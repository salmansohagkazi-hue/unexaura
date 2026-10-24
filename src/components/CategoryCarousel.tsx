import React, { useRef } from 'react';
import { Category } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryCarouselProps {
  categories: Category[];
  productCountMap: Record<number, number>;
  onSelectCategory: (categoryId: number) => void;
  onViewAll?: () => void;
}

export const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  categories,
  productCountMap,
  onSelectCategory,
  onViewAll
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!categories || categories.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group/carousel py-1 select-none">
      {/* LEFT NAVIGATION ARROW */}
      <button
        type="button"
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 text-slate-700 shadow-md border border-slate-200/80 hover:bg-white hover:text-indigo-600 transition-all flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 -ml-2 sm:-ml-3"
        aria-label="Previous Category"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* COMPACT HORIZONTAL CAROUSEL - TAKES MINIMAL VERTICAL SPACE */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-2.5 sm:gap-3.5 overflow-x-auto scrollbar-none scroll-smooth px-1 py-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* ALL CATEGORIES BUTTON */}
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="shrink-0 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs cursor-pointer group"
          >
            <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm">
              ✨
            </span>
            <div className="text-left pr-1">
              <div className="text-xs font-bold leading-tight">সব কালেকশন</div>
              <div className="text-[10px] text-slate-300 font-medium">All Designs</div>
            </div>
          </button>
        )}

        {/* CATEGORY CARDS */}
        {categories.map((cat) => {
          const count = productCountMap[cat.id] ?? 0;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className="shrink-0 flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-white hover:bg-indigo-50/50 border border-slate-200/90 hover:border-indigo-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer text-left group"
            >
              {/* COMPACT THUMBNAIL */}
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg bg-indigo-50 text-indigo-700">
                    {cat.icon || '🕌'}
                  </div>
                )}
              </div>

              {/* DETAILS */}
              <div className="min-w-0 pr-1">
                <h4 className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-indigo-600 transition-colors truncate max-w-[120px] sm:max-w-[150px]">
                  {cat.name}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-semibold text-slate-500">
                    {count > 0 ? `${count} টি ডিজাইন` : 'প্রিমিয়াম'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* RIGHT NAVIGATION ARROW */}
      <button
        type="button"
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 text-slate-700 shadow-md border border-slate-200/80 hover:bg-white hover:text-indigo-600 transition-all flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 -mr-2 sm:-mr-3"
        aria-label="Next Category"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
