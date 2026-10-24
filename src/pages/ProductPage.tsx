import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { Product, ProductSize } from '../types';
import { calculateDeliveryFee } from '../utils/delivery';
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
  MessageCircle,
  Zap,
  ShoppingCart
} from 'lucide-react';

interface ProductPageProps {
  slug: string;
  onNavigate: (page: string, params?: any) => void;
  onOpenWallModal: (p: Product) => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({ slug, onNavigate, onOpenWallModal }) => {
  const { products, addToCart, formatPrice, deliveryZone, setDeliveryZone, settings, toggleWishlist, isInWishlist, openCartDrawer } = useApp();
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
    }, 5500); // 5.5 seconds relaxed duration

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


  // Handle Add To Cart with correct variant info
  const handleAddToCart = (andCheckout: boolean = false) => {
    const itemToAdd: Product = {
      ...product,
      price: currentPrice,
      material: currentMaterial,
      thickness: currentThickness,
      image_url: galleryItems[activeImageIdx]?.url || product.image_url
    };
    addToCart(itemToAdd, quantity, activeSize, !andCheckout);
    if (andCheckout) {
      onNavigate('checkout');
    } else {
      openCartDrawer();
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
          {/* CLEAN TITLE */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0f3d44] leading-snug">
              {product.name}
            </h1>
          </div>

          {/* CLEAN PRICING (NO DISCOUNT FOR AYATUL KURSI) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#0f3d44]">
                {formatPrice(currentPrice)}
              </span>
              {activeSize.old_price && activeSize.old_price > currentPrice && (
                <span className="text-sm text-slate-400 line-through">
                  {formatPrice(activeSize.old_price)}
                </span>
              )}
            </div>

            {activeSize.old_price && activeSize.old_price > currentPrice && (
              <span className="text-xs text-teal-800 font-bold bg-teal-100/80 px-2.5 py-1 rounded-full">
                Save {formatPrice(activeSize.old_price - currentPrice)}
              </span>
            )}
          </div>

          {/* QUANTITY & ACTIONS */}
          <div className="space-y-3 pt-1">
            {product.stock <= 0 ? (
              <div className="w-full p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-2 shadow-xs">
                <div className="text-sm font-black text-rose-900 flex items-center justify-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                  <span>এই ডিজাইনটি বর্তমানে স্টক আউট রয়েছে</span>
                </div>
              </div>
            ) : (
              <>
                {/* QUANTITY & WISHLIST ROW */}
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700">পরিমাণ:</span>
                    <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer transition-colors"
                      >
                        -
                      </button>
                      <span className="px-4 py-1.5 text-sm font-black text-[#0f3d44]">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer select-none ${
                      isWishlisted
                        ? 'bg-pink-50 border-pink-300 text-pink-600'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                    title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-pink-500 text-pink-500' : ''}`} />
                    <span>{isWishlisted ? 'সংরক্ষিত' : 'উইশলিস্ট'}</span>
                  </button>
                </div>

                {/* DUAL PROPORTIONAL HIGH-CONVERTING BUTTONS */}
                <div className="space-y-2.5">
                  {/* Primary Order Now Button (Yellow Amazon-style) */}
                  <button
                    type="button"
                    onClick={() => handleAddToCart(true)}
                    className="w-full py-3.5 px-4 rounded-xl text-sm font-black text-slate-950 bg-[#f59e0b] hover:bg-[#d97706] shadow-md shadow-amber-500/20 transition-all cursor-pointer select-none flex items-center justify-center gap-2 active:scale-98"
                  >
                    <Zap className="w-4 h-4 fill-slate-950 text-slate-950 shrink-0" />
                    <span>Order Now (ক্যাশ অন ডেলিভারি)</span>
                  </button>

                  {/* Secondary Add to Cart Button (Dark Navy) */}
                  <button
                    type="button"
                    onClick={() => handleAddToCart(false)}
                    className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer select-none active:scale-98"
                  >
                    <ShoppingCart className="w-4 h-4 text-white shrink-0" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* SINGLE CLEAN CONSOLIDATED PRODUCT DESCRIPTION SECTION */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#0f3d44] font-black text-sm">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>পণ্যের বিবরণ (Product Description)</span>
              </div>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              {/* Product Detailed Overview */}
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                {currentBanglaDesc}
              </p>

              {/* Integrated Specifications & Features */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold shrink-0 mt-0.5">✦</span>
                    <span><strong>উপাদান ও স্থায়িত্ব:</strong> {currentMaterial} — মরিচারোধী এবং আজীবন উজ্জ্বলতা বজায় রাখে।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold shrink-0 mt-0.5">✦</span>
                    <span><strong>সাইজ ও থিকনেস:</strong> {currentDimensions} ({currentThickness})।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold shrink-0 mt-0.5">✦</span>
                    <span><strong>ইনস্টলেশন:</strong> দেয়ালে ড্রিল করার প্রয়োজন নেই, প্যাকেটের সাথেই শক্তিশালী ডাবল সাইড টেপ দেওয়া আছে।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold shrink-0 mt-0.5">✦</span>
                    <span><strong>৩ডি ফ্লোটিং লুক:</strong> দেয়াল থেকে কিছুটা ভেসে থাকে, যা দৃষ্টিনন্দন মডার্ন আভিজাত্য তৈরি করে।</span>
                  </li>
                </ul>
              </div>

              {/* Delivery Note */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                <Truck className="w-4 h-4 text-teal-600 shrink-0" />
                <span>📦 সারা দেশে দ্রুত হোম ডেলিভারি সুবিধা (পণ্য হাতে পেয়ে চেক করে টাকা দিন)।</span>
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
                  onQuickOrder={() => {
                    onNavigate('checkout');
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
