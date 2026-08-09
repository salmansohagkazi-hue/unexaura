import React, { useState } from 'react';
import { MessageCircle, X, Send, ShieldCheck } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber?: string; // default "01623319639"
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber = '01623319639'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const formattedPhone = phoneNumber.replace(/^0/, '880');
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent('আসসালামু আলাইকুম! UNEX AURA থেকে ওয়াল আর্ট অর্ডার / তথ্য জানতে চাই।')}`;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 group select-none">
      {/* EXPANDABLE QUICK CHAT WIDGET */}
      {isOpen && (
        <div className="w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* HEADER */}
          <div className="bg-gradient-to-r from-[#128C7E] to-[#25D366] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg text-white border border-white/30">
                  UA
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h4 className="font-extrabold text-sm leading-tight">UNEX AURA Support</h4>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                  অনলাইন আছেন • দ্রুত রেসপন্স
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* CHAT BODY */}
          <div className="p-4 bg-slate-50 space-y-3">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200/80 shadow-2xs space-y-1 text-xs text-slate-700">
              <p className="font-bold text-[#128C7E]">আসসালামু আলাইকুম! 👋</p>
              <p className="text-slate-600 leading-relaxed">
                UNEX AURA-তে আপনাকে স্বাগতম। যেকোনো ইসলামিক ওয়াল আর্টের কাস্টম সাইজ, অর্ডার বা প্রশ্ন থাকলে সরাসরি হোয়াটসঅ্যাপে মেসেজ দিন!
              </p>
              <div className="pt-1 text-[10px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>অফিসিয়াল হোয়াটসঅ্যাপ সাপোর্ট: {phoneNumber}</span>
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              <span>WhatsApp-এ চ্যাট শুরু করুন</span>
            </a>
          </div>
        </div>
      )}

      {/* FLOATING ACTION BUTTON */}
      <div className="flex items-center gap-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-2 bg-slate-900/95 hover:bg-emerald-950 text-white px-3.5 py-2 rounded-full shadow-lg border border-slate-700 hover:border-emerald-500 text-xs font-bold backdrop-blur-xs transition-all duration-300 hover:scale-105"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>WhatsApp-এ সরাসরি অর্ডার করুন</span>
        </a>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp Support"
          className="relative group/btn w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-xl shadow-emerald-600/30 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-white/50 cursor-pointer"
        >
          {/* Subtle Outer Glow Pulse */}
          <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 group-hover/btn:opacity-60 animate-ping pointer-events-none"></span>

          <svg
            className="w-8 h-8 fill-current relative z-10"
            viewBox="0 0 24 24"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
        </a>
      </div>
    </div>
  );
};
