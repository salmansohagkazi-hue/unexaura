import React from 'react';
import { ShieldCheck, Truck, Sparkles, RefreshCw, PhoneCall, Mail, MapPin, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#0b1329] text-slate-300 pt-14 pb-8 border-t border-slate-800">
      {/* BRAND VALUE HIGHLIGHTS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
          <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-white text-sm">Stainless &amp; MS Steel Art</h4>
            <p className="text-xs text-slate-400">100% rust-free guaranteed lifetime protection with premium electro-powder coating.</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-white text-sm">Fast All-Bangladesh Delivery</h4>
            <p className="text-xs text-slate-400">Safe packaging in custom protective framing with nationwide express shipping.</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-white text-sm">3D Floating Mounts</h4>
            <p className="text-xs text-slate-400">Includes hidden wall spacers for dynamic drop-shadow reflections on your room wall.</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
          <div className="p-3 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20 shrink-0">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-white text-sm">Custom Size Customization</h4>
            <p className="text-xs text-slate-400">Need specific dimension for your hall or mosque? Custom laser sizing available.</p>
          </div>
        </div>
      </div>

      {/* FOOTER LINKS & INFORMATION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="space-y-0.5">
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-teal-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent block">
              UNEX AURA
            </span>
            <span className="block text-[10px] tracking-[0.25em] text-teal-300 lowercase font-bold opacity-90">
              unique experience
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Leading manufacturer of precision laser-cut Stainless Steel and Mild Steel (MS) Islamic wall decor, calligraphies, natural motifs, and architectural metal artwork in Bangladesh.
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm mb-3">Shop Categories</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><button onClick={() => onNavigate('shop')} className="hover:text-teal-400 transition-colors">Surah &amp; Islamic Calligraphy</button></li>
            <li><button onClick={() => onNavigate('shop')} className="hover:text-teal-400 transition-colors">Ayatul Kursi Metal Art</button></li>
            <li><button onClick={() => onNavigate('shop')} className="hover:text-teal-400 transition-colors">Modern Abstract Stainless Steel</button></li>
            <li><button onClick={() => onNavigate('shop')} className="hover:text-teal-400 transition-colors">Floral &amp; Nature Wall Art</button></li>
            <li><button onClick={() => onNavigate('shop')} className="hover:text-teal-400 transition-colors">Geometrical Architectural Decor</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm mb-3">Quick Links</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><button onClick={() => onNavigate('home')} className="hover:text-teal-400 transition-colors">Home Page</button></li>
            <li><button onClick={() => onNavigate('shop')} className="hover:text-teal-400 transition-colors">Shop Wall Art</button></li>
            <li><button onClick={() => onNavigate('cart')} className="hover:text-teal-400 transition-colors">Shopping Cart</button></li>
            <li><button onClick={() => onNavigate('account')} className="hover:text-teal-400 transition-colors">Customer Account &amp; Track Order</button></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm mb-1">Customer Support</h4>
          <div className="space-y-2 text-xs text-slate-400">
            <a
              href="https://wa.me/8801623319639?text=%E0%A6%AE%E0%A7%87%E0%A6%B8%E0%A7%87%E0%A6%9C%20%E0%A6%A6%E0%A6%BF%E0%A6%A8"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Hotline &amp; WhatsApp: 01623319639</span>
            </a>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-teal-400 shrink-0" />
              <span>support@unexaura.com</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span>Dada Market, Unique, Baipail, Ashulia, Dhaka, Zip code: 1341</span>
            </div>
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <div>
          &copy; {new Date().getFullYear()} UNEX AURA. All Rights Reserved.
        </div>
        <div className="flex items-center gap-1">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
          <span>in Stainless Steel</span>
        </div>
      </div>
    </footer>
  );
};
