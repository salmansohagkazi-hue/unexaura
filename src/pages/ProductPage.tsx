import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { Product, ProductSize } from '../types';
import { calculateDeliveryFee, isAyatulKursiProduct } from '../utils/delivery';
import { useSEO } from '../hooks/useSEO';
import { trackViewItem } from '../utils/analytics';
import {
  Eye,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Scale,
  Maximize2,
  Star,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Share2,
  Heart,
  Sparkles,
  Compass,
  Palette,
  Layers,
  MessageCircle
} from 'lucide-react';

interface ProductPageProps {
  slug: string;
  onNavigate: (page: string, params?: any) => void;
  onOpenWallModal: (p: Product) => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({ slug, onNavigate, onOpenWallModal }) => {
  const { products, addToCart, formatPrice, deliveryZone, setDeliveryZone, settings, toggleWishlist, isInWishlist } = useApp();
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);

  const product = products.find(p => p.slug === slug || p.id === Number(slug)) || products[0];
  const isWishlisted = isInWishlist(product.id);

  // Determine if product is Islamic or Natural to label room
  const isIslamic =
    product.category_id === 1 ||
    product.category_id === 2 ||
    product.category_id === 3 ||
    (product.category_name || '').toLowerCase().includes('islamic') ||
    (product.name || '').toLowerCase().includes('ayatul') ||
    (product.name || '').toLowerCase().includes('surah') ||
    (product.name || '').toLowerCase().includes('dua') ||
    (product.name || '').toLowerCase().includes('allah');

  const thirdRoomLabel = isIslamic ? 'নামাজের ঘর' : 'রিডিং রুম';
  const roomImages = product.room_images || {};

  // Standard Room Gallery Items (Golden Editions)
  const galleryItems = [
    {
      id: 'drawing_room',
      url: roomImages.drawing_room || product.image_url,
      label: 'ড্রয়িং রুম'
    },
    {
      id: 'office_room',
      url: roomImages.office_room || product.placements?.find(p => p.room_type === 'Office')?.image_url || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      label: 'অফিস রুম'
    },
    {
      id: 'prayer_or_reading_room',
      url: roomImages.prayer_or_reading_room || product.placements?.find(p => p.room_type === 'Hallway' || p.room_type === 'Formations')?.image_url || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
      label: thirdRoomLabel
    },
    {
      id: 'bedroom',
      url: roomImages.bedroom || product.placements?.find(p => p.room_type === 'Bedroom')?.image_url || 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
      label: 'বেডরুম'
    }
  ];

  // Standard golden sizes (Medium & Large)
  const standardSizes: ProductSize[] = product.sizes && product.sizes.length >= 2 ? product.sizes : [
    { id: 's1', name: 'Medium (75cm × 40cm)', price: product.price, old_price: product.old_price, weight_grams: product.weight_grams || 1400, size_dimensions: product.size_dimensions || '75cm × 40cm' },
    { id: 's2', name: 'Large (120cm × 60cm)', price: Math.round(product.price * 1.36), old_price: product.old_price ? Math.round(product.old_price * 1.36) : undefined, weight_grams: Math.round((product.weight_grams || 1400) * 1.57), size_dimensions: '120cm × 60cm' }
  ];

  const [selectedSizeIdx, setSelectedSizeIdx] = useState<number>(0);
  const activeSize = standardSizes[selectedSizeIdx] || standardSizes[0];

  const currentPrice = activeSize.price;
  const currentWeight = activeSize.weight_grams;
  const currentDimensions = activeSize.size_dimensions;

  const currentThickness = product.thickness || '0.6/0.8 mm (গোল্ডেন স্টেইনলেস স্টিল)';
  const currentMaterial = product.material || 'সার্জিক্যাল স্টেইনলেস স্টিল (0.6/0.8 mm থিকনেস)';
  const currentBanglaDesc = product.bangla_short_desc || 'উচ্চমানের উপকরণে নির্মিত এই অনন্য গোল্ডেন ওয়াল আর্টটি আপনার ড্রয়িং রুম, লিভিং রুম বা বেডরুমে দেবে আভিজাত্যময় সৌন্দর্য। দেওয়ালে লাগানোর জন্য শক্তিশালী ডাবল সাইড টেপ দেওয়া আছে।';
  const currentDescription = product.description;

  const currentQualities = product.qualities || [
    'দেওয়ালে লাগানোর জন্য শক্তিশালী ডাবল সাইড টেপ রয়েছে - কোনো ড্রিলিং ছাড়াই সহজে ঝুলানো যায়।',
    'প্রিসিশন ফাইবার লেজার কাটিং - প্রতিটি ডিজাইন অত্যন্ত নিখুঁত ও মসৃণ।',
    '৩ডি ফ্লোটিং ভিজ্যুয়াল লুক - দেয়াল থেকে ভেসে থাকে যা দৃষ্টিনন্দন সৌন্দর্য তৈরি করে।',
    'প্রিমিয়াম প্রফেশনাল ফিনিশিং - যেকোনো দেয়ালে নিয়ে আসবে রাজকীয় ও মার্জিত আবহ।',
    'সহজ ও নিরাপদ ইনস্টলেশন - প্যাকেটের সাথে ফ্রি ডাবল সাইডেড টেপ ও মাউন্টিং গাইড।'
  ];

  // Dynamic SEO update for active product page
  useSEO({
    title: product ? `${product.name} - ${product.category_name} Wall Art` : '3D Islamic Wall Decor',
    description: product ? currentBanglaDesc.slice(0, 160) : undefined,
    ogImage: galleryItems[activeImageIdx]?.url || product?.image_url,
    keywords: product ? `${product.name}, ${product.category_name}, Islamic Calligraphy BD, 3D Wall Decor, UNEX AURA` : undefined,
    productData: product ? {
      name: product.name,
      description: currentBanglaDesc,
      price: currentPrice,
      image: galleryItems[activeImageIdx]?.url || product.image_url,
      inStock: product.stock > 0,
      brand: 'UNEX AURA'
    } : undefined
  });

  // Track view_item / ViewContent on product load
  useEffect(() => {
    if (product) {
      trackViewItem({
        id: product.id,
        name: product.name,
        price: currentPrice,
        category_name: product.category_name,
        slug: product.slug
      });
    }
  }, [product?.id, currentPrice]);

  // Auto change product picture every 2 seconds from left to right
  const [isGalleryPaused, setIsGalleryPaused] = useState<boolean>(false);

  useEffect(() => {
    if (!galleryItems || galleryItems.length <= 1 || isGalleryPaused) return;

    const interval = setInterval(() => {
      setActiveImageIdx((prev) => (prev + 1) % galleryItems.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [galleryItems.length, isGalleryPaused, product?.id]);

  // Reset active image to 0 whenever product changes
  useEffect(() => {
    setActiveImageIdx(0);
    setSelectedSizeIdx(0);
  }, [slug, product?.id]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate alternating category product list for Facebook Ads & direct landing visitors
  const otherProducts = products.filter(p => p.id !== product.id);
  const sameCategoryProducts = otherProducts.filter(p => p.category_id === product.category_id);
  const diffCategoryProducts = otherProducts.filter(p => p.category_id !== product.category_id);

  const diverseCarouselProducts: Product[] = [];
  let sameIdx = 0;
  let diffIdx = 0;

  while (sameIdx < sameCategoryProducts.length || diffIdx < diffCategoryProducts.length) {
    if (sameIdx < sameCategoryProducts.length) {
      diverseCarouselProducts.push(sameCategoryProducts[sameIdx]);
      sameIdx++;
    }
    if (diffIdx < diffCategoryProducts.length) {
      diverseCarouselProducts.push(diffCategoryProducts[diffIdx]);
      diffIdx++;
    }
  }

  const handleScroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = dir === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const isAyatul = isAyatulKursiProduct(product);

  // Handle Add To Cart with correct variant info
  const handleAddToCart = (andCheckout: boolean = false) => {
    const itemToAdd: Product = {
      ...product,
      price: currentPrice,
      material: currentMaterial,
      thickness: currentThickness,
      image_url: galleryItems[activeImageIdx]?.url || product.image_url
    };
    addToCart(itemToAdd, quantity, activeSize);
    if (andCheckout) {
      onNavigate('checkout');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <button onClick={() => onNavigate('home')} className="hover:text-[#4f46e5]">Home</button>
        <span>/</span>
        <button onClick={() => onNavigate('shop')} className="hover:text-[#4f46e5]">Shop</button>
        <span>/</span>
        <span className="text-[#0f3d44] font-bold truncate max-w-xs">{product.name}</span>
      </div>

      {/* MAIN PRODUCT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* LEFT GALLERY (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div
            onMouseEnter={() => setIsGalleryPaused(true)}
            onMouseLeave={() => setIsGalleryPaused(false)}
            className="relative aspect-4/3 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-md group select-none"
          >
            <img
              key={activeImageIdx}
              src={galleryItems[activeImageIdx]?.url || product.image_url}
              alt={galleryItems[activeImageIdx]?.label || product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-all duration-700 animate-fadeIn"
            />

            {/* VARIANT BADGE ON TOP OF IMAGE */}
            <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-900/80 text-amber-100 backdrop-blur-md border border-amber-500/40 shadow-md flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>গোল্ডেন স্টেইনলেস স্টিল</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-md border border-white/20 shadow-xs">
                ২ সেকেন্ড পর পর ছবি পরিবর্তন
              </span>
            </div>

            {/* PREV / NEXT ARROWS OVERLAY */}
            {galleryItems.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIdx((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all opacity-80 group-hover:opacity-100 hover:scale-110 cursor-pointer"
                  title="পূর্ববর্তী ছবি"
                  aria-label="Previous Image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIdx((prev) => (prev + 1) % galleryItems.length);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all opacity-80 group-hover:opacity-100 hover:scale-110 cursor-pointer"
                  title="পরবর্তী ছবি"
                  aria-label="Next Image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* BOTTOM DOTS ON MAIN IMAGE */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full">
                  {galleryItems.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`transition-all rounded-full cursor-pointer ${
                        idx === activeImageIdx
                          ? 'w-5 h-1.5 bg-amber-400'
                          : 'w-1.5 h-1.5 bg-white/60 hover:bg-white'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* THUMBNAIL STRIP WITH LABELS */}
          {galleryItems.length > 0 && (
            <div className="flex items-center gap-3 overflow-x-auto py-2 px-1 scrollbar-none">
              {galleryItems.map((item, idx) => {
                const isItemActive = activeImageIdx === idx;

                return (
                  <div key={item.id || idx} className="flex flex-col items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                        isItemActive
                          ? 'border-[#4f46e5] ring-3 ring-indigo-200 shadow-md scale-105'
                          : 'border-slate-200 opacity-75 hover:opacity-100 hover:scale-102'
                      }`}
                    >
                      <img src={item.url} alt={item.label} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </button>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-all whitespace-nowrap ${
                        isItemActive
                          ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white border-transparent shadow-2xs'
                          : 'bg-slate-100 text-slate-700 border-slate-200/80'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT INFO PANEL (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100">
                {product.category_name || 'Wall Decor'}
              </span>

              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>গোল্ডেন স্টেইনলেস স্টিল ({currentThickness})</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#0f3d44] leading-snug">
              {product.name}
            </h1>

            {/* RATING */}
            <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
              <div className="flex items-center text-amber-400 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="ml-1.5 font-bold text-slate-800">{product.rating || 4.9}</span>
              </div>
              <span>•</span>
              {activeSize.is_stock_out || (activeSize.stock !== undefined && activeSize.stock <= 0) || product.stock <= 0 ? (
                <span className="text-red-600 font-extrabold bg-red-50 px-2.5 py-1 rounded-md border border-red-200 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                  <span>এই সাইজটি স্টক আউট (Out of Stock)</span>
                </span>
              ) : (
                <span className="text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                  In Stock ({activeSize.stock !== undefined ? activeSize.stock : product.stock} টি স্টক এভেলেবল)
                </span>
              )}
            </div>
          </div>

          {/* DYNAMIC PRICING */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-[#0f3d44]">
                {formatPrice(currentPrice)}
              </span>
              {activeSize.old_price && (
                <span className="text-sm text-slate-400 line-through ml-2">
                  {formatPrice(activeSize.old_price)}
                </span>
              )}
            </div>

            {activeSize.old_price && (
              <span className="text-xs text-teal-800 font-bold bg-teal-100/80 px-2.5 py-1 rounded-full">
                Save {formatPrice(activeSize.old_price - currentPrice)}
              </span>
            )}

            {isAyatul && (
              <span className="text-xs text-emerald-800 font-extrabold bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1 shadow-xs">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                <span>ফ্রি হোম ডেলিভারি</span>
              </span>
            )}
          </div>

          {/* QUANTITY & FAST ORDER ACTIONS */}
          <div className="space-y-3 pt-1">
            {product.stock <= 0 ? (
              <div className="w-full p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-2 shadow-xs">
                <div className="text-sm font-black text-rose-900 flex items-center justify-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                  <span>এই ডিজাইনটি বর্তমানে স্টক আউট রয়েছে</span>
                </div>
                <p className="text-xs text-slate-600">
                  কাস্টম তৈরি করতে সরাসরি আমাদের WhatsApp-এ মেসেজ দিন।
                </p>
                <a
                  href={`https://wa.me/88${settings.whatsapp_number || '01623319639'}?text=${encodeURIComponent(
                    `আসসালামু আলাইকুম, আমি "${product.name}" ডিজাইনটি প্রি-অর্ডার করতে চাচ্ছি।`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp-এ মেসেজ দিয়ে অর্ডার করুন</span>
                </a>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-2xs">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3.5 py-2.5 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 text-sm font-black text-[#0f3d44]">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3.5 py-2.5 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Primary 1-Click Fast Order Button */}
                  <button
                    onClick={() => handleAddToCart(true)}
                    className="flex-1 py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:opacity-95 shadow-lg shadow-teal-600/25 transition-all cursor-pointer select-none flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>এখনই অর্ডার করুন (Cash on Delivery)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-center shrink-0 cursor-pointer select-none icon-btn ${
                      isWishlisted
                        ? 'bg-pink-50 border-pink-300 text-pink-600'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                    title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-pink-500 text-pink-500' : ''}`} />
                  </button>
                </div>

                {/* Secondary Cart Button (Triggers Right Slide-Over Cart Drawer) */}
                <button
                  onClick={() => handleAddToCart(false)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
                >
                  <ShoppingBag className="w-4 h-4 text-teal-600" />
                  <span>কার্টে যোগ করুন • {formatPrice(currentPrice * quantity)}</span>
                </button>
              </>
            )}
          </div>

          {/* SINGLE CLEAN CONSOLIDATED PRODUCT DESCRIPTION SECTION */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#0f3d44] font-black text-sm">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>পণ্যের বিবরণ (Product Description)</span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {currentMaterial}
              </span>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              {/* Product Detailed Bengali Overview */}
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                {currentBanglaDesc}
              </p>

              {/* Key Features / Qualities */}
              {currentQualities.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>বিশেষ বৈশিষ্ট্যসমূহ:</span>
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    {currentQualities.map((q, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                        <span className="text-teal-600 font-bold shrink-0">✦</span>
                        <span className="leading-tight">{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Product Specifications Table */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 mb-2">স্পেসিফিকেশন:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-400 block font-medium">সাইজ (Size)</span>
                    <span className="font-bold text-[#0f3d44]">{currentDimensions}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-400 block font-medium">পুরুত্ব (Thickness)</span>
                    <span className="font-bold text-amber-700">{currentThickness}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
                    <span className="text-[11px] text-slate-400 block font-medium">ইনস্টলেশন</span>
                    <span className="font-bold text-emerald-700">ডাবল সাইড টেপযুক্ত</span>
                  </div>
                </div>
              </div>

              {/* Delivery & Assurance note */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                <Truck className="w-4 h-4 text-teal-600 shrink-0" />
                <span>
                  {isAyatul
                    ? '🎉 আয়াতুল কুরসিতে পাচ্ছেন সারা দেশে ১০০% ফ্রি হোম ডেলিভারি!'
                    : '📦 সারা দেশে হোম ডেলিভারি (কুরিয়ার চার্জ ওজন অনুযায়ী চেকআউটে যুক্ত হবে)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FACEBOOK ADS & DIRECT TRAFFIC DIVERSE PRODUCT CAROUSEL */}
      {diverseCarouselProducts.length > 0 && (
        <div className="pt-10 border-t border-slate-200 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Featured Collection</span>
              </div>
              <h2 className="text-2xl font-black text-[#0f3d44]">More Exclusive Wall Decor Designs</h2>
              <p className="text-xs text-slate-500 mt-1">Discover handcrafted Islamic and modern geometric accents</p>
            </div>

            {/* NAVIGATION BUTTONS */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleScroll('left')}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs cursor-pointer"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs cursor-pointer"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* HORIZONTAL CAROUSEL */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {diverseCarouselProducts.map((prod) => (
              <div
                key={prod.id}
                className="w-[280px] sm:w-[300px] shrink-0 snap-start"
              >
                <ProductCard
                  product={prod}
                  onSelectProduct={(p) => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    onNavigate('product', { slug: p.slug });
                  }}
                  onOpenWallModal={onOpenWallModal}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
