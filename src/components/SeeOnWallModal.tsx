import React, { useState, useEffect } from 'react';
import { Product, ProductSize } from '../types';
import { useApp } from '../context/AppContext';
import { trackViewItem } from '../utils/analytics';
import {
  X,
  Eye,
  ShoppingBag,
  Sparkles,
  Sun,
  Moon,
  Star,
  CheckCircle2,
  Heart,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Scale
} from 'lucide-react';

interface SeeOnWallModalProps {
  product: Product | null;
  onClose: () => void;
  onNavigate?: (page: string, params?: any) => void;
}

export const SeeOnWallModal: React.FC<SeeOnWallModalProps> = ({ product, onClose, onNavigate }) => {
  // Track view_item / ViewContent when modal opens
  useEffect(() => {
    if (product) {
      trackViewItem({
        id: product.id,
        name: product.name,
        price: product.price,
        category_name: product.category_name,
        slug: product.slug
      });
    }
  }, [product?.id]);

  if (!product) return null;

  const { addToCart, formatPrice, toggleWishlist, isInWishlist } = useApp();
  const isWishlisted = isInWishlist(product.id);

  // View mode: 'overview' (Product Details & Overview) or 'wall' (See On Your Wall)
  const [viewMode, setViewMode] = useState<'overview' | 'wall'>('overview');

  // Size selection
  const productSizes: ProductSize[] = product.sizes && product.sizes.length >= 2 ? product.sizes : [
    { id: 's1', name: 'Medium (60cm × 40cm)', price: product.price, old_price: product.old_price, weight_grams: product.weight_grams, size_dimensions: product.size_dimensions || '60cm × 40cm' },
    { id: 's2', name: 'Large (80cm × 50cm)', price: Math.round(product.price * 1.32), old_price: product.old_price ? Math.round(product.old_price * 1.32) : Math.round(product.price * 1.65), weight_grams: Math.round(product.weight_grams * 1.45), size_dimensions: '80cm × 50cm' }
  ];
  const [selectedSizeIdx, setSelectedSizeIdx] = useState<number>(0);
  const activeSize = productSizes[selectedSizeIdx] || productSizes[0];

  const currentPrice = activeSize.price;
  const oldPrice = activeSize.old_price || Math.round(currentPrice * 1.25);
  const savings = oldPrice > currentPrice ? oldPrice - currentPrice : 0;

  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);

  const placements = product.placements && product.placements.length > 0
    ? product.placements
    : [
        {
          id: 991,
          product_id: product.id,
          image_url: product.image_url,
          room_type: 'Living Room' as const,
          caption: 'Mounted above living room sofa with floating 3D shadow depth',
          sort_order: 1
        },
        {
          id: 992,
          product_id: product.id,
          image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
          room_type: 'Bedroom' as const,
          caption: 'Master bedroom headboard feature wall installation',
          sort_order: 2
        },
        {
          id: 993,
          product_id: product.id,
          image_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
          room_type: 'Hallway' as const,
          caption: 'Entrance gallery hallway focal point',
          sort_order: 3
        },
        {
          id: 994,
          product_id: product.id,
          image_url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
          room_type: 'Formations' as const,
          caption: 'Arrangement Formations: Straight Row, Cascade, or Staggered Cluster',
          sort_order: 4
        }
      ];

  const [activeRoomTab, setActiveRoomTab] = useState<string>(placements[0]?.room_type || 'Living Room');
  const [nightMode, setNightMode] = useState<boolean>(false);
  const activePlacement = placements.find(p => p.room_type === activeRoomTab) || placements[0];

  const getRoomLabelBangla = (roomType?: string, defaultIdx: number = 1) => {
    if (defaultIdx === 0) return 'মেইন ডিজাইন';
    if (!roomType) return `ছবি ${defaultIdx}`;
    const lower = (roomType || '').toLowerCase();
    if (lower.includes('living')) return 'লিভিং রুম';
    if (lower.includes('bed')) return 'বেডরুম';
    if (lower.includes('hallway') || lower.includes('drawing')) return 'ড্রয়িং রুম';
    if (lower.includes('office')) return 'অফিস';
    if (lower.includes('formation')) return 'লেআউট প্যাক';
    return roomType;
  };

  const galleryItems = [
    { url: product.image_url, label: 'মেইন ডিজাইন' },
    ...(placements.map((p, idx) => ({
      url: p.image_url,
      label: p.room_type ? getRoomLabelBangla(p.room_type, idx + 1) : `রুম ${idx + 1}`
    })))
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-[#fdfdfe] rounded-2xl max-w-5xl w-full overflow-hidden shadow-2xl border border-white/20 flex flex-col my-auto max-h-[94vh]">
        
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-3.5 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] to-[#ec4899] text-white shadow-md">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white leading-tight">{product.name}</h3>
              <p className="text-xs text-slate-300 truncate max-w-xs sm:max-w-md">
                {product.category_name || 'Wall Art'} • {activeSize.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* VIEW MODE TABS */}
            <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 text-xs font-bold">
              <button
                onClick={() => setViewMode('overview')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'overview'
                    ? 'bg-gradient-to-r from-[#14b8a6] to-[#4f46e5] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>বিবরণ ও সাইজ (Overview)</span>
              </button>
              <button
                onClick={() => setViewMode('wall')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'wall'
                    ? 'bg-gradient-to-r from-[#14b8a6] to-[#4f46e5] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>ওয়ালে দেখুন (See On Wall)</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer ml-1"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY CONTENT */}
        <div className="flex-1 overflow-y-auto">
          {viewMode === 'overview' ? (
            /* MODE 1: PRODUCT DETAILS & OVERVIEW (MATCHES USER SCREENSHOT EXACTLY) */
            <div className="p-4 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                
                {/* LEFT: GALLERY & IMAGES (5 COLS) */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="relative aspect-4/3 sm:aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm group">
                    <img
                      src={galleryItems[activeImageIdx]?.url || product.image_url}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-teal-800/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                      {galleryItems[activeImageIdx]?.label || 'মেইন ডিজাইন'}
                    </div>
                  </div>

                  {/* THUMBNAIL STRIP */}
                  {galleryItems.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {galleryItems.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIdx(idx)}
                          className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                            activeImageIdx === idx ? 'border-indigo-600 ring-2 ring-indigo-200 scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={item.url} alt={item.label} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* BUTTON TO SWITCH TO WALL VIEW */}
                  <button
                    onClick={() => setViewMode('wall')}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-purple-600" />
                    <span>বাস্তব রুমে এটি কেমন দেখাবে তা দেখুন (See On Room Wall)</span>
                  </button>
                </div>

                {/* RIGHT: DETAILS, PRICING, SIZES & BANGLA OVERVIEW (7 COLS) */}
                <div className="lg:col-span-7 space-y-4">
                  {/* BADGES & TITLE */}
                  <div className="space-y-1.5">
                    <h1 className="text-xl sm:text-2xl font-black text-[#0f3d44] leading-snug">
                      {product.name}
                    </h1>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <div className="flex items-center text-amber-500 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200/80 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                        <span>{product.rating || 4.8}</span>
                      </div>
                      <span className="text-slate-300">•</span>
                      {product.stock > 0 ? (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/80">
                          In Stock ({product.stock} available)
                        </span>
                      ) : (
                        <span className="text-red-700 font-extrabold bg-red-50 px-2.5 py-0.5 rounded-md border border-red-200/80">
                          Out of Stock (স্টক শেষ)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* PRICE & DISCOUNT SAVINGS BADGE */}
                  <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-2xl sm:text-3xl font-black text-[#0f3d44]">
                        {formatPrice(currentPrice)}
                      </span>
                      {oldPrice > currentPrice && (
                        <span className="text-sm text-slate-400 line-through">
                          {formatPrice(oldPrice)}
                        </span>
                      )}
                    </div>

                    {savings > 0 && (
                      <span className="text-xs text-teal-800 font-bold bg-teal-100/90 px-3 py-1 rounded-lg border border-teal-200 shadow-2xs">
                        Save {formatPrice(savings)}
                      </span>
                    )}
                  </div>

                  {/* SIZE SELECTION CARDS (EXACT MATCH TO SCREENSHOT) */}
                  <div className="space-y-2 bg-indigo-50/40 p-3.5 rounded-2xl border border-indigo-100">
                    <div className="flex items-center justify-between text-xs font-extrabold text-[#0f3d44]">
                      <span>সাইজ সিলেক্ট করুন (Select Size Option):</span>
                      <span className="text-indigo-600 font-bold text-[11px]">{activeSize.name}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {productSizes.map((sz, idx) => (
                        <button
                          key={sz.id}
                          type="button"
                          onClick={() => setSelectedSizeIdx(idx)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            selectedSizeIdx === idx
                              ? 'bg-white border-[#4f46e5] ring-2 ring-indigo-200 shadow-xs'
                              : 'bg-white/70 border-slate-200 hover:bg-white text-slate-700'
                          }`}
                        >
                          <div className="font-extrabold text-xs text-[#0f3d44] truncate">{sz.name}</div>
                          <div className="flex items-center justify-between text-[11px] mt-1.5 pt-1 border-t border-slate-100">
                            <span className="font-extrabold text-indigo-700">{formatPrice(sz.price)}</span>
                            <span className="text-slate-500 font-medium">{sz.weight_grams}g</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* BANGLA SHORT OVERVIEW & QUALITIES BOX (EXACT MATCH TO SCREENSHOT) */}
                  <div className="p-4 bg-gradient-to-br from-indigo-50/60 via-teal-50/40 to-slate-50 rounded-2xl border border-indigo-100/90 shadow-2xs space-y-3">
                    <div className="flex items-center gap-2 text-indigo-950 font-extrabold text-sm border-b border-indigo-100 pb-2">
                      <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>পণ্যের বিবরণ ও সংক্ষেপ (Product Short Overview)</span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                      {product.bangla_short_desc || product.description || 'উচ্চমানের উপাদানে তৈরি এই আধুনিক ওয়াল ডেকোরটি আপনার ঘরকে এনে দেবে এক অপরূপ আভিজাত্য। সহজ ইনস্টলেশন ও মার্জিত আউটলুক।'}
                    </p>

                    <div className="pt-1 space-y-2">
                      <h4 className="text-xs font-black text-[#0f3d44] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>পণ্যের বিশেষ গুণাবলী ও বৈশিষ্ট্যসমূহ:</span>
                      </h4>

                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {(product.qualities && product.qualities.length > 0 ? product.qualities : [
                          'হ্যান্ড-ফিনিশড চারকোল সিলুয়েট টেক্সচার ও মেটাল বডি।',
                          'প্রিমিয়াম সার্জিক্যাল মেটাল বডি ও স্মুথ ফিনিশিং।',
                          'দেওয়ালে লাগানোর জন্য শক্তিশালী ডাবল সাইড টেপ দেওয়া আছে।',
                          '৩ডি ফ্লোটিং ভিজ্যুয়াল লুক - দেয়াল থেকে ভেসে থাকে।'
                        ]).map((q, idx) => (
                          <li key={idx} className="flex items-start gap-2 bg-white/90 p-2 rounded-xl border border-slate-200/60">
                            <span className="text-teal-600 font-bold shrink-0">✦</span>
                            <span className="leading-snug">{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* ACTION BUTTONS (ADD TO CART & BUY NOW OR OUT OF STOCK BANNER) */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    {product.stock <= 0 ? (
                      <div className="w-full p-3 rounded-xl bg-red-50 border border-red-200 text-center font-bold text-xs text-red-700 flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-600"></span>
                        <span>বর্তমানে স্টক শেষ (Out of Stock) • অর্ডার নেওয়া বন্ধ রয়েছে</span>
                      </div>
                    ) : (
                      <>
                        {/* QUANTITY CONTROLLER */}
                        <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shrink-0 w-full sm:w-auto justify-center">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="px-3 py-2 text-slate-600 hover:bg-slate-100 font-bold text-sm cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-4 py-2 text-xs font-bold text-[#0f3d44]">{quantity}</span>
                          <button
                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                            className="px-3 py-2 text-slate-600 hover:bg-slate-100 font-bold text-sm cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            addToCart(product, quantity, activeSize);
                            onClose();
                          }}
                          className="flex-1 w-full py-3 px-4 rounded-xl text-xs font-extrabold text-white bg-teal-700 hover:bg-teal-800 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>কার্টে যোগ করুন ({formatPrice(currentPrice * quantity)})</span>
                        </button>

                        <button
                          onClick={() => {
                            addToCart(product, quantity, activeSize);
                            onClose();
                            if (onNavigate) {
                              onNavigate('checkout');
                            }
                          }}
                          className="flex-1 w-full py-3 px-4 rounded-xl text-xs font-extrabold text-slate-900 bg-amber-400 hover:bg-amber-300 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>অর্ডার করুন (Buy Now)</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isWishlisted ? 'bg-pink-50 border-pink-300 text-pink-600' : 'bg-white border-slate-300 text-slate-600 hover:text-pink-600'
                      }`}
                      title="Wishlist"
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-pink-500' : ''}`} />
                    </button>
                  </div>

                  {/* DIRECT NAVIGATION LINK */}
                  {onNavigate && (
                    <div className="pt-1 text-center">
                      <button
                        onClick={() => {
                          onClose();
                          onNavigate('product', { slug: product.slug });
                        }}
                        className="text-xs font-bold text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>সম্পূর্ণ পেজ দেখুন (View Full Detail Page)</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                </div>
              </div>
            </div>
          ) : (
            /* MODE 2: ROOM PLACEMENT PREVIEW */
            <div className="flex flex-col">
              {/* ROOM TAB NAVIGATION */}
              <div className="bg-slate-100 p-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  {Array.from(new Set(placements.map(p => p.room_type))).map((room) => (
                    <button
                      key={room}
                      onClick={() => setActiveRoomTab(room)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        activeRoomTab === room
                          ? 'bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] to-[#9333ea] text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {room === 'Formations' ? '📐 Formations' : `🛋️ ${room}`}
                    </button>
                  ))}
                </div>

                {/* LIGHTING SWITCH */}
                <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-700">
                  <span className="font-medium text-[11px]">Lighting:</span>
                  <button
                    onClick={() => setNightMode(false)}
                    className={`p-1 rounded flex items-center gap-1 cursor-pointer ${!nightMode ? 'bg-amber-100 text-amber-800 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Day</span>
                  </button>
                  <button
                    onClick={() => setNightMode(true)}
                    className={`p-1 rounded flex items-center gap-1 cursor-pointer ${nightMode ? 'bg-indigo-950 text-indigo-200 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Night</span>
                  </button>
                </div>
              </div>

              {/* MAIN PREVIEW CANVAS */}
              <div className={`relative flex-1 min-h-[340px] sm:min-h-[420px] overflow-hidden flex items-center justify-center transition-colors duration-500 ${nightMode ? 'bg-slate-950' : 'bg-slate-200/60'}`}>
                <img
                  src={activePlacement.image_url}
                  alt={activePlacement.caption}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover max-h-[60vh] transition-all duration-700 ${nightMode ? 'brightness-75 contrast-125 sepia-[0.15]' : ''}`}
                />

                {/* OVERLAY CAPTION */}
                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/85 backdrop-blur-md text-white p-3 rounded-xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-teal-300 mb-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{activePlacement.room_type} Mockup</span>
                      <span>•</span>
                      <span className="text-slate-300">{activeSize.size_dimensions}</span>
                    </div>
                    <p className="text-xs text-slate-100 font-medium">{activePlacement.caption}</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-300 shrink-0">
                    <span className="px-2 py-1 bg-white/10 rounded font-mono text-[11px]">
                      {activeSize.weight_grams}g Stainless Steel
                    </span>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-extrabold text-[#0f3d44]">{formatPrice(currentPrice)}</span>
                  {oldPrice > currentPrice && (
                    <span className="text-sm text-slate-400 line-through">{formatPrice(oldPrice)}</span>
                  )}
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-bold border border-emerald-200">
                    In Stock
                  </span>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      addToCart(product, 1, activeSize);
                      onClose();
                    }}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] via-[#9333ea] to-[#ec4899] hover:opacity-95 shadow-md hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add Design To Cart</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

