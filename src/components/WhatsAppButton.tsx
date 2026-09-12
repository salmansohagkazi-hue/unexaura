import React, { useState } from 'react';
import { MessageCircle, X, Send, ShieldCheck, Phone } from 'lucide-react';
import { trackLead } from '../utils/analytics';

interface WhatsAppButtonProps {
  phoneNumber?: string; // default "01623319639"
  facebookUrl?: string;
  instagramUrl?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber = '01623319639',
  facebookUrl = 'https://www.facebook.com/unexaura',
  instagramUrl = 'https://www.instagram.com/unex.aura'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const formattedPhone = phoneNumber.replace(/^0/, '880');
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent('আসসালামু আলাইকুম! UNEX AURA থেকে ওয়াল আর্ট অর্ডার / তথ্য জানতে চাই।')}`;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 group select-none">
      {/* EXPANDABLE MULTI-CHANNEL QUICK CHAT WIDGET */}
      {isOpen && (
        <div className="w-84 sm:w-90 bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* HEADER */}
          <div className="bg-gradient-to-r from-[#0f3d44] via-teal-800 to-[#128C7E] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center font-black text-sm text-white border border-white/20 shadow-inner">
                  UA
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#0f3d44] rounded-full"></span>
              </div>
              <div>
                <h4 className="font-extrabold text-sm leading-tight">UNEX AURA কাস্টমার কেয়ার</h4>
                <p className="text-[11px] text-teal-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                  অনলাইন আছেন • দ্রুত সহায়তা পাবেন
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
              aria-label="Close Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* CHAT BODY */}
          <div className="p-4 bg-slate-50 space-y-3 text-xs">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5 text-slate-700">
              <p className="font-bold text-[#0f3d44] flex items-center gap-1.5">
                <span>আসসালামু আলাইকুম!</span>
                <span>👋</span>
              </p>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                আপনার পছন্দের মেটাল ওয়াল আর্ট অর্ডার, সাইজ কাস্টমাইজেশন বা যেকোনো তথ্যের জন্য নিচের যেকোনো মাধ্যমে সরাসরি যোগাযোগ করুন:
              </p>
              <div className="pt-1 text-[10px] text-slate-400 flex items-center gap-1 border-t border-slate-100">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>অফিসিয়াল সাপোর্ট হেল্পলাইন: {phoneNumber}</span>
              </div>
            </div>

            {/* CHANNEL BUTTONS */}
            <div className="space-y-2">
              {/* WhatsApp Option */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackLead('whatsapp_inquiry')}
                className="w-full py-2.5 px-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl font-bold text-xs flex items-center justify-between shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  <span>WhatsApp-এ চ্যাট করুন</span>
                </div>
                <Send className="w-3.5 h-3.5 opacity-80" />
              </a>

              {/* Facebook Messenger / Page Option */}
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackLead('facebook_inquiry')}
                className="w-full py-2.5 px-3.5 bg-[#0084FF] hover:bg-[#0073e6] text-white rounded-xl font-bold text-xs flex items-center justify-between shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook পেইজে মেসেজ দিন</span>
                </div>
                <Send className="w-3.5 h-3.5 opacity-80" />
              </a>

              {/* Instagram Option */}
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackLead('instagram_inquiry')}
                className="w-full py-2.5 px-3.5 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-95 text-white rounded-xl font-bold text-xs flex items-center justify-between shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Instagram-এ DM করুন</span>
                </div>
                <Send className="w-3.5 h-3.5 opacity-80" />
              </a>

              {/* Direct Phone Call */}
              <a
                href={`tel:${phoneNumber}`}
                onClick={() => trackLead('phone_call')}
                className="w-full py-2.5 px-3.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-between shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>সরাসরি কল দিন ({phoneNumber})</span>
                </div>
                <span className="text-[10px] text-teal-300 font-normal">Call Now</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING ACTION BUTTON */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          className="hidden sm:flex items-center gap-2 bg-slate-900/95 hover:bg-emerald-950 text-white px-3.5 py-2 rounded-full shadow-lg border border-slate-700 hover:border-emerald-500 text-xs font-bold backdrop-blur-xs transition-all duration-300 hover:scale-105 cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>সরাসরি চ্যাট বা অর্ডার করুন</span>
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          aria-label="Social Customer Support"
          className="relative group/btn w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-xl shadow-emerald-600/30 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-white/50 cursor-pointer"
        >
          {/* Subtle Outer Glow Pulse */}
          <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 group-hover/btn:opacity-60 animate-ping pointer-events-none"></span>

          {isOpen ? (
            <X className="w-6 h-6 text-white relative z-10" />
          ) : (
            <svg
              className="w-8 h-8 fill-current relative z-10"
              viewBox="0 0 24 24"
            >
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

