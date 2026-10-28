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

      {/* HORIZONTAL CAROUSEL - BIG IMAGES WITH COMPACT LABELS BENEATH */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto scrollbar-none scroll-smooth px-1 py-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* ALL CATEGORIES BUTTON */}
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="w-[125px] sm:w-[150px] shrink-0 flex flex-col items-center bg-white rounded-2xl p-2 border border-slate-200/90 hover:border-teal-500 shadow-2xs hover:shadow-md transition-all group cursor-pointer text-center select-none"
          >
            {/* BIG PROMINENT HERO IMAGE / BANNER */}
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-[#0f3d44] via-slate-900 to-indigo-950 flex flex-col items-center justify-center p-3 text-white border border-slate-100 shadow-inner group-hover:scale-[1.03] transition-transform duration-500">
              <span className="text-2xl sm:text-3xl mb-1 filter drop-shadow">✨</span>
              <span className="text-[11px] sm:text-xs font-black tracking-wide text-amber-300 uppercase">
                ALL
              </span>
            </div>

            {/* COMPACT CATEGORY NAME UNDERNEATH */}
            <div className="w-full mt-2 space-y-0.5">
              <h4 className="font-extrabold text-xs sm:text-[13px] text-slate-800 group-hover:text-teal-700 transition-colors truncate">
                সব কালেকশন
              </h4>
              <p className="text-[10px] text-slate-500 font-medium">
                সকল ডিজাইন
              </p>
            </div>
          </button>
        )}

        {/* CATEGORY CARDS WITH BIG IMAGES & SMALL TITLE BELOW */}
        {categories.map((cat, idx) => {
          const count = productCountMap[cat.id] ?? 0;

          return (
            <button
              key={`cat-carousel-${cat.id}-${idx}`}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className="w-[125px] sm:w-[150px] shrink-0 flex flex-col items-center bg-white rounded-2xl p-2 border border-slate-200/90 hover:border-teal-500 shadow-2xs hover:shadow-md transition-all group cursor-pointer text-center select-none"
            >
              {/* BIG PROMINENT CATEGORY IMAGE */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-3xl bg-teal-50 text-teal-700">
                    {cat.icon || '🕌'}
                  </div>
                )}
                {/* Subtle soft gradient overlay at bottom edge */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>

              {/* COMPACT CATEGORY NAME UNDERNEATH */}
              <div className="w-full mt-2 space-y-0.5">
                <h4
                  className="font-extrabold text-xs sm:text-[13px] text-slate-800 group-hover:text-teal-700 transition-colors truncate"
                  title={cat.name}
                >
                  {cat.name}
                </h4>
                <p className="text-[10px] text-slate-500 font-medium">
                  {count > 0 ? `${count} টি ডিজাইন` : 'প্রিমিয়াম'}
                </p>
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
