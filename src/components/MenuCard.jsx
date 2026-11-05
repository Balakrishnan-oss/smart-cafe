import React from 'react';

const CATEGORY_FALLBACK_IMAGES = {
  'Filter Kaapi': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpsuAa6cuJfUI1SOLCGutFqK9XgAW8Ev5x3LGR3-GBMsoEYkcNEAYAIsYGRX4zjR4TDH6hhCRa9iPNrMumiGuW8r8MaKFXmk1xukJs1yfwnP24NVOrlPX4cYEyC9AJC8f6MGMsQEyJmBLeOh7tmEa_GrKoJ_bi6WjyCHzW7qSiq-P0QDHucqYk_hZCJHWss354vC_PlOGrmaF6PotTYYuL0gb-vGYhVidN1L9MdNoZ',
  'Salem Tiffin': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCu6ZnxZeE3OnnnDtoaq6LigYMjiGeaqoepMIqyNTXFB-DLfYdgLmPkHWU81y03d44jB6zawGu1WcKqUhkmj5Y922f7x2qEjzsFvD5fJBq0DTKa93mTicn18Q7at3BFgkjD0h4iwxADzxozLl2IlF74swzmzcMKdtuuCFP-65q6S1Nk60sc5C0Ft3x8k_6NJ7GdFrULVbK6xp50LGZiHEemK0JzVqQokm9pH-weCC9j',
  'Signature Combos': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAixL7sL3y8FQf9PlUjm15mOIDHZNXnDjK7NSpMfV1EQ6REBdratjROdaozRdxrEvuXHsWm9_qUjpOcWjTsc154v6AI1LwEHM6Cnmad24i5hXkcf6jUD-HRiRa9nrcNZVOSZ20AFI2bTROeFFcsZG9b67obd-JORVOgzfsxfllYSopkOggAvuUUG8deZec6Onbm_IScfooW7-PC5e4iJSl73K311rslmlUYSshjaCIf',
  'Desserts': 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7i_8-k8gL7_g6j2n0c_9-k8gL7_g6j2n0c_9-k8gL7_g6j2n0c_9',
  default: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBL-Ca9xK0SKTv8EOrpaJPlHFF7r4SpSNMMWm-5N2VQEg2OpWUCX2NeNgR56qhL92Q40FQ7txsg3nWmDkwlM3yuaAG-940YczD_HTmCMRgw57OOMM2F3FlHVz0eevux7dimSCC6zXR2ESvYw3AlNCBh-uPL-xx2a-5qAJPhRZlJc70qrd10DSIlcybjMwjntDiFFtQYR1lsDrmpwOkVDKArOAN19kHqTkW0gUivaG4s'
};

export default function MenuCard({ item, inCartQty = 0, onAdd, onUpdateQty }) {
  const displayImage = item.image_url || item.image || CATEGORY_FALLBACK_IMAGES[item.category] || CATEGORY_FALLBACK_IMAGES.default;
  const description = item.description || item.desc || 'Prepared fresh upon order in authentic Salem style.';
  const prepTime = item.prep_time || item.prep || 5;
  const isVeg = item.is_vegetarian !== false;

  return (
    <div className="bg-white rounded-xl p-4 shadow-md flex flex-col justify-between hover:shadow-lg transition-all group border border-[#e8e2d6]">
      {/* Image Banner */}
      <div className="relative rounded-lg overflow-hidden h-44 mb-3 bg-[#f3ede1]">
        <img 
          src={displayImage} 
          alt={item.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = CATEGORY_FALLBACK_IMAGES.default;
          }}
        />
        {item.tag && (
          <span className="absolute top-2 left-2 bg-[#a23f00] text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
            {item.tag}
          </span>
        )}
        {isVeg && (
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 text-[#1d1c14] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>Pure Veg</span>
          </div>
        )}
      </div>

      {/* Info Block */}
      <div>
        <h3 className="font-bold text-[#250f03] text-base leading-snug line-clamp-1">{item.name}</h3>
        <p className="text-xs text-[#50443f] mt-1 line-clamp-2">{description}</p>
        <div className="flex items-center gap-1.5 mt-2 text-[#50443f] text-xs">
          <span className="material-symbols-outlined text-sm text-[#82746e]">timer</span>
          <span>{prepTime} mins prep</span>
        </div>
      </div>

      {/* Pricing & Add / Quantity Action */}
      <div className="flex items-center justify-between mt-4 pt-2 border-t border-[#f3ede1]">
        <span className="text-lg font-bold text-[#250f03]">₹{item.price}</span>

        {inCartQty > 0 ? (
          <div className="flex items-center gap-2 bg-[#f3ede1] px-2 py-1 rounded-lg shadow-inner">
            <button
              onClick={() => onUpdateQty(item.id, -1)}
              className="w-6 h-6 rounded flex items-center justify-center font-bold text-[#250f03] hover:bg-[#ede8dc] active:scale-95 transition-colors"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="text-sm font-bold text-[#250f03] min-w-4 text-center">{inCartQty}</span>
            <button
              onClick={() => onUpdateQty(item.id, 1)}
              className="w-6 h-6 rounded flex items-center justify-center font-bold text-[#250f03] hover:bg-[#ede8dc] active:scale-95 transition-colors"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={() => onAdd({ ...item, image: displayImage, desc: description })}
            className="px-4 py-1.5 rounded-lg bg-[#fd6c19] text-white font-semibold text-xs hover:bg-[#a23f00] transition-colors shadow-sm flex items-center gap-1 active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Add</span>
          </button>
        )}
      </div>
    </div>
  );
}
