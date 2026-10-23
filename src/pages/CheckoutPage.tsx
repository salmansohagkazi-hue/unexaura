import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useSEO } from '../hooks/useSEO';
import { trackBeginCheckout } from '../utils/analytics';
import { calculateDeliveryFee } from '../utils/delivery';
import {
  Truck,
  CreditCard,
  Check,
  ShoppingBag,
  Home,
  ChevronRight,
  ChevronDown,
  Trash2,
  Plus,
  Minus,
  Banknote,
  ShieldCheck,
  Lock
} from 'lucide-react';

interface CheckoutPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  useSEO({
    title: 'Checkout - UNEX AURA',
    description: 'Complete your order with Cash on Delivery. Fast nationwide delivery across Bangladesh.'
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
    updateCartQty,
    removeFromCart,
    clearCart,
    showToast,
    addOrder
  } = useApp();

  const [fullName, setFullName] = useState(
    user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : ''
  );
  const [phone, setPhone] = useState(user ? user.phone : '');
  const [address, setAddress] = useState(user ? user.address : '');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-select 'dhaka' if not already selected so checkout is ready
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

  // Standard delivery fee calculations for display
  const dhakaFee = calculateDeliveryFee(totalWeight, 'dhaka', subtotal);
  const outsideDhakaFee = calculateDeliveryFee(totalWeight, 'outside_dhaka', subtotal);

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
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">আপনার কার্ট বর্তমানে খালি</h2>
        <p className="text-xs text-slate-500">
          অর্ডার সম্পন্ন করতে প্রথমে পছন্দের পণ্যটি সিলেক্ট করুন।
        </p>
        <button
          onClick={() => onNavigate('shop')}
          className="mt-3 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors cursor-pointer"
        >
          কালেকশন দেখুন (Browse Products)
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-5 space-y-4">
        {/* BREADCRUMB: Home > Checkout */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium select-none">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1 hover:text-purple-600 transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-800 font-semibold">Checkout</span>
        </nav>

        <form onSubmit={handleSubmitOrder} className="space-y-4">
          {/* CARD 1: SHIPPING INFORMATION */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900">
              <Truck className="w-5 h-5 text-purple-600" />
              <h2 className="text-base sm:text-lg font-bold">Shipping Information</h2>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm">
              {/* FULL NAME */}
              <div>
                <label className="block text-slate-700 font-medium mb-1.5 text-xs">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all font-normal"
                />
              </div>

              {/* PHONE NUMBER */}
              <div>
                <label className="block text-slate-700 font-medium mb-1.5 text-xs">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded-xl border border-slate-200 overflow-hidden focus-within:border-purple-600 focus-within:ring-1 focus-within:ring-purple-600 transition-all bg-white">
                  <div className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-50 border-r border-slate-200 text-slate-700 select-none text-xs sm:text-sm font-medium">
                    <span className="text-sm">🇧🇩</span>
                    <span>+88</span>
                    <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01712345678"
                    className="flex-1 px-3 py-2.5 text-slate-800 placeholder:text-slate-400 focus:outline-none font-mono text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* FULL ADDRESS */}
              <div>
                <label className="block text-slate-700 font-medium mb-1.5 text-xs">
                  Full Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your full address (e.g. House, Road, Area, Thana/District)"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all resize-y text-xs sm:text-sm"
                />
              </div>

              {/* CITY, ZONE & AREA */}
              <div>
                <label className="block text-slate-700 font-medium mb-1.5 text-xs">
                  City, Zone & Area <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDeliveryZone('dhaka')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                      deliveryZone === 'dhaka'
                        ? 'border-purple-600 bg-purple-50/40 ring-1 ring-purple-600 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                        Inside Dhaka
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                          deliveryZone === 'dhaka'
                            ? 'bg-purple-600 border-purple-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {deliveryZone === 'dhaka' && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-purple-700 mt-1">
                      ডেলিভারি চার্জ: {formatPrice(dhakaFee.totalCharge)}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryZone('outside_dhaka')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                      deliveryZone === 'outside_dhaka'
                        ? 'border-purple-600 bg-purple-50/40 ring-1 ring-purple-600 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                        Outside Dhaka
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                          deliveryZone === 'outside_dhaka'
                            ? 'bg-purple-600 border-purple-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {deliveryZone === 'outside_dhaka' && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-purple-700 mt-1">
                      ডেলিভারি চার্জ: {formatPrice(outsideDhakaFee.totalCharge)}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: PAYMENT METHOD */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 text-slate-900">
              <CreditCard className="w-5 h-5 text-purple-600" />
              <h2 className="text-base sm:text-lg font-bold">Payment Method</h2>
            </div>

            {/* CASH ON DELIVERY CARD (MATCHING SCREENSHOT) */}
            <div className="p-3.5 rounded-xl border-2 border-purple-600 bg-purple-50/20 flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-purple-600 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                </div>
                <div className="flex items-center gap-2 font-semibold text-slate-800 text-xs sm:text-sm">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  <span>Cash On Delivery</span>
                </div>
              </div>
              <Check className="w-4 h-4 text-purple-600 font-bold" />
            </div>
          </div>

          {/* CARD 3: ORDER SUMMARY & SUBMIT */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-sm sm:text-base text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs text-slate-500 font-normal">
                {cart.length} item{cart.length > 1 ? 's' : ''}
              </span>
            </h3>

            {/* ITEMS LIST */}
            <div className="space-y-3 divide-y divide-slate-100">
              {cart.map(({ product, quantity, selectedSize }) => {
                const itemPrice = selectedSize ? selectedSize.price : product.price;
                const itemKey = `${product.id}-${selectedSize?.id || 'default'}`;

                return (
                  <div key={itemKey} className="pt-3 first:pt-0 flex items-center gap-3">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{product.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {selectedSize ? selectedSize.name : formatPrice(itemPrice)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden text-xs">
                          <button
                            type="button"
                            onClick={() => updateCartQty(product.id, Math.max(1, quantity - 1), selectedSize?.id)}
                            className="px-2 py-0.5 text-slate-600 hover:bg-slate-200 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 py-0.5 font-bold text-slate-800 text-[11px] min-w-5 text-center">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(product.id, quantity + 1, selectedSize?.id)}
                            className="px-2 py-0.5 text-slate-600 hover:bg-slate-200 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(product.id, selectedSize?.id)}
                          className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 shrink-0">
                      {formatPrice(itemPrice * quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* BILLING BREAKDOWN */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs sm:text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge ({deliveryZone === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
                <span className="font-semibold text-slate-800">{formatPrice(deliveryCharge)}</span>
              </div>
              <div className="pt-2.5 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 text-sm sm:text-base">Total</span>
                <span className="text-lg sm:text-xl font-black text-purple-700">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 select-none active:scale-98"
            >
              <Lock className="w-4 h-4" />
              <span>
                {isSubmitting ? 'অর্ডার প্রসেস হচ্ছে...' : `অর্ডার নিশ্চিত করুন • ${formatPrice(grandTotal)}`}
              </span>
            </button>

            {/* ASSURANCE NOTE */}
            <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে দেখে টাকা দিন</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
