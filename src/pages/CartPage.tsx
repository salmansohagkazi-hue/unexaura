import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DeliveryCalculatorWidget } from '../components/DeliveryCalculatorWidget';
import { useSEO } from '../hooks/useSEO';
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck, Tag, Sparkles, Truck } from 'lucide-react';

interface CartPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  useSEO({
    title: 'Shopping Cart',
    description: 'View your selected UNEX AURA 3D Islamic Wall Decor items in your shopping cart.'
  });
  const {
    cart,
    updateCartQty,
    removeFromCart,
    getCartSubtotal,
    getCartWeight,
    deliveryCharge,
    deliveryDetails,
    deliveryZone,
    setDeliveryZone,
    formatPrice,
    settings,
    applyCoupon,
    removeCoupon,
    appliedCoupon
  } = useApp();

  const [couponCodeInput, setCouponCodeInput] = useState('');

  const subtotal = getCartSubtotal();
  const totalWeight = getCartWeight();

  const discountAmount = appliedCoupon
    ? Math.round(subtotal * (appliedCoupon.discount_percentage / 100))
    : 0;

  const grandTotal = Math.max(0, subtotal - discountAmount) + deliveryCharge;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    const res = applyCoupon(couponCodeInput);
    if (res.success) {
      alert(res.message);
      setCouponCodeInput('');
    } else {
      alert(res.message);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-3xl shadow-xs">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-[#0f3d44]">Your Cart Is Empty</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            You haven&apos;t added any stainless steel wall decor designs yet. Explore our handcrafted Islamic and botanical wall art collections!
          </p>
        </div>
        <button
          onClick={() => onNavigate('shop')}
          className="px-8 py-3.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] via-[#9333ea] to-[#ec4899] hover:opacity-95 shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <button onClick={() => onNavigate('home')} className="hover:text-[#4f46e5]">Home</button>
        <span>/</span>
        <span className="text-[#0f3d44] font-bold">Shopping Cart ({cart.length} items)</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT CART TABLE (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-extrabold text-base text-[#0f3d44]">Items in Your Cart</h2>
              <span className="text-xs text-slate-400 font-mono">
                Total Weight: {(totalWeight/1000).toFixed(2)} kg ({totalWeight}g)
              </span>
            </div>

            <div className="divide-y divide-slate-100 overflow-x-auto">
              {cart.map(({ product, quantity, selectedSize }) => {
                const itemPrice = selectedSize ? selectedSize.price : product.price;
                const itemWeight = selectedSize ? selectedSize.weight_grams : product.weight_grams;
                const itemDimensions = selectedSize ? selectedSize.size_dimensions : product.size_dimensions;
                const itemSizeName = selectedSize?.name;
                const itemKey = `${product.id}-${selectedSize?.id || 'default'}`;

                return (
                  <div key={itemKey} className="p-4 sm:p-5 flex items-center gap-4 hover:bg-slate-50/60 transition-colors">
                    {/* THUMBNAIL */}
                    <img
                      src={product.image_url}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-slate-200 shrink-0"
                    />

                    {/* INFO */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                          {product.category_name || 'Wall Art'}
                        </span>
                        {itemSizeName && (
                          <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            Size: {itemSizeName}
                          </span>
                        )}
                      </div>
                      <h3
                        onClick={() => onNavigate('product', { slug: product.slug })}
                        className="font-bold text-xs sm:text-sm text-[#0f3d44] truncate hover:text-[#4f46e5] cursor-pointer"
                      >
                        {product.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Dimensions: {itemDimensions}
                      </p>
                      <div className="text-xs font-bold text-[#0f3d44] sm:hidden">
                        {formatPrice(itemPrice)} each
                      </div>
                    </div>

                    {/* PRICE (DESKTOP) */}
                    <div className="hidden sm:block text-right shrink-0">
                      <div className="text-xs text-slate-400">Unit Price</div>
                      <div className="text-sm font-bold text-[#0f3d44]">{formatPrice(itemPrice)}</div>
                    </div>

                    {/* QUANTITY CONTROLS */}
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shrink-0">
                      <button
                        onClick={() => updateCartQty(product.id, quantity - 1, selectedSize?.id)}
                        className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold text-[#0f3d44]">{quantity}</span>
                      <button
                        onClick={() => updateCartQty(product.id, quantity + 1, selectedSize?.id)}
                        className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    {/* SUBTOTAL */}
                    <div className="text-right shrink-0">
                      <div className="text-xs sm:text-sm font-extrabold text-[#0f3d44]">
                        {formatPrice(itemPrice * quantity)}
                      </div>
                    </div>

                    {/* REMOVE BUTTON WRAPPED IN POST FORM FOR SERVER FALLBACK */}
                    <form
                      method="POST"
                      action="/pages/cart_action.php"
                      onSubmit={(e) => {
                        e.preventDefault();
                        removeFromCart(product.id, selectedSize?.id);
                      }}
                      className="shrink-0"
                    >
                      <input type="hidden" name="action" value="remove" />
                      <input type="hidden" name="product_id" value={product.id} />
                      {selectedSize?.id && <input type="hidden" name="size_id" value={selectedSize.id} />}
                      <button
                        type="submit"
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => onNavigate('shop')}
                className="text-xs font-bold text-[#4f46e5] hover:underline flex items-center gap-1 cursor-pointer"
              >
                ← Continue Shopping
              </button>
            </div>
          </div>

          {/* WEIGHT CALCULATOR WIDGET */}
          <DeliveryCalculatorWidget />
        </div>

        {/* RIGHT ORDER SUMMARY SIDEBAR (4 cols) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md space-y-5">
            <h3 className="font-extrabold text-base text-[#0f3d44] pb-3 border-b border-slate-100">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({cart.length} items):</span>
                <span className="font-bold text-[#0f3d44]">{formatPrice(subtotal)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between items-center text-emerald-600 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon ({appliedCoupon.code} - {appliedCoupon.discount_percentage}%):</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>-{formatPrice(discountAmount)}</span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-red-500 hover:text-red-700 font-bold text-xs"
                      title="Remove Coupon"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-between text-slate-600 items-start">
                <div className="flex flex-col">
                  <span>
                    Delivery Charge ({deliveryZone === 'none' ? 'জোন নির্বাচন করুন' : deliveryZone === 'dhaka' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে'}):
                  </span>
                  {deliveryDetails.isAyatulKursiFreeOffer && (
                    <span className="text-[10px] text-emerald-600 font-bold">
                      {deliveryDetails.hasOtherProducts
                        ? '✨ আয়াতুল কুরসি ডেলিভারি চার্জ ফ্রি'
                        : '✨ আয়াতুল কুরসি স্পেশাল ফ্রি ডেলিভারি'}
                    </span>
                  )}
                  {deliveryZone !== 'none' && deliveryDetails.slabDescription && (
                    <span className="text-[10px] text-slate-500 font-medium">
                      {deliveryDetails.slabDescription}
                    </span>
                  )}
                </div>
                <span className="font-bold text-[#0f3d44]">
                  {deliveryZone === 'none' ? (
                    <span className="text-amber-700 font-bold text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">চেকআউটে জোন নির্বাচন করুন</span>
                  ) : deliveryCharge === 0 ? (
                    <span className="text-emerald-600 font-black">FREE / ফ্রি</span>
                  ) : (
                    formatPrice(deliveryCharge)
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-sm font-extrabold text-[#0f3d44]">Grand Total:</span>
                <span className="text-2xl font-black bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] to-[#ec4899] bg-clip-text text-transparent">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            {/* COUPON CODE FORM */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2 pt-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Promo code (e.g. SAVE10)"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0f3d44] focus:outline-none uppercase font-mono font-bold"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0f3d44] hover:bg-indigo-950 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Apply
              </button>
            </form>

            {/* CHECKOUT CTA */}
            <button
              onClick={() => onNavigate('checkout')}
              className="w-full py-3.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] via-[#9333ea] to-[#ec4899] hover:opacity-95 shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* PAYMENT LOGOS & SECURITY BADGE */}
            <div className="pt-4 border-t border-slate-100 space-y-3 text-center">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>🔒 256-bit Encrypted Checkout</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
                <span className="px-2 py-1 bg-slate-100 rounded font-semibold text-pink-600">bKash</span>
                <span className="px-2 py-1 bg-slate-100 rounded font-semibold text-orange-600">Nagad</span>
                <span className="px-2 py-1 bg-slate-100 rounded font-semibold text-blue-600">Visa / Mastercard</span>
                <span className="px-2 py-1 bg-slate-100 rounded font-semibold text-emerald-700">Cash on Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
