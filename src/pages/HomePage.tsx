import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { CategoryCarousel } from '../components/CategoryCarousel';
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
  ShoppingBag,
  Copy,
  Check,
  Zap
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenWallModal: (p: Product) => void;
  onQuickOrder?: (p: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenWallModal, onQuickOrder }) => {
  const { products, categories, formatPrice, addToCart, settings } = useApp();
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const handleCopyCategoryLink = (catId: number, catName: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://unexaura.xyz';
    const link = `${origin}/?page=shop&cat=${catId}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(() => {
        setCopyFeedback(catName);
        setTimeout(() => setCopyFeedback(null), 3000);
      }).catch(() => {
        prompt('Copy category link:', link);
      });
    } else {
      prompt('Copy category link:', link);
    }
  };

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
  const [isMuted, setIsMuted] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const rawVideoSrc = settings.promo_video_url || 'https://player.cloudinary.com/embed/?cloud_name=glq1jvyu&public_id=lv_0_20260818164632';

  // Helper to extract direct mp4 streaming URL if available (faster & instant autoplay)
  const getDirectMediaSrc = (url: string) => {
    if (!url) return '';
    if (url.includes('/video/upload/') || url.endsWith('.mp4') || url.endsWith('.webm')) {
      return url;
    }
    if (url.includes('player.cloudinary.com')) {
      try {
        const u = new URL(url);
        const cloudName = u.searchParams.get('cloud_name') || 'glq1jvyu';
        const publicId = u.searchParams.get('public_id');
        if (publicId) {
          return `https://res.cloudinary.com/${cloudName}/video/upload/${publicId}.mp4`;
        }
      } catch {}
    }
    return '';
  };

  const directVideoSrc = getDirectMediaSrc(rawVideoSrc);
  const isEmbed = !directVideoSrc && (rawVideoSrc.includes('youtube.com') || rawVideoSrc.includes('youtu.be') || rawVideoSrc.includes('vimeo.com') || rawVideoSrc.includes('/embed/'));

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
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  const unmuteAudio = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.play().catch(() => {});
    }
  };

  // Attempt unmuted auto-play on landing + auto-unmute on first user touch/click/scroll anywhere
  useEffect(() => {
    if (isEmbed || videoError) return;

    const video = videoRef.current;
    if (!video) return;

    // Try unmuted playback first
    video.muted = false;
    video.play()
      .then(() => {
        setIsPlaying(true);
        setIsMuted(false);
      })
      .catch(() => {
        // Browser autoplay policy restricted unmuted audio; start muted immediately
        video.muted = true;
        setIsMuted(true);
        video.play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      });

    // Auto-unmute on very first user interaction anywhere on the website
    const handleFirstUserInteraction = () => {
      if (videoRef.current) {
        videoRef.current.muted = false;
        setIsMuted(false);
        videoRef.current.play().catch(() => {});
      }
      cleanupListeners();
    };

    const cleanupListeners = () => {
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('touchstart', handleFirstUserInteraction);
      window.removeEventListener('scroll', handleFirstUserInteraction);
      window.removeEventListener('keydown', handleFirstUserInteraction);
    };

    window.addEventListener('click', handleFirstUserInteraction, { once: true, passive: true });
    window.addEventListener('touchstart', handleFirstUserInteraction, { once: true, passive: true });
    window.addEventListener('scroll', handleFirstUserInteraction, { once: true, passive: true });
    window.addEventListener('keydown', handleFirstUserInteraction, { once: true, passive: true });

    return () => {
      cleanupListeners();
    };
  }, [directVideoSrc, isEmbed, videoError]);

  // Viewport intersection observer for pause/play on scroll
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
            }).catch(() => {});
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
    };
  }, [directVideoSrc, isEmbed, videoError]);

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
                    preload="auto"
                    poster="https://res.cloudinary.com/glq1jvyu/image/upload/v1786771553/tajbih_drawingrm.jpg.jpg"
                    onError={handleVideoError}
                    onClick={isMuted ? unmuteAudio : togglePlay}
                    className="w-full h-full object-cover cursor-pointer"
                  >
                    {directVideoSrc && <source src={directVideoSrc} type="video/mp4" />}
                    <source src="https://res.cloudinary.com/glq1jvyu/video/upload/lv_0_20260818164632.mp4" type="video/mp4" />
                    {rawVideoSrc.endsWith('.mp4') && <source src={rawVideoSrc} type="video/mp4" />}
                  </video>

                  {/* EYE-CATCHING TOP BADGE */}
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2 bg-slate-950/75 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/20 shadow-md pointer-events-none">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[10px] sm:text-xs font-bold text-white tracking-wider uppercase">
                      3D Laser Showcase
                    </span>
                  </div>

                  {/* PROMPT TO UNMUTE IF SOUND IS RESTRICTED BY BROWSER */}
                  {isMuted && (
                    <button
                      type="button"
                      onClick={unmuteAudio}
                      className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 flex items-center gap-2 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-white/30 backdrop-blur-md animate-pulse cursor-pointer transition-all active:scale-95 z-20"
                      title="সাউন্ড সহ শুনতে ক্লিক করুন"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>সাউন্ড চালু করুন 🔊</span>
                    </button>
                  )}

                  {/* MINIMAL CONTROLS (PLAY/PAUSE & MUTE) */}
                  <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex items-center gap-1.5 sm:gap-2 bg-slate-900/80 backdrop-blur-md px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full border border-white/20 shadow-lg z-20">
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

      {/* 3. COMPACT 3D AUTO-SWIPING CATEGORY CAROUSEL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
              <h2 className="text-lg sm:text-2xl font-black text-[#0f3d44]">
                ক্যাটাগরি কালেকশন
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              পছন্দের ক্যাটাগরি বেছে নিন এবং সরাসরি আকর্ষণীয় ডিজাইনগুলো দেখুন
            </p>
          </div>

          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100/80 px-3 py-1.5 rounded-xl border border-teal-200/80 flex items-center gap-1 cursor-pointer transition-all"
          >
            <span>সব দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3D Side Carousel with Center Zoom & Side Previews - Compact Layout */}
        <div className="bg-slate-50/80 p-1 sm:p-2.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <CategoryCarousel
            categories={categories}
            productCountMap={categories.reduce((acc, cat) => {
              acc[cat.id] = products.filter(p => p.category_id === cat.id).length;
              return acc;
            }, {} as Record<number, number>)}
            onSelectCategory={(catId) => onNavigate('shop', { cat: catId })}
            onViewAll={() => onNavigate('shop')}
          />
        </div>
      </section>

      {/* 4. DIRECT PRODUCTS COLLECTION RIGHT BENEATH CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100">
              Exclusive Wall Art Collection
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-[#0f3d44] mt-1.5">
              সব আকর্ষণীয় ডিজাইন (Featured Wall Designs)
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-6">
          {featuredProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onSelectProduct={(prod) => onNavigate('product', { slug: prod.slug })}
              onOpenWallModal={onOpenWallModal}
              onQuickOrder={onQuickOrder}
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

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {newArrivals.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onSelectProduct={(prod) => onNavigate('product', { slug: prod.slug })}
              onOpenWallModal={onOpenWallModal}
              onQuickOrder={onQuickOrder}
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
              <p className="text-[11px] text-slate-500">আয়াতুল কুরসি অর্ডারে ফ্রি ডেলিভারি</p>
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
