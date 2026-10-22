import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useSEO } from '../hooks/useSEO';
import { trackBeginCheckout } from '../utils/analytics';
import { isAyatulKursiProduct, calculateDeliveryFee } from '../utils/delivery';
import {
  ShieldCheck,
  Lock,
  Check,
  MapPin,
  User,
  Phone,
  FileText,
  Truck,
  Banknote,
  Sparkles,
  ShoppingBag,
  ArrowLeft,
  Trash2,
  Plus,
  Minus
} from 'lucide-react';

interface CheckoutPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  useSEO({
    title: 'অর্ডার কনফার্ম ও চেকআউট',
    description: 'সহজ ও নিরাপদ চেকআউট - UNEX AURA প্রিমিয়াম ওয়াল ডেকোর ক্যাশ অন ডেলিভারিতে অর্ডার করুন।'
  });

  const {
    cart,
    user,
    deliveryZone,
    setDeliveryZone,
    deliveryCharge,
    deliveryDetails,
    getCartSubtotal,
    getCartWeight,
    formatPrice,
    updateCartQty,
    removeFromCart,
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
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-select 'dhaka' if not already selected so checkout is 1-tap ready
  useEffect(() => {
    if (deliveryZone === 'none') {
      setDeliveryZone('dhaka');
    }
  }, [deliveryZone, setDeliveryZone]);

  const subtotal = getCartSubtotal();
  const totalWeight = getCartWeight();
  const grandTotal = subtotal + deliveryCharge;

  // Track checkout initiation
  useEffect(() => {
    if (cart && cart.length > 0) {
      trackBeginCheckout(cart, grandTotal);
    }
  }, []);

  // Compute weight details for delivery options display
  let hasAyatulKursi = false;
  let ayatulKursiWeight = 0;
  let otherProductsWeight = 0;
  let hasOtherProducts = false;

  cart.forEach((item) => {
    const isAyatul = isAyatulKursiProduct(item);
    const w = (item.selectedSize ? item.selectedSize.weight_grams : item.product.weight_grams) || 0;
    const totalItemWeight = w * item.quantity;
    if (isAyatul) {
      hasAyatulKursi = true;
      ayatulKursiWeight += totalItemWeight;
    } else {
      hasOtherProducts = true;
      otherProductsWeight += totalItemWeight;
    }
  });

  const billableWeight = hasAyatulKursi ? otherProductsWeight : totalWeight;

  const dhakaFeeDetails = calculateDeliveryFee(
    billableWeight,
    'dhaka',
    subtotal,
    settings.free_shipping_threshold_dhaka,
    {
      isAyatulKursiOnly: hasAyatulKursi && !hasOtherProducts,
      hasAyatulKursi,
      hasOtherProducts,
      ayatulKursiWeight,
      totalWeight
    }
  );

  const outsideDhakaFeeDetails = calculateDeliveryFee(
    billableWeight,
    'outside_dhaka',
    subtotal,
    settings.free_shipping_threshold_dhaka,
    {
      isAyatulKursiOnly: hasAyatulKursi && !hasOtherProducts,
      hasAyatulKursi,
      hasOtherProducts,
      ayatulKursiWeight,
      totalWeight
    }
  );

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      alert('দয়া করে আপনার নাম, মোবাইল নম্বর এবং সম্পূর্ণ ঠিকানা পূরণ করুন।');
      return;
    }

    if (deliveryZone === 'none') {
      alert('দয়া করে ডেলিভারি এলাকা (ঢাকার ভেতরে অথবা ঢাকার বাইরে) নির্বাচন করুন।');
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
        city: deliveryZone === 'dhaka' ? 'Dhaka' : 'Outside Dhaka',
        delivery_zone: deliveryZone,
        total_weight_grams: totalWeight,
        delivery_charge: deliveryCharge,
        subtotal_amount: subtotal,
        total_amount: grandTotal,
        payment_method: 'cod',
        payment_status: 'unpaid',
        order_notes: orderNotes.trim(),
        items: cart.map((item) => ({
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
      showToast('আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!');

      onNavigate('ordersuccess', {
        order: createdOrder,
        orderNumber: createdOrder?.order_number
      });
    } catch (err) {
      console.error('Failed to submit order:', err);
      alert('অর্ডার সাবমিট করার সময় একটি সমস্যা দেখা দিয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-[#0f3d44]">আপনার কার্ট বর্তমানে খালি</h2>
        <p className="text-xs text-slate-500">
          অর্ডার সম্পন্ন করতে প্রথমে পছন্দের পণ্যটি কার্টে যোগ করুন।
        </p>
        <button
          onClick={() => onNavigate('shop')}
          className="mt-3 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer"
        >
          কালেকশন দেখুন
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* SIMPLE BREADCRUMB */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('shop')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>শপে ফিরে যান (Back to Shop)</span>
        </button>
        <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে টাকা দিন)</span>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CUSTOMER FRIENDLY SIMPLIFIED FORM (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
            {/* CLEAN FORM HEADER */}
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-black text-base sm:text-lg text-[#0f3d44]">
                  অর্ডার ও ডেলিভারি তথ্য
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  পণ্যটি ডেলিভারি পেতে নিচের তথ্যগুলো পূরণ করুন
                </p>
              </div>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                সহজ অর্ডার
              </span>
            </div>

            {/* FORM INPUTS */}
            <div className="space-y-4 text-xs sm:text-sm">
              {/* FULL NAME */}
              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>আপনার নাম <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="যেমন: তানভীর হোসেন"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#0f3d44] focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                />
              </div>

              {/* MOBILE NUMBER */}
              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  <span>মোবাইল নম্বর <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX (১১ ডিজিটের মোবাইল নম্বর)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#0f3d44] focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium font-mono"
                />
              </div>

              {/* FULL ADDRESS */}
              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-pink-600" />
                  <span>সম্পূর্ণ ঠিকানা <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="বাসা/ফ্ল্যাট নং, রোড নং, এলাকা, থানা/উপজেলা ও জেলা"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#0f3d44] focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                />
              </div>

              {/* DELIVERY LOCATION SELECTOR (FRIENDLY 2-CARD BUTTONS INSTEAD OF CLUNKY DROPDOWN) */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>ডেলিভারি এলাকা নির্বাচন করুন <span className="text-red-500">*</span></span>
                  </span>
                  {hasAyatulKursi && (
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>আয়াতুল কুরসি ফ্রি ডেলিভারি</span>
                    </span>
                  )}
                </label>

                <div className="grid grid-cols-2 gap-3">
                  {/* Inside Dhaka Option Card */}
                  <div
                    onClick={() => setDeliveryZone('dhaka')}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer select-none flex flex-col justify-between ${
                      deliveryZone === 'dhaka'
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-[#0f3d44] text-xs sm:text-sm flex items-center gap-1">
                        <span>📍 ঢাকার ভেতরে</span>
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                          deliveryZone === 'dhaka'
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {deliveryZone === 'dhaka' && <Check className="w-3 h-3" />}
                      </div>
                    </div>

                    <div className="text-[11px] font-bold">
                      {dhakaFeeDetails.totalCharge === 0 ? (
                        <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-black">
                          FREE / ফ্রি (৳০)
                        </span>
                      ) : (
                        <span className="text-indigo-700">
                          ডেলিভারি চার্জ: {formatPrice(dhakaFeeDetails.totalCharge)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Outside Dhaka Option Card */}
                  <div
                    onClick={() => setDeliveryZone('outside_dhaka')}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer select-none flex flex-col justify-between ${
                      deliveryZone === 'outside_dhaka'
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-[#0f3d44] text-xs sm:text-sm flex items-center gap-1">
                        <span>🚚 ঢাকার বাইরে</span>
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                          deliveryZone === 'outside_dhaka'
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {deliveryZone === 'outside_dhaka' && <Check className="w-3 h-3" />}
                      </div>
                    </div>

                    <div className="text-[11px] font-bold">
                      {outsideDhakaFeeDetails.totalCharge === 0 ? (
                        <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-black">
                          FREE / ফ্রি (৳০)
                        </span>
                      ) : (
                        <span className="text-indigo-700">
                          ডেলিভারি চার্জ: {formatPrice(outsideDhakaFeeDetails.totalCharge)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Weight Slab note */}
                <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>
                    মোট ওজন:{' '}
                    <strong className="text-slate-700 font-mono">
                      {totalWeight >= 1000 ? `${(totalWeight / 1000).toFixed(1)} কেজি` : `${totalWeight} গ্রাম`}
                    </strong>
                  </span>
                  <span className="font-semibold text-indigo-700">
                    {deliveryDetails.slabDescription}
                  </span>
                </div>
              </div>

              {/* ORDER NOTE (OPTIONAL) */}
              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>অর্ডার নোট (ঐচ্ছিক)</span>
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="ডেলিভারি সম্পর্কিত বিশেষ কোনো কথা থাকলে লিখুন..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#0f3d44] focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                />
              </div>

              {/* PAYMENT METHOD (CASH ON DELIVERY) */}
              <div className="pt-2">
                <div className="p-3.5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Banknote className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-[#0f3d44] text-xs sm:text-sm flex items-center gap-2">
                        <span>ক্যাশ অন ডেলিভারি (Cash on Delivery)</span>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          ০৳ অগ্রিম
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        পণ্য হাতে পেয়ে দেখে ডেলিভারিম্যানকে টাকা দিন
                      </p>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR: CLEAN ORDER SUMMARY (5 cols) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-md space-y-4">
            <h3 className="font-extrabold text-sm sm:text-base text-[#0f3d44] pb-2.5 border-b border-slate-100 flex items-center justify-between">
              <span>অর্ডার বিবরণী (Order Summary)</span>
              <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full">
                {cart.length} টি পণ্য
              </span>
            </h3>

            {/* PRODUCT MINI LIST WITH QUANTITY & REMOVE CONTROLS */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 divide-y divide-slate-100">
              {cart.map(({ product, quantity, selectedSize }) => {
                const itemPrice = selectedSize ? selectedSize.price : product.price;
                const itemKey = `${product.id}-${selectedSize?.id || 'default'}`;

                return (
                  <div key={itemKey} className="pt-2.5 flex items-center gap-2.5">
                    <img
                      src={product.image_url}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#0f3d44] truncate">{product.name}</h4>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {selectedSize ? selectedSize.name : formatPrice(itemPrice)}
                      </div>
                      {/* QUANTITY CONTROLS */}
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden text-xs">
                          <button
                            type="button"
                            onClick={() => updateCartQty(product.id, Math.max(1, quantity - 1), selectedSize?.id)}
                            className="px-2 py-0.5 text-slate-600 hover:bg-slate-200 transition-colors font-bold cursor-pointer"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 py-0.5 font-bold text-slate-800 text-[11px] min-w-5 text-center">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(product.id, quantity + 1, selectedSize?.id)}
                            className="px-2 py-0.5 text-slate-600 hover:bg-slate-200 transition-colors font-bold cursor-pointer"
                            title="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(product.id, selectedSize?.id)}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#0f3d44] shrink-0">
                      {formatPrice(itemPrice * quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* BILLING BREAKDOWN */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>পণ্যের মোট মূল্য (Subtotal):</span>
                <span className="font-bold text-[#0f3d44]">{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>
                  ডেলিভারি চার্জ ({deliveryZone === 'dhaka' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে'}):
                </span>
                <span className="font-bold text-[#0f3d44]">
                  {deliveryCharge === 0 ? (
                    <span className="text-emerald-600 font-black bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      FREE / ফ্রি
                    </span>
                  ) : (
                    formatPrice(deliveryCharge)
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm sm:text-base font-extrabold text-[#0f3d44]">সর্বমোট (Total):</span>
                <span className="text-xl sm:text-2xl font-black text-indigo-700">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            {/* CONFIRM ORDER SUBMIT CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:opacity-95 shadow-lg shadow-teal-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 select-none active:scale-98"
            >
              <Lock className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'অর্ডার প্রসেস হচ্ছে...'
                  : `অর্ডার নিশ্চিত করুন (Cash on Delivery) • ${formatPrice(grandTotal)}`}
              </span>
            </button>

            {/* TRUST GUARANTEES */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10px] text-slate-500 text-center">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center gap-1">
                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>পণ্য দেখে মূল্য দিন</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3 text-indigo-600 shrink-0" />
                <span>দ্রুত হোম ডেলিভারি</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
