import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useSEO } from '../hooks/useSEO';
import { trackBeginCheckout } from '../utils/analytics';
import { dispatchOrderToWhatsApp, getWhatsAppOrderUrl } from '../utils/whatsappOrder';
import { ShieldCheck, Lock, Check, MapPin, User, Phone, FileText, Truck, Banknote, MessageCircle } from 'lucide-react';

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
    addOrder,
    settings
  } = useApp();

  const [fullName, setFullName] = useState(
    user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : ''
  );
  const [phone, setPhone] = useState(user ? user.phone : '');
  const [address, setAddress] = useState(user ? user.address : '');
  const [district, setDistrict] = useState(user ? user.city || 'ঢাকা' : 'ঢাকা');
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

    if (!fullName.trim() || !phone.trim() || !address.trim() || !district.trim()) {
      alert('দয়া করে * চিহ্নিত সকল প্রয়োজনীয় তথ্য (নাম, মোবাইল নম্বর, সম্পূর্ণ ঠিকানা ও জেলা) পূরণ করুন।');
      return;
    }

    if (deliveryZone === 'none') {
      alert('দয়া করে ডেলিভারি জোন নির্বাচন করুন (ঢাকার ভেতরে অথবা ঢাকার বাইরে)।');
      return;
    }

    setIsSubmitting(true);

    try {
      const createdOrder = await addOrder({
        user_id: user ? user.id : null,
        user_name: fullName.trim(),
        user_email: user?.email || '',
        user_phone: phone.trim(),
        shipping_address: address.trim(),
        city: district.trim(),
        delivery_zone: deliveryZone,
        total_weight_grams: totalWeight,
        delivery_charge: deliveryCharge,
        subtotal_amount: subtotal,
        total_amount: grandTotal,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'stripe' ? 'paid' : 'unpaid',
        order_notes: orderNotes.trim(),
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

      // Automatically dispatch order details to Admin WhatsApp
      const adminWhatsApp = settings?.whatsapp_number || '01623319639';
      const whatsappUrl = dispatchOrderToWhatsApp(createdOrder, adminWhatsApp);

      onNavigate('ordersuccess', { 
        order: createdOrder, 
        orderNumber: createdOrder?.order_number,
        whatsappUrl 
      });
    } catch (err) {
      console.error('Failed to submit order:', err);
      alert('অর্ডার সাবমিট করার সময় একটি সমস্যা দেখা দিয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <button onClick={() => onNavigate('home')} className="hover:text-[#4f46e5] cursor-pointer">Home</button>
        <span>/</span>
        <button onClick={() => onNavigate('cart')} className="hover:text-[#4f46e5] cursor-pointer">Cart</button>
        <span>/</span>
        <span className="text-[#0f3d44] font-bold">Checkout</span>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SINGLE UNIFIED FORM SECTION */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
            {/* FORM HEADER */}
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-teal-500 via-indigo-600 to-pink-500 text-white flex items-center justify-center shadow-xs">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-black text-lg text-[#0f3d44]">
                    অর্ডার ও ডেলিভারি তথ্য (Order & Delivery Details)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    অর্ডারটি কনফার্ম করতে নিচের ফর্মটি সঠিকভাবে পূরণ করুন
                  </p>
                </div>
              </div>
            </div>

            {/* FORM INPUTS */}
            <div className="space-y-4">
              {/* FULL NAME */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>আপনার পুরো নাম (Full Name) <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="যেমন: তানভীর হোসেন / আপনার পূর্ণ নাম লিখুন"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-[#0f3d44] focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                />
              </div>

              {/* MOBILE NUMBER */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  <span>মোবাইল নম্বর (Mobile Number) <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX (১১ ডিজিটের সচল মোবাইল নম্বর)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-[#0f3d44] focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                />
              </div>

              {/* FULL ADDRESS */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-pink-600" />
                  <span>সম্পূর্ণ ঠিকানা (Full Address) <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="বাসা/ফ্ল্যাট নং, রোড নং, এলাকা, থানা/উপজেলা"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-[#0f3d44] focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                />
              </div>

              {/* DISTRICT & DELIVERY ZONE (2-column layout) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* DISTRICT */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>জেলা (District) <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="যেমন: ঢাকা, চট্টগ্রাম, রাজশাহী, বগুড়া..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-[#0f3d44] focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                  />
                </div>

                {/* DELIVERY ZONE */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>ডেলিভারি এলাকা (Delivery Zone) <span className="text-red-500">*</span></span>
                  </label>
                  <select
                    value={deliveryZone}
                    onChange={(e) => setDeliveryZone(e.target.value as any)}
                    className={`w-full border rounded-xl px-3.5 py-3 text-xs sm:text-sm font-bold focus:outline-none cursor-pointer transition-all ${
                      deliveryZone === 'none'
                        ? 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-300/40'
                        : 'bg-slate-50 border-slate-200 text-[#0f3d44] focus:bg-white focus:border-indigo-500'
                    }`}
                  >
                    <option value="none">-- এলাকা নির্বাচন করুন --</option>
                    <option value="dhaka">ঢাকার ভেতরে / Inside Dhaka (Base ৳60)</option>
                    <option value="outside_dhaka">ঢাকার বাইরে / Outside Dhaka (Base ৳110)</option>
                  </select>
                  {deliveryZone === 'none' && (
                    <p className="text-[11px] text-amber-700 font-bold mt-1.5 flex items-center gap-1">
                      ⚠️ অর্ডার করতে ঢাকার ভেতরে অথবা বাইরে সিলেক্ট করুন।
                    </p>
                  )}
                </div>
              </div>

              {/* ORDER NOTE */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>অর্ডার নোট / বিশেষ নির্দেশনা (Order Note - Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="ডেলিভারি সম্পর্কিত বিশেষ কোনো নির্দেশনা থাকলে এখানে লিখুন (ঐচ্ছিক)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#0f3d44] focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium resize-none"
                />
              </div>

              {/* PAYMENT METHOD (COD) */}
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
                  <Banknote className="w-3.5 h-3.5 text-teal-600" />
                  <span>পেমেন্ট পদ্ধতি (Payment Method)</span>
                </label>
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
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
                      <span className="font-extrabold text-[#0f3d44] text-xs sm:text-sm">
                        ক্যাশ অন ডেলিভারি (Cash on Delivery) 💵
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                        কোনো অগ্রিম ফি নেই
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      পণ্য হাতে পাওয়ার পর রাইডারকে সম্পূর্ণ মূল্য পরিশোধ করুন।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT ORDER REVIEW SIDEBAR */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-md space-y-5">
            <h3 className="font-extrabold text-base text-[#0f3d44] pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Order Review</span>
              <span className="text-xs text-slate-400 font-mono">({cart.length} items)</span>
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-slate-100">
              {cart.map(({ product, quantity, selectedSize }) => {
                const itemPrice = selectedSize ? selectedSize.price : product.price;
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
              className={`w-full py-4 rounded-2xl text-sm font-black text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 select-none ${
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
