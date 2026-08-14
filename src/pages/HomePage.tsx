import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';
import { useSEO } from '../hooks/useSEO';
import { INITIAL_TESTIMONIALS } from '../data/mockData';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  Maximize,
  Headphones,
  CreditCard,
  Eye,
  ArrowRight,
  Clock,
  Star,
  CheckCircle2,
  Flame,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Video,
  Edit3,
  ShoppingBag
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenWallModal: (p: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenWallModal }) => {
  const { products, categories, formatPrice, addToCart, settings } = useApp();

  useSEO({
    title: 'UNEX AURA | Luxury 3D Islamic Wall Decor & Calligraphy',
    description: 'UNEX AURA - বাংলাদেশের সেরা লাক্সারি থ্রিডি ইসলামিক ওয়াল আর্ট ও ক্যালিগ্রাফি কালেকশন। দেওয়ালে লাগানোর জন্য ডাবল সাইড টেপযুক্ত আধুনিক ইসলামিক ডেকোর।',
    keywords: 'UNEX AURA, Islamic Wall Art, 3D Wall Art Bangladesh, Ayatul Kursi, Islamic Home Decor, Calligraphy BD'
  });

  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 59, seconds: 34 });

  // Viral Video State
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);

  const rawVideoSrc = settings.promo_video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
  const isEmbed = rawVideoSrc.includes('youtube.com') || rawVideoSrc.includes('youtu.be') || rawVideoSrc.includes('vimeo.com') || rawVideoSrc.includes('/embed/');

  const handleVideoError = () => {
    console.warn('Primary video failed to load, switching to fallback media.');
    setVideoError(true);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Auto-play when video is visible in screen viewport, pause when scrolled down or navigating away
  useEffect(() => {
    if (isEmbed || videoError) return;

    const container = videoContainerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().then(() => {
              setIsPlaying(true);
            }).catch(() => {
              setIsPlaying(false);
            });
          } else {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      if (video) {
        try {
          video.pause();
        } catch {}
      }
    };
  }, [rawVideoSrc, isEmbed, videoError]);

  // Midnight countdown timer (12:01 AM start, 12:00 AM Midnight end)
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const nextMidnight = new Date();
      nextMidnight.setHours(24, 0, 0, 0); // Next 12:00 AM Midnight

      const diffInSeconds = Math.max(0, Math.floor((nextMidnight.getTime() - now.getTime()) / 1000));
      const hours = Math.floor(diffInSeconds / 3600);
      const minutes = Math.floor((diffInSeconds % 3600) / 60);
      const seconds = diffInSeconds % 60;

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(timer);
  }, []);

  const featuredProducts = products.filter(p => p.featured).slice(0, 6);
  const newArrivals = products.slice().reverse().slice(0, 4);
  const dealProduct = (settings.best_deal_product_id ? products.find(p => p.id === settings.best_deal_product_id) : null) || products[0];

  return (
    <div className="space-y-8 sm:space-y-12 pb-12">
      {/* 1. HERO SECTION WITH ENHANCED LARGE 16:9 VIDEO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#fdfdfe] via-indigo-50/40 to-purple-50/30 pt-3 sm:pt-6 pb-6 sm:pb-8 px-2 sm:px-4 lg:px-8 border-b border-slate-200/50">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 text-center">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0f3d44] tracking-tight leading-[1.15] px-2">
            Turn Your Walls Into <br />
            <span className="bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] via-[#9333ea] to-[#ec4899] bg-clip-text text-transparent">
              Timeless Masterpieces
            </span>
          </h1>

          {/* EYE-CATCHING WIDE 16:9 ASPECT RATIO VIDEO CONTAINER */}
          <div ref={videoContainerRef} className="relative w-full mx-auto max-w-6xl">
            {/* AMBIENT GLOW BACKDROP */}
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 via-indigo-600 to-pink-500 rounded-3xl sm:rounded-[36px] opacity-30 blur-lg group-hover:opacity-50 transition duration-1000"></div>

            {/* VIDEO FRAME WITH GRADIENT BORDER */}
            <div className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 sm:border-4 border-white bg-slate-950 group">
              {isEmbed ? (
                <iframe
                  src={rawVideoSrc.includes('?') ? rawVideoSrc : `${rawVideoSrc}?autoplay=1&mute=1&loop=1`}
                  title="3D Laser Showcase"
                  className="w-full h-full object-cover border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : videoError ? (
                <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-[#0f3d44] to-slate-950 flex flex-col items-center justify-center p-6 text-center">
                  <img
                    src="/images/cat_islamic_combo_v2.jpg"
                    alt="UNEX AURA Showcase"
                    className="absolute inset-0 w-full h-full object-cover opacity-40 blur-xs"
                  />
                  <div className="relative z-10 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center mx-auto shadow-xl">
                      <Play className="w-8 h-8 text-white fill-current ml-1" />
                    </div>
                    <h3 className="text-lg sm:text-2xl font-black text-white tracking-wide">UNEX AURA 3D Laser Precision Wall Art</h3>
                    <p className="text-xs sm:text-sm text-teal-200 font-semibold max-w-md mx-auto">
                      Luxury surgical stainless steel wall art crafted for modern homes across Bangladesh
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    poster="/images/cat_islamic_combo_v2.jpg"
                    onError={handleVideoError}
                    className="w-full h-full object-cover"
                  >
                    <source src={rawVideoSrc} type="video/mp4" />
                    <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4" />
                  </video>

                  {/* EYE-CATCHING TOP BADGE */}
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2 bg-slate-950/75 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/20 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[10px] sm:text-xs font-bold text-white tracking-wider uppercase">
                      3D Laser Showcase
                    </span>
                  </div>

                  {/* MINIMAL CONTROLS (PLAY/PAUSE & MUTE) */}
                  <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex items-center gap-1.5 sm:gap-2 bg-slate-900/80 backdrop-blur-md px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full border border-white/20 shadow-lg">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="p-1 text-white hover:text-teal-300 transition-colors cursor-pointer"
                      title={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />}
                    </button>

                    <div className="w-px h-3.5 bg-white/20"></div>

                    <button
                      type="button"
                      onClick={toggleMute}
                      className="p-1 text-white hover:text-teal-300 transition-colors cursor-pointer"
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORY GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f3d44]">
              Explore Design Categories
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Curated laser-cut wall art tailored for every living space
            </p>
          </div>

          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-bold text-[#4f46e5] hover:text-[#9333ea] flex items-center gap-1 cursor-pointer"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate('shop', { cat: cat.id })}
              className="group bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10 transition-all cursor-pointer flex flex-col items-center text-center space-y-2.5"
            >
              <div className="w-full aspect-square rounded-xl bg-slate-50 border border-slate-100 p-2 overflow-hidden flex items-center justify-center group-hover:scale-[1.03] transition-transform">
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLElement).parentElement;
                      if (parent && !parent.querySelector('.fallback-icon')) {
                        const span = document.createElement('span');
                        span.className = 'fallback-icon text-3xl';
                        span.textContent = cat.icon || '🕌';
                        parent.appendChild(span);
                      }
                    }}
                    className="w-full h-full object-contain drop-shadow-sm rounded-lg"
                  />
                ) : (
                  <span className="text-3xl">{cat.icon}</span>
                )}
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-[#0f3d44] group-hover:text-[#4f46e5] line-clamp-1">
                {cat.name}
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                {products.filter(p => p.category_id === cat.id).length || cat.item_count || 1} Designs
              </span>
            </div>
          ))}

          <div className="bg-slate-50/60 p-4 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-center space-y-2 text-slate-400 min-h-[140px]">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl">
              ✨
            </div>
            <h3 className="font-bold text-xs text-slate-500">More Coming Soon</h3>
            <span className="text-[10px] text-slate-400">Admin auto-synced</span>
          </div>
        </div>
      </section>

      {/* 4. DEAL OF THE DAY (FULL PROPORTIONAL SPOTLIGHT SHOWCASE) */}
      {dealProduct && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 via-[#0f3d44] to-slate-950 rounded-2xl sm:rounded-3xl border border-teal-500/30 text-white shadow-2xl p-4 sm:p-8 relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center relative z-10">
              {/* Product Image Area - Same high quality aspect-4/3 as standard product cards */}
              <div
                onClick={() => onNavigate('product', { slug: dealProduct.slug })}
                className="md:col-span-6 relative w-full aspect-4/3 rounded-2xl overflow-hidden border-2 border-white/20 bg-slate-800 shadow-xl group/deal cursor-pointer"
              >
                <img
                  src={dealProduct.image_url}
                  alt={dealProduct.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = '/images/cat_islamic_combo_v2.jpg';
                  }}
                  className="w-full h-full object-cover group-hover/deal:scale-105 transition-transform duration-500"
                />

                {/* Discount Badge */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                  <span className="text-xs sm:text-sm font-black text-white bg-gradient-to-r from-red-600 to-pink-600 px-3 py-1 rounded-full shadow-lg">
                    SAVE {formatPrice((dealProduct.old_price || 9200) - dealProduct.price)}
                  </span>
                </div>

                {/* Quick view overlay */}
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/deal:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white/90 text-slate-900 font-extrabold text-xs px-4 py-2 rounded-full shadow-lg backdrop-blur-md flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-teal-600" />
                    <span>পণ্য দেখুন (Quick View)</span>
                  </span>
                </div>
              </div>

              {/* Product Details & Deal Info */}
              <div className="md:col-span-6 space-y-3.5 sm:space-y-4 text-left">
                {/* Header Row: Flame Badge + Countdown */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="inline-flex items-center gap-1.5 text-xs font-black text-red-400 bg-red-950/90 px-3 py-1 rounded-full border border-red-800/80">
                    <Flame className="w-4 h-4 fill-red-400 animate-bounce" />
                    <span>DAILY SPECIAL DEAL (আজকের স্পেশাল ডিল)</span>
                  </div>

                  <div className="inline-flex items-center gap-2 bg-slate-800/90 border border-white/15 px-3 py-1 rounded-xl text-xs font-mono font-bold text-teal-300">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-300">Ends In:</span>
                    <span>{String(timeLeft.hours).padStart(2, '0')}h:{String(timeLeft.minutes).padStart(2, '0')}m:{String(timeLeft.seconds).padStart(2, '0')}s</span>
                  </div>
                </div>

                {/* Title */}
                <h3
                  onClick={() => onNavigate('product', { slug: dealProduct.slug })}
                  className="text-lg sm:text-2xl font-black text-white hover:text-teal-300 transition-colors cursor-pointer leading-snug"
                >
                  {dealProduct.name}
                </h3>

                {/* Short Bangla Description */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {dealProduct.bangla_short_desc || dealProduct.description}
                </p>

                {/* Highlights checklist */}
                <div className="grid grid-cols-2 gap-2 text-[11px] sm:text-xs text-slate-300 py-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>সার্জিক্যাল মেটাল কাস্টিং</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>১০০% মরিচারোধক টেকসই</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>সহজে স্থাপনযোগ্য ডাবল সাইড টেপ</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>ঢাকায় ফ্রী ডেলিভারি সুবিধা</span>
                  </div>
                </div>

                {/* Price & Action Buttons */}
                <div className="pt-3 border-t border-white/10 space-y-3">
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl sm:text-3xl font-black text-teal-300">
                      {formatPrice(dealProduct.price)}
                    </span>
                    {dealProduct.old_price && (
                      <span className="text-sm sm:text-base text-slate-400 line-through font-semibold">
                        {formatPrice(dealProduct.old_price)}
                      </span>
                    )}
                    <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/80">
                      Free Dhaka Delivery
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => addToCart(dealProduct, 1)}
                      className="flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-teal-500 via-indigo-600 to-pink-600 hover:opacity-95 shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add To Cart Now</span>
                    </button>
                    <button
                      onClick={() => onNavigate('product', { slug: dealProduct.slug })}
                      className="py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer"
                    >
                      View Specs
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. FEATURED PRODUCTS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100">
              Handpicked Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f3d44] mt-2">
              Featured Wall Designs
            </h2>
          </div>

          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-bold text-[#4f46e5] hover:text-[#9333ea] flex items-center gap-1 cursor-pointer"
          >
            <span>See All Products</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onSelectProduct={(prod) => onNavigate('product', { slug: prod.slug })}
              onOpenWallModal={onOpenWallModal}
            />
          ))}
        </div>
      </section>

      {/* 5. "SEE IT ON YOUR WALL" FEATURE TEASER SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl overflow-hidden relative border border-indigo-900/50 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
              <Eye className="w-4 h-4 text-purple-400" />
              <span>Interactive Wall Preview Gallery</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Not sure how it&apos;ll look on your wall?
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Every UNEX AURA design comes with high-resolution real room placements — Living Room, Bedroom, Entrance Hallway, and Executive Office — plus arrangement formation guides for multi-piece combos.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              {dealProduct && (
                <button
                  onClick={() => onOpenWallModal(dealProduct)}
                  className="px-6 py-3 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-300 via-indigo-300 to-pink-300 hover:opacity-90 shadow-md hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Launch Placement Gallery</span>
                </button>
              )}

              <button
                onClick={() => onNavigate('shop')}
                className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer"
              >
                Browse Designs
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 aspect-4/3 shadow-xl group">
              <img
                src={dealProduct?.placements?.[0]?.image_url || dealProduct?.image_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80'}
                alt="See On Your Wall Mockup"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
                <span className="text-xs text-white font-medium flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                  <span>Real room scale visualization</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
              Fresh Off Laser Workbench
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f3d44] mt-2">
              New Arrivals
            </h2>
          </div>

          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-bold text-[#4f46e5] hover:text-[#9333ea] flex items-center gap-1 cursor-pointer"
          >
            <span>Explore All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onSelectProduct={(prod) => onNavigate('product', { slug: prod.slug })}
              onOpenWallModal={onOpenWallModal}
            />
          ))}
        </div>
      </section>

      {/* FEATURE STRIP: REPOSITIONED IMMEDIATELY ABOVE TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-teal-50/90 via-indigo-50/90 to-purple-50/90 rounded-3xl p-6 sm:p-8 border border-indigo-100/80 shadow-md grid grid-cols-2 md:grid-cols-5 gap-6 items-center">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white text-teal-600 shadow-sm border border-teal-100">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0f3d44]">Free Delivery / ফ্রি ডেলিভারি</h4>
              <p className="text-[11px] text-slate-500">Inside Dhaka (&gt;৳3,000)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white text-indigo-600 shadow-sm border border-indigo-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0f3d44]">Rust-Proof Warranty</h4>
              <p className="text-[11px] text-slate-500">প্রিমিয়াম সার্জিক্যাল স্টিল</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white text-purple-600 shadow-sm border border-purple-100">
              <Maximize className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0f3d44]">Custom Sizing</h4>
              <p className="text-[11px] text-slate-500">যেকোনো সাইজে অর্ডার করুন</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white text-pink-600 shadow-sm border border-pink-100">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0f3d44]">24/7 Support</h4>
              <p className="text-[11px] text-slate-500">কল বা হোয়াটসঅ্যাপ সাপোর্ট</p>
            </div>
          </div>

          <div className="col-span-2 md:col-span-1 flex items-center gap-3 justify-center md:justify-start">
            <div className="p-3 rounded-2xl bg-white text-emerald-600 shadow-sm border border-emerald-100">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0f3d44]">Secure Payment</h4>
              <p className="text-[11px] text-slate-500">ক্যাশ অন ডেলিভারি / বিকাশ</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f3d44]">
            Loved By Homeowners Across Bangladesh
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Real feedback from verified UNEX AURA customers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INITIAL_TESTIMONIALS.map((t) => (
            <div key={t.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center text-amber-400 gap-0.5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;{t.comment}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-teal-500 via-indigo-600 to-pink-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {t.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#0f3d44]">{t.user_name}</h4>
                  <p className="text-[11px] text-slate-400">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. NEWSLETTER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] via-[#9333ea] to-[#ec4899] rounded-3xl p-8 sm:p-12 text-white text-center shadow-xl space-y-6">
          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black">
              Get Exclusive Design Drops First 🎉
            </h2>
            <p className="text-xs sm:text-sm text-white/90">
              Subscribe to unlock early access to limited edition Islamic laser cut pieces and special discount vouchers.
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed to UNEX AURA newsletter!'); }} className="max-w-md mx-auto flex items-center bg-white/20 p-1.5 rounded-full backdrop-blur-md border border-white/30">
            <input
              type="email"
              placeholder="Enter your email address..."
              required
              className="bg-transparent text-xs sm:text-sm text-white placeholder-white/70 px-4 py-2 w-full focus:outline-none"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-white text-[#0f3d44] font-bold text-xs hover:bg-slate-100 shadow-md shrink-0 cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
