import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Search, Eye, User, Shield, Menu, X, Sparkles, ChevronDown, PackageCheck, Layers, Heart, ChevronRight, ArrowRight } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string, params?: any) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenSeeOnWall: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onOpenSeeOnWall,
}) => {
  const { cart, getCartCount, user, currency, currencies, setCurrencyCode, formatPrice, getWishlistCount, products } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  const cartCount = getCartCount();
  const wishlistCount = getWishlistCount();

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(e.target as Node) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(e.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNav = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cleanQuery = searchQuery.trim().toLowerCase();
  const matchingProducts = cleanQuery
    ? products.filter((p) => {
        const name = p.name.toLowerCase();
        const category = (p.category_name || '').toLowerCase();
        const banglaDesc = (p.bangla_short_desc || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const qualities = (p.qualities || []).join(' ').toLowerCase();
        return (
          name.includes(cleanQuery) ||
          category.includes(cleanQuery) ||
          banglaDesc.includes(cleanQuery) ||
          desc.includes(cleanQuery) ||
          qualities.includes(cleanQuery)
        );
      })
    : [];

  const popularSearchTags = ['Ayatul Kursi', 'Lantern', 'Tree of Life', 'Four Qul', 'Surah Ar-Rahman', '3D Metal'];

  const renderSearchResultsList = () => {
    if (matchingProducts.length === 0) {
      return (
        <div className="p-4 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700">
              ‘{searchQuery}’ সংক্রান্ত কোনো ডিজাইন পাওয়া যায়নি
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              অন্য কোনো কিওয়ার্ড লিখে সার্চ করুন অথবা নিচের ক্যাটাগরি ট্রাই করুন:
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            {popularSearchTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearchQuery(tag);
                  setShowSearchResults(true);
                }}
                className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-full border border-indigo-200/80 transition-colors cursor-pointer"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-700 font-bold">
          <span className="flex items-center gap-1.5 text-teal-800">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>ম্যাচিং ডিজাইন ({matchingProducts.length}টি)</span>
          </span>
          <span className="text-[10px] text-slate-400 font-normal">ইনস্ট্যান্ট সার্চ</span>
        </div>

        <div className="divide-y divide-slate-100 max-h-[320px] overflow-y-auto">
          {matchingProducts.slice(0, 5).map((prod) => (
            <button
              key={prod.id}
              type="button"
              onClick={() => {
                setShowSearchResults(false);
                setSearchOpen(false);
                setActiveTab('product', { slug: prod.slug });
              }}
              className="w-full p-2.5 hover:bg-indigo-50/60 transition-colors flex items-center gap-3 text-left group cursor-pointer"
            >
              <img
                src={prod.image_url}
                alt={prod.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl object-cover border border-slate-200/80 shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] text-teal-700 font-extrabold uppercase tracking-wide">
                  <span>{prod.category_name || 'Wall Art'}</span>
                  {prod.size_dimensions && <span>• {prod.size_dimensions}</span>}
                </div>
                <h4 className="font-extrabold text-xs text-[#0f3d44] group-hover:text-indigo-700 truncate transition-colors">
                  {prod.name}
                </h4>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-extrabold text-xs text-[#0f3d44]">
                    {formatPrice(prod.price)}
                  </span>
                  {prod.old_price && (
                    <span className="text-[11px] text-slate-400 line-through">
                      {formatPrice(prod.old_price)}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-400 transition-all shrink-0">
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>

        {matchingProducts.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setShowSearchResults(false);
              setSearchOpen(false);
              setActiveTab('shop');
            }}
            className="w-full p-3 bg-gradient-to-r from-teal-50 via-indigo-50 to-purple-50 hover:from-teal-100 hover:to-purple-100 border-t border-slate-200 text-xs font-extrabold text-indigo-900 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>সকল {matchingProducts.length}টি রেজাল্ট শপে দেখুন (View All Results)</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-700" />
          </button>
        )}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-[#fdfdfe]/95 backdrop-blur-md border-b border-slate-200/60 shadow-xs">
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-teal-500 via-indigo-600 via-purple-600 to-pink-500 text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide flex justify-between items-center">
        <div className="hidden sm:block text-slate-100">
          ✨ Premium Laser-Cut Stainless &amp; MS Steel Wall Decor
        </div>
        <div className="mx-auto sm:mx-0 flex items-center gap-3">
          <span>🎉 Free Delivery inside Dhaka on orders over ৳3,000</span>
          <span className="opacity-60 hidden md:inline">|</span>
          <span className="hidden md:inline">🛡️ Lifetime Rust-Proof Guarantee</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="text-[11px] opacity-90">Currency:</span>
          <span className="bg-white/20 text-white text-[11px] font-bold rounded px-2 py-0.5 border border-white/30">
            BDT (৳)
          </span>
        </div>
      </div>

      {/* MAIN HEADER NAVBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* LOGO */}
        <button
          onClick={() => handleNav('home')}
          className="flex flex-col items-start group focus:outline-none shrink-0"
        >
          <span className="text-xl sm:text-2xl font-black tracking-tight leading-none whitespace-nowrap bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] via-[#9333ea] to-[#ec4899] bg-clip-text text-transparent group-hover:scale-[1.02] transition-transform">
            UNEX AURA
          </span>
          <span className="text-[9px] sm:text-[10px] tracking-[0.25em] text-[#0f3d44] font-black lowercase opacity-90 whitespace-nowrap mt-0.5">
            unique experience
          </span>
        </button>

        {/* DESKTOP NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => handleNav('home')}
            className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'home'
                ? 'bg-indigo-50 text-[#4f46e5] shadow-xs'
                : 'text-[#0f3d44] hover:text-[#4f46e5] hover:bg-slate-100/80'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNav('shop')}
            className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'shop'
                ? 'bg-indigo-50 text-[#4f46e5] shadow-xs'
                : 'text-[#0f3d44] hover:text-[#4f46e5] hover:bg-slate-100/80'
            }`}
          >
            Shop Designs
          </button>
          <button
            onClick={onOpenSeeOnWall}
            className="px-3 py-2 rounded-xl text-sm font-semibold text-[#0f3d44] hover:text-[#9333ea] hover:bg-purple-50 transition-all flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4 text-[#9333ea]" />
            <span>See On Your Wall</span>
          </button>
        </nav>

        {/* SEARCH BAR & ACTION BUTTONS */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* DESKTOP SEARCH TRIGGER / INPUT WITH INSTANT AUTO-COMPLETE */}
          <div className="relative" ref={desktopSearchRef}>
            <div className="hidden lg:flex items-center bg-slate-100/90 hover:bg-slate-100 rounded-full px-3.5 py-1.5 border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:bg-white transition-all w-48 xl:w-64">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search Wall Art..."
                value={searchQuery}
                onFocus={() => setShowSearchResults(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setShowSearchResults(false);
                    setActiveTab('shop');
                  }
                }}
                className="w-full bg-transparent text-xs text-[#0f3d44] placeholder-slate-400 focus:outline-none font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchResults(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 text-xs px-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* DESKTOP AUTO-COMPLETE POPUP DROPDOWN */}
            {showSearchResults && searchQuery.trim().length > 0 && (
              <div className="hidden lg:block absolute top-full left-0 xl:-left-12 mt-2 w-[380px] xl:w-[440px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-fade-in">
                {renderSearchResultsList()}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setSearchOpen(!searchOpen);
                setShowSearchResults(true);
              }}
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Wishlist Button */}
          <button
            onClick={() => setActiveTab('account', { tab: 'wishlist' })}
            className="relative p-2 rounded-full border border-slate-200 text-slate-700 hover:text-pink-600 hover:bg-pink-50 hover:border-pink-200 active:scale-90 transition-all flex items-center justify-center cursor-pointer select-none"
            title="My Saved Wishlist"
          >
            <Heart className="w-5 h-5 text-slate-700 hover:text-pink-600" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Account Button */}
          <button
            onClick={() => handleNav(user ? 'account' : 'login')}
            className={`p-2 rounded-full border active:scale-95 transition-all flex items-center gap-2 select-none ${
              user
                ? 'bg-gradient-to-r from-teal-50 to-indigo-50 border-teal-200 text-[#0f3d44]'
                : 'border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title={user ? `Logged in as ${user.first_name}` : 'Login / Account'}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-teal-500 via-indigo-600 to-pink-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              {user ? user.first_name[0] : <User className="w-4 h-4" />}
            </div>
            <span className="hidden xl:inline text-xs font-semibold pr-1">
              {user ? user.first_name : 'Sign In'}
            </span>
          </button>

          {/* Cart Badge Button */}
          <button
            onClick={() => handleNav('cart')}
            className="relative p-2.5 rounded-full bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] to-[#ec4899] text-white hover:opacity-95 shadow-md shadow-indigo-500/20 active:scale-90 transition-all flex items-center justify-center select-none cursor-pointer"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {/* CRITICAL DOM CART BADGE */}
            <span
              className="cart-badge absolute -top-1.5 -right-1.5 bg-pink-600 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white shadow-xs"
              style={{ display: cartCount > 0 ? 'flex' : 'none' }}
            >
              {cartCount}
            </span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE SEARCH EXPANDABLE BAR WITH INSTANT RESULTS */}
      {searchOpen && (
        <div className="lg:hidden px-4 pb-3 pt-2 border-t border-slate-100 bg-white shadow-md relative" ref={mobileSearchRef}>
          <div className="flex items-center bg-slate-100 rounded-xl px-3 py-2 border border-slate-200 focus-within:border-indigo-500 focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search Islamic calligraphy, natural designs..."
              value={searchQuery}
              autoFocus
              onFocus={() => setShowSearchResults(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSearchOpen(false);
                  setShowSearchResults(false);
                  setActiveTab('shop');
                }
              }}
              className="w-full bg-transparent text-sm text-[#0f3d44] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 text-xs px-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* MOBILE LIVE AUTO-COMPLETE POPUP */}
          {searchQuery.trim().length > 0 && (
            <div className="mt-2 bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden">
              {renderSearchResultsList()}
            </div>
          )}
        </div>
      )}

      {/* MOBILE NAVIGATION MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-4 space-y-2 shadow-lg">
          <button
            onClick={() => handleNav('home')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
              activeTab === 'home' ? 'bg-indigo-50 text-[#4f46e5]' : 'text-[#0f3d44]'
            }`}
          >
            <span>Home</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </button>

          <button
            onClick={() => handleNav('shop')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold ${
              activeTab === 'shop' ? 'bg-indigo-50 text-[#4f46e5]' : 'text-[#0f3d44]'
            }`}
          >
            Shop All Wall Art
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setActiveTab('account', { tab: 'wishlist' });
            }}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-pink-700 bg-pink-50 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
              <span>My Wishlist</span>
            </span>
            <span className="bg-pink-200 text-pink-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {wishlistCount}
            </span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenSeeOnWall();
            }}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-[#0f3d44] bg-purple-50 text-purple-700 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>See It On Your Wall</span>
          </button>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Currency:</span>
            <span className="font-extrabold text-[#0f3d44] bg-teal-50 text-teal-800 px-2.5 py-0.5 rounded border border-teal-200">
              BDT (৳)
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
