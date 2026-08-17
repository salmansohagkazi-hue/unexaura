import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';
import { useSEO } from '../hooks/useSEO';
import { Search, Filter, SlidersHorizontal, RotateCcw, Eye, Sparkles, Copy, Check, Share2, Link as LinkIcon } from 'lucide-react';

interface ShopPageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenWallModal: (p: Product) => void;
  initialCatId?: number | 'all';
  initialBadge?: string;
  searchQuery?: string;
  initialSearch?: string;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  onNavigate,
  onOpenWallModal,
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SIDEBAR FILTERS (260px approx -> 3 col on lg) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-[#0f3d44] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-teal-600" />
              <span>Filter Wall Art</span>
            </h3>

            {(selectedCatId !== 'all' || selectedBadge !== 'all' || maxPrice < 10000 || localSearch) && (
              <button
                onClick={resetFilters}
                className="text-[11px] text-red-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {/* CATEGORIES RADIO LIST */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 block">Product Categories (5)</label>
              <span className="text-[10px] text-slate-400 font-medium">Direct Linkable</span>
            </div>
            <div className="space-y-1">
              <div className="relative group/all">
                <button
                  onClick={() => handleSelectCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    selectedCatId === 'all'
                      ? 'bg-gradient-to-r from-teal-50 to-indigo-50 text-[#4f46e5] font-bold border border-teal-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>All Categories</span>
                  <span className="text-[10px] text-slate-400 font-normal">({products.length})</span>
                </button>
              </div>

              {categories.map((cat) => {
                const count = products.filter((p) => p.category_id === cat.id).length;
                const isSelected = selectedCatId === cat.id;
                return (
                  <div key={cat.id} className="relative group/cat flex items-center">
                    <button
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`flex-1 text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer pr-8 ${
                        isSelected
                          ? 'bg-gradient-to-r from-teal-50 to-indigo-50 text-[#4f46e5] font-bold border border-teal-200'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate flex items-center gap-1.5">
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal shrink-0">({count})</span>
                    </button>

                    {/* Quick copy link icon */}
                    <button
                      type="button"
                      onClick={(e) => handleCopyCategoryLink(cat.id, cat.name, e)}
                      title={`"${cat.name}" ক্যাটাগরি লিংক কপি করুন`}
                      className="absolute right-1.5 p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors opacity-70 group-hover/cat:opacity-100 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PRICE SLIDER */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-700">Max Price</label>
              <span className="font-extrabold text-[#0f3d44]">{formatPrice(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="500"
              max="10000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>৳500</span>
              <span>৳10,000</span>
            </div>
          </div>

          {/* BADGE FILTER */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block">Collection Tag</label>
            <div className="flex flex-wrap gap-1.5">
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
                  {b === 'all' ? 'All Tags' : b}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="lg:col-span-9 space-y-6">
          {/* CATALOG HEADER & SORTING & SHARE LINK */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-extrabold text-lg sm:text-xl text-[#0f3d44]">
                  {activeCategoryObj ? `${activeCategoryObj.icon || '🕌'} ${activeCategoryObj.name}` : 'All Wall Decor Designs'}
                </h1>

                {/* 1-CLICK CATEGORY LINK COPY BUTTON */}
                {activeCategoryObj && (
                  <button
                    onClick={(e) => handleCopyCategoryLink(activeCategoryObj.id, activeCategoryObj.name, e)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 transition-all cursor-pointer shadow-2xs active:scale-95"
                    title="এই ক্যাটাগরির ডিরেক্ট লিংক কপি করুন"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Category Link</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Showing {filteredProducts.length} of {products.length} stainless steel designs
                {activeCategoryObj && ` in "${activeCategoryObj.name}"`}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs text-slate-500 font-medium shrink-0">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-100 border border-slate-200 text-xs text-[#0f3d44] font-bold rounded-xl px-3 py-2 outline-none cursor-pointer"
              >
                <option value="newest">Newest Designs</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* PRODUCT GRID */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSelectProduct={(prod) => onNavigate('product', { slug: prod.slug })}
                  onOpenWallModal={onOpenWallModal}
                />
              ))}
            </div>
          ) : (
            /* EMPTY STATE */
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 max-w-md mx-auto my-8">
              <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-2xl">
                🔍
              </div>
              <h3 className="font-extrabold text-lg text-[#0f3d44]">কোনো ডিজাইন পাওয়া যায়নি</h3>
              <p className="text-xs text-slate-500">
                এই ক্যাটাগরিতে খুব শীঘ্রই নতুন প্রিমিয়াম ডিজাইন যুক্ত করা হবে। সকল ওয়াল আর্ট ডিজাইন দেখতে নিচের বাটনে ক্লিক করুন।
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-indigo-600 hover:opacity-95 shadow-md cursor-pointer"
              >
                সব ডিজাইন দেখুন (View All)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
