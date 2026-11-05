import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Orders({
  orders = [],
  onUpdateStatus,
  onNavigate,
  isAdmin = false,
  currentUser = null
}) {
  const [viewMode, setViewMode] = useState(isAdmin ? 'admin' : 'tracking'); // 'tracking' | 'admin'
  const [adminTab, setAdminTab] = useState('orders'); // 'orders' | 'menu'
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [decoctionLevel, setDecoctionLevel] = useState(68);
  const [decoctionBatch, setDecoctionBatch] = useState(4);
  const [brewing, setBrewing] = useState(false);

  // Supabase live orders state
  const [dbOrders, setDbOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successBanner, setSuccessBanner] = useState(null);

  // Admin Menu items state for price & availability management
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [editingPriceVal, setEditingPriceVal] = useState('');

  // Fetch orders respecting RLS (Customer: own orders only; Admin: all orders)
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      let query = supabase
        .from('orders')
        .select(`
          id,
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
          created_at,
          order_items (
            id,
            menu_item_id,
            item_name,
            quantity,
            unit_price
          )
        `)
        .order('created_at', { ascending: false });

      // Requirement 4: Customers must only see their own orders. Admins see all orders.
      if (user && !isAdmin) {
        query = query.eq('customer_id', user.id);
      }

      const { data, error: fetchErr } = await query;
      if (fetchErr) throw fetchErr;

      if (data) {
        const mappedOrders = data.map((d) => ({
          id: d.order_number || `#SC-SLM-${d.id}`,
          db_id: d.id,
          order_number: d.order_number,
          token_number: d.token_number,
          pin: d.token_number || `${d.id}`,
          status: d.status || 'PREPARING 🔥',
          customer: {
            name: d.customer_name || 'Karthik Subramanian',
            phone: d.phone || '+91 94432 10890',
            address: d.address || 'Salem Fairlands'
          },
          items: (d.order_items || []).map((item) => ({
            id: item.menu_item_id,
            name: item.item_name || 'Salem Specialty',
            price: item.unit_price,
            qty: item.quantity
          })),
          pricing: {
            subtotal: (d.order_items || []).reduce((s, i) => s + (i.unit_price * i.quantity), 0),
            packaging: 10,
            delivery: 20,
            tax: Math.round(((d.order_items || []).reduce((s, i) => s + (i.unit_price * i.quantity), 0)) * 0.05 * 100) / 100,
            total: d.total_amount
          },
          paymentMethod: d.payment_method || 'cod',
          createdAt: d.created_at,
          runner: { name: 'Muthu Kumaran', phone: '+91 94432 10890' }
        }));
        setDbOrders(mappedOrders);
      }
    } catch (err) {
      console.warn('PostgreSQL orders query error:', err);
      setError(err.message || 'Could not fetch orders from database');
    } finally {
      setLoading(false);
    }
  };

  // Fetch menu items for Admin Management (Requirement 7: Admins can manage menu items and orders)
  const fetchAdminMenuItems = async () => {
    setMenuLoading(true);
    try {
      const { data, error: menuErr } = await supabase
        .from('menu_items')
        .select('*')
        .order('id', { ascending: true });
      if (menuErr) throw menuErr;
      if (data) setMenuItems(data);
    } catch (err) {
      console.warn('Menu fetch error:', err);
    } finally {
      setMenuLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    if (isAdmin) {
      fetchAdminMenuItems();
    }
  }, [isAdmin]);

  // Order status updater (Requirement 5: Customers cannot update status; only Admins)
  const handleStatusChange = async (orderId, newStatus, dbId) => {
    if (!isAdmin) {
      setError('Permission Denied: Only users with the admin role in profiles can update order status.');
      return;
    }

    onUpdateStatus(orderId, newStatus);
    if (dbId) {
      try {
        const { error: updateErr } = await supabase
          .from('orders')
          .update({ status: newStatus })
          .eq('id', dbId);

        if (updateErr) {
          throw updateErr;
        }

        setSuccessBanner(`Order ${orderId} updated to ${newStatus}`);
        setTimeout(() => setSuccessBanner(null), 3000);
      } catch (err) {
        console.error('Error updating order status in Supabase:', err);
        setError('Database RLS Policy Violation: Update rejected by PostgreSQL permissions.');
      }
    }
  };

  // Admin Menu Price & Availability Updater (Requirements 6 & 7: Customers cannot modify menu prices; Admins can)
  const handleUpdateMenuPrice = async (itemId, newPrice) => {
    if (!isAdmin) {
      setError('Permission Denied: Customers cannot modify menu prices.');
      return;
    }

    const numPrice = Number(newPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Please enter a valid price amount.');
      return;
    }

    try {
      const { error: updateErr } = await supabase
        .from('menu_items')
        .update({ price: numPrice })
        .eq('id', itemId);

      if (updateErr) throw updateErr;

      setMenuItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, price: numPrice } : item))
      );
      setEditingPriceId(null);
      setSuccessBanner(`Menu item price updated to ₹${numPrice} in PostgreSQL.`);
      setTimeout(() => setSuccessBanner(null), 3000);
    } catch (err) {
      console.error('Menu price update error:', err);
      setError(`Database RLS Error: ${err.message || 'Permission denied while modifying menu price.'}`);
    }
  };

  // Admin Menu Availability Toggle
  const handleToggleAvailability = async (itemId, currentAvailability) => {
    if (!isAdmin) {
      setError('Permission Denied: Only Admins can modify menu availability.');
      return;
    }

    const newStatus = !currentAvailability;
    try {
      const { error: toggleErr } = await supabase
        .from('menu_items')
        .update({ is_available: newStatus })
        .eq('id', itemId);

      if (toggleErr) throw toggleErr;

      setMenuItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, is_available: newStatus } : item))
      );
      setSuccessBanner(`Dish availability set to ${newStatus ? 'Available' : 'Sold Out'}.`);
      setTimeout(() => setSuccessBanner(null), 3000);
    } catch (err) {
      console.error('Menu toggle error:', err);
      setError(`Database RLS Error: ${err.message || 'Permission denied.'}`);
    }
  };

  // Combined order list
  const displayOrders = dbOrders.length > 0 ? dbOrders : orders;
  const activeOrder = (selectedOrderId ? displayOrders.find((o) => o.id === selectedOrderId) : null) || displayOrders[0];

  const handleBrew = () => {
    setBrewing(true);
    setTimeout(() => {
      setDecoctionLevel(100);
      setDecoctionBatch((b) => b + 1);
      setBrewing(false);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#e8e2d6]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold text-[#a23f00] tracking-wider">Station SLM-KDS-01</span>
            {isAdmin && (
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#fd6c19] text-white">
                Admin Verified
              </span>
            )}
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#250f03]">
            {viewMode === 'tracking' ? 'Live Order Kitchen Pass' : 'Kitchen POS & Command Hub'}
          </h1>
        </div>

        {/* View Mode Switcher (Restricted to Admins) */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            className="px-3 py-2 bg-[#f3ede1] text-[#250f03] rounded-lg text-xs font-bold hover:bg-[#ede8dc] flex items-center gap-1"
          >
            <span className={`material-symbols-outlined text-xs ${loading ? 'animate-spin' : ''}`}>sync</span>
            <span>Refresh</span>
          </button>

          {isAdmin ? (
            <div className="flex items-center gap-1 bg-[#ede8dc] p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setViewMode('tracking')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'tracking' ? 'bg-[#250f03] text-white shadow-sm' : 'text-[#50443f] hover:bg-white'
                }`}
              >
                Tracking
              </button>
              <button
                onClick={() => setViewMode('admin')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'admin' ? 'bg-[#250f03] text-white shadow-sm' : 'text-[#50443f] hover:bg-white'
                }`}
              >
                Kitchen Staff Admin
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-[#f3ede1] px-3 py-1.5 rounded-full text-xs font-semibold text-[#50443f] border border-[#e8e2d6]">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Customer Tracking View</span>
            </div>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {successBanner && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl flex items-center gap-2 text-xs">
          <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
          <span className="font-medium">{successBanner}</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-700 text-base">info</span>
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-amber-800 font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {loading && displayOrders.length === 0 ? (
        <div className="bg-white rounded-xl p-8 border border-[#e8e2d6] shadow-sm flex flex-col items-center justify-center text-center py-16 animate-pulse">
          <span className="material-symbols-outlined text-4xl text-[#a23f00] mb-3 animate-spin">progress_activity</span>
          <h3 className="font-bold text-[#250f03] text-base">Retrieving Live Salem Orders...</h3>
          <p className="text-xs text-[#50443f] mt-1">Applying database RLS permissions.</p>
        </div>
      ) : displayOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#e8e2d6] shadow-sm flex flex-col items-center">
          <span className="material-symbols-outlined text-5xl text-[#82746e] mb-2">moped</span>
          <h3 className="font-bold text-lg text-[#250f03]">No Orders Active Yet</h3>
          <p className="text-xs text-[#50443f] max-w-sm mt-1 mb-4">
            {isAdmin ? 'No live orders currently in the kitchen queue.' : 'Place an order from our Salem filter kaapi and tiffin menu to track live preparation.'}
          </p>
          <button
            onClick={() => onNavigate('menu')}
            className="px-5 py-2.5 bg-[#fd6c19] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#a23f00] transition-colors"
          >
            Explore Menu &amp; Order
          </button>
        </div>
      ) : viewMode === 'tracking' ? (
        /* CUSTOMER LIVE PASS VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e8e2d6] flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#f3ede1] pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#a23f00]">track_changes</span>
                  <span className="font-bold text-[#250f03]">Salem Kitchen Live Pipeline</span>
                </div>
                <div className="flex items-center gap-2">
                  {activeOrder?.token_number && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900">
                      Token #{activeOrder.token_number}
                    </span>
                  )}
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    {activeOrder?.status || 'PREPARING 🔥'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4 py-2">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm">check</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-xs text-[#250f03]">Order Confirmed &amp; KOT Printed</p>
                    <p className="text-xs text-[#50443f]">Salem Junction kitchen accepted your order instantly.</p>
                  </div>
                  <span className="text-xs text-[#50443f]">Done</span>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#fd6c19] text-white flex items-center justify-center shrink-0 animate-pulse">
                    <span className="material-symbols-outlined text-sm">local_fire_department</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-xs text-[#250f03]">Steaming Hot Tiffin &amp; Kaapi Brewing</p>
                    <p className="text-xs text-[#50443f]">Medu vadas frying in groundnut oil; degree decoction pulled in brass dabara.</p>
                  </div>
                  <span className="text-xs text-[#a23f00] font-bold">In Progress</span>
                </div>

                <div className="flex items-start gap-4 opacity-60">
                  <div className="w-8 h-8 rounded-full bg-[#ede8dc] text-[#50443f] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm">inventory_2</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-xs text-[#250f03]">Thermal Flask &amp; Areca Leaf Packing</p>
                    <p className="text-xs text-[#50443f]">Sealed in spill-proof flasks with fresh chutney duo &amp; drumstick sambar.</p>
                  </div>
                  <span className="text-xs text-[#82746e]">~5 mins</span>
                </div>

                <div className="flex items-start gap-4 opacity-60">
                  <div className="w-8 h-8 rounded-full bg-[#ede8dc] text-[#50443f] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm">moped</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-xs text-[#250f03]">Dispatched via Salem Café Runner</p>
                    <p className="text-xs text-[#50443f]">Express doorstep delivery across Fairlands &amp; Alagapuram.</p>
                  </div>
                  <span className="text-xs text-[#82746e]">~15 mins</span>
                </div>
              </div>
            </div>

            {/* Runner Card */}
            <div className="bg-[#f3ede1] rounded-xl p-5 border border-[#e8e2d6] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#250f03] text-white flex items-center justify-center font-bold text-sm">MK</div>
                <div>
                  <h4 className="font-bold text-sm text-[#250f03]">Muthu Kumaran</h4>
                  <p className="text-xs text-[#50443f]">Assigned Salem Café Delivery Barista</p>
                </div>
              </div>
              <a
                href="tel:+919443210890"
                className="px-4 py-2 bg-[#250f03] text-white rounded-lg text-xs font-bold hover:bg-[#a23f00] flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">call</span>
                <span>Call (+91 94432 10890)</span>
              </a>
            </div>
          </div>

          {/* Right Column: Receipt Breakdown */}
          <aside className="lg:col-span-5 flex flex-col gap-6 sticky top-28">
            <div className="bg-white rounded-xl p-6 shadow-md border border-[#e8e2d6] flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#f3ede1]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#a23f00]">receipt</span>
                  <span className="font-bold text-[#250f03]">
                    Receipt: {activeOrder?.order_number || activeOrder?.id}
                  </span>
                </div>
                <button onClick={() => window.print()} className="text-xs text-[#a23f00] font-bold hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">print</span> Print
                </button>
              </div>

              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
                {activeOrder?.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-[#f3ede1]">
                    <span className="text-[#250f03] font-semibold">{item.qty || item.quantity}x {item.name || item.item_name}</span>
                    <span className="font-bold text-[#250f03]">₹{item.price * (item.qty || item.quantity || 1)}</span>
                  </div>
                ))}
              </div>

              <div className="bg-[#f9f3e7] p-4 rounded-xl flex flex-col gap-1 text-xs text-[#50443f]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#250f03]">₹{activeOrder?.pricing?.subtotal || 110}</span>
                </div>
                <div className="flex justify-between">
                  <span>Eco-Packaging</span>
                  <span className="font-bold text-[#250f03]">₹{activeOrder?.pricing?.packaging || 10}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="font-bold text-[#250f03]">₹{activeOrder?.pricing?.delivery || 20}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span className="font-bold text-[#250f03]">₹{activeOrder?.pricing?.tax || 5.5}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-[#e8e2d6] flex justify-between items-baseline text-[#250f03] font-bold">
                  <span className="text-sm">Total Amount</span>
                  <span className="text-lg text-[#a23f00]">₹{activeOrder?.pricing?.total || 145.5}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => onNavigate('menu')}
                  className="w-full py-3 rounded-xl bg-[#fd6c19] text-white text-xs font-bold hover:bg-[#a23f00] flex items-center justify-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">restaurant_menu</span>
                  <span>Order More Salem Kaapi</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        /* KITCHEN STAFF ADMIN COMMAND VIEW (ADMINS ONLY) */
        <div className="flex flex-col gap-6">
          {/* Admin Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-[#e8e2d6] pb-2">
            <button
              onClick={() => setAdminTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
                adminTab === 'orders' ? 'bg-[#250f03] text-white shadow-sm' : 'bg-[#f3ede1] text-[#50443f] hover:bg-[#ede8dc]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">receipt_long</span>
              <span>Live KOT Queue ({displayOrders.length})</span>
            </button>
            <button
              onClick={() => {
                setAdminTab('menu');
                fetchAdminMenuItems();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
                adminTab === 'menu' ? 'bg-[#250f03] text-white shadow-sm' : 'bg-[#f3ede1] text-[#50443f] hover:bg-[#ede8dc]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">edit_note</span>
              <span>Menu &amp; Price Manager</span>
            </button>
          </div>

          {adminTab === 'orders' ? (
            /* Orders Stream & Tank Grid */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="bg-white rounded-xl p-6 shadow-md border border-[#e8e2d6] flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#f3ede1]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#fd6c19] animate-pulse"></span>
                      <h2 className="font-bold text-base text-[#250f03]">Live KOT Queue (All Orders)</h2>
                    </div>
                    <span className="text-[11px] bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full font-bold">
                      Admin RLS Authorized
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-[#f3ede1] text-[#50443f] uppercase font-bold tracking-wider">
                          <th className="p-2.5 rounded-l-lg">Order &amp; Token</th>
                          <th className="p-2.5">Items</th>
                          <th className="p-2.5">Total &amp; Mode</th>
                          <th className="p-2.5">Status Action (Admin)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayOrders.map((ord) => (
                          <tr key={ord.id} className="border-b border-[#f3ede1] hover:bg-[#f9f3e7] transition-colors">
                            <td className="p-2.5 align-top">
                              <p className="font-bold text-[#250f03]">{ord.id}</p>
                              {ord.token_number && (
                                <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                                  Token #{ord.token_number}
                                </span>
                              )}
                              <p className="text-[#1d1c14] mt-1">{ord.customer?.name}</p>
                              <p className="text-[#82746e] text-[10px]">{ord.customer?.phone}</p>
                            </td>
                            <td className="p-2.5 align-top">
                              {ord.items?.map((i, idx) => (
                                <p key={idx} className="font-semibold text-[#250f03]">
                                  {i.qty || i.quantity}x {i.name || i.item_name}
                                </p>
                              ))}
                            </td>
                            <td className="p-2.5 align-top">
                              <p className="font-bold text-[#250f03]">₹{ord.pricing?.total || 145.5}</p>
                              <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-semibold">
                                {ord.paymentMethod?.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-2.5 align-top">
                              <select
                                value={ord.status}
                                onChange={(e) => handleStatusChange(ord.id, e.target.value, ord.db_id)}
                                className="bg-white border border-[#d4c3bc] px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#250f03] focus:outline-none focus:ring-2 focus:ring-[#fd6c19]"
                              >
                                <option value="PREPARING 🔥">PREPARING 🔥</option>
                                <option value="READY FOR PICKUP ☕">READY FOR PICKUP ☕</option>
                                <option value="OUT FOR DELIVERY 🛵">OUT FOR DELIVERY 🛵</option>
                                <option value="COMPLETED ✅">COMPLETED ✅</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right: Decoction Tank */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="bg-white rounded-xl p-5 shadow-md border border-[#e8e2d6] flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-[#f3ede1] pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#a23f00]">water_drop</span>
                      <h3 className="font-bold text-sm text-[#250f03]">Brass Decoction Tank</h3>
                    </div>
                    <span className="text-xs bg-[#ffdbcd] text-[#a23f00] px-2 py-0.5 rounded font-bold">Batch #{decoctionBatch}</span>
                  </div>

                  <div className="flex items-baseline justify-between text-xs">
                    <span>Decoction Level</span>
                    <span className="font-bold text-base text-[#a23f00]">{decoctionLevel}%</span>
                  </div>

                  <div className="w-full bg-[#f3ede1] h-3.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#a23f00] to-[#fd6c19] h-full transition-all duration-700 rounded-full" 
                      style={{ width: `${decoctionLevel}%` }}
                    ></div>
                  </div>

                  <button
                    onClick={handleBrew}
                    disabled={brewing}
                    className="w-full py-2.5 rounded-xl bg-[#250f03] hover:bg-[#a23f00] text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">coffee_maker</span>
                    <span>{brewing ? 'Brewing Fresh Decoction...' : 'Brew Fresh Batch (100%)'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Menu Items & Price Manager (Requirement 7: Admins manage menu items; Requirement 6: Customers cannot modify prices) */
            <div className="bg-white rounded-xl p-6 shadow-md border border-[#e8e2d6] flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#f3ede1]">
                <div>
                  <h2 className="font-bold text-base text-[#250f03]">Salem Menu Management (Admin Only)</h2>
                  <p className="text-xs text-[#50443f]">
                    Update prices and toggle live dish availability in PostgreSQL. Protected by menu_items RLS.
                  </p>
                </div>
                <button
                  onClick={fetchAdminMenuItems}
                  className="px-3 py-1.5 bg-[#f3ede1] text-[#250f03] rounded-lg text-xs font-bold hover:bg-[#ede8dc] flex items-center gap-1"
                >
                  <span className={`material-symbols-outlined text-xs ${menuLoading ? 'animate-spin' : ''}`}>sync</span>
                  <span>Refresh Menu</span>
                </button>
              </div>

              {menuLoading && menuItems.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#50443f]">Loading database menu items...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#f3ede1] text-[#50443f] uppercase font-bold tracking-wider">
                        <th className="p-2.5 rounded-l-lg">Dish Name</th>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5">Current Price (₹)</th>
                        <th className="p-2.5">Availability</th>
                        <th className="p-2.5 rounded-r-lg">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menuItems.map((item) => (
                        <tr key={item.id} className="border-b border-[#f3ede1] hover:bg-[#f9f3e7] transition-colors">
                          <td className="p-2.5 align-middle">
                            <p className="font-bold text-[#250f03]">{item.name}</p>
                            <p className="text-[11px] text-[#82746e] truncate max-w-xs">{item.description}</p>
                          </td>
                          <td className="p-2.5 align-middle">
                            <span className="px-2 py-0.5 rounded-full bg-[#f3ede1] text-[#250f03] font-semibold text-[11px]">
                              {item.category}
                            </span>
                          </td>
                          <td className="p-2.5 align-middle">
                            {editingPriceId === item.id ? (
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[#250f03]">₹</span>
                                <input
                                  type="number"
                                  value={editingPriceVal}
                                  onChange={(e) => setEditingPriceVal(e.target.value)}
                                  className="w-16 bg-white border border-[#fd6c19] px-2 py-1 rounded text-xs font-bold text-[#250f03]"
                                />
                                <button
                                  onClick={() => handleUpdateMenuPrice(item.id, editingPriceVal)}
                                  className="px-2 py-1 bg-emerald-700 text-white rounded text-[11px] font-bold hover:bg-emerald-800"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingPriceId(null)}
                                  className="px-1.5 py-1 text-[#82746e] text-[11px] hover:text-[#250f03]"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-[#250f03]">₹{item.price}</span>
                                <button
                                  onClick={() => {
                                    setEditingPriceId(item.id);
                                    setEditingPriceVal(item.price.toString());
                                  }}
                                  className="text-[11px] text-[#a23f00] font-bold hover:underline flex items-center gap-0.5"
                                >
                                  <span className="material-symbols-outlined text-xs">edit</span>
                                  <span>Edit</span>
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="p-2.5 align-middle">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                item.is_available
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {item.is_available ? 'Available' : 'Sold Out'}
                            </span>
                          </td>
                          <td className="p-2.5 align-middle">
                            <button
                              onClick={() => handleToggleAvailability(item.id, item.is_available)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                item.is_available
                                  ? 'bg-[#f3ede1] text-red-800 hover:bg-red-100'
                                  : 'bg-[#250f03] text-white hover:bg-[#a23f00]'
                              }`}
                            >
                              {item.is_available ? 'Mark Sold Out' : 'Mark Available'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
