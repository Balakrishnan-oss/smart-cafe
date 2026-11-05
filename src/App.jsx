import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Cart from './components/Cart';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import { supabase } from './lib/supabaseClient';

const INITIAL_CART = [
  { id: 1, name: "Salem Filter Coffee (Davarah Tumbler)", price: 25, qty: 2 },
  { id: 7, name: "Ghee Podi Thatte Idli", price: 50, qty: 2 },
  { id: 11, name: "Crispy Medu Vada (2 pcs)", price: 20, qty: 2 }
];

const INITIAL_ORDERS = [
  {
    id: "#SC-SLM-8492",
    token_number: "492",
    customer: {
      name: "Karthik Subramanian",
      phone: "+91 98421 55678",
      email: "karthik.s@example.com",
      address: "Plot 14, Fairlands Main Road, Salem - 636016"
    },
    items: [
      { id: 1, name: "Salem Filter Coffee (Davarah Tumbler)", price: 25, qty: 2 },
      { id: 7, name: "Ghee Podi Thatte Idli", price: 50, qty: 2 }
    ],
    pricing: { subtotal: 150, packaging: 10, delivery: 20, tax: 7.5, total: 187.5 },
    mode: "delivery",
    paymentMethod: "cod",
    status: "PREPARING 🔥",
    pin: "4892",
    runner: { name: "Muthu Kumaran", phone: "+91 94432 10890" }
  }
];

export default function App() {
  const [activePage, setActivePage] = useState('home');

  // Supabase Authentication & Profile state
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
  const isAdmin = customerProfile && customerProfile.role === 'admin';

  // Fetch customer profile from PostgreSQL profiles table
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
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

  // Supabase Auth session & expiry listener (Requirement 9: Handle expired sessions & logout)
  useEffect(() => {
    // 1. Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      if (user) {
        fetchProfile(user.id);
      }
      setAuthLoading(false);
    }).catch((err) => {
      console.warn('Session check notice:', err);
      setAuthLoading(false);
    });

    // 2. Real-time auth state & session expiry listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user ?? null;
      setCurrentUser(user);

      if (user) {
        fetchProfile(user.id);
      } else {
        setCustomerProfile(null);
      }

      if (event === 'SIGNED_IN') {
        const name = user?.user_metadata?.full_name || user?.email;
        setGlobalBanner(`Signed in as ${name}`);
        setTimeout(() => setGlobalBanner(null), 4000);
      } else if (event === 'SIGNED_OUT') {
        setCustomerProfile(null);
      } else if (event === 'TOKEN_REFRESHED' && !session) {
        // Session expired handler (Requirement 9)
        handleSessionExpired();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Handle expired session (Requirement 9)
  const handleSessionExpired = () => {
    setCurrentUser(null);
    setCustomerProfile(null);
    setRedirectNotice('Your login session has expired. Please sign in again.');
    setGlobalBanner('Session expired. Please log in.');
    setTimeout(() => setGlobalBanner(null), 4000);
    setActivePage('login');
  };

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

  // Protected navigation handler (Requirements 1, 6 & 8)
  const handleNavigate = (targetPage) => {
    // Requirement 6: Protect checkout and orders pages for authenticated users
    if ((targetPage === 'checkout' || targetPage === 'orders') && !currentUser) {
      setRedirectAfterAuth(targetPage);
      setRedirectNotice(
        targetPage === 'checkout'
          ? 'Customer sign in is required to finalize your checkout order.'
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
        const userName = customerProfile?.full_name || currentUser?.user_metadata?.full_name || currentUser.email;
        setAccessDeniedNotice(
          `Access Denied: The Staff Hub is restricted to administrators. Your account (${userName}) has the "customer" role.`
        );
        setTimeout(() => setAccessDeniedNotice(null), 5000);
        setActivePage('home'); // Redirect unauthorized users away from admin pages (Requirement 8)
        return;
      }
    }

    setRedirectNotice(null);
    setAccessDeniedNotice(null);
    setActivePage(targetPage);
  };

  // Customer & Admin Logout handler (Requirement 9)
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setCustomerProfile(null);
      setGlobalBanner('You have been logged out successfully.');
      setTimeout(() => setGlobalBanner(null), 3500);
      setActivePage('home');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Tone generator
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
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === id) {
            return { ...item, qty: item.qty + delta };
          }
          return item;
        })
        .filter((item) => item.qty > 0);
    });
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handlePlaceOrder = (orderPayload) => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const tokenNumber = Math.floor(100 + Math.random() * 900).toString();
    const newOrder = {
      ...orderPayload,
      id: orderPayload.order_number || `#SC-SLM-${randomSuffix}`,
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

  return (
    <div className="min-h-screen bg-[#fff9ed] text-[#1d1c14] flex flex-col justify-between font-sans">
      <Navbar
        activePage={activePage}
        setActivePage={handleNavigate}
        cartCount={totalCartCount}
        currentUser={currentUser}
        customerProfile={customerProfile}
        onLogout={handleLogout}
        isAdmin={isAdmin}
      />

      {/* Global Toast Notification */}
      {globalBanner && (
        <div className="fixed top-24 right-4 z-50 bg-[#250f03] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs border border-[#fd6c19] animate-bounce">
          <span className="material-symbols-outlined text-[#fd6c19] text-base">check_circle</span>
          <span>{globalBanner}</span>
        </div>
      )}

      {/* Access Denied Banner (Requirement 8) */}
      {accessDeniedNotice && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-24 mb--16 w-full">
          <div className="bg-red-50 border border-red-200 text-red-900 p-4 rounded-xl flex items-start justify-between text-xs shadow-md">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-red-600 text-xl">block</span>
              <div>
                <p className="font-bold text-red-800">RBAC Security Notice</p>
                <p className="text-red-700 mt-0.5">{accessDeniedNotice}</p>
              </div>
            </div>
            <button
              onClick={() => setAccessDeniedNotice(null)}
              className="text-red-700 font-bold hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 w-full pt-28">
        {activePage === 'home' && (
          <Home
            onNavigate={handleNavigate}
            onAddToCart={handleAddToCart}
          />
        )}

        {activePage === 'menu' && (
          <Menu
            cart={cart}
            onAddToCart={handleAddToCart}
            onUpdateQty={handleUpdateQty}
            onClearCart={handleClearCart}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'cart' && (
          <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="font-serif text-3xl font-bold text-[#250f03] mb-6">Your Basket &amp; Kaapi Tray</h1>
            <Cart
              cart={cart}
              onUpdateQty={handleUpdateQty}
              onClear={handleClearCart}
              onProceed={() => handleNavigate('checkout')}
              isSidebar={false}
            />
          </div>
        )}

        {activePage === 'checkout' && (
          <Checkout
            cart={cart}
            onPlaceOrder={handlePlaceOrder}
            onNavigate={handleNavigate}
          />
        )}

        {(activePage === 'orders' || activePage === 'admin') && (
          <Orders
            orders={orders}
            onUpdateStatus={handleUpdateStatus}
            onNavigate={handleNavigate}
            isAdmin={isAdmin}
            currentUser={currentUser}
          />
        )}

        {activePage === 'login' && (
          <Login
            onNavigate={setActivePage}
            redirectTarget={redirectAfterAuth}
            redirectNotice={redirectNotice}
            onLoginSuccess={(user, mockProfile) => {
              setCurrentUser(user);
              if (mockProfile) {
                setCustomerProfile(mockProfile);
              } else {
                fetchProfile(user.id);
              }
            }}
          />
        )}

        {activePage === 'register' && (
          <Register
            onNavigate={setActivePage}
            redirectTarget={redirectAfterAuth}
            onRegisterSuccess={(user) => {
              setCurrentUser(user);
              fetchProfile(user.id);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#f3ede1] mt-12 py-8 px-4 md:px-8 border-t border-[#e8e2d6] text-xs text-[#50443f]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2025 Eswar, Bala &amp; Co. Salem Junction &amp; NH44 Rest Stop.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => handleNavigate('home')} className="hover:text-[#a23f00]">Home</button>
            <button onClick={() => handleNavigate('menu')} className="hover:text-[#a23f00]">Menu</button>
            <button onClick={() => handleNavigate('orders')} className="hover:text-[#a23f00]">Order Tracking</button>
            <button onClick={() => handleNavigate('admin')} className="hover:text-[#a23f00]">
              Staff Hub {isAdmin && <span className="ml-1 text-[10px] bg-[#fd6c19] text-white px-1.5 py-0.2 rounded font-bold">Admin</span>}
            </button>
            {currentUser ? (
              <button onClick={handleLogout} className="text-red-700 font-bold hover:underline">Log Out</button>
            ) : (
              <button onClick={() => handleNavigate('login')} className="hover:text-[#a23f00] font-bold">Sign In</button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
