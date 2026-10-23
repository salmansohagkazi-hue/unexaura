import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';
import { useSEO } from '../hooks/useSEO';
import { Search, SlidersHorizontal, RotateCcw, Copy, Check, Filter, X } from 'lucide-react';

interface ShopPageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenWallModal: (p: Product) => void;
  onQuickOrder?: (p: Product) => void;
  initialCatId?: number | 'all';
  initialBadge?: string;
  searchQuery?: string;
  initialSearch?: string;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  onNavigate,
  onOpenWallModal,
  onQuickOrder,
  initialCatId,
  initialBadge,
  searchQuery = '',
  initialSearch,
}) => {
  const { products, categories, formatPrice } = useApp();

  const [selectedCatId, setSelectedCatId] = useState<number | 'all'>(initialCatId || 'all');
  const [selectedBadge, setSelectedBadge] = useState<string>(initialBadge || 'all');
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [localSearch, setLocalSearch] = useState<string>(searchQuery || initialSearch || '');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [showFilterDrawer, setShowFilterDrawer] = useState<boolean>(false);

  useEffect(() => {
    if (initialCatId !== undefined) {
      setSelectedCatId(initialCatId);
    }
  }, [initialCatId]);

  useEffect(() => {
    if (initialSearch !== undefined) {
      setLocalSearch(initialSearch);
    }
  }, [initialSearch]);

  const activeCategory = categories.find((c) => c.id === selectedCatId);

  // Dynamic SEO update for Shop / Category view
  useSEO({
    title: activeCategory
      ? `${activeCategory.name} - Islamic Wall Art Catalog`
      : (localSearch ? `Search "${localSearch}" - Shop Products` : 'Shop All 3D Islamic Wall Decor'),
    description: activeCategory
      ? `Explore ${activeCategory.name} collection at UNEX AURA. Premium 3D Islamic wall decor with double-sided tape included.`
      : 'Browse the full catalog of UNEX AURA luxury 3D Islamic wall art, calligraphy, and home decor.',
    keywords: activeCategory
      ? `${activeCategory.name}, Islamic Wall Art, UNEX AURA Catalog, Calligraphy BD`
      : 'Islamic Wall Art, 3D Calligraphy, Home Decor Bangladesh, Ayatul Kursi'
  });

  const handleSelectCategory = (catId: number | 'all') => {
    setSelectedCatId(catId);
    if (catId !== 'all') {
      window.history.pushState({}, '', `?page=shop&cat=${catId}`);
    } else {
      window.history.pushState({}, '', '?page=shop');
    }
  };

  const handleCopyCategoryLink = (catId: number | 'all', catName: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://unexaura.xyz';
    const link = catId === 'all' ? `${origin}/?page=shop` : `${origin}/?page=shop&cat=${catId}`;

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

  // Filter products dynamically
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCatId !== 'all') {
      result = result.filter((p) => p.category_id === selectedCatId);
    }

    if (selectedBadge !== 'all') {
      result = result.filter((p) => p.badge === selectedBadge);
    }

    if (maxPrice < 10000) {
      result = result.filter((p) => p.price <= maxPrice);
    }

    if (localSearch.trim()) {
      const q = (localSearch || '').toLowerCase();
      result = result.filter((p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.material || '').toLowerCase().includes(q) ||
        (p.category_name || '').toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'price_low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [products, selectedCatId, selectedBadge, maxPrice, localSearch, sortBy]);

  const resetFilters = () => {
    setSelectedCatId('all');
    setSelectedBadge('all');
    setMaxPrice(10000);
    setLocalSearch('');
    setSortBy('newest');
    window.history.pushState({}, '', '?page=shop');
  };

  const activeCategoryObj = categories.find((c) => c.id === selectedCatId);
  const hasActiveExtraFilters = selectedBadge !== 'all' || maxPrice < 10000 || Boolean(localSearch.trim());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-4">
      {/* TOAST FEEDBACK NOTIFICATION */}
      {copyFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-teal-500/40 flex items-center gap-2.5 animate-bounce">
          <div className="w-6 h-6 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center font-bold text-xs">
            <Check className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-teal-300">লিংক কপি সফল হয়েছে!</p>
            <p className="text-slate-300 text-[11px]">"{copyFeedback}" ক্যাটাগরির ডিরেক্ট লিংক কপি করা হয়েছে।</p>
          </div>
        </div>
      )}

      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <button onClick={() => onNavigate('home')} className="hover:text-[#4f46e5] cursor-pointer">Home</button>
        <span>/</span>
        <button onClick={() => handleSelectCategory('all')} className="hover:text-[#4f46e5] cursor-pointer">Shop Designs</button>
        {activeCategoryObj && (
          <>
            <span>/</span>
            <span className="text-teal-700 font-bold">{activeCategoryObj.name}</span>
          </>
        )}
      </div>

      {/* HORIZONTAL CATEGORY BAR (PASHA PASHI - SIDE BY SIDE) */}
      <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs px-0.5">
          <span className="font-extrabold text-[#0f3d44] flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
            <span>ক্যাটাগরি নির্বাচন করুন (Categories)</span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            পাশাপাশি স্ক্রল করে ব্রাউজ করুন
          </span>
        </div>

        {/* HORIZONTAL SCROLLABLE ROW OF CATEGORIES */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => handleSelectCategory('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedCatId === 'all'
                ? 'bg-[#0f3d44] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>All Categories</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${selectedCatId === 'all' ? 'bg-white/20 text-white' : 'bg-white text-slate-600'}`}>
              {products.length}
            </span>
          </button>

          {categories.map((cat) => {
            const count = products.filter((p) => p.category_id === cat.id).length;
            const isSelected = selectedCatId === cat.id;
            return (
              <div key={cat.id} className="relative shrink-0 flex items-center">
                <button
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#0f3d44] text-white shadow-xs pr-7'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-600'}`}>
                    {count}
                  </span>
                </button>
                {isSelected && (
                  <button
                    type="button"
                    onClick={(e) => handleCopyCategoryLink(cat.id, cat.name, e)}
                    title={`"${cat.name}" ক্যাটাগরি লিংক কপি করুন`}
                    className="absolute right-1.5 p-1 rounded-md text-teal-200 hover:text-white cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CATALOG HEADER & FILTER TOGGLE */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-extrabold text-base sm:text-lg text-[#0f3d44] flex items-center gap-2">
              <span>{activeCategoryObj ? `${activeCategoryObj.icon || '🕌'} ${activeCategoryObj.name}` : 'All Wall Decor Designs'}</span>
              {activeCategoryObj && (
                <button
                  onClick={(e) => handleCopyCategoryLink(activeCategoryObj.id, activeCategoryObj.name, e)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2 py-0.5 rounded-full cursor-pointer transition-all"
                  title="ক্যাটাগরি লিংক কপি করুন"
                >
                  <Copy className="w-3 h-3" />
                  <span>কপি লিংক</span>
                </button>
              )}
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5">
              মোট {filteredProducts.length}টি প্রিমিয়াম ওয়াল আর্ট ডিজাইন প্রদর্শিত হচ্ছে
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                showFilterDrawer || hasActiveExtraFilters
                  ? 'bg-teal-50 text-teal-800 border border-teal-300'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-teal-600" />
              <span>ফিল্টার</span>
              {hasActiveExtraFilters && (
                <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              )}
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-100 border border-slate-200 text-xs text-[#0f3d44] font-bold rounded-xl px-3 py-1.5 outline-none cursor-pointer"
            >
              <option value="newest">Newest Designs</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* COLLAPSIBLE SECONDARY FILTERS (PRICE RANGE & COLLECTION TAGS) */}
        {showFilterDrawer && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs animate-fadeIn">
            {/* Price slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-bold text-slate-700">
                <span>সর্বোচ্চ মূল্য (Max Price):</span>
                <span className="text-teal-800 font-black">{formatPrice(maxPrice)}</span>
              </div>
              <input
                type="range"
                min="500"
                max="10000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-teal-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>৳500</span>
                <span>৳10,000</span>
              </div>
            </div>

            {/* Tags and reset */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-bold text-slate-700">
                <span>কালেকশন ট্যাগ:</span>
                {hasActiveExtraFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-[11px] text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> রিসেট
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {['all', 'HOT', 'NEW', 'SALE'].map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBadge(b)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedBadge === b
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {b === 'all' ? 'সব ট্যাগ' : b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PRODUCTS GRID (IMMEDIATELY VISIBLE WITHOUT VERTICAL SCROLL DELAY) */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {filteredProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onSelectProduct={(prod) => onNavigate('product', { slug: prod.slug })}
              onOpenWallModal={onOpenWallModal}
              onQuickOrder={onQuickOrder}
            />
          ))}
        </div>
      ) : (
        /* EMPTY STATE */
        <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center space-y-3 max-w-md mx-auto my-6">
          <div className="w-14 h-14 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto text-xl font-bold">
            🔍
          </div>
          <h3 className="font-extrabold text-base text-[#0f3d44]">কোনো ডিজাইন পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500">
            এই ক্যাটাগরিতে খুব শীঘ্রই নতুন ডিজাইন যুক্ত করা হবে।
          </p>
          <button
            onClick={resetFilters}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0f3d44] hover:bg-teal-900 shadow-md cursor-pointer"
          >
            সব ডিজাইন দেখুন (View All)
          </button>
        </div>
      )}
    </div>
  );
};
