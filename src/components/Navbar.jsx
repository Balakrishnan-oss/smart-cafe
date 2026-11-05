import React, { useState } from 'react';

export default function Navbar({
  activePage,
  setActivePage,
  cartCount = 0,
  currentUser = null,
  customerProfile = null,
  onLogout = null,
  isAdmin = false
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'menu', label: 'Full Menu', icon: 'restaurant_menu' },
    { id: 'cart', label: `Cart (${cartCount})`, icon: 'shopping_bag' },
    { id: 'orders', label: 'Orders & Tracking', icon: 'moped' },
    { id: 'admin', label: 'Staff Hub', icon: 'soup_kitchen', adminOnly: true }
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const displayName =
    customerProfile?.full_name ||
    currentUser?.user_metadata?.full_name ||
    (currentUser?.email ? currentUser.email.split('@')[0] : null);

  const initial = displayName ? displayName.charAt(0).toUpperCase() : 'C';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#fff9ed]/95 backdrop-blur-xl shadow-[0_2px_12px_rgba(61,35,20,0.06)]">
      {/* Top Announcement Bar */}
      <div className="bg-[#250f03] text-white px-4 text-center py-1 flex items-center justify-center gap-2 text-xs">
        <span className="material-symbols-outlined text-[#fd6c19] text-sm">local_cafe</span>
        <span className="tracking-wide">
          Fresh hot Salem Filter Kaapi &amp; Crispy Medu Vadas brewing right now! Cash on Delivery available.
        </span>
      </div>

      {/* Main Navigation Bar */}
      <div className="h-20 max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 text-left focus:outline-none"
          >
            <img
              alt="Eswar, Bala & Co Logo"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1XZs9MuMQKEmNvDzp1fMXF7K-DJXdpK_tost2i6v0lD59W7LBOjThUtUpisLVlvNdB8IwESWp3YMEIz3UMLG4R7onvrczC-mRpVmSd3avF_Iw-Ou5iuAuBduesqysWyijXTFVO_LkIGAdn1UVZsNVgTfxnrGw7a3bSCkUIFdunbNPwX5tT2Lehj0bMenzqh-nIJTQ5jSy_TLmUi9rfiGikD3YeqK8aqo4Enau7WGkDKPQ"
            />
            <div className="flex flex-col">
              <span className="font-bold text-lg text-[#250f03] leading-tight font-serif">Eswar, Bala &amp; Co</span>
              <span className="text-xs text-[#a23f00] leading-none">Salem Bypass &amp; Junction Rd</span>
            </div>
          </button>

          <div className="hidden xl:flex items-center gap-1.5 bg-[#ede8dc] px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#fd6c19] animate-pulse"></span>
            <span className="text-xs text-[#50443f]">Open Now • 6:30 AM - 11:00 PM</span>
          </div>
        </div>

        {/* Center Nav Items */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#3d2314] text-white shadow-sm'
                    : 'text-[#50443f] hover:bg-[#ede8dc] hover:text-[#1d1c14]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Action Icons & Customer Auth */}
        <div className="flex items-center gap-3">
          {/* Phone */}
          <a
            href="tel:+919443210890"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f3ede1] text-[#50443f] hover:bg-[#ede8dc] transition-colors"
          >
            <span className="material-symbols-outlined text-[#a23f00] text-sm">call</span>
            <span className="text-xs font-semibold text-[#1d1c14]">+91 94432 10890</span>
          </a>

          {/* Cart Icon Button */}
          <button
            onClick={() => handleNavClick('cart')}
            className="relative p-2.5 rounded-full bg-[#fd6c19] text-white hover:bg-[#a23f00] transition-colors flex items-center justify-center shadow-md active:scale-95"
            aria-label="View Cart"
          >
            <span className="material-symbols-outlined text-lg">shopping_bag</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#250f03] text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-[#fff9ed]">
                {cartCount}
              </span>
            )}
          </button>

          {/* Customer Authentication & Profile Area */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f3ede1] hover:bg-[#ede8dc] border border-[#e8e2d6] transition-all"
                aria-label="User Profile Menu"
              >
                <div className="w-7 h-7 rounded-full bg-[#250f03] text-white font-bold text-xs flex items-center justify-center">
                  {initial}
                </div>
                <span className="hidden md:inline-block text-xs font-bold text-[#250f03] max-w-[120px] truncate">
                  {displayName}
                </span>
                <span className="material-symbols-outlined text-xs text-[#82746e]">
                  {userDropdownOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {/* Profile Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#e8e2d6] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-[#f3ede1]">
                    <p className="text-xs font-bold text-[#250f03] truncate">{displayName}</p>
                    <p className="text-[11px] text-[#82746e] truncate">{currentUser.email}</p>
                    {customerProfile?.role && (
                      <span className="inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                        {customerProfile.role}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleNavClick('orders')}
                    className="w-full text-left px-4 py-2 text-xs text-[#250f03] hover:bg-[#f9f3e7] flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm text-[#a23f00]">moped</span>
                    <span>My Orders &amp; Tracking</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      if (onLogout) onLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-red-700 hover:bg-red-50 flex items-center gap-2 border-t border-[#f3ede1] mt-1"
                  >
                    <span className="material-symbols-outlined text-sm">logout</span>
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => handleNavClick('login')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#250f03] hover:bg-[#ede8dc] transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => handleNavClick('register')}
                className="px-3.5 py-1.5 rounded-xl bg-[#250f03] hover:bg-[#a23f00] text-white text-xs font-bold transition-colors shadow-sm"
              >
                Register
              </button>
            </div>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-[#250f03] hover:bg-[#ede8dc] transition-colors focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#fff9ed] border-t border-[#e8e2d6] px-4 py-3 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-1">
            {/* User status in mobile drawer */}
            {currentUser ? (
              <div className="p-3 bg-[#f3ede1] rounded-xl flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-8 h-8 rounded-full bg-[#250f03] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {initial}
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-xs text-[#250f03] truncate">{displayName}</p>
                    <p className="text-[10px] text-[#82746e] truncate">{currentUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="p-1.5 text-red-700 hover:bg-white rounded-lg flex items-center gap-1 text-xs font-bold shrink-0"
                  title="Logout"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  <span>Exit</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  onClick={() => handleNavClick('login')}
                  className="py-2.5 px-3 bg-[#f3ede1] hover:bg-[#ede8dc] text-[#250f03] text-xs font-bold rounded-xl text-center"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="py-2.5 px-3 bg-[#250f03] text-white text-xs font-bold rounded-xl text-center shadow-sm"
                >
                  Register
                </button>
              </div>
            )}

            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#3d2314] text-white shadow-sm'
                      : 'text-[#50443f] hover:bg-[#ede8dc] hover:text-[#1d1c14]'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-2 mt-2 border-t border-[#ede8dc] flex items-center justify-between text-xs text-[#50443f]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#fd6c19] animate-pulse"></span>
                <span>Open 6:30 AM - 11:00 PM</span>
              </span>
              <a href="tel:+919443210890" className="font-bold text-[#a23f00] flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">call</span>
                <span>Call Kitchen</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
