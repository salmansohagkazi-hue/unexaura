import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useSEO } from '../hooks/useSEO';
import { trackBeginCheckout } from '../utils/analytics';
import { ShieldCheck, Lock, Check } from 'lucide-react';

interface CheckoutPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  useSEO({
    title: 'Secure Checkout',
    description: 'Complete your order for UNEX AURA luxury 3D Islamic Wall Decor with Cash on Delivery across Bangladesh.'
  });
  const {
    cart,
    user,
    deliveryZone,
    setDeliveryZone,
    deliveryCharge,
    getCartSubtotal,
    getCartWeight,
    formatPrice,
    clearCart,
    showToast,
    addOrder
  } = useApp();

  const [fullName, setFullName] = useState(
    user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : ''
  );
  const [email, setEmail] = useState(user ? user.email : '');
  const [phone, setPhone] = useState(user ? user.phone : '');
  const [address, setAddress] = useState(user ? user.address : '');
  const [city, setCity] = useState(user ? user.city : 'Dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'stripe'>('cod');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = getCartSubtotal();
  const totalWeight = getCartWeight();
  const grandTotal = subtotal + deliveryCharge;

  // Track begin_checkout / InitiateCheckout on checkout mount
  useEffect(() => {
    if (cart && cart.length > 0) {
      trackBeginCheckout(cart, grandTotal);
    }
  }, []);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      alert('Please fill in all required fields marked with * (সকল প্রয়োজনীয় তথ্য প্রদান করুন)');
      return;
    }

    if (deliveryZone === 'none') {
      alert('দয়া করে ডেলিভারি জোন নির্বাচন করুন (ঢাকার ভেতরে অথবা ঢাকার বাইরে)। / Please select a delivery zone (Inside Dhaka or Outside Dhaka) before confirming your order.');
      return;
    }

    setIsSubmitting(true);

    try {
      const createdOrder = await addOrder({
        user_id: user ? user.id : null,
        user_name: fullName.trim(),
        user_email: email,
        user_phone: phone,
        shipping_address: address,
        city,
        delivery_zone: deliveryZone,
        total_weight_grams: totalWeight,
        delivery_charge: deliveryCharge,
        subtotal_amount: subtotal,
        total_amount: grandTotal,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'stripe' ? 'paid' : 'unpaid',
        order_notes: orderNotes,
        items: cart.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          price: item.selectedSize ? item.selectedSize.price : item.product.price,
          quantity: item.quantity,
          image_url: item.product.image_url,
          weight_grams: item.selectedSize ? item.selectedSize.weight_grams : item.product.weight_grams,
          selected_size_name: item.selectedSize?.name,
          material: item.product.material || 'Laser-Cut Steel'
        }))
      });

      clearCart();
      showToast('অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!');
      onNavigate('ordersuccess', { order: createdOrder, orderNumber: createdOrder?.order_number });
    } catch (err) {
      console.error('Failed to submit order:', err);
      alert('অর্ডার সাবমিট করার সময় একটি সমস্যা দেখা দিয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <button onClick={() => onNavigate('home')} className="hover:text-[#4f46e5]">Home</button>
        <span>/</span>
        <button onClick={() => onNavigate('cart')} className="hover:text-[#4f46e5]">Cart</button>
        <span>/</span>
        <span className="text-[#0f3d44] font-bold">Checkout</span>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-8">
          {/* STEP 1: CONTACT INFO */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] to-[#ec4899] text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h2 className="font-extrabold text-base text-[#0f3d44]">Contact Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Tanvir Hossain / আপনার পূর্ণ নাম"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f3d44] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01623319639 / আপনার মোবাইল নম্বর"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f3d44] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tanvir@example.com (optional)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f3d44] focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: SHIPPING ADDRESS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] to-[#ec4899] text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h2 className="font-extrabold text-base text-[#0f3d44]">Shipping Address</h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House/Flat #, Road #, Area, Thana, District / বাসা/ফ্ল্যাট নং, রোড, এলাকা, থানা, জেলা"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f3d44] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Dhaka, Chittagong"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f3d44] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Delivery Zone *</label>
                  <select
                    value={deliveryZone}
                    onChange={(e) => setDeliveryZone(e.target.value as any)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none cursor-pointer ${
                      deliveryZone === 'none'
                        ? 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-300/40'
                        : 'bg-slate-50 border-slate-200 text-[#0f3d44]'
                    }`}
                  >
                    <option value="none">-- Select Delivery Zone (সিলেক্ট করুন) --</option>
                    <option value="dhaka">Inside Dhaka / ঢাকার ভেতরে (Base ৳60-৳90)</option>
                    <option value="outside_dhaka">Outside Dhaka / ঢাকার বাইরে (Base ৳110-৳170)</option>
                  </select>
                  {deliveryZone === 'none' && (
                    <p className="text-[11px] text-amber-700 font-bold mt-1.5 flex items-center gap-1">
                      ⚠️ অর্ডার কনফার্ম করতে ঢাকার ভেতরে অথবা ঢাকার বাইরে সিলেক্ট করুন।
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Order Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Special instructions for courier..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#0f3d44] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* STEP 3: PAYMENT METHOD */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] to-[#ec4899] text-white font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h2 className="font-extrabold text-base text-[#0f3d44]">Payment Method (পেমেন্ট পদ্ধতি)</h2>
            </div>

            <div className="space-y-3">
              {/* COD OPTION */}
              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                  paymentMethod === 'cod'
                    ? 'border-teal-500 bg-teal-50/40 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                    paymentMethod === 'cod'
                      ? 'bg-teal-600 border-teal-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {paymentMethod === 'cod' && <Check className="w-3.5 h-3.5" />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[#0f3d44] text-sm">ক্যাশ অন ডেলিভারি (Cash on Delivery) 💵</span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                      জনপ্রিয়
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    পণ্য হাতে পাওয়ার পর রাইডারকে সম্পূর্ণ ক্যাশ মূল্য পরিশোধ করুন। কোনো অগ্রিম ফি নেই।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT ORDER REVIEW SIDEBAR */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md space-y-5">
            <h3 className="font-extrabold text-base text-[#0f3d44] pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Order Review</span>
              <span className="text-xs text-slate-400 font-mono">({cart.length} items)</span>
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-slate-100">
              {cart.map(({ product, quantity, selectedSize }) => {
                const itemPrice = selectedSize ? selectedSize.price : product.price;
                const itemWeight = selectedSize ? selectedSize.weight_grams : product.weight_grams;
                const itemKey = `${product.id}-${selectedSize?.id || 'default'}`;

                return (
                  <div key={itemKey} className="pt-2 flex items-center gap-3">
                    <img
                      src={product.image_url}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#0f3d44] truncate">{product.name}</h4>
                      <div className="text-[11px] text-slate-500 font-medium truncate">
                        Qty: {quantity}
                        {selectedSize?.name && <span className="text-indigo-700 font-bold ml-1">({selectedSize.name.split('(')[0].trim()})</span>}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#0f3d44]">
                      {formatPrice(itemPrice * quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-bold text-[#0f3d44]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Delivery Charge ({deliveryZone === 'none' ? 'Zone Not Selected' : deliveryZone === 'dhaka' ? 'Dhaka' : 'Outside Dhaka'}):</span>
                <span className="font-bold text-[#0f3d44]">
                  {deliveryZone === 'none' ? (
                    <span className="text-amber-700 font-bold text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">সিলেক্ট করুন</span>
                  ) : deliveryCharge === 0 ? (
                    <span className="text-emerald-600">FREE</span>
                  ) : (
                    formatPrice(deliveryCharge)
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-base font-extrabold text-[#0f3d44]">Total Payable:</span>
                <span className="text-2xl font-black bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] to-[#ec4899] bg-clip-text text-transparent">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 select-none ${
                deliveryZone === 'none'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800'
                  : 'bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] via-[#9333ea] to-[#ec4899] hover:opacity-95 shadow-indigo-500/20'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>
                {deliveryZone === 'none'
                  ? 'ডেলিভারি জোন সিলেক্ট করুন (Select Delivery Zone)'
                  : isSubmitting
                  ? 'Processing Order...'
                  : `Place Order – ${formatPrice(grandTotal)}`}
              </span>
            </button>

            <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Secure Checkout • UNEX AURA Guarantee</span>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
