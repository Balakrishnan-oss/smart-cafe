import React, { useState } from 'react';
import { MENU_ITEMS } from '../data/menuData';

export default function Home({ onNavigate, onAddToCart }) {
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState(null);

  const bestsellers = MENU_ITEMS.slice(0, 6);
  const filteredBestsellers = filter === 'all' 
    ? bestsellers 
    : (filter === 'kaapi' 
        ? bestsellers.filter(i => i.category === 'beverages') 
        : bestsellers.filter(i => i.category === 'tiffin' || i.category === 'snacks'));

  const handleClaimCombo = () => {
    onAddToCart({
      id: 101,
      name: 'Salem Signature Morning Set (2 Podi Idli + 1 Medu Vada + Kaapi)',
      price: 99,
      desc: '2 Ghee Podi Idli + 1 Medu Vada + Salem Filter Kaapi'
    });
    showToast('Salem Special Combo', '₹99 added to order');
  };

  const handleAdd = (item) => {
    onAddToCart(item);
    showToast(item.name, `₹${item.price} added to tray`);
  };

  const showToast = (title, sub) => {
    setToast({ title, sub });
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Highway Announcement Ticker */}
      <section className="w-full bg-[#f3ede1] py-2 px-4 overflow-hidden border-b border-[#e8e2d6]">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[#50443f] text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#a23f00] text-white text-[10px] tracking-wider uppercase font-bold">
              NH-44 Corridor
            </span>
            <span className="truncate">Salem Junction • Drive-Through Takeaway Counter Express Bay 1 &amp; 2 Active</span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <span className="flex items-center gap-1 text-[#d97706]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#fd6c19] animate-ping"></span> Live Kitchen Queue: 4 mins wait
            </span>
            <span>Salem Fresh Cow Milk Batch #04 • Steaming</span>
          </div>
        </div>
      </section>

      {/* Hero Visual Stage */}
      <section className="relative w-full bg-[#f9f3e7] overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#ffb595]/30 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-[#ffdcc3]/40 blur-2xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Hero Copy */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#e8e2d6] text-[#a23f00] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">local_fire_department</span> Authentic Salem Legacy
                </span>
                <span className="bg-[#ffdbca] text-[#250f03] text-xs font-semibold px-3 py-1 rounded-full">
                  NH44 Highway Pit-Stop
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#250f03] leading-tight">
                Authentic Salem Filter Kaapi &amp; Fresh Hot Tiffin on NH44
              </h1>

              <p className="text-base text-[#50443f] max-w-2xl leading-relaxed">
                Brewed with pure freshly roasted chicory blend decoction, served steaming hot in traditional brass davarah-tumbler. Quick highway takeaway, dine-in &amp; local doorstep delivery across Salem.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('menu')}
                  className="px-6 py-3 rounded-xl bg-[#fd6c19] text-white font-bold text-sm shadow-lg hover:bg-[#a23f00] transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">restaurant_menu</span>
                  <span>Explore Menu &amp; Order Now</span>
                </button>
                <button
                  onClick={() => onNavigate('menu')}
                  className="px-6 py-3 rounded-xl bg-[#ede8dc] text-[#250f03] font-semibold text-sm hover:bg-[#e8e2d6] transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">schedule</span>
                  <span>Today's Tiffin Specials</span>
                </button>
              </div>

              {/* Feature Badges Cluster */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#f3ede1]">
                  <span className="material-symbols-outlined text-[#fd6c19] text-lg">bolt</span>
                  <span className="text-xs font-semibold text-[#1d1c14]">15-Min Fast Prep</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#f3ede1]">
                  <span className="material-symbols-outlined text-[#fd6c19] text-lg">coffee</span>
                  <span className="text-xs font-semibold text-[#1d1c14]">Salem Cow Milk</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#f3ede1]">
                  <span className="material-symbols-outlined text-[#fd6c19] text-lg">soup_kitchen</span>
                  <span className="text-xs font-semibold text-[#1d1c14]">3 Chutneys Free</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#f3ede1]">
                  <span className="material-symbols-outlined text-[#fd6c19] text-lg">payments</span>
                  <span className="text-xs font-semibold text-[#1d1c14]">Pay on Delivery</span>
                </div>
              </div>
            </div>

            {/* Right Featured Combo Spotlight Tile */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="relative rounded-2xl bg-white p-4 shadow-xl overflow-hidden border border-[#e8e2d6] group">
                <div className="absolute top-4 left-4 z-20">
                  <span className="px-3 py-1 rounded-full bg-[#fd6c19] text-white text-xs font-bold tracking-wide uppercase shadow-md">
                    Salem Signature Morning Set
                  </span>
                </div>
                <div className="relative w-full h-72 rounded-xl overflow-hidden bg-[#ede8dc]">
                  <img
                    alt="Salem Special Combo Breakfast"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAixL7sL3y8FQf9PlUjm15mOIDHZNXnDjK7NSpMfV1EQ6REBdratjROdaozRdxrEvuXHsWm9_qUjpOcWjTsc154v6AI1LwEHM6Cnmad24i5hXkcf6jUD-HRiRa9nrcNZVOSZ20AFI2bTROeFFcsZG9b67obd-JORVOgzfsxfllYSopkOggAvuUUG8deZec6Onbm_IScfooW7-PC5e4iJSl73K311rslmlUYSshjaCIf"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#250f03]/80 via-[#250f03]/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                    <div>
                      <span className="text-xs text-[#ffdbca] uppercase tracking-wider block font-semibold">Combo of the Day</span>
                      <h3 className="font-serif text-2xl font-bold leading-tight">Find Eswar, Bala &amp; Co</h3>
                      <p className="text-xs text-[#e8e2d6]">2 Ghee Podi Idli + 1 Medu Vada + Salem Filter Kaapi</p>
                    </div>
                    <div className="text-right">
                      <span className="line-through text-xs text-[#e9bda7] block">₹140</span>
                      <span className="font-serif text-3xl font-bold text-[#ffdbcd]">₹99</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5 text-[#50443f] text-xs">
                    <span className="material-symbols-outlined text-[#fd6c19] text-base">verified</span>
                    <span>Freshly roasted podi with pure country ghee</span>
                  </div>
                  <button
                    onClick={handleClaimCombo}
                    className="px-4 py-2 rounded-lg bg-[#250f03] text-white text-xs font-bold hover:bg-[#a23f00] transition-all flex items-center gap-1 active:scale-95 shadow-md"
                  >
                    <span className="material-symbols-outlined text-sm">shopping_bag</span>
                    <span>Claim ₹99</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Bestsellers Section */}
      <section className="w-full py-12 px-4 md:px-8 bg-[#f9f3e7]">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#fd6c19]"></span>
                <span className="text-xs text-[#a23f00] uppercase tracking-widest font-bold">Top Kitchen Re-Orders</span>
              </div>
              <h2 className="font-serif text-3xl text-[#250f03] mt-1">Featured Salem Bestsellers</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  filter === 'all' ? 'bg-[#250f03] text-white' : 'bg-[#f3ede1] text-[#50443f] hover:bg-[#ede8dc]'
                }`}
              >
                All Items
              </button>
              <button
                onClick={() => setFilter('kaapi')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  filter === 'kaapi' ? 'bg-[#250f03] text-white' : 'bg-[#f3ede1] text-[#50443f] hover:bg-[#ede8dc]'
                }`}
              >
                Kaapi &amp; Teas
              </button>
              <button
                onClick={() => setFilter('tiffin')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  filter === 'tiffin' ? 'bg-[#250f03] text-white' : 'bg-[#f3ede1] text-[#50443f] hover:bg-[#ede8dc]'
                }`}
              >
                Crispy Tiffin
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBestsellers.map((item) => (
              <div key={item.id} className="rounded-2xl bg-white p-4 shadow-sm flex flex-col justify-between border border-[#e8e2d6] group hover:shadow-md transition-shadow">
                <div>
                  <div className="relative w-full h-48 rounded-xl overflow-hidden bg-[#ede8dc]">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.tag && (
                      <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-[#250f00] text-white text-xs font-semibold">
                        {item.tag}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-[#250f03] text-base">{item.name}</h3>
                      <span className="font-bold text-lg text-[#250f03]">₹{item.price}</span>
                    </div>
                    <p className="text-xs text-[#50443f] line-clamp-2">{item.desc}</p>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-[#f3ede1] flex items-center justify-between">
                  <span className="text-[11px] text-[#a23f00] bg-[#ffdbcd]/50 px-2 py-0.5 rounded font-semibold">
                    {item.prep} mins prep
                  </span>
                  <button
                    onClick={() => handleAdd(item)}
                    className="px-4 py-1.5 rounded-lg bg-[#fd6c19] text-white font-bold text-xs hover:bg-[#a23f00] transition-colors flex items-center gap-1 active:scale-95 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    <span>ADD</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#250f03] text-white p-3 rounded-2xl shadow-2xl flex items-center gap-3 max-w-sm animate-bounce">
          <div className="w-8 h-8 rounded-full bg-[#fd6c19] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-base text-white">check</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs">{toast.title}</span>
            <span className="text-[11px] text-[#e9bda7]">{toast.sub}</span>
          </div>
          <button 
            onClick={() => onNavigate('cart')} 
            className="ml-auto px-3 py-1 bg-[#fd6c19] text-white text-xs font-bold rounded-lg hover:bg-[#a23f00]"
          >
            View Tray
          </button>
        </div>
      )}
    </div>
  );
}
