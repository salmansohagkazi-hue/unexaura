import React from 'react';
import { useApp } from '../context/AppContext';
import { Truck, Scale, Info, Sparkles, CheckCircle, ShieldCheck } from 'lucide-react';

export const DeliveryCalculatorWidget: React.FC = () => {
  const {
    cart,
    deliveryZone,
    setDeliveryZone,
    deliveryCharge,
    codFee,
    deliveryDetails,
    getCartSubtotal,
    getCartWeight,
    settings,
    formatPrice
  } = useApp();

  const totalWeight = getCartWeight();
  const subtotal = getCartSubtotal();
  const freeThreshold = settings.free_shipping_threshold_dhaka;

  const freeProgress = Math.min(100, (subtotal / freeThreshold) * 100);
  const remainingForFree = Math.max(0, freeThreshold - subtotal);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white shadow-xl border border-indigo-900/50">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-r from-teal-400 to-indigo-500 text-slate-950 font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">কুরিয়ার ডেলিভারি চার্জ ক্যালকুলেটর</h4>
            <p className="text-[11px] text-slate-300">ওজন ও জোন ভিত্তিক সুনির্দিষ্ট চার্জ</p>
          </div>
        </div>

        <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full text-teal-300 font-mono flex items-center gap-1">
          <Scale className="w-3 h-3" />
          {totalWeight >= 1000 ? `${(totalWeight / 1000).toFixed(2)} kg` : `${totalWeight} g`}
        </span>
      </div>

      {/* ZONE TOGGLE */}
      <div className="mt-4 space-y-2">
        <label className="text-xs text-slate-300 font-medium block">ডেলিভারি লোকেশন সিলেক্ট করুন:</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setDeliveryZone('dhaka')}
            className={`p-3 rounded-xl text-xs font-bold transition-all border text-left cursor-pointer ${
              deliveryZone === 'dhaka'
                ? 'bg-gradient-to-r from-[#14b8a6] to-[#4f46e5] border-teal-300 text-white shadow-md'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>ঢাকার ভেতরে</span>
              {deliveryZone === 'dhaka' && <CheckCircle className="w-3.5 h-3.5" />}
            </div>
            <span className="text-[10px] opacity-80 block mt-0.5">৬০৳ - ৯০৳ (COD: ০.৫%)</span>
          </button>

          <button
            type="button"
            onClick={() => setDeliveryZone('outside_dhaka')}
            className={`p-3 rounded-xl text-xs font-bold transition-all border text-left cursor-pointer ${
              deliveryZone === 'outside_dhaka'
                ? 'bg-gradient-to-r from-[#14b8a6] to-[#4f46e5] border-teal-300 text-white shadow-md'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>ঢাকার বাইরে</span>
              {deliveryZone === 'outside_dhaka' && <CheckCircle className="w-3.5 h-3.5" />}
            </div>
            <span className="text-[10px] opacity-80 block mt-0.5">১১০৳ - ১৭০৳ (COD: ১%)</span>
          </button>
        </div>
      </div>

      {/* RATE CARD SLAB INFO BOX */}
      <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10 space-y-1.5 text-[11px] text-slate-300">
        <div className="flex items-center justify-between text-teal-300 font-bold">
          <span>ওজন স্ল্যাব ({deliveryZone === 'none' ? 'জোন সিলেক্ট করুন' : deliveryZone === 'dhaka' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে'}):</span>
          <span className="text-white font-mono bg-teal-500/20 px-2 py-0.5 rounded border border-teal-400/30">
            {deliveryDetails.slabDescription}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-400 pt-1 border-t border-white/5">
          <div className="bg-white/5 p-1.5 rounded text-center">
            <span className="block text-slate-300 font-bold">০–৫০০ গ্রাম</span>
            <span>{deliveryZone === 'dhaka' ? '৬০৳' : deliveryZone === 'outside_dhaka' ? '১১০৳' : '৬০৳/১১০৳'}</span>
          </div>
          <div className="bg-white/5 p-1.5 rounded text-center">
            <span className="block text-slate-300 font-bold">৫০০ গ্রাম–১ কেজি</span>
            <span>{deliveryZone === 'dhaka' ? '৭০৳' : deliveryZone === 'outside_dhaka' ? '১৩০৳' : '৭০৳/১৩০৳'}</span>
          </div>
          <div className="bg-white/5 p-1.5 rounded text-center">
            <span className="block text-slate-300 font-bold">১ কেজি–২ কেজি</span>
            <span>{deliveryZone === 'dhaka' ? '৯০৳' : deliveryZone === 'outside_dhaka' ? '১৭০৳' : '৯০৳/১৭০৳'}</span>
          </div>
        </div>
      </div>

      {/* FREE SHIPPING PROGRESS BAR FOR DHAKA */}
      {deliveryZone === 'dhaka' && (
        <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-200 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>ফ্রি ডেলিভারি থ্রেশহোল্ড (ঢাকা)</span>
            </span>
            <span className="text-teal-300 font-bold">
              {deliveryCharge === 0 ? 'FREE DELIVERY!' : formatPrice(remainingForFree) + ' বাকি'}
            </span>
          </div>

          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-400 via-indigo-400 to-pink-500 transition-all duration-500 rounded-full"
              style={{ width: `${freeProgress}%` }}
            />
          </div>

          {remainingForFree > 0 ? (
            <p className="text-[11px] text-slate-400">
              আর {formatPrice(remainingForFree)}-এর ওয়াল আর্ট অর্ডার করলেই <strong>ঢাকায় পাচ্ছেন ফ্রি ডেলিভারি</strong>!
            </p>
          ) : (
            <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              অভিনন্দন! আপনার অর্ডারে ঢাকার ভেতর ডেলিভারি চার্জ সম্পূর্ণ ফ্রি।
            </p>
          )}
        </div>
      )}

      {/* CALCULATED FEE SUMMARY */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-300 font-bold flex items-center gap-1">
            <span>মোট কুরিয়ার + COD চার্জ:</span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1 flex-wrap">
            <span>ডেলিভারি: {formatPrice(deliveryCharge)}</span>
            <span>|</span>
            <span>COD ({deliveryDetails.codPercentage}%): {formatPrice(deliveryDetails.calculatedCodFee || 0)}</span>
            <span className="text-emerald-400 font-bold text-[9px] bg-emerald-950/80 px-1 py-0.2 rounded border border-emerald-800/60 lowercase">(free)</span>
          </p>
        </div>

        <span className="text-xl font-extrabold text-teal-300">
          {deliveryDetails.totalCharge === 0 ? (
            <span className="text-emerald-400 font-bold">FREE</span>
          ) : (
            formatPrice(deliveryDetails.totalCharge)
          )}
        </span>
      </div>
    </div>
  );
};
