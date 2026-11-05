-- Migration: Secure Orders and Order Items Policies & Atomic Function
-- Project: Eswar, Bala & Co - Smart Café Salem

-- 1. Enable RLS on orders and order_items
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 2. Customer RLS Policy: Customers can only select their own orders
DROP POLICY IF EXISTS "Customers can view their own orders" ON public.orders;
CREATE POLICY "Customers can view their own orders"
ON public.orders FOR SELECT
USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Customers can view their own order items" ON public.order_items;
CREATE POLICY "Customers can view their own order items"
ON public.order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.customer_id = auth.uid()
  )
);

-- 3. Customers can insert their own orders if authenticated
DROP POLICY IF EXISTS "Customers can create their own orders" ON public.orders;
CREATE POLICY "Customers can create their own orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Customers can create their own order items" ON public.order_items;
CREATE POLICY "Customers can create their own order items"
ON public.order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.customer_id = auth.uid()
  )
);

-- 4. Service role can perform all operations (used by Edge Functions)
DROP POLICY IF EXISTS "Service role full access on orders" ON public.orders;
CREATE POLICY "Service role full access on orders"
ON public.orders FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access on order_items" ON public.order_items;
CREATE POLICY "Service role full access on order_items"
ON public.order_items FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 5. Atomic Order Creation PostgreSQL Function
-- Validates item IDs, calculates database prices, checks availability, and inserts order & order_items in a single atomic transaction.
CREATE OR REPLACE FUNCTION public.create_order_atomic(
  p_customer_id UUID,
  p_items JSONB,
  p_customer_name TEXT,
  p_phone TEXT,
  p_address TEXT,
  p_payment_method TEXT DEFAULT 'cod'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item RECORD;
  v_db_item RECORD;
  v_subtotal NUMERIC := 0;
  v_packaging NUMERIC := 10;
  v_delivery NUMERIC := 20;
  v_tax NUMERIC := 0;
  v_total NUMERIC := 0;
  v_order_id BIGINT;
  v_order_num TEXT;
  v_token_num TEXT;
  v_result JSONB;
BEGIN
  -- Generate random order and token numbers
  v_order_num := 'SC-SLM-' || FLOOR(1000 + RANDOM() * 9000)::TEXT;
  v_token_num := FLOOR(100 + RANDOM() * 900)::TEXT;

  -- 1. Validate items and compute subtotal from menu_items database prices
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(id INT, quantity INT)
  LOOP
    SELECT id, name, price, is_available
    INTO v_db_item
    FROM public.menu_items
    WHERE id = v_item.id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Menu item ID % not found in database.', v_item.id;
    END IF;

    IF NOT v_db_item.is_available THEN
      RAISE EXCEPTION 'Menu item "%" is currently unavailable / sold out.', v_db_item.name;
    END IF;

    v_subtotal := v_subtotal + (v_db_item.price * GREATEST(1, v_item.quantity));
  END LOOP;

  v_tax := ROUND(v_subtotal * 0.05, 2);
  v_total := ROUND(v_subtotal + v_packaging + v_delivery + v_tax);

  -- 2. Insert order record
  INSERT INTO public.orders (
    customer_id,
    order_number,
    token_number,
    status,
    total_amount,
    payment_method,
    payment_status,
    customer_name,
    phone,
    address,
    created_at
  ) VALUES (
    p_customer_id,
    v_order_num,
    v_token_num,
    'PREPARING 🔥',
    v_total,
    p_payment_method,
    CASE WHEN p_payment_method = 'cod' THEN 'pending' ELSE 'paid' END,
    p_customer_name,
    p_phone,
    p_address,
    NOW()
  )
  RETURNING id INTO v_order_id;

  -- 3. Insert order items
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(id INT, quantity INT)
  LOOP
    SELECT id, name, price
    INTO v_db_item
    FROM public.menu_items
    WHERE id = v_item.id;

    INSERT INTO public.order_items (
      order_id,
      menu_item_id,
      item_name,
      quantity,
      unit_price,
      created_at
    ) VALUES (
      v_order_id,
      v_db_item.id,
      v_db_item.name,
      GREATEST(1, v_item.quantity),
      v_db_item.price,
      NOW()
    );
  END LOOP;

  v_result := jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_num,
    'token_number', v_token_num,
    'total_amount', v_total,
    'status', 'PREPARING 🔥'
  );

  RETURN v_result;
END;
$$;
