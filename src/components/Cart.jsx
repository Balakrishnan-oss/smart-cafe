import React, { useState } from 'react';

export default function Cart({ cart = [], onUpdateQty, onClear, onProceed, isSidebar = false }) {
  const [couponCode, setCouponCode] = useState('SALEMKAAPI');
  const [couponApplied, setCouponApplied] = useState(true);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const packaging = cart.length > 0 ? 10 : 0;
  const delivery = cart.length > 0 ? 20 : 0;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const discount = (couponApplied && cart.length > 0) ? 20 : 0;
  const grandTotal = Math.max(0, Math.round(subtotal + packaging + delivery + tax - discount));

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'SALEMKAAPI') {
      setCouponApplied(true);
    } else {
      setCouponApplied(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center text-center py-12">
        <span className="material-symbols-outlined text-5xl text-[#82746e] mb-2">shopping_bag</span>
        <h3 className="font-bold text-lg text-[#250f03]">Your Kaapi Tray is Empty</h3>
        <p className="text-xs text-[#50443f] max-w-xs mt-1">Select degree kaapi, crispy vadas or ghee roast dosas from our Salem menu.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl flex flex-col gap-4 border border-[#e8e2d6]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#f3ede1]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#a23f00] text-xl">shopping_bag</span>
          <div>
            <h3 className="font-bold text-base text-[#250f03]">Your Table Order</h3>
            <span className="text-[11px] text-[#50443f]">Eswar, Bala &amp; Co Kiosk #T-08</span>
          </div>
        </div>
        <button 
          onClick={onClear} 
          className="text-xs text-[#a23f00] hover:underline font-semibold"
        >
          Clear
        </button>
      </div>

      {/* Degree Kaapi Preparation Tag */}
      <div className="flex items-center justify-between bg-[#f3ede1] px-3 py-2 rounded-xl text-xs text-[#50443f]">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#a23f00] text-sm">coffee</span>
          <span>Degree Kaapi: Strong</span>
        </div>
        <span className="font-bold text-[#250f03]">Nattu Sakkarai</span>
      </div>

      {/* Cart Items List */}
      <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
        {cart.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-2 bg-[#f9f3e7] px-3 rounded-lg">
            <div className="flex-1 min-w-0 pr-2">
              <p className="font-semibold text-xs text-[#250f03] truncate">{item.name}</p>
              <p className="text-[11px] text-[#50443f]">₹{item.price} each</p>
            </div>
            <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-md shadow-sm">
              <button 
                onClick={() => onUpdateQty(item.id, -1)} 
                className="text-[#50443f] hover:text-[#250f03] font-bold text-xs"
              >
                -
              </button>
              <span className="text-xs font-bold text-[#250f03] w-4 text-center">{item.qty}</span>
              <button 
                onClick={() => onUpdateQty(item.id, 1)} 
                className="text-[#50443f] hover:text-[#250f03] font-bold text-xs"
              >
                +
              </button>
            </div>
            <span className="font-bold text-xs text-[#250f03] w-14 text-right">₹{item.price * item.qty}</span>
          </div>
        ))}
      </div>

      {/* Coupon section (shown if not minimal sidebar) */}
      {!isSidebar && (
        <form onSubmit={handleApplyCoupon} className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Coupon code"
            className="flex-1 bg-[#f9f3e7] px-3 py-1.5 text-xs rounded-lg uppercase font-bold text-[#250f03] focus:outline-none"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-[#250f03] text-white text-xs font-bold rounded-lg hover:bg-[#a23f00] transition-colors"
          >
            Apply
          </button>
        </form>
      )}

      {/* Bill Calculation */}
      <div className="flex flex-col gap-1.5 pt-2 border-t border-[#f3ede1] text-xs text-[#50443f]">
        <div className="flex justify-between">
          <span>Item Subtotal</span>
          <span className="font-bold text-[#250f03]">₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Areca Leaf Eco-Packaging</span>
          <span className="font-bold text-[#250f03]">₹{packaging.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Priority Highway Delivery</span>
          <span className="font-bold text-[#250f03]">₹{delivery.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>GST &amp; Tiffin Charges (5%)</span>
          <span className="font-bold text-[#250f03]">₹{tax.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-700 font-semibold">
            <span>Salem Promo (SALEMKAAPI)</span>
            <span>-₹{discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between pt-2 border-t border-[#f3ede1] text-[#250f03] font-bold text-sm">
          <span>Grand Total</span>
          <span className="text-base text-[#a23f00]">₹{grandTotal}</span>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onProceed}
        className="w-full py-3 px-4 rounded-xl bg-[#fd6c19] hover:bg-[#a23f00] text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
      >
        <span>Proceed to Checkout</span>
        <span className="material-symbols-outlined text-sm">arrow_forward</span>
      </button>

      <div className="text-center text-[10px] text-[#50443f] flex items-center justify-center gap-1">
        <span className="material-symbols-outlined text-xs text-emerald-600">verified</span>
        <span>Contactless UPI &amp; Cash on Delivery Available</span>
      </div>
    </div>
  );
}
