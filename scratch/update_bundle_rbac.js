// Script to upgrade build_bundle.js with Stage 6/7 RBAC Security
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectDir = path.resolve(__dirname, '..');
const bundlePath = path.join(projectDir, 'build_bundle.js');

let code = fs.readFileSync(bundlePath, 'utf8');

// 1. Updated Navbar with isAdmin
const updatedNavbarCode = `    // 2. NAVBAR COMPONENT (WITH CUSTOMER PROFILE & RBAC ROLE DISPLAY)
    function Navbar({ activePage, setActivePage, cartCount = 0, currentUser = null, customerProfile = null, onLogout = null, isAdmin = false }) {
      const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
      const [userDropdownOpen, setUserDropdownOpen] = useState(false);

      const navItems = [
        { id: 'home', label: 'Home', icon: 'home' },
        { id: 'menu', label: 'Full Menu', icon: 'restaurant_menu' },
        { id: 'cart', label: 'Cart (' + cartCount + ')', icon: 'shopping_bag' },
        { id: 'orders', label: 'Orders & Tracking', icon: 'moped' },
        { id: 'admin', label: 'Staff Hub', icon: 'soup_kitchen', adminOnly: true }
      ];

      const handleNav = (id) => {
        setActivePage(id);
        setMobileMenuOpen(false);
        setUserDropdownOpen(false);
      };

      const displayName =
        (customerProfile && customerProfile.full_name) ||
        (currentUser && currentUser.user_metadata && currentUser.user_metadata.full_name) ||
        (currentUser && currentUser.email ? currentUser.email.split('@')[0] : null);

      const initial = displayName ? displayName.charAt(0).toUpperCase() : 'C';

      return h('header', { className: 'fixed top-0 left-0 right-0 z-50 bg-[#fff9ed]/95 backdrop-blur-xl shadow-[0_2px_12px_rgba(61,35,20,0.06)]' },
        // Top Announcement Bar
        h('div', { className: 'bg-[#250f03] text-white px-4 text-center py-1 flex items-center justify-center gap-2 text-xs' },
          h('span', { className: 'material-symbols-outlined text-[#fd6c19] text-sm' }, 'local_cafe'),
          h('span', { className: 'tracking-wide' }, 'Fresh hot Salem Filter Kaapi & Crispy Medu Vadas brewing right now! Cash on Delivery available.')
        ),
        // Main Nav
        h('div', { className: 'h-20 max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between gap-4' },
          h('div', { className: 'flex items-center gap-4' },
            h('button', {
              onClick: () => handleNav('home'),
              className: 'flex items-center gap-2 text-left focus:outline-none'
            },
              h('img', {
                alt: 'Eswar, Bala & Co Logo',
                className: 'h-8 w-auto object-contain',
                src: 'https://lh3.googleusercontent.com/aida/AEtjO1XZs9MuMQKEmNvDzp1fMXF7K-DJXdpK_tost2i6v0lD59W7LBOjThUtUpisLVlvNdB8IwESWp3YMEIz3UMLG4R7onvrczC-mRpVmSd3avF_Iw-Ou5iuAuBduesqysWyijXTFVO_LkIGAdn1UVZsNVgTfxnrGw7a3bSCkUIFdunbNPwX5tT2Lehj0bMenzqh-nIJTQ5jSy_TLmUi9rfiGikD3YeqK8aqo4Enau7WGkDKPQ'
              }),
              h('div', { className: 'flex flex-col' },
                h('span', { className: 'font-bold text-lg text-[#250f03] leading-tight font-serif' }, 'Eswar, Bala & Co'),
                h('span', { className: 'text-xs text-[#a23f00] leading-none' }, 'Salem Bypass & Junction Rd')
              )
            ),
            h('div', { className: 'hidden xl:flex items-center gap-1.5 bg-[#ede8dc] px-3 py-1 rounded-full' },
              h('span', { className: 'w-2 h-2 rounded-full bg-[#fd6c19] animate-pulse' }),
              h('span', { className: 'text-xs text-[#50443f]' }, 'Open Now • 6:30 AM - 11:00 PM')
            )
          ),

          // Center nav items
          h('nav', { className: 'hidden lg:flex items-center gap-1' },
            navItems.map((item) =>
              h('button', {
                key: item.id,
                onClick: () => handleNav(item.id),
                className: 'px-4 py-2 font-medium text-sm rounded-lg transition-colors flex items-center gap-1.5 ' +
                  (activePage === item.id ? 'bg-[#3d2314] text-white shadow-sm' : 'text-[#50443f] hover:bg-[#ede8dc] hover:text-[#1d1c14]')
              },
                h('span', null, item.label),
                item.adminOnly && isAdmin && h('span', { className: 'text-[9px] bg-[#fd6c19] text-white px-1.5 py-0.2 rounded font-bold' }, 'ADMIN')
              )
            )
          ),

          // Right CTAs & Profile
          h('div', { className: 'flex items-center gap-3' },
            h('a', {
              href: 'tel:+919443210890',
              className: 'hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f3ede1] text-[#50443f] hover:bg-[#ede8dc] transition-colors'
            },
              h('span', { className: 'material-symbols-outlined text-[#a23f00] text-sm' }, 'call'),
              h('span', { className: 'text-xs font-semibold text-[#1d1c14]' }, '+91 94432 10890')
            ),

            // Cart button
            h('button', {
              onClick: () => handleNav('cart'),
              className: 'relative p-2.5 rounded-full bg-[#fd6c19] text-white hover:bg-[#a23f00] transition-colors flex items-center justify-center shadow-md active:scale-95',
              'aria-label': 'View Cart'
            },
              h('span', { className: 'material-symbols-outlined text-lg' }, 'shopping_bag'),
              cartCount > 0 && h('span', {
                className: 'absolute -top-1 -right-1 bg-[#250f03] text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-[#fff9ed]'
              }, cartCount)
            ),

            // Logged-in Customer Badge & Dropdown OR Login/Register Buttons
            currentUser
              ? h('div', { className: 'relative' },
                  h('button', {
                    onClick: () => setUserDropdownOpen(!userDropdownOpen),
                    className: 'flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f3ede1] hover:bg-[#ede8dc] border border-[#e8e2d6] transition-all'
                  },
                    h('div', { className: 'w-7 h-7 rounded-full bg-[#250f03] text-white font-bold text-xs flex items-center justify-center' }, initial),
                    h('div', { className: 'hidden md:flex flex-col text-left' },
                      h('span', { className: 'text-xs font-bold text-[#250f03] max-w-[120px] truncate' }, displayName),
                      h('span', { className: 'text-[9px] font-bold uppercase ' + (isAdmin ? 'text-[#fd6c19]' : 'text-[#82746e]') }, isAdmin ? 'Admin Lead' : 'Customer')
                    ),
                    h('span', { className: 'material-symbols-outlined text-xs text-[#82746e]' }, userDropdownOpen ? 'expand_less' : 'expand_more')
                  ),
                  userDropdownOpen && h('div', { className: 'absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#e8e2d6] py-2 z-50' },
                    h('div', { className: 'px-4 py-2 border-b border-[#f3ede1]' },
                      h('p', { className: 'text-xs font-bold text-[#250f03] truncate' }, displayName),
                      h('p', { className: 'text-[11px] text-[#82746e] truncate' }, currentUser.email),
                      h('span', {
                        className: 'inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ' +
                          (isAdmin ? 'bg-[#ffdbcd] text-[#a23f00]' : 'bg-emerald-100 text-emerald-800')
                      }, 'Role: ' + (customerProfile && customerProfile.role ? customerProfile.role : (isAdmin ? 'admin' : 'customer')))
                    ),
                    h('button', {
                      onClick: () => handleNav('orders'),
                      className: 'w-full text-left px-4 py-2 text-xs text-[#250f03] hover:bg-[#f9f3e7] flex items-center gap-2'
                    },
                      h('span', { className: 'material-symbols-outlined text-sm text-[#a23f00]' }, 'moped'),
                      h('span', null, 'My Orders & Tracking')
                    ),
                    isAdmin && h('button', {
                      onClick: () => handleNav('admin'),
                      className: 'w-full text-left px-4 py-2 text-xs text-[#a23f00] font-bold hover:bg-[#f9f3e7] flex items-center gap-2'
                    },
                      h('span', { className: 'material-symbols-outlined text-sm' }, 'soup_kitchen'),
                      h('span', null, 'Kitchen Staff Command Hub')
                    ),
                    h('button', {
                      onClick: () => {
                        setUserDropdownOpen(false);
                        if (onLogout) onLogout();
                      },
                      className: 'w-full text-left px-4 py-2 text-xs text-red-700 hover:bg-red-50 flex items-center gap-2 border-t border-[#f3ede1] mt-1'
                    },
                      h('span', { className: 'material-symbols-outlined text-sm' }, 'logout'),
                      h('span', null, 'Log Out')
                    )
                  )
                )
              : h('div', { className: 'hidden sm:flex items-center gap-2' },
                  h('button', {
                    onClick: () => handleNav('login'),
                    className: 'px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#250f03] hover:bg-[#ede8dc] transition-colors'
                  }, 'Sign In'),
                  h('button', {
                    onClick: () => handleNav('register'),
                    className: 'px-3.5 py-1.5 rounded-xl bg-[#250f03] hover:bg-[#a23f00] text-white text-xs font-bold transition-colors shadow-sm'
                  }, 'Register')
                ),

            // Mobile Hamburger
            h('button', {
              onClick: () => setMobileMenuOpen(!mobileMenuOpen),
              className: 'lg:hidden p-2 rounded-lg text-[#250f03] hover:bg-[#ede8dc] transition-colors focus:outline-none',
              'aria-label': 'Toggle Navigation Menu'
            },
              h('span', { className: 'material-symbols-outlined text-2xl' }, mobileMenuOpen ? 'close' : 'menu')
            )
          )
        ),

        // Mobile drawer menu
        mobileMenuOpen && h('div', { className: 'lg:hidden bg-[#fff9ed] border-t border-[#e8e2d6] px-4 py-3 shadow-xl' },
          h('div', { className: 'flex flex-col gap-1' },
            currentUser
              ? h('div', { className: 'p-3 bg-[#f3ede1] rounded-xl flex items-center justify-between mb-2' },
                  h('div', { className: 'flex items-center gap-2.5 truncate' },
                    h('div', { className: 'w-8 h-8 rounded-full bg-[#250f03] text-white font-bold text-xs flex items-center justify-center shrink-0' }, initial),
                    h('div', { className: 'truncate' },
                      h('p', { className: 'font-bold text-xs text-[#250f03] truncate' }, displayName),
                      h('p', { className: 'text-[10px] text-[#82746e] truncate' }, (currentUser.email || '') + ' (' + (isAdmin ? 'Admin' : 'Customer') + ')')
                    )
                  ),
                  h('button', {
                    onClick: () => {
                      setMobileMenuOpen(false);
                      if (onLogout) onLogout();
                    },
                    className: 'p-1.5 text-red-700 hover:bg-white rounded-lg flex items-center gap-1 text-xs font-bold shrink-0'
                  },
                    h('span', { className: 'material-symbols-outlined text-sm' }, 'logout'),
                    h('span', null, 'Exit')
                  )
                )
              : h('div', { className: 'grid grid-cols-2 gap-2 mb-2' },
                  h('button', {
                    onClick: () => handleNav('login'),
                    className: 'py-2.5 px-3 bg-[#f3ede1] hover:bg-[#ede8dc] text-[#250f03] text-xs font-bold rounded-xl text-center'
                  }, 'Sign In'),
                  h('button', {
                    onClick: () => handleNav('register'),
                    className: 'py-2.5 px-3 bg-[#250f03] text-white text-xs font-bold rounded-xl text-center shadow-sm'
                  }, 'Register')
                ),
            navItems.map((item) =>
              h('button', {
                key: item.id,
                onClick: () => handleNav(item.id),
                className: 'flex items-center justify-between px-4 py-2.5 rounded-xl text-left text-sm font-semibold transition-colors ' +
                  (activePage === item.id ? 'bg-[#3d2314] text-white shadow-sm' : 'text-[#50443f] hover:bg-[#ede8dc] hover:text-[#1d1c14]')
              },
                h('div', { className: 'flex items-center gap-3' },
                  h('span', { className: 'material-symbols-outlined text-lg' }, item.icon),
                  h('span', null, item.label)
                ),
                item.adminOnly && isAdmin && h('span', { className: 'text-[9px] bg-[#fd6c19] text-white px-1.5 py-0.2 rounded font-bold' }, 'ADMIN')
              )
            ),
            h('div', { className: 'pt-2 mt-2 border-t border-[#ede8dc] flex items-center justify-between text-xs text-[#50443f]' },
              h('span', { className: 'flex items-center gap-1' },
                h('span', { className: 'w-2 h-2 rounded-full bg-[#fd6c19] animate-pulse' }),
                h('span', null, 'Open 6:30 AM - 11:00 PM')
              ),
              h('a', { href: 'tel:+919443210890', className: 'font-bold text-[#a23f00] flex items-center gap-1' },
                h('span', { className: 'material-symbols-outlined text-sm' }, 'call'),
                h('span', null, 'Call Kitchen')
              )
            )
          )
        )
      );
    }`;

// 2. Updated Orders Component with RBAC checks and Menu & Price Manager
const updatedOrdersCode = `    // 8. ORDERS & ADMIN PAGE COMPONENT (WITH SECURE RBAC & DATABASE RLS ENFORCEMENT)
    function Orders({ orders, onUpdateStatus, onNavigate, isAdmin = false, currentUser = null }) {
      const [viewMode, setViewMode] = useState(isAdmin ? 'admin' : 'tracking');
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

      // Menu management state (Requirement 7: Admins manage menu items and orders)
      const [adminMenuItems, setAdminMenuItems] = useState([]);
      const [menuLoading, setMenuLoading] = useState(false);
      const [editingPriceId, setEditingPriceId] = useState(null);
      const [editingPriceVal, setEditingPriceVal] = useState('');

      // Fetch customer's own orders or all orders if admin (Requirement 4)
      const fetchOrdersFromSupabase = async () => {
        setLoading(true);
        setError(null);
        const sb = getSupabase();
        if (!sb) {
          setLoading(false);
          return;
        }

        try {
          let user = currentUser;
          if (!user && sb.auth) {
            const { data } = await sb.auth.getUser();
            user = data ? data.user : null;
          }

          let query = sb
            .from('orders')
            .select('id, customer_id, order_number, token_number, status, total_amount, payment_method, payment_status, customer_name, phone, address, created_at, order_items(id, menu_item_id, item_name, quantity, unit_price)')
            .order('created_at', { ascending: false });

          // Customers must only see their own orders (Requirement 4). Admins see all orders.
          if (user && !isAdmin) {
            query = query.eq('customer_id', user.id);
          }

          const { data, error: fetchErr } = await query;
          if (fetchErr) throw fetchErr;

          if (data && data.length > 0) {
            const mappedOrders = data.map((d) => ({
              id: d.order_number || ('#SC-SLM-' + d.id),
              db_id: d.id,
              order_number: d.order_number,
              token_number: d.token_number,
              pin: d.token_number || ('' + d.id),
              status: d.status || 'PREPARING 🔥',
              customer: {
                name: d.customer_name || 'Karthik Subramanian',
                phone: d.phone || '+91 94432 10890',
                address: d.address || 'Fairlands, Salem'
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
          console.warn('Orders query notice:', err);
          setError(err.message || 'Could not fetch live orders from database');
        } finally {
          setLoading(false);
        }
      };

      // Fetch Menu Items for Admin Manager
      const fetchAdminMenu = async () => {
        const sb = getSupabase();
        if (!sb) return;
        setMenuLoading(true);
        try {
          const { data, error: mErr } = await sb
            .from('menu_items')
            .select('*')
            .order('id', { ascending: true });
          if (mErr) throw mErr;
          if (data) setAdminMenuItems(data);
        } catch (e) {
          console.warn('Menu items fetch notice:', e);
        } finally {
          setMenuLoading(false);
        }
      };

      useEffect(() => {
        fetchOrdersFromSupabase();
        if (isAdmin) {
          fetchAdminMenu();
        }
      }, [isAdmin]);

      // Order status update (Requirement 5: Customers cannot update status; only Admins)
      const handleStatusChange = async (orderId, newStatus, dbId) => {
        if (!isAdmin) {
          setError('Permission Denied: Only users with the admin role in profiles can update order status.');
          return;
        }

        onUpdateStatus(orderId, newStatus);
        const sb = getSupabase();
        if (dbId && sb) {
          try {
            const { error: updateErr } = await sb
              .from('orders')
              .update({ status: newStatus })
              .eq('id', dbId);

            if (updateErr) throw updateErr;

            setSuccessBanner('Order ' + orderId + ' updated to ' + newStatus);
            setTimeout(() => setSuccessBanner(null), 3000);
          } catch (err) {
            console.error('Error updating order status in Supabase:', err);
            setError('Database RLS Policy Violation: ' + (err.message || 'Permission denied.'));
          }
        }
      };

      // Admin Menu Price Updater (Requirements 6 & 7: Customers cannot modify menu prices; Admins can)
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

        const sb = getSupabase();
        if (!sb) return;

        try {
          const { error: updateErr } = await sb
            .from('menu_items')
            .update({ price: numPrice })
            .eq('id', itemId);

          if (updateErr) throw updateErr;

          setAdminMenuItems((prev) =>
            prev.map((item) => (item.id === itemId ? { ...item, price: numPrice } : item))
          );
          setEditingPriceId(null);
          setSuccessBanner('Menu item price updated to ₹' + numPrice + ' in PostgreSQL.');
          setTimeout(() => setSuccessBanner(null), 3000);
        } catch (err) {
          console.error('Menu price update error:', err);
          setError('Database RLS Error: ' + (err.message || 'Permission denied while modifying menu price.'));
        }
      };

      // Admin Availability Toggle
      const handleToggleAvailability = async (itemId, currentAvailability) => {
        if (!isAdmin) {
          setError('Permission Denied: Only Admins can modify menu availability.');
          return;
        }

        const newStatus = !currentAvailability;
        const sb = getSupabase();
        if (!sb) return;

        try {
          const { error: toggleErr } = await sb
            .from('menu_items')
            .update({ is_available: newStatus })
            .eq('id', itemId);

          if (toggleErr) throw toggleErr;

          setAdminMenuItems((prev) =>
            prev.map((item) => (item.id === itemId ? { ...item, is_available: newStatus } : item))
          );
          setSuccessBanner('Dish availability updated to ' + (newStatus ? 'Available' : 'Sold Out') + '.');
          setTimeout(() => setSuccessBanner(null), 3000);
        } catch (err) {
          console.error('Menu toggle error:', err);
          setError('Database RLS Error: ' + (err.message || 'Permission denied.'));
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

      return h('div', { className: 'max-w-7xl mx-auto px-4 md:px-8 py-8 w-full' },
        // Top Toolbar
        h('div', { className: 'flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#e8e2d6]' },
          h('div', null,
            h('div', { className: 'flex items-center gap-2' },
              h('span', { className: 'text-xs uppercase font-bold text-[#a23f00] tracking-wider' }, 'Station SLM-KDS-01'),
              isAdmin && h('span', { className: 'text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#fd6c19] text-white' }, 'Admin Verified')
            ),
            h('h1', { className: 'font-serif text-3xl font-bold text-[#250f03]' },
              viewMode === 'tracking' ? 'Live Order Kitchen Pass' : 'Kitchen POS & Command Hub'
            )
          ),
          h('div', { className: 'flex flex-wrap items-center gap-2' },
            h('button', {
              onClick: fetchOrdersFromSupabase,
              className: 'px-3 py-2 bg-[#f3ede1] text-[#250f03] rounded-lg text-xs font-bold hover:bg-[#ede8dc] flex items-center gap-1'
            },
              h('span', { className: 'material-symbols-outlined text-xs ' + (loading ? 'animate-spin' : '') }, 'sync'),
              h('span', null, 'Refresh')
            ),
            isAdmin
              ? h('div', { className: 'flex items-center gap-1 bg-[#ede8dc] p-1 rounded-xl text-xs font-bold' },
                  h('button', {
                    onClick: () => setViewMode('tracking'),
                    className: 'px-3 py-1.5 rounded-lg transition-all ' + (viewMode === 'tracking' ? 'bg-[#250f03] text-white shadow-sm' : 'text-[#50443f] hover:bg-white')
                  }, 'Tracking'),
                  h('button', {
                    onClick: () => setViewMode('admin'),
                    className: 'px-3 py-1.5 rounded-lg transition-all ' + (viewMode === 'admin' ? 'bg-[#250f03] text-white shadow-sm' : 'text-[#50443f] hover:bg-white')
                  }, 'Kitchen Staff Admin')
                )
              : h('div', { className: 'flex items-center gap-1.5 bg-[#f3ede1] px-3 py-1.5 rounded-full text-xs font-semibold text-[#50443f] border border-[#e8e2d6]' },
                  h('span', { className: 'w-2 h-2 rounded-full bg-emerald-600' }),
                  h('span', null, 'Customer Tracking View')
                )
          )
        ),

        // Notifications
        successBanner && h('div', { className: 'mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl flex items-center gap-2 text-xs' },
          h('span', { className: 'material-symbols-outlined text-emerald-600 text-base' }, 'check_circle'),
          h('span', { className: 'font-medium' }, successBanner)
        ),

        error && h('div', { className: 'mb-6 bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-xl flex items-center justify-between text-xs' },
          h('div', { className: 'flex items-center gap-2' },
            h('span', { className: 'material-symbols-outlined text-amber-700 text-base' }, 'info'),
            h('span', null, error)
          ),
          h('button', { onClick: () => setError(null), className: 'text-amber-800 font-bold hover:underline' }, 'Dismiss')
        ),

        loading && displayOrders.length === 0
          ? h('div', { className: 'bg-white rounded-xl p-8 border border-[#e8e2d6] shadow-sm flex flex-col items-center justify-center text-center py-16 animate-pulse' },
              h('span', { className: 'material-symbols-outlined text-4xl text-[#a23f00] mb-3 animate-spin' }, 'progress_activity'),
              h('h3', { className: 'font-bold text-[#250f03] text-base' }, 'Retrieving Live Salem Orders...'),
              h('p', { className: 'text-xs text-[#50443f] mt-1' }, 'Applying database RLS permissions.')
            )
          : displayOrders.length === 0
            ? h('div', { className: 'bg-white rounded-2xl p-12 text-center border border-[#e8e2d6] shadow-sm flex flex-col items-center' },
                h('span', { className: 'material-symbols-outlined text-5xl text-[#82746e] mb-2' }, 'moped'),
                h('h3', { className: 'font-bold text-lg text-[#250f03]' }, 'No Orders Active Yet'),
                h('p', { className: 'text-xs text-[#50443f] max-w-sm mt-1 mb-4' },
                  isAdmin ? 'No live orders currently in the kitchen queue.' : 'Place an order from our Salem filter kaapi and tiffin menu to track live preparation.'
                ),
                h('button', {
                  onClick: () => onNavigate('menu'),
                  className: 'px-5 py-2.5 bg-[#fd6c19] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#a23f00] transition-colors'
                }, 'Explore Menu & Order')
              )
            : viewMode === 'tracking'
              ? h('div', { className: 'grid grid-cols-1 lg:grid-cols-12 gap-8 items-start' },
                  h('div', { className: 'lg:col-span-7 flex flex-col gap-6' },
                    h('div', { className: 'bg-white rounded-xl p-6 shadow-sm border border-[#e8e2d6] flex flex-col gap-4' },
                      h('div', { className: 'flex items-center justify-between border-b border-[#f3ede1] pb-3' },
                        h('div', { className: 'flex items-center gap-2' },
                          h('span', { className: 'material-symbols-outlined text-[#a23f00]' }, 'track_changes'),
                          h('span', { className: 'font-bold text-[#250f03]' }, 'Salem Kitchen Live Pipeline')
                        ),
                        h('div', { className: 'flex items-center gap-2' },
                          activeOrder && activeOrder.token_number && h('span', { className: 'text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900' },
                            'Token #' + activeOrder.token_number
                          ),
                          h('span', { className: 'text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800' },
                            (activeOrder && activeOrder.status) ? activeOrder.status : 'PREPARING 🔥'
                          )
                        )
                      ),
                      h('div', { className: 'flex flex-col gap-4 py-2' },
                        h('div', { className: 'flex items-start gap-4' },
                          h('div', { className: 'w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0' },
                            h('span', { className: 'material-symbols-outlined text-sm' }, 'check')
                          ),
                          h('div', { className: 'flex-1' },
                            h('p', { className: 'font-bold text-xs text-[#250f03]' }, 'Order Confirmed & KOT Printed'),
                            h('p', { className: 'text-xs text-[#50443f]' }, 'Salem Junction kitchen accepted your order instantly.')
                          ),
                          h('span', { className: 'text-xs text-[#50443f]' }, 'Done')
                        ),
                        h('div', { className: 'flex items-start gap-4' },
                          h('div', { className: 'w-8 h-8 rounded-full bg-[#fd6c19] text-white flex items-center justify-center shrink-0 animate-pulse' },
                            h('span', { className: 'material-symbols-outlined text-sm' }, 'local_fire_department')
                          ),
                          h('div', { className: 'flex-1' },
                            h('p', { className: 'font-bold text-xs text-[#250f03]' }, 'Steaming Hot Tiffin & Kaapi Brewing'),
                            h('p', { className: 'text-xs text-[#50443f]' }, 'Medu vadas frying in groundnut oil; degree decoction pulled in brass dabara.')
                          ),
                          h('span', { className: 'text-xs text-[#a23f00] font-bold' }, 'In Progress')
                        ),
                        h('div', { className: 'flex items-start gap-4 opacity-60' },
                          h('div', { className: 'w-8 h-8 rounded-full bg-[#ede8dc] text-[#50443f] flex items-center justify-center shrink-0' },
                            h('span', { className: 'material-symbols-outlined text-sm' }, 'inventory_2')
                          ),
                          h('div', { className: 'flex-1' },
                            h('p', { className: 'font-bold text-xs text-[#250f03]' }, 'Thermal Flask & Areca Leaf Packing'),
                            h('p', { className: 'text-xs text-[#50443f]' }, 'Sealed in spill-proof flasks with fresh chutney duo & drumstick sambar.')
                          ),
                          h('span', { className: 'text-xs text-[#82746e]' }, '~5 mins')
                        ),
                        h('div', { className: 'flex items-start gap-4 opacity-60' },
                          h('div', { className: 'w-8 h-8 rounded-full bg-[#ede8dc] text-[#50443f] flex items-center justify-center shrink-0' },
                            h('span', { className: 'material-symbols-outlined text-sm' }, 'moped')
                          ),
                          h('div', { className: 'flex-1' },
                            h('p', { className: 'font-bold text-xs text-[#250f03]' }, 'Dispatched via Salem Café Runner'),
                            h('p', { className: 'text-xs text-[#50443f]' }, 'Express doorstep delivery across Fairlands & Alagapuram.')
                          ),
                          h('span', { className: 'text-xs text-[#82746e]' }, '~15 mins')
                        )
                      )
                    ),

                    // Runner Contact Card
                    h('div', { className: 'bg-[#f3ede1] rounded-xl p-5 border border-[#e8e2d6] flex items-center justify-between' },
                      h('div', { className: 'flex items-center gap-3' },
                        h('div', { className: 'w-10 h-10 rounded-full bg-[#250f03] text-white flex items-center justify-center font-bold text-sm' }, 'MK'),
                        h('div', null,
                          h('h4', { className: 'font-bold text-sm text-[#250f03]' }, 'Muthu Kumaran'),
                          h('p', { className: 'text-xs text-[#50443f]' }, 'Assigned Salem Café Delivery Barista')
                        )
                      ),
                      h('a', {
                        href: 'tel:+919443210890',
                        className: 'px-4 py-2 bg-[#250f03] text-white rounded-lg text-xs font-bold hover:bg-[#a23f00] flex items-center gap-1 transition-colors'
                      },
                        h('span', { className: 'material-symbols-outlined text-sm' }, 'call'),
                        h('span', null, 'Call (+91 94432 10890)')
                      )
                    )
                  ),

                  // Right Column: Receipt Breakdown
                  h('aside', { className: 'lg:col-span-5 flex flex-col gap-6 sticky top-28' },
                    h('div', { className: 'bg-white rounded-xl p-6 shadow-md border border-[#e8e2d6] flex flex-col gap-4' },
                      h('div', { className: 'flex items-center justify-between pb-3 border-b border-[#f3ede1]' },
                        h('div', { className: 'flex items-center gap-2' },
                          h('span', { className: 'material-symbols-outlined text-[#a23f00]' }, 'receipt'),
                          h('span', { className: 'font-bold text-[#250f03]' }, 'Receipt: ' + (activeOrder && activeOrder.id ? activeOrder.id : '#SC-SLM-8492'))
                        ),
                        h('button', {
                          onClick: () => window.print(),
                          className: 'text-xs text-[#a23f00] font-bold hover:underline flex items-center gap-1'
                        },
                          h('span', { className: 'material-symbols-outlined text-xs' }, 'print'),
                          'Print'
                        )
                      ),
                      h('div', { className: 'flex flex-col gap-2 max-h-56 overflow-y-auto' },
                        activeOrder && activeOrder.items ? activeOrder.items.map((item, idx) =>
                          h('div', { key: idx, className: 'flex justify-between items-center text-xs py-1 border-b border-[#f3ede1]' },
                            h('span', { className: 'text-[#250f03] font-semibold' }, item.qty + 'x ' + item.name),
                            h('span', { className: 'font-bold text-[#250f03]' }, '₹' + (item.price * item.qty))
                          )
                        ) : null
                      ),
                      h('div', { className: 'bg-[#f9f3e7] p-4 rounded-xl flex flex-col gap-1 text-xs text-[#50443f]' },
                        h('div', { className: 'flex justify-between' }, h('span', null, 'Subtotal'), h('span', { className: 'font-bold text-[#250f03]' }, '₹' + (activeOrder && activeOrder.pricing ? activeOrder.pricing.subtotal : 190))),
                        h('div', { className: 'flex justify-between' }, h('span', null, 'Eco-Packaging'), h('span', { className: 'font-bold text-[#250f03]' }, '₹' + (activeOrder && activeOrder.pricing ? activeOrder.pricing.packaging : 10))),
                        h('div', { className: 'flex justify-between' }, h('span', null, 'Delivery Charge'), h('span', { className: 'font-bold text-[#250f03]' }, '₹' + (activeOrder && activeOrder.pricing ? activeOrder.pricing.delivery : 20))),
                        h('div', { className: 'flex justify-between' }, h('span', null, 'GST (5%)'), h('span', { className: 'font-bold text-[#250f03]' }, '₹' + (activeOrder && activeOrder.pricing ? activeOrder.pricing.tax : 9.5))),
                        h('div', { className: 'mt-2 pt-2 border-t border-[#e8e2d6] flex justify-between items-baseline text-[#250f03] font-bold' },
                          h('span', { className: 'text-sm' }, 'Total Amount'),
                          h('span', { className: 'text-lg text-[#a23f00]' }, '₹' + (activeOrder && activeOrder.pricing ? activeOrder.pricing.total : 230))
                        )
                      ),
                      h('div', { className: 'flex flex-col gap-2 pt-2' },
                        h('button', {
                          onClick: () => onNavigate('menu'),
                          className: 'w-full py-3 rounded-xl bg-[#fd6c19] text-white text-xs font-bold hover:bg-[#a23f00] flex items-center justify-center gap-1 transition-colors'
                        },
                          h('span', { className: 'material-symbols-outlined text-sm' }, 'restaurant_menu'),
                          h('span', null, 'Order More Salem Kaapi')
                        )
                      )
                    )
                  )
                )
              : /* KITCHEN STAFF ADMIN COMMAND VIEW (ADMINS ONLY) */
                h('div', { className: 'flex flex-col gap-6' },
                  // Tabs for Admin
                  h('div', { className: 'flex items-center gap-2 border-b border-[#e8e2d6] pb-2' },
                    h('button', {
                      onClick: () => setAdminTab('orders'),
                      className: 'px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ' +
                        (adminTab === 'orders' ? 'bg-[#250f03] text-white shadow-sm' : 'bg-[#f3ede1] text-[#50443f] hover:bg-[#ede8dc]')
                    },
                      h('span', { className: 'material-symbols-outlined text-sm' }, 'receipt_long'),
                      h('span', null, 'Live KOT Queue (' + displayOrders.length + ')')
                    ),
                    h('button', {
                      onClick: () => {
                        setAdminTab('menu');
                        fetchAdminMenu();
                      },
                      className: 'px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ' +
                        (adminTab === 'menu' ? 'bg-[#250f03] text-white shadow-sm' : 'bg-[#f3ede1] text-[#50443f] hover:bg-[#ede8dc]')
                    },
                      h('span', { className: 'material-symbols-outlined text-sm' }, 'edit_note'),
                      h('span', null, 'Menu & Price Manager')
                    )
                  ),

                  adminTab === 'orders'
                    ? h('div', { className: 'grid grid-cols-1 lg:grid-cols-12 gap-8 items-start' },
                        h('div', { className: 'lg:col-span-8 flex flex-col gap-6' },
                          h('div', { className: 'bg-white rounded-xl p-6 shadow-md border border-[#e8e2d6] flex flex-col gap-4' },
                            h('div', { className: 'flex items-center justify-between pb-3 border-b border-[#f3ede1]' },
                              h('div', { className: 'flex items-center gap-2' },
                                h('span', { className: 'w-2.5 h-2.5 rounded-full bg-[#fd6c19] animate-pulse' }),
                                h('h2', { className: 'font-bold text-base text-[#250f03]' }, 'Live KOT Queue (All Salem Orders)'),
                              ),
                              h('span', { className: 'text-[11px] bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full font-bold' },
                                'Admin RLS Authorized'
                              )
                            ),
                            h('div', { className: 'overflow-x-auto' },
                              h('table', { className: 'w-full text-left text-xs' },
                                h('thead', null,
                                  h('tr', { className: 'bg-[#f3ede1] text-[#50443f] uppercase font-bold tracking-wider' },
                                    h('th', { className: 'p-2.5 rounded-l-lg' }, 'Order & Token'),
                                    h('th', { className: 'p-2.5' }, 'Items'),
                                    h('th', { className: 'p-2.5' }, 'Total & Mode'),
                                    h('th', { className: 'p-2.5' }, 'Status Action (Admin)')
                                  )
                                ),
                                h('tbody', null,
                                  displayOrders.map((ord) =>
                                    h('tr', { key: ord.id, className: 'border-b border-[#f3ede1] hover:bg-[#f9f3e7] transition-colors' },
                                      h('td', { className: 'p-2.5 align-top' },
                                        h('p', { className: 'font-bold text-[#250f03]' }, ord.id),
                                        ord.token_number && h('span', { className: 'text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-bold' }, 'Token: #' + ord.token_number),
                                        h('p', { className: 'text-[#1d1c14] mt-1' }, ord.customer ? ord.customer.name : 'Customer'),
                                        h('p', { className: 'text-[#82746e] text-[10px]' }, ord.customer ? ord.customer.phone : '')
                                      ),
                                      h('td', { className: 'p-2.5 align-top' },
                                        ord.items ? ord.items.map((i, idx) =>
                                          h('p', { key: idx, className: 'font-semibold text-[#250f03]' }, i.qty + 'x ' + i.name)
                                        ) : null
                                      ),
                                      h('td', { className: 'p-2.5 align-top' },
                                        h('p', { className: 'font-bold text-[#250f03]' }, '₹' + (ord.pricing ? ord.pricing.total : 230)),
                                        h('span', { className: 'text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-semibold' },
                                          (ord.paymentMethod || 'cod').toUpperCase()
                                        )
                                      ),
                                      h('td', { className: 'p-2.5 align-top' },
                                        h('select', {
                                          value: ord.status,
                                          onChange: (e) => handleStatusChange(ord.id, e.target.value, ord.db_id),
                                          className: 'bg-white border border-[#d4c3bc] px-2 py-1 rounded text-xs font-bold text-[#250f03] focus:outline-none'
                                        },
                                          h('option', { value: 'PREPARING 🔥' }, 'PREPARING 🔥'),
                                          h('option', { value: 'READY FOR PICKUP ☕' }, 'READY FOR PICKUP ☕'),
                                          h('option', { value: 'OUT FOR DELIVERY 🛵' }, 'OUT FOR DELIVERY 🛵'),
                                          h('option', { value: 'COMPLETED ✅' }, 'COMPLETED ✅')
                                        )
                                      )
                                    )
                                  )
                                )
                              )
                            )
                          )
                        ),
                        h('div', { className: 'lg:col-span-4 flex flex-col gap-6' },
                          h('div', { className: 'bg-white rounded-xl p-5 shadow-md border border-[#e8e2d6] flex flex-col gap-3' },
                            h('div', { className: 'flex items-center justify-between border-b border-[#f3ede1] pb-2' },
                              h('div', { className: 'flex items-center gap-1.5' },
                                h('span', { className: 'material-symbols-outlined text-[#a23f00]' }, 'water_drop'),
                                h('h3', { className: 'font-bold text-sm text-[#250f03]' }, 'Brass Decoction Tank')
                              ),
                              h('span', { className: 'text-xs bg-[#ffdbcd] text-[#a23f00] px-2 py-0.5 rounded font-bold' }, 'Batch #' + decoctionBatch)
                            ),
                            h('div', { className: 'flex items-baseline justify-between text-xs' },
                              h('span', null, 'Decoction Level'),
                              h('span', { className: 'font-bold text-base text-[#a23f00]' }, decoctionLevel + '%')
                            ),
                            h('div', { className: 'w-full bg-[#f3ede1] h-3.5 rounded-full overflow-hidden' },
                              h('div', {
                                className: 'bg-gradient-to-r from-[#a23f00] to-[#fd6c19] h-full transition-all duration-700 rounded-full',
                                style: { width: decoctionLevel + '%' }
                              })
                            ),
                            h('button', {
                              onClick: handleBrew,
                              disabled: brewing,
                              className: 'w-full py-2.5 rounded-xl bg-[#250f03] hover:bg-[#a23f00] text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-colors disabled:opacity-50'
                            },
                              h('span', { className: 'material-symbols-outlined text-sm' }, 'coffee_maker'),
                              h('span', null, brewing ? 'Brewing Fresh Decoction...' : 'Brew Fresh Batch (100%)')
                            )
                          )
                        )
                      )
                    : /* Menu Items & Price Manager (Requirement 7: Admins manage menu items; Requirement 6: Customers cannot modify prices) */
                      h('div', { className: 'bg-white rounded-xl p-6 shadow-md border border-[#e8e2d6] flex flex-col gap-4' },
                        h('div', { className: 'flex items-center justify-between pb-3 border-b border-[#f3ede1]' },
                          h('div', null,
                            h('h2', { className: 'font-bold text-base text-[#250f03]' }, 'Salem Menu Management (Admin Only)'),
                            h('p', { className: 'text-xs text-[#50443f]' }, 'Update prices and toggle live dish availability in PostgreSQL. Protected by database RLS.')
                          ),
                          h('button', {
                            onClick: fetchAdminMenu,
                            className: 'px-3 py-1.5 bg-[#f3ede1] text-[#250f03] rounded-lg text-xs font-bold hover:bg-[#ede8dc] flex items-center gap-1'
                          },
                            h('span', { className: 'material-symbols-outlined text-xs ' + (menuLoading ? 'animate-spin' : '') }, 'sync'),
                            h('span', null, 'Refresh Menu')
                          )
                        ),
                        menuLoading && adminMenuItems.length === 0
                          ? h('div', { className: 'text-center py-8 text-xs text-[#50443f]' }, 'Loading database menu items...')
                          : h('div', { className: 'overflow-x-auto' },
                              h('table', { className: 'w-full text-left text-xs' },
                                h('thead', null,
                                  h('tr', { className: 'bg-[#f3ede1] text-[#50443f] uppercase font-bold tracking-wider' },
                                    h('th', { className: 'p-2.5 rounded-l-lg' }, 'Dish Name'),
                                    h('th', { className: 'p-2.5' }, 'Category'),
                                    h('th', { className: 'p-2.5' }, 'Current Price (₹)'),
                                    h('th', { className: 'p-2.5' }, 'Availability'),
                                    h('th', { className: 'p-2.5 rounded-r-lg' }, 'Actions')
                                  )
                                ),
                                h('tbody', null,
                                  adminMenuItems.map((item) =>
                                    h('tr', { key: item.id, className: 'border-b border-[#f3ede1] hover:bg-[#f9f3e7] transition-colors' },
                                      h('td', { className: 'p-2.5 align-middle' },
                                        h('p', { className: 'font-bold text-[#250f03]' }, item.name),
                                        h('p', { className: 'text-[11px] text-[#82746e] truncate max-w-xs' }, item.description)
                                      ),
                                      h('td', { className: 'p-2.5 align-middle' },
                                        h('span', { className: 'px-2 py-0.5 rounded-full bg-[#f3ede1] text-[#250f03] font-semibold text-[11px]' }, item.category)
                                      ),
                                      h('td', { className: 'p-2.5 align-middle' },
                                        editingPriceId === item.id
                                          ? h('div', { className: 'flex items-center gap-1.5' },
                                              h('span', { className: 'font-bold text-[#250f03]' }, '₹'),
                                              h('input', {
                                                type: 'number',
                                                value: editingPriceVal,
                                                onChange: (e) => setEditingPriceVal(e.target.value),
                                                className: 'w-16 bg-white border border-[#fd6c19] px-2 py-1 rounded text-xs font-bold text-[#250f03]'
                                              }),
                                              h('button', {
                                                onClick: () => handleUpdateMenuPrice(item.id, editingPriceVal),
                                                className: 'px-2 py-1 bg-emerald-700 text-white rounded text-[11px] font-bold hover:bg-emerald-800'
                                              }, 'Save'),
                                              h('button', {
                                                onClick: () => setEditingPriceId(null),
                                                className: 'px-1.5 py-1 text-[#82746e] text-[11px] hover:text-[#250f03]'
                                              }, '✕')
                                            )
                                          : h('div', { className: 'flex items-center gap-2' },
                                              h('span', { className: 'font-bold text-sm text-[#250f03]' }, '₹' + item.price),
                                              h('button', {
                                                onClick: () => {
                                                  setEditingPriceId(item.id);
                                                  setEditingPriceVal(item.price.toString());
                                                },
                                                className: 'text-[11px] text-[#a23f00] font-bold hover:underline flex items-center gap-0.5'
                                              },
                                                h('span', { className: 'material-symbols-outlined text-xs' }, 'edit'),
                                                h('span', null, 'Edit')
                                              )
                                            )
                                      ),
                                      h('td', { className: 'p-2.5 align-middle' },
                                        h('span', {
                                          className: 'text-[11px] font-bold px-2 py-0.5 rounded-full ' +
                                            (item.is_available ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800')
                                        }, item.is_available ? 'Available' : 'Sold Out')
                                      ),
                                      h('td', { className: 'p-2.5 align-middle' },
                                        h('button', {
                                          onClick: () => handleToggleAvailability(item.id, item.is_available),
                                          className: 'px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ' +
                                            (item.is_available ? 'bg-[#f3ede1] text-red-800 hover:bg-red-100' : 'bg-[#250f03] text-white hover:bg-[#a23f00]')
                                        }, item.is_available ? 'Mark Sold Out' : 'Mark Available')
                                      )
                                    )
                                  )
                                )
                              )
                            )
                      )
                )
      );
    }`;

// 3. Updated Login Component with Customer & Admin Demo buttons
const updatedLoginCode = `    // 8.5. LOGIN PAGE COMPONENT (WITH CUSTOMER & ADMIN TESTING ACCOUNTS)
    function Login({ onNavigate, onLoginSuccess, redirectTarget = null, redirectNotice = null }) {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [showPassword, setShowPassword] = useState(false);
      const [loading, setLoading] = useState(false);
      const [errorMessage, setErrorMessage] = useState(null);
      const [successMessage, setSuccessMessage] = useState(null);

      const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);

        const cleanEmail = email.trim();
        if (!cleanEmail) {
          setErrorMessage('Please enter your email address.');
          return;
        }
        if (!password) {
          setErrorMessage('Please enter your password.');
          return;
        }

        const sb = getSupabase();
        if (!sb || !sb.auth) {
          setErrorMessage('Supabase auth is not available.');
          return;
        }

        setLoading(true);
        try {
          const { data, error } = await sb.auth.signInWithPassword({
            email: cleanEmail,
            password: password
          });

          if (error) throw error;

          if (data && data.user) {
            setSuccessMessage('Welcome back! Signed in successfully.');
            if (onLoginSuccess) onLoginSuccess(data.user);
            setTimeout(() => {
              onNavigate(redirectTarget || 'home');
            }, 500);
          }
        } catch (err) {
          console.error('Login error:', err);
          let msg = err.message || 'Failed to sign in. Please check your credentials.';
          if (err.message && err.message.indexOf('Invalid login credentials') !== -1) {
            msg = 'Incorrect email or password. Please verify your credentials or register a new account.';
          }
          setErrorMessage(msg);
        } finally {
          setLoading(false);
        }
      };

      // 1-Click Customer Demo Login
      const handleCustomerDemoLogin = async () => {
        setEmail('karthik.salemcafe@gmail.com');
        setPassword('SalemKaapi@2025!');
        setErrorMessage(null);
        const sb = getSupabase();
        if (!sb || !sb.auth) return;

        setLoading(true);
        try {
          const { data, error } = await sb.auth.signInWithPassword({
            email: 'karthik.salemcafe@gmail.com',
            password: 'SalemKaapi@2025!'
          });

          if (error) {
            const { data: regData, error: regError } = await sb.auth.signUp({
              email: 'karthik.salemcafe@gmail.com',
              password: 'SalemKaapi@2025!',
              options: {
                data: {
                  full_name: 'Karthik Subramanian',
                  phone: '+91 94432 10890'
                }
              }
            });
            if (regError) throw regError;
            if (regData && regData.user) {
              setSuccessMessage('Customer demo account initialized and signed in!');
              if (onLoginSuccess) onLoginSuccess(regData.user, { role: 'customer', full_name: 'Karthik Subramanian' });
              setTimeout(() => onNavigate(redirectTarget || 'home'), 500);
              return;
            }
          }

          if (data && data.user) {
            setSuccessMessage('Signed in as Karthik Subramanian (Customer)');
            if (onLoginSuccess) onLoginSuccess(data.user, { role: 'customer', full_name: 'Karthik Subramanian' });
            setTimeout(() => onNavigate(redirectTarget || 'home'), 500);
          }
        } catch (err) {
          setErrorMessage(err.message || 'Customer demo login failed.');
        } finally {
          setLoading(false);
        }
      };

      // 1-Click Admin Staff Demo Login (Requirement: Test both customer and admin accounts)
      const handleAdminDemoLogin = async () => {
        setEmail('admin.salemcafe@gmail.com');
        setPassword('AdminSalemKaapi@2025!');
        setErrorMessage(null);
        const sb = getSupabase();
        if (!sb || !sb.auth) return;

        setLoading(true);
        try {
          const { data, error } = await sb.auth.signInWithPassword({
            email: 'admin.salemcafe@gmail.com',
            password: 'AdminSalemKaapi@2025!'
          });

          if (error) {
            const { data: regData, error: regError } = await sb.auth.signUp({
              email: 'admin.salemcafe@gmail.com',
              password: 'AdminSalemKaapi@2025!',
              options: {
                data: {
                  full_name: 'Ramasamy Iyer (Kitchen Lead)',
                  phone: '+91 94432 99887'
                }
              }
            });
            if (regError) throw regError;
            if (regData && regData.user) {
              setSuccessMessage('Admin staff account initialized! Role verified.');
              if (onLoginSuccess) onLoginSuccess(regData.user, { role: 'admin', full_name: 'Ramasamy Iyer (Kitchen Lead)' });
              setTimeout(() => onNavigate(redirectTarget || 'admin'), 500);
              return;
            }
          }

          if (data && data.user) {
            setSuccessMessage('Signed in as Ramasamy Iyer (Admin Staff)!');
            if (onLoginSuccess) onLoginSuccess(data.user, { role: 'admin', full_name: 'Ramasamy Iyer (Kitchen Lead)' });
            setTimeout(() => onNavigate(redirectTarget || 'admin'), 500);
          }
        } catch (err) {
          setErrorMessage(err.message || 'Admin demo login failed.');
        } finally {
          setLoading(false);
        }
      };

      return h('div', { className: 'max-w-md mx-auto px-4 py-12 w-full' },
        h('div', { className: 'text-center mb-8' },
          h('div', { className: 'inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#f3ede1] shadow-sm mb-3' },
            h('span', { className: 'material-symbols-outlined text-[#a23f00] text-3xl' }, 'local_cafe')
          ),
          h('h1', { className: 'font-serif text-3xl font-bold text-[#250f03]' }, 'Welcome Back'),
          h('p', { className: 'text-xs text-[#a23f00] font-semibold uppercase tracking-wider mt-1' },
            'Smart Café Salem • Authentication & RBAC Portal'
          )
        ),

        redirectNotice && h('div', { className: 'mb-6 bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-xl flex items-center gap-2.5 text-xs' },
          h('span', { className: 'material-symbols-outlined text-amber-700 text-base' }, 'lock'),
          h('span', { className: 'font-medium' }, redirectNotice)
        ),

        errorMessage && h('div', { className: 'mb-6 bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl flex items-start gap-2.5 text-xs animate-shake' },
          h('span', { className: 'material-symbols-outlined text-red-600 text-base shrink-0 mt-0.5' }, 'error'),
          h('div', { className: 'flex-1' }, errorMessage),
          h('button', { onClick: () => setErrorMessage(null), className: 'text-red-700 font-bold hover:underline shrink-0' }, '✕')
        ),

        successMessage && h('div', { className: 'mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl flex items-center gap-2.5 text-xs' },
          h('span', { className: 'material-symbols-outlined text-emerald-600 text-base' }, 'check_circle'),
          h('span', { className: 'font-medium' }, successMessage)
        ),

        h('div', { className: 'bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#e8e2d6]' },
          h('form', { onSubmit: handleSubmit, className: 'flex flex-col gap-4' },
            h('div', { className: 'flex flex-col gap-1.5' },
              h('label', { className: 'text-xs font-bold text-[#250f03] flex items-center gap-1.5' },
                h('span', { className: 'material-symbols-outlined text-sm text-[#a23f00]' }, 'mail'),
                h('span', null, 'Email Address')
              ),
              h('input', {
                type: 'email',
                required: true,
                autoFocus: true,
                value: email,
                onChange: (e) => setEmail(e.target.value),
                placeholder: 'e.g. karthik.salem@gmail.com',
                className: 'w-full bg-[#f9f3e7] px-3.5 py-2.5 rounded-xl text-xs text-[#1d1c14] border border-[#e8e2d6] focus:outline-none focus:ring-2 focus:ring-[#fd6c19] focus:bg-white transition-all'
              })
            ),
            h('div', { className: 'flex flex-col gap-1.5' },
              h('label', { className: 'text-xs font-bold text-[#250f03] flex items-center gap-1.5' },
                h('span', { className: 'material-symbols-outlined text-sm text-[#a23f00]' }, 'lock'),
                h('span', null, 'Password')
              ),
              h('div', { className: 'relative' },
                h('input', {
                  type: showPassword ? 'text' : 'password',
                  required: true,
                  value: password,
                  onChange: (e) => setPassword(e.target.value),
                  placeholder: 'Enter your password',
                  className: 'w-full bg-[#f9f3e7] px-3.5 py-2.5 pr-10 rounded-xl text-xs text-[#1d1c14] border border-[#e8e2d6] focus:outline-none focus:ring-2 focus:ring-[#fd6c19] focus:bg-white transition-all'
                }),
                h('button', {
                  type: 'button',
                  onClick: () => setShowPassword(!showPassword),
                  className: 'absolute right-3 top-1/2 -translate-y-1/2 text-[#82746e] hover:text-[#250f03]'
                },
                  h('span', { className: 'material-symbols-outlined text-base' }, showPassword ? 'visibility_off' : 'visibility')
                )
              )
            ),
            h('button', {
              type: 'submit',
              disabled: loading,
              className: 'w-full mt-2 py-3.5 px-4 rounded-xl bg-[#fd6c19] hover:bg-[#a23f00] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50'
            },
              loading
                ? [
                    h('span', { key: 'sp', className: 'material-symbols-outlined text-sm animate-spin' }, 'progress_activity'),
                    h('span', { key: 'tx' }, 'Authenticating with Salem Café...')
                  ]
                : [
                    h('span', { key: 'tx' }, 'Sign In to Account'),
                    h('span', { key: 'ic', className: 'material-symbols-outlined text-sm' }, 'arrow_forward')
                  ]
            )
          ),

          h('div', { className: 'relative my-6 text-center' },
            h('div', { className: 'absolute inset-0 flex items-center' },
              h('div', { className: 'w-full border-t border-[#ede8dc]' })
            ),
            h('span', { className: 'relative bg-white px-3 text-[11px] font-semibold text-[#82746e] uppercase tracking-wider' },
              'RBAC Testing Accounts'
            )
          ),

          h('div', { className: 'flex flex-col gap-2.5' },
            h('button', {
              type: 'button',
              disabled: loading,
              onClick: handleCustomerDemoLogin,
              className: 'w-full py-2.5 px-3 rounded-xl bg-[#f3ede1] hover:bg-[#ede8dc] text-[#250f03] font-bold text-xs border border-[#e8e2d6] flex items-center justify-between transition-colors disabled:opacity-50'
            },
              h('div', { className: 'flex items-center gap-2' },
                h('span', { className: 'material-symbols-outlined text-[#a23f00] text-sm' }, 'person'),
                h('span', null, '1-Click Customer: Karthik')
              ),
              h('span', { className: 'text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full' }, 'Role: Customer')
            ),

            h('button', {
              type: 'button',
              disabled: loading,
              onClick: handleAdminDemoLogin,
              className: 'w-full py-2.5 px-3 rounded-xl bg-[#250f03] hover:bg-[#3d2314] text-white font-bold text-xs shadow-sm flex items-center justify-between transition-colors disabled:opacity-50'
            },
              h('div', { className: 'flex items-center gap-2' },
                h('span', { className: 'material-symbols-outlined text-[#fd6c19] text-sm' }, 'admin_panel_settings'),
                h('span', null, '1-Click Admin: Ramasamy (Staff)')
              ),
              h('span', { className: 'text-[10px] bg-[#fd6c19] text-white font-bold px-2 py-0.5 rounded-full' }, 'Role: Admin')
            )
          ),

          h('div', { className: 'mt-6 pt-4 border-t border-[#ede8dc] text-center text-xs text-[#50443f]' },
            h('span', null, 'New to Smart Café Salem? '),
            h('button', {
              onClick: () => onNavigate('register'),
              className: 'font-bold text-[#a23f00] hover:underline'
            }, 'Create an Account')
          )
        )
      );
    }`;

// 4. Updated App Component with Admin Protection, Unauthorized Redirects, and Session Expiry
const updatedAppCode = `    // 9. APP ROOT (WITH SECURE RBAC & ADMIN GATING)
    function App() {
      const [activePage, setActivePage] = useState('home');

      // Customer & Admin Auth state
      const [currentUser, setCurrentUser] = useState(null);
      const [customerProfile, setCustomerProfile] = useState(null);
      const [authLoading, setAuthLoading] = useState(true);
      const [redirectAfterAuth, setRedirectAfterAuth] = useState(null);
      const [redirectNotice, setRedirectNotice] = useState(null);
      const [accessDeniedNotice, setAccessDeniedNotice] = useState(null);
      const [globalBanner, setGlobalBanner] = useState(null);

      const [cart, setCart] = useState(() => {
        try {
          const saved = localStorage.getItem('react_smart_cafe_cart');
          return saved ? JSON.parse(saved) : INITIAL_CART;
        } catch (e) {
          return INITIAL_CART;
        }
      });

      const [orders, setOrders] = useState(() => {
        try {
          const saved = localStorage.getItem('react_smart_cafe_orders');
          return saved ? JSON.parse(saved) : INITIAL_ORDERS;
        } catch (e) {
          return INITIAL_ORDERS;
        }
      });

      // Verify admin role using the Supabase profiles table (Requirement 2)
      const isAdmin = (customerProfile && customerProfile.role === 'admin');

      // Fetch customer profile from PostgreSQL profiles table
      const fetchProfile = async (userId) => {
        const sb = getSupabase();
        if (!sb) return;
        try {
          const { data, error } = await sb
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (!error && data) {
            setCustomerProfile(data);
          }
        } catch (err) {
          console.warn('Profiles table query notice:', err);
        }
      };

      // Handle session expiry (Requirement 9)
      const handleSessionExpired = () => {
        setCurrentUser(null);
        setCustomerProfile(null);
        setRedirectNotice('Your login session has expired. Please sign in again.');
        setGlobalBanner('Session expired. Please log in.');
        setTimeout(() => setGlobalBanner(null), 4000);
        setActivePage('login');
      };

      // Listen to Supabase Auth session & state changes
      useEffect(() => {
        const sb = getSupabase();
        if (!sb || !sb.auth) {
          setAuthLoading(false);
          return;
        }

        // 1. Initial session check
        sb.auth.getSession().then(({ data }) => {
          const session = data && data.session;
          const user = session ? session.user : null;
          setCurrentUser(user);
          if (user) {
            fetchProfile(user.id);
          }
          setAuthLoading(false);
        }).catch(() => setAuthLoading(false));

        // 2. Subscribe to auth events
        const { data: authSub } = sb.auth.onAuthStateChange(async (event, session) => {
          const user = session ? session.user : null;
          setCurrentUser(user);
          if (user) {
            fetchProfile(user.id);
          } else {
            setCustomerProfile(null);
          }

          if (event === 'SIGNED_IN') {
            const name = (user && user.user_metadata && user.user_metadata.full_name) || (user && user.email) || 'Customer';
            setGlobalBanner('Signed in as ' + name);
            setTimeout(() => setGlobalBanner(null), 3500);
          } else if (event === 'SIGNED_OUT') {
            setCustomerProfile(null);
          } else if (event === 'TOKEN_REFRESHED' && !session) {
            handleSessionExpired();
          }
        });

        return () => {
          if (authSub && authSub.subscription) {
            authSub.subscription.unsubscribe();
          }
        };
      }, []);

      useEffect(() => {
        try {
          localStorage.setItem('react_smart_cafe_cart', JSON.stringify(cart));
        } catch (e) {}
      }, [cart]);

      useEffect(() => {
        try {
          localStorage.setItem('react_smart_cafe_orders', JSON.stringify(orders));
        } catch (e) {}
      }, [orders]);

      // Protected Navigation Handler (Requirements 1, 6 & 8)
      const handleNavigate = (targetPage) => {
        // Requirement 6: Protect checkout and orders pages
        if ((targetPage === 'checkout' || targetPage === 'orders') && !currentUser) {
          setRedirectAfterAuth(targetPage);
          setRedirectNotice(
            targetPage === 'checkout'
              ? 'Customer sign in is required to finalize your order.'
              : 'Please sign in to view your live orders and delivery tracking.'
          );
          setActivePage('login');
          return;
        }

        // Requirements 1 & 8: Only users with the admin role can access admin pages.
        // Redirect unauthorized users away from admin pages.
        if (targetPage === 'admin') {
          if (!currentUser) {
            setRedirectAfterAuth('admin');
            setRedirectNotice('Staff Hub requires Admin authentication. Please sign in with an admin staff account.');
            setActivePage('login');
            return;
          }

          // Verify admin role using profiles table (Requirement 2)
          if (!isAdmin) {
            const userName = (customerProfile && customerProfile.full_name) || (currentUser && currentUser.user_metadata && currentUser.user_metadata.full_name) || currentUser.email;
            setAccessDeniedNotice(
              'Access Denied: The Staff Hub is restricted to administrators. Your account (' + userName + ') has the "customer" role.'
            );
            setTimeout(() => setAccessDeniedNotice(null), 5000);
            setActivePage('home'); // Redirect unauthorized users away (Requirement 8)
            return;
          }
        }

        setRedirectNotice(null);
        setAccessDeniedNotice(null);
        setActivePage(targetPage);
      };

      // Logout handler (Requirement 9)
      const handleLogout = async () => {
        const sb = getSupabase();
        if (sb && sb.auth) {
          try {
            await sb.auth.signOut();
          } catch (err) {
            console.error('Logout error:', err);
          }
        }
        setCurrentUser(null);
        setCustomerProfile(null);
        setGlobalBanner('You have been logged out successfully.');
        setTimeout(() => setGlobalBanner(null), 3500);
        setActivePage('home');
      };

      const playTone = () => {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        } catch (e) {}
      };

      const handleAddToCart = (item) => {
        setCart((prev) => {
          const existing = prev.find((i) => i.id === item.id);
          if (existing) {
            return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
          }
          return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
        });
        playTone();
      };

      const handleUpdateQty = (id, delta) => {
        setCart((prev) =>
          prev
            .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
            .filter((item) => item.qty > 0)
        );
      };

      const handleClearCart = () => setCart([]);

      const handlePlaceOrder = (orderPayload) => {
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const tokenNumber = '' + Math.floor(100 + Math.random() * 900);
        const newOrder = {
          ...orderPayload,
          id: orderPayload.order_number || ('#SC-SLM-' + randomSuffix),
          token_number: orderPayload.token_number || tokenNumber,
          pin: orderPayload.token_number || tokenNumber,
          status: orderPayload.status || 'PREPARING 🔥',
          createdAt: orderPayload.createdAt || new Date().toISOString(),
          runner: { name: 'Muthu Kumaran', phone: '+91 94432 10890' }
        };
        setOrders((prev) => [newOrder, ...prev]);
        setCart([]);
      };

      const handleUpdateStatus = (orderId, newStatus) => {
        setOrders((prev) =>
          prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
        );
      };

      const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);

      return h('div', { className: 'min-h-screen bg-[#fff9ed] text-[#1d1c14] flex flex-col justify-between font-sans' },
        h(Navbar, {
          activePage: activePage,
          setActivePage: handleNavigate,
          cartCount: totalCartCount,
          currentUser: currentUser,
          customerProfile: customerProfile,
          onLogout: handleLogout,
          isAdmin: isAdmin
        }),

        // Global Banner
        globalBanner && h('div', { className: 'fixed top-24 right-4 z-50 bg-[#250f03] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs border border-[#fd6c19]' },
          h('span', { className: 'material-symbols-outlined text-[#fd6c19] text-base' }, 'check_circle'),
          h('span', null, globalBanner)
        ),

        // Access Denied Banner (Requirement 8)
        accessDeniedNotice && h('div', { className: 'max-w-7xl mx-auto px-4 md:px-8 mt-24 mb--16 w-full' },
          h('div', { className: 'bg-red-50 border border-red-200 text-red-900 p-4 rounded-xl flex items-start justify-between text-xs shadow-md' },
            h('div', { className: 'flex items-center gap-2.5' },
              h('span', { className: 'material-symbols-outlined text-red-600 text-xl' }, 'block'),
              h('div', null,
                h('p', { className: 'font-bold text-red-800' }, 'RBAC Security Notice'),
                h('p', { className: 'text-red-700 mt-0.5' }, accessDeniedNotice)
              )
            ),
            h('button', {
              onClick: () => setAccessDeniedNotice(null),
              className: 'text-red-700 font-bold hover:underline'
            }, 'Dismiss')
          )
        ),

        h('main', { className: 'flex-1 w-full pt-28' },
          activePage === 'home' && h(Home, {
            onNavigate: handleNavigate,
            onAddToCart: handleAddToCart
          }),
          activePage === 'menu' && h(Menu, {
            cart: cart,
            onAddToCart: handleAddToCart,
            onUpdateQty: handleUpdateQty,
            onClearCart: handleClearCart,
            onNavigate: handleNavigate
          }),
          activePage === 'cart' && h('div', { className: 'max-w-3xl mx-auto px-4 py-8' },
            h('h1', { className: 'font-serif text-3xl font-bold text-[#250f03] mb-6' }, 'Your Basket & Kaapi Tray'),
            h(Cart, {
              cart: cart,
              onUpdateQty: handleUpdateQty,
              onClear: handleClearCart,
              onProceed: () => handleNavigate('checkout'),
              isSidebar: false
            })
          ),
          activePage === 'checkout' && h(Checkout, {
            cart: cart,
            onPlaceOrder: handlePlaceOrder,
            onNavigate: handleNavigate
          }),
          (activePage === 'orders' || activePage === 'admin') && h(Orders, {
            orders: orders,
            onUpdateStatus: handleUpdateStatus,
            onNavigate: handleNavigate,
            isAdmin: isAdmin,
            currentUser: currentUser
          }),
          activePage === 'login' && h(Login, {
            onNavigate: setActivePage,
            redirectTarget: redirectAfterAuth,
            redirectNotice: redirectNotice,
            onLoginSuccess: (user, mockProfile) => {
              setCurrentUser(user);
              if (mockProfile) {
                setCustomerProfile(mockProfile);
              } else {
                fetchProfile(user.id);
              }
            }
          }),
          activePage === 'register' && h(Register, {
            onNavigate: setActivePage,
            redirectTarget: redirectAfterAuth,
            onRegisterSuccess: (user) => {
              setCurrentUser(user);
              fetchProfile(user.id);
            }
          })
        ),
        h('footer', { className: 'w-full bg-[#f3ede1] mt-12 py-8 px-4 md:px-8 border-t border-[#e8e2d6] text-xs text-[#50443f]' },
          h('div', { className: 'max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4' },
            h('p', null, '© 2025 Eswar, Bala & Co. Salem Junction & NH44 Rest Stop.'),
            h('div', { className: 'flex items-center gap-4' },
              h('button', { onClick: () => handleNavigate('home'), className: 'hover:text-[#a23f00]' }, 'Home'),
              h('button', { onClick: () => handleNavigate('menu'), className: 'hover:text-[#a23f00]' }, 'Menu'),
              h('button', { onClick: () => handleNavigate('orders'), className: 'hover:text-[#a23f00]' }, 'Order Tracking'),
              h('button', { onClick: () => handleNavigate('admin'), className: 'hover:text-[#a23f00]' },
                'Staff Hub ' + (isAdmin ? '(Admin)' : '')
              ),
              currentUser
                ? h('button', { onClick: handleLogout, className: 'text-red-700 font-bold hover:underline' }, 'Log Out')
                : h('button', { onClick: () => handleNavigate('login'), className: 'hover:text-[#a23f00] font-bold' }, 'Sign In')
            )
          )
        )
      );
    }`;

// 1. Replace Navbar
const navStart = code.indexOf('    // 2. NAVBAR COMPONENT');
const navEnd = code.indexOf('    // 3. MENU CARD COMPONENT');
if (navStart === -1 || navEnd === -1) {
  console.error('Navbar markers missing in build_bundle.js', { navStart, navEnd });
  process.exit(1);
}
code = code.slice(0, navStart) + updatedNavbarCode + '\n\n' + code.slice(navEnd);

// 2. Replace Orders
const ordersStart = code.indexOf('    // 8. ORDERS & ADMIN PAGE COMPONENT');
const ordersEnd = code.indexOf('    // 8.5. LOGIN PAGE COMPONENT');
if (ordersStart === -1 || ordersEnd === -1) {
  console.error('Orders markers missing in build_bundle.js', { ordersStart, ordersEnd });
  process.exit(1);
}
code = code.slice(0, ordersStart) + updatedOrdersCode + '\n\n' + code.slice(ordersEnd);

// 3. Replace Login
const loginStart = code.indexOf('    // 8.5. LOGIN PAGE COMPONENT');
const loginEnd = code.indexOf('    // 8.6. REGISTER PAGE COMPONENT');
if (loginStart === -1 || loginEnd === -1) {
  console.error('Login markers missing in build_bundle.js', { loginStart, loginEnd });
  process.exit(1);
}
code = code.slice(0, loginStart) + updatedLoginCode + '\n\n' + code.slice(loginEnd);

// 4. Replace App
const appStart = code.indexOf('    // 9. APP ROOT');
const appEnd = code.indexOf('    // 10. MOUNT REACT APP ROBUSTLY');
if (appStart === -1 || appEnd === -1) {
  console.error('App markers missing in build_bundle.js', { appStart, appEnd });
  process.exit(1);
}
code = code.slice(0, appStart) + updatedAppCode + '\n\n' + code.slice(appEnd);

fs.writeFileSync(bundlePath, code, 'utf8');
console.log('✔ Successfully updated build_bundle.js with Stage 7 RBAC & Security!');
