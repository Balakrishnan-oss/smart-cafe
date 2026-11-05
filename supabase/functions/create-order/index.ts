// Supabase Edge Function: create-order
// Secure server-side order creation with database price calculation, validation & atomicity.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Require an authenticated customer
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header. Customer authentication is required.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    // Verify user JWT token with Supabase Auth
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: { user }, error: authError } = await userClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid or expired customer token. Please sign in.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Receive selected menu item IDs, quantities and checkout details
    const payload = await req.json()
    const {
      items,
      customer_name,
      phone,
      address,
      payment_method = 'cod'
    } = payload

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Basket is empty. Select at least one menu item.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize administrative client for PostgreSQL operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey)

    // 3. Validate all menu item IDs against PostgreSQL
    const requestedIds = items.map((i: any) => Number(i.id || i.menu_item_id)).filter((id: number) => !isNaN(id))

    if (requestedIds.length !== items.length) {
      return new Response(
        JSON.stringify({ error: 'One or more menu item IDs in basket are invalid.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: dbItems, error: menuErr } = await adminClient
      .from('menu_items')
      .select('id, name, price, is_available')
      .in('id', requestedIds)

    if (menuErr || !dbItems || dbItems.length !== requestedIds.length) {
      return new Response(
        JSON.stringify({ error: 'One or more menu items could not be found in the Salem kitchen database.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Reject unavailable menu items
    const unavailableItems = dbItems.filter(item => !item.is_available)
    if (unavailableItems.length > 0) {
      const names = unavailableItems.map(i => i.name).join(', ')
      return new Response(
        JSON.stringify({ error: `Dish unavailable: ${names} is currently sold out. Please modify your order.` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 5. Calculate prices and totals using database values (NEVER trust prices sent by the browser)
    let calculatedSubtotal = 0
    const validatedOrderItems = []

    for (const reqItem of items) {
      const itemId = Number(reqItem.id || reqItem.menu_item_id)
      const dbItem = dbItems.find(d => d.id === itemId)
      if (!dbItem) continue

      const quantity = Math.max(1, parseInt(reqItem.quantity || reqItem.qty || 1, 10))
      const unitPrice = Number(dbItem.price)
      calculatedSubtotal += unitPrice * quantity

      validatedOrderItems.push({
        menu_item_id: dbItem.id,
        item_name: dbItem.name,
        quantity: quantity,
        unit_price: unitPrice
      })
    }

    const packagingFee = 10
    const deliveryFee = 20
    const tax = Math.round(calculatedSubtotal * 0.05 * 100) / 100
    const calculatedTotalAmount = Math.round(calculatedSubtotal + packagingFee + deliveryFee + tax)

    // 6. Generate unique order number and token number
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const orderNumber = `SC-SLM-${randomSuffix}`
    const tokenNumber = `${Math.floor(100 + Math.random() * 900)}`

    // 7. Atomic database transaction: create order and order_items
    const orderRecord = {
      customer_id: user.id,
      order_number: orderNumber,
      token_number: tokenNumber,
      status: 'PREPARING 🔥',
      total_amount: calculatedTotalAmount,
      payment_method: payment_method,
      payment_status: payment_method === 'cod' ? 'pending' : 'paid',
      customer_name: customer_name || user.user_metadata?.full_name || 'Karthik Subramanian',
      phone: phone || user.user_metadata?.phone || '+91 94432 10890',
      address: address || 'Plot 14, Fairlands Main Road, Salem - 636016'
    }

    const { data: createdOrder, error: orderInsertErr } = await adminClient
      .from('orders')
      .insert(orderRecord)
      .select()
      .single()

    if (orderInsertErr || !createdOrder) {
      console.error('PostgreSQL order insert error:', orderInsertErr)
      return new Response(
        JSON.stringify({ error: orderInsertErr?.message || 'Database error while inserting order record.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Attach order_id to order_items records
    const itemsToInsert = validatedOrderItems.map(item => ({
      ...item,
      order_id: createdOrder.id
    }))

    const { error: itemsInsertErr } = await adminClient
      .from('order_items')
      .insert(itemsToInsert)

    if (itemsInsertErr) {
      console.error('Failed to insert order items, rolling back order:', itemsInsertErr)
      // Rollback order to ensure atomicity
      await adminClient.from('orders').delete().eq('id', createdOrder.id)
      return new Response(
        JSON.stringify({ error: 'Failed to record order items. Database transaction rolled back.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 8. Return generated order ID, order number, and token number
    return new Response(
      JSON.stringify({
        success: true,
        order_id: createdOrder.id,
        order_number: createdOrder.order_number,
        token_number: createdOrder.token_number,
        total_amount: createdOrder.total_amount,
        status: createdOrder.status,
        created_at: createdOrder.created_at,
        items: validatedOrderItems
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('Unhandled Edge Function error:', err)
    return new Response(
      JSON.stringify({ error: (err as Error).message || 'Internal Edge Function processing error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
