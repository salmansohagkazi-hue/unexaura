import React, { useState } from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { X, Truck, Phone, MapPin, User, CheckCircle2, ShieldCheck, ShoppingBag } from 'lucide-react';

interface QuickOrderModalProps {
  product: Product | null;
  onClose: () => void;
  onSuccess: (order: any) => void;
}

export const QuickOrderModal: React.FC<QuickOrderModalProps> = ({ product, onClose, onSuccess }) => {
  if (!product) return null;

  const { addOrder, deliveryZone, setDeliveryZone, deliveryDetails, formatPrice, showToast, settings } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [zone, setZone] = useState<'dhaka' | 'outside_dhaka'>(deliveryZone === 'dhaka' ? 'dhaka' : 'outside_dhaka');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const price = product.price;
  const isAyatul = product.name?.toLowerCase().includes('ayatul') || product.name?.includes('আয়াতুল');
  const deliveryCharge = isAyatul ? 0 : (zone === 'dhaka' ? (settings.base_charge_dhaka || 70) : (settings.base_charge_outside || 130));
  const subtotal = price * quantity;
  const total = subtotal + deliveryCharge;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('দয়া করে আপনার নাম লিখুন');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      alert('দয়া করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন');
      return;
    }
    if (!address.trim()) {
      alert('দয়া করে আপনার পূর্ণ ঠিকানা লিখুন (যেমন: বাসা নং, রোড, থানা, জেলা)');
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await addOrder({
        user_name: name.trim(),
        user_phone: phone.trim(),
        shipping_address: address.trim(),
        city: zone === 'dhaka' ? 'Dhaka' : 'Outside Dhaka',
        delivery_zone: zone,
        subtotal_amount: subtotal,
        delivery_charge: deliveryCharge,
        total_amount: total,
        payment_method: 'cod',
        payment_status: 'unpaid',
        items: [
          {
            product_id: product.id,
            product_name: product.name,
            price: product.price,
            quantity: quantity,
            image_url: product.image_url,
            material: product.material || 'Laser-Cut Steel'
          }
        ]
      });

      showToast('আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!');
      onSuccess(order);
      onClose();
    } catch (err: any) {
      alert('অর্ডার করতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0f3d44] via-teal-800 to-[#0f3d44] text-white p-4 sm:p-5 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>সহজ ১-ক্লিক অর্ডার (Cash On Delivery)</span>
            </div>
            <h3 className="text-base sm:text-lg font-black leading-tight">
              অর্ডারটি কনফার্ম করতে ফর্মটি পূরণ করুন
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Selected Product Snapshot */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-xs sm:text-sm text-[#0f3d44] truncate">{product.name}</h4>
              <div className="flex items-center justify-between mt-1">
                <span className="font-black text-sm sm:text-base text-teal-700">{formatPrice(price)}</span>
                {/* Quantity */}
                <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-2.5 py-1 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 font-bold text-xs">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-2.5 py-1 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Zone Selection */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block text-xs">
              ডেলিভারি লোকেশন নির্বাচন করুন *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setZone('dhaka');
                  setDeliveryZone('dhaka');
                }}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  zone === 'dhaka'
                    ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-200 text-teal-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-black">ঢাকার ভেতরে</div>
                <div className="text-[11px] text-teal-700 font-bold">
                  {isAyatul ? 'ফ্রি ডেলিভারি (৳০)' : 'চার্জ: ৳৭০'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setZone('outside_dhaka');
                  setDeliveryZone('outside_dhaka');
                }}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  zone === 'outside_dhaka'
                    ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-200 text-teal-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-black">ঢাকার বাইরে</div>
                <div className="text-[11px] text-teal-700 font-bold">
                  {isAyatul ? 'ফ্রি ডেলিভারি (৳০)' : 'চার্জ: ৳১৩০'}
                </div>
              </button>
            </div>
          </div>

          {/* Customer Name */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>আপনার নাম *</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="যেমন: মোঃ সাকিব হোসেন"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#0f3d44] focus:bg-white focus:border-teal-500 focus:outline-none font-medium"
            />
          </div>

          {/* Customer Phone */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
              <Phone className="w-3.5 h-3.5 text-teal-600" />
              <span>মোবাইল নম্বর (১১ ডিজিট) *</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="017XXXXXXXX"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#0f3d44] font-mono focus:bg-white focus:border-teal-500 focus:outline-none font-bold"
            />
          </div>

          {/* Customer Address */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>সম্পূর্ণ ডেলিভারি ঠিকানা *</span>
            </label>
            <textarea
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="বাসা নং, রোড নং, এলাকা/গ্রাম, থানা ও জেলা..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#0f3d44] focus:bg-white focus:border-teal-500 focus:outline-none font-medium resize-none"
            />
          </div>

          {/* Total Summary */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>প্রোডাক্ট মূল্য:</span>
              <span className="font-bold">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>ডেলিভারি চার্জ:</span>
              <span className="font-bold text-emerald-700">
                {deliveryCharge === 0 ? 'ফ্রি (৳০)' : formatPrice(deliveryCharge)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-black text-[#0f3d44] pt-1.5 border-t border-slate-200">
              <span>সর্বমোট প্রদেয় (Cash On Delivery):</span>
              <span className="text-teal-700 text-base">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:opacity-95 shadow-lg shadow-teal-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isSubmitting ? 'অর্ডার প্রসেস হচ্ছে...' : `অর্ডার কনফার্ম করুন • ${formatPrice(total)}`}</span>
          </button>

          <p className="text-[11px] text-center text-slate-500 flex items-center justify-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>পণ্য হাতে পেয়ে দেখে ডেলিভারিম্যানকে টাকা পরিশোধ করবেন।</span>
          </p>
        </form>
      </div>
    </div>
  );
};
