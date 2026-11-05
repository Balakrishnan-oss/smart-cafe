import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import MenuCard from '../components/MenuCard';
import Cart from '../components/Cart';

export default function Menu({ cart, onAddToCart, onUpdateQty, onClearCart, onNavigate }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dietFilter, setDietFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  // Fetch available menu items from PostgreSQL via Supabase
  const fetchMenuItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('id', { ascending: true });

      if (fetchErr) throw fetchErr;
      setMenuItems(data || []);
    } catch (err) {
      console.error('Error fetching menu_items from Supabase:', err);
      setError(err.message || 'Unable to connect to Salem kitchen database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  // Derive unique dynamic categories from database records
  const uniqueCategories = Array.from(new Set(menuItems.map((i) => i.category).filter(Boolean)));

  // Filter & Search Logic
  const filteredItems = menuItems.filter((item) => {
    // Search query
    const q = search.trim().toLowerCase();
    const itemDesc = (item.description || item.desc || '').toLowerCase();
    const matchesSearch = !q || item.name.toLowerCase().includes(q) || itemDesc.includes(q);

    // Category filter
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;

    // Diet filter
    let matchesDiet = true;
    if (dietFilter === 'veg') {
      matchesDiet = item.is_vegetarian !== false;
    } else if (dietFilter === 'beverage') {
      matchesDiet = item.category?.toLowerCase().includes('kaapi') || item.category?.toLowerCase().includes('beverage');
    } else if (dietFilter === 'special') {
      matchesDiet = Boolean(item.tag) || item.price >= 60;
    }

    return matchesSearch && matchesCat && matchesDiet;
  });

  // Sort Logic
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'prep-time') {
      const prepA = a.prep_time || a.prep || 5;
      const prepB = b.prep_time || b.prep || 5;
      return prepA - prepB;
    }
    return 0; // Default popularity / ID ordering
  });

  const getQtyInCart = (id) => {
    const found = cart.find((i) => i.id === id);
    return found ? found.qty : 0;
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="flex flex-col w-full">
      {/* Search & Filter Ribbon */}
      <section className="w-full bg-[#f9f3e7] px-4 md:px-8 py-4 shadow-sm border-b border-[#e8e2d6]">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          {/* Search & Sort Controls */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-2xl">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#82746e]">search</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search filter coffee, podi idli, crispy vadas, bajjis..."
                className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-white text-[#1d1c14] text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#fd6c19] border border-[#e8e2d6]"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#50443f] hover:text-[#250f03]"
                  aria-label="Clear search"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>

            {/* Diet Filter & Sort Dropdown */}
            <div className="flex flex-wrap items-center gap-2 justify-between lg:justify-end">
              <div className="flex items-center gap-1 p-1 bg-[#ede8dc] rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setDietFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    dietFilter === 'all' ? 'bg-[#250f03] text-white shadow-sm' : 'text-[#50443f] hover:bg-white'
                  }`}
                >
                  All ({menuItems.length})
                </button>
                <button
                  onClick={() => setDietFilter('veg')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    dietFilter === 'veg' ? 'bg-[#250f03] text-white shadow-sm' : 'text-[#50443f] hover:bg-white'
                  }`}
                >
                  Pure Veg 🌿
                </button>
                <button
                  onClick={() => setDietFilter('beverage')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    dietFilter === 'beverage' ? 'bg-[#250f03] text-white shadow-sm' : 'text-[#50443f] hover:bg-white'
                  }`}
                >
                  Beverages ☕
                </button>
                <button
                  onClick={() => setDietFilter('special')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    dietFilter === 'special' ? 'bg-[#250f03] text-white shadow-sm' : 'text-[#50443f] hover:bg-white'
                  }`}
                >
                  Chef's Special ⭐
                </button>
              </div>

              {/* Sort Selector */}
              <div className="relative inline-flex items-center bg-white px-3 py-2 rounded-xl shadow-sm border border-[#e8e2d6] text-xs">
                <span className="material-symbols-outlined text-[#82746e] text-sm mr-1">swap_vert</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-[#1d1c14] font-medium focus:outline-none cursor-pointer"
                >
                  <option value="popular">Popularity</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="prep-time">Prep Time</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dynamic Category Horizontal Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-nowrap scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedCategory === 'all'
                  ? 'bg-[#3d2314] text-white shadow-sm'
                  : 'bg-white text-[#50443f] hover:bg-[#ede8dc] border border-[#e8e2d6]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">restaurant_menu</span>
              <span>All Dishes</span>
              <span className="px-1.5 py-0.2 bg-[#f3ede1] text-[#250f03] rounded-full text-[10px]">
                {menuItems.length}
              </span>
            </button>

            {uniqueCategories.map((cat) => {
              const count = menuItems.filter((i) => i.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? 'bg-[#3d2314] text-white shadow-sm'
                      : 'bg-white text-[#50443f] hover:bg-[#ede8dc] border border-[#e8e2d6]'
                  }`}
                >
                  <span>{cat}</span>
                  <span className="px-1.5 py-0.2 bg-[#f3ede1] text-[#250f03] rounded-full text-[10px]">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Dual Column Layout */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Menu Items Grid (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="flex items-center justify-between pb-2 border-b border-[#e8e2d6]">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#250f03]">
                  {selectedCategory === 'all' ? 'Live Salem Menu' : selectedCategory}
                </h2>
                <p className="text-xs text-[#50443f]">
                  Fresh from PostgreSQL database, served with pure cow ghee &amp; brass davarah froth.
                </p>
              </div>
              <span className="text-xs text-[#a23f00] bg-[#ffdbcd] px-3 py-1 rounded-full font-bold">
                {sortedItems.length} Available
              </span>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-600 text-lg">error</span>
                  <div>
                    <p className="font-bold">Failed to load menu from Supabase</p>
                    <p className="text-[11px] text-red-600">{error}</p>
                  </div>
                </div>
                <button
                  onClick={fetchMenuItems}
                  className="px-3 py-1.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shrink-0"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading Skeleton State */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="bg-white rounded-xl p-4 shadow-sm border border-[#e8e2d6] animate-pulse">
                    <div className="w-full h-44 bg-[#f3ede1] rounded-lg mb-3"></div>
                    <div className="h-4 bg-[#f3ede1] rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-[#f3ede1] rounded w-full mb-1"></div>
                    <div className="h-3 bg-[#f3ede1] rounded w-2/3 mb-4"></div>
                    <div className="flex justify-between items-center pt-2 border-t border-[#f3ede1]">
                      <div className="h-5 bg-[#f3ede1] rounded w-12"></div>
                      <div className="h-8 bg-[#f3ede1] rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedItems.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#e8e2d6] p-8">
                <span className="material-symbols-outlined text-4xl text-[#82746e]">search_off</span>
                <p className="font-bold text-[#250f03] mt-2">No matching dishes found</p>
                <p className="text-xs text-[#50443f] mt-1">Try resetting your search query or dietary filters.</p>
                <button
                  onClick={() => {
                    setSearch('');
                    setSelectedCategory('all');
                    setDietFilter('all');
                  }}
                  className="mt-3 px-4 py-1.5 bg-[#fd6c19] text-white text-xs font-bold rounded-lg hover:bg-[#a23f00] transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {sortedItems.map((item) => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    inCartQty={getQtyInCart(item.id)}
                    onAdd={onAddToCart}
                    onUpdateQty={onUpdateQty}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Desktop Side Cart Drawer (4 Cols) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-28">
            <Cart
              cart={cart}
              onUpdateQty={onUpdateQty}
              onClear={onClearCart}
              onProceed={() => onNavigate('checkout')}
              isSidebar={true}
            />
          </div>
        </div>
      </div>

      {/* Mobile Floating Cart Pill for small screens */}
      {totalCartCount > 0 && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
          <div className="bg-[#250f03] text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative bg-[#fd6c19] text-white p-2 rounded-xl">
                <span className="material-symbols-outlined text-xl">shopping_bag</span>
                <span className="absolute -top-1 -right-1 bg-white text-[#250f03] font-bold text-[10px] px-1.5 rounded-full">
                  {totalCartCount}
                </span>
              </div>
              <div>
                <span className="font-bold text-sm">₹{cartSubtotal.toFixed(2)}</span>
                <p className="text-[11px] text-[#e9bda7]">{totalCartCount} items in Kaapi tray</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('cart')}
              className="bg-[#fd6c19] hover:bg-[#a23f00] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-1 transition-all"
            >
              <span>View Tray</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
