import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { Product, ProductSize } from '../types';
import { calculateDeliveryFee } from '../utils/delivery';
import { useSEO } from '../hooks/useSEO';
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
  Compass
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

  // Size selection (2 sizes per product: Medium index 0 default, Large index 1)
  const productSizes: ProductSize[] = product.sizes && product.sizes.length >= 2 ? product.sizes : [
    { id: 's1', name: 'Medium (2.5 Feet / 75x40cm)', price: product.price, old_price: product.old_price, weight_grams: product.weight_grams, size_dimensions: product.size_dimensions || '75cm × 40cm' },
    { id: 's2', name: 'Large (4 Feet / 120x60cm)', price: Math.round(product.price * 1.4), old_price: product.old_price ? Math.round(product.old_price * 1.4) : undefined, weight_grams: Math.round(product.weight_grams * 1.4), size_dimensions: '120cm × 60cm' }
  ];
  const [selectedSizeIdx, setSelectedSizeIdx] = useState<number>(0);
  const activeSize = productSizes[selectedSizeIdx] || productSizes[0];

  const currentPrice = activeSize.price;
  const currentWeight = activeSize.weight_grams;
  const currentDimensions = activeSize.size_dimensions;

  // Dynamic SEO update for active product page
  useSEO({
    title: product ? `${product.name} - ${product.category_name} Wall Art` : '3D Islamic Wall Decor',
    description: product ? (product.bangla_short_desc || product.description || `Buy ${product.name} 3D Islamic Wall Decor at UNEX AURA`).slice(0, 160) : undefined,
    ogImage: product?.image_url,
    keywords: product ? `${product.name}, ${product.category_name}, Islamic Calligraphy BD, 3D Wall Decor, UNEX AURA` : undefined,
    productData: product ? {
      name: product.name,
      description: product.bangla_short_desc || product.description,
      price: currentPrice,
      image: product.image_url,
      inStock: product.stock > 0,
      brand: 'UNEX AURA'
    } : undefined
  });

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
    ...(product.placements?.map((p, idx) => ({
      url: p.image_url,
      label: p.room_type ? getRoomLabelBangla(p.room_type, idx + 1) : `রুম ${idx + 1}`
    })) || [])
  ];

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

  // Delivery fee estimation recalculated based on size weight & price
  const calcDelivery = calculateDeliveryFee(
    currentWeight * quantity,
    deliveryZone,
    currentPrice * quantity,
    settings.free_shipping_threshold_dhaka
  );
  const estDeliveryFee = calcDelivery.baseCharge;

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
          <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-md group">
            <img
              src={galleryItems[activeImageIdx]?.url || product.image_url}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* THUMBNAIL STRIP WITH LABELS */}
          {galleryItems.length > 0 && (
            <div className="flex items-center gap-3.5 overflow-x-auto py-2 px-1">
              {galleryItems.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImageIdx === idx ? 'border-[#4f46e5] ring-2 ring-indigo-200 shadow-md scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={item.url} alt={item.label} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                    activeImageIdx === idx
                      ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white border-transparent shadow-2xs'
                      : 'bg-slate-100 text-slate-700 border-slate-200/80'
                  }`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT INFO PANEL (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100">
              {product.category_name || 'Wall Decor'}
            </span>

            <h1 className="text-2xl sm:text-3xl font-black text-[#0f3d44] leading-snug">
              {product.name}
            </h1>

            {/* RATING ONLY - NO REVIEWS TEXT */}
            <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
              <div className="flex items-center text-amber-400 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="ml-1.5 font-bold text-slate-800">{product.rating || 4.9}</span>
              </div>
              <span>•</span>
              {product.stock > 0 ? (
                <span className="text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="text-red-600 font-extrabold bg-red-50 px-2.5 py-1 rounded-md border border-red-200 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                  <span>Out of Stock (স্টক শেষ)</span>
                </span>
              )}
            </div>
          </div>

          {/* DYNAMIC PRICING BASED ON SIZE */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-[#0f3d44]">
                {formatPrice(currentPrice)}
              </span>
              {product.old_price && (
                <span className="text-sm text-slate-400 line-through ml-2">
                  {formatPrice(Math.round(currentPrice * 1.25))}
                </span>
              )}
            </div>

            <span className="text-xs text-teal-800 font-bold bg-teal-100/80 px-2.5 py-1 rounded-full">
              Save {formatPrice(Math.round(currentPrice * 0.25))}
            </span>
          </div>

          {/* SIZE SELECTION OPTIONS (2 SIZES PER PRODUCT) */}
          <div className="space-y-2 bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-100">
            <label className="text-xs font-extrabold text-[#0f3d44] flex items-center justify-between">
              <span>সাইজ সিলেক্ট করুন (Select Size Option):</span>
              <span className="text-indigo-600 font-bold text-[11px]">{activeSize.name}</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {productSizes.map((sz, idx) => (
                <button
                  key={sz.id}
                  type="button"
                  onClick={() => setSelectedSizeIdx(idx)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedSizeIdx === idx
                      ? 'bg-white border-[#4f46e5] ring-2 ring-indigo-200 shadow-sm'
                      : 'bg-white/60 border-slate-200 hover:bg-white text-slate-700'
                  }`}
                >
                  <div className="font-extrabold text-xs text-[#0f3d44]">{sz.name}</div>
                  <div className="flex items-center justify-between text-[11px] mt-1">
                    <span className="font-bold text-indigo-600">{formatPrice(sz.price)}</span>
                    <span className="text-slate-400 font-medium">{sz.weight_grams}g</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* QUANTITY & ADD TO CART / BUY NOW ORDER ACTIONS (RIGHT BELOW SIZE SELECTION) */}
          <div className="space-y-3 pt-1">
            {product.stock <= 0 ? (
              <div className="w-full p-4 rounded-2xl bg-red-50 border border-red-200 text-center space-y-1">
                <div className="text-sm font-black text-red-700 flex items-center justify-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                  <span>প্রোডাক্টটি বর্তমানে স্টক আউট (Out of Stock)</span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  এই মুহূর্তে অর্ডার করা সম্ভব নয়। অ্যাডমিন প্যানেল থেকে পুনরায় রিস্টক করা হলে সরাসরি অর্ডার করা যাবে।
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3.5 py-2.5 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 text-sm font-bold text-[#0f3d44]">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3.5 py-2.5 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => addToCart(product, quantity, activeSize)}
                    className="flex-1 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] via-[#9333ea] to-[#ec4899] hover:opacity-95 shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add To Cart • {formatPrice(currentPrice * quantity)}</span>
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

                <button
                  onClick={() => {
                    addToCart(product, quantity, activeSize);
                    onNavigate('checkout');
                  }}
                  className="w-full py-3 rounded-xl text-xs sm:text-sm font-extrabold text-slate-900 bg-amber-400 hover:bg-amber-300 shadow-md transition-all cursor-pointer select-none flex items-center justify-center gap-2"
                >
                  <span>অর্ডার করুন (Express Checkout)</span>
                </button>
              </>
            )}
          </div>

          {/* WEIGHT DELIVERY ESTIMATOR PREVIEW */}
          <div className="p-3.5 bg-gradient-to-r from-teal-50/80 to-indigo-50/80 rounded-2xl border border-teal-200 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-[#0f3d44]">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-teal-600" />
                <span>Delivery Charge Estimate</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryZone('dhaka')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${deliveryZone === 'dhaka' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600'}`}
                >
                  Dhaka
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryZone('outside_dhaka')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${deliveryZone === 'outside_dhaka' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600'}`}
                >
                  Outside
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-slate-700">
              <span>Estimated shipping fee ({deliveryZone === 'none' ? 'Select Zone Above' : deliveryZone === 'dhaka' ? 'Dhaka' : 'Outside Dhaka'}):</span>
              <span className="font-extrabold text-[#0f3d44]">
                {deliveryZone === 'none' ? '—' : estDeliveryFee === 0 ? 'FREE' : formatPrice(estDeliveryFee)}
              </span>
            </div>
          </div>

          {/* BANGLA SHORT DESCRIPTION & QUALITIES BOX (NOW BELOW ORDER OPTIONS) */}
          <div className="p-4 bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-teal-50/60 rounded-2xl border border-indigo-100 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-sm border-b border-indigo-100/80 pb-2">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
              <span>পণ্যের বিবরণ ও সংক্ষেপ (Product Short Overview)</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              {product.bangla_short_desc || 'উচ্চমানের উপকরণে নির্মিত এই অনন্য ওয়াল আর্টটি আপনার ড্রয়িং রুম, লিভিং রুম বা বেডরুমে দেবে আভিজাত্যময় সৌন্দর্য। দেওয়ালে লাগানোর জন্য শক্তিশালী ডাবল সাইড টেপ দেওয়া আছে।'}
            </p>

            {/* PRODUCT QUALITIES BULLETS */}
            <div className="pt-2 space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#0f3d44] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>পণ্যের বিশেষ গুণাবলী ও বৈশিষ্ট্যসমূহ:</span>
              </h4>

              <ul className="space-y-1.5 text-xs text-slate-700">
                {(product.qualities || [
                  'দেওয়ালে লাগানোর জন্য শক্তিশালী ডাবল সাইড টেপ রয়েছে - কোনো ড্রিলিং ছাড়াই সহজে ঝুলানো যায়।',
                  'প্রিসিশন ফাইবার লেজার কাটিং - প্রতিটি ডিজাইন অত্যন্ত নিখুঁত ও মসৃণ।',
                  '৩ডি ফ্লোটিং ভিজ্যুয়াল লুক - দেয়াল থেকে ভেসে থাকে যা দৃষ্টিনন্দন সৌন্দর্য তৈরি করে।',
                  'প্রিমিয়াম প্রফেশনাল ফিনিশিং - যেকোনো দেয়ালে নিয়ে আসবে রাজকীয় ও মার্জিত আবহ।',
                  'সহজ ও নিরাপদ ইনস্টলেশন - প্যাকেটের সাথে ফ্রি ডাবল সাইডেড টেপ ও মাউন্টিং গাইড।'
                ]).map((q, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white/80 p-2 rounded-xl border border-slate-200/60">
                    <span className="text-teal-600 font-bold shrink-0">✦</span>
                    <span className="leading-snug">{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* PRODUCT KEY SPECS */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
              <span className="text-slate-400 font-medium block">Selected Dimensions</span>
              <span className="font-bold text-[#0f3d44]">{currentDimensions}</span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
              <span className="text-slate-400 font-medium block">Weight</span>
              <span className="font-bold text-[#0f3d44]">{currentWeight} grams ({ (currentWeight/1000).toFixed(2) } kg)</span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1 col-span-2">
              <span className="text-slate-400 font-medium block">Material &amp; Finish</span>
              <span className="font-bold text-[#0f3d44]">{product.material}</span>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="pt-4 border-t border-slate-200 text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2">
            <h4 className="font-bold text-[#0f3d44]">Craftsmanship &amp; Material Notes:</h4>
            <p>{product.description}</p>
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
                <span>ম্যাচিং ও ভ্যারাইটি কালেকশন (Explore Diverse Wall Decor)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0f3d44] flex items-center gap-2">
                <span>আপনার ঘরের ওয়ালের জন্য অন্যান্য সেরা ডিজাইনসমূহ</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                ইসলামিক ক্যালিগ্রাফি এবং ন্যাচারাল ও মডার্ন থ্রিডি ওয়ালের ডিজাইন অল্টারনেট করে দেখতে ডানে/বামে স্লাইড করুন:
              </p>
            </div>

            {/* CAROUSEL NAVIGATION BUTTONS */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                className="p-2.5 rounded-full bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-indigo-600 shadow-xs transition-all cursor-pointer"
                title="Scroll Left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll('right')}
                className="p-2.5 rounded-full bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-indigo-600 shadow-xs transition-all cursor-pointer"
                title="Scroll Right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* HORIZONTAL SCROLL CAROUSEL */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{ scrollBehavior: 'smooth' }}
          >
            {diverseCarouselProducts.map((p) => {
              const isSameCat = p.category_id === product.category_id;
              return (
                <div
                  key={p.id}
                  className="w-[230px] sm:w-[260px] shrink-0 snap-start bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group relative"
                >
                  {/* Category Alternating Tag */}
                  <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
                    <span className={`text-[9px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-md shadow-xs text-white ${
                      isSameCat ? 'bg-teal-700' : 'bg-purple-700'
                    }`}>
                      {isSameCat ? 'ইসলামিক ডিজাইন' : 'ন্যাচারাল / মডার্ন আর্ট'}
                    </span>
                    {p.stock <= 0 && (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-md text-white bg-red-600">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Product Image */}
                  <div
                    onClick={() => onNavigate('product', { slug: p.slug })}
                    className="relative aspect-4/3 overflow-hidden bg-slate-100 cursor-pointer"
                  >
                    <img
                      src={p.image_url}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Quick Wall View Overlay */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenWallModal(p);
                      }}
                      className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-slate-800 text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-xs border border-slate-200 flex items-center gap-1 backdrop-blur-xs transition-all cursor-pointer"
                    >
                      <Eye className="w-3 h-3 text-indigo-600" />
                      <span>ওয়াল ভিউ</span>
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[10px] font-extrabold text-teal-800 uppercase tracking-wider block">
                        {p.category_name || 'Wall Decor'}
                      </span>
                      <h3
                        onClick={() => onNavigate('product', { slug: p.slug })}
                        className="font-black text-xs text-[#0f3d44] group-hover:text-indigo-600 transition-colors line-clamp-1 cursor-pointer mt-0.5"
                      >
                        {p.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-medium">
                        {p.bangla_short_desc || p.size_dimensions || '3D Laser Cut Stainless Steel'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-xs text-[#0f3d44]">
                          {formatPrice(p.price)}
                        </span>
                        {p.old_price && (
                          <span className="text-[10px] text-slate-400 line-through ml-1.5">
                            {formatPrice(p.old_price)}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => onNavigate('product', { slug: p.slug })}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-extrabold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>ডিজাইন দেখুন</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
