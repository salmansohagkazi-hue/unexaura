import React, { useState, useEffect, useRef } from 'react';
import { Category } from '../types';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';

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
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const total = categories.length;

  // Auto-slide to the right every 2.8 seconds smoothly
  useEffect(() => {
    if (total <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 2800);

    return () => clearInterval(interval);
  }, [total, isPaused]);

  if (total === 0) return null;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current !== null && touchEndXRef.current !== null) {
      const diff = touchStartXRef.current - touchEndXRef.current;
      if (diff > 40) {
        handleNext();
      } else if (diff < -40) {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  return (
    <div
      className="relative select-none py-1"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* COMPACT STAGE TAKING LESS VERTICAL SPACE */}
      <div className="relative h-44 sm:h-52 w-full max-w-3xl mx-auto flex items-center justify-center overflow-hidden px-2 sm:px-4">
        {categories.map((cat, idx) => {
          let offset = (idx - activeIndex) % total;
          if (offset > Math.floor(total / 2)) offset -= total;
          if (offset < -Math.floor(total / 2)) offset += total;

          const isCenter = offset === 0;
          const isLeft = offset === -1;
          const isRight = offset === 1;

          let transformStyle = 'translate3d(0, 0, 0) scale(0.6)';
          let opacity = 0;
          let zIndex = 5;
          let pointerEvents: 'auto' | 'none' = 'none';

          if (isCenter) {
            transformStyle = 'translate3d(0, 0, 0) scale(1)';
            opacity = 1;
            zIndex = 30;
            pointerEvents = 'auto';
          } else if (isLeft) {
            transformStyle = 'translate3d(-78%, 0, -20px) scale(0.85)';
            opacity = 0.55;
            zIndex = 20;
            pointerEvents = 'auto';
          } else if (isRight) {
            transformStyle = 'translate3d(78%, 0, -20px) scale(0.85)';
            opacity = 0.55;
            zIndex = 20;
            pointerEvents = 'auto';
          }

          const count = productCountMap[cat.id] ?? 0;

          return (
            <div
              key={cat.id}
              onClick={() => {
                if (isCenter) {
                  onSelectCategory(cat.id);
                } else if (isLeft) {
                  handlePrev();
                } else if (isRight) {
                  handleNext();
                }
              }}
              style={{
                transform: transformStyle,
                opacity,
                zIndex,
                pointerEvents,
                transition: 'transform 450ms cubic-bezier(0.25, 1, 0.5, 1), opacity 450ms ease, box-shadow 300ms ease'
              }}
              className={`absolute top-0 bottom-0 my-auto h-40 sm:h-48 w-44 sm:w-56 rounded-2xl cursor-pointer p-2 sm:p-2.5 flex flex-col justify-between border backdrop-blur-md transition-shadow ${
                isCenter
                  ? 'bg-white border-indigo-500/50 shadow-xl shadow-indigo-600/10 ring-2 ring-indigo-400/25'
                  : 'bg-white/85 border-slate-200 shadow-sm hover:opacity-85'
              }`}
            >
              {/* CATEGORY IMAGE CONTAINER */}
              <div className="relative w-full h-24 sm:h-30 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 group shrink-0">
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl bg-indigo-50/50">
                    {cat.icon || '🕌'}
                  </div>
                )}

                {/* COUNT BADGE */}
                <div className="absolute top-1.5 right-1.5">
                  <span className="text-[9px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded-md shadow-xs text-white bg-black/70 backdrop-blur-xs border border-white/20">
                    {count > 0 ? `${count} টি` : 'নতুন'}
                  </span>
                </div>

                {isCenter && (
                  <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-indigo-600/90 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                    <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                    <span>প্রিমিয়াম</span>
                  </div>
                )}
              </div>

              {/* CATEGORY DETAILS BELOW THE IMAGE */}
              <div className="pt-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3
                    className={`font-black text-xs sm:text-sm text-center leading-tight line-clamp-1 transition-colors ${
                      isCenter ? 'text-indigo-950' : 'text-slate-800'
                    }`}
                  >
                    {cat.name}
                  </h3>
                  <p className="text-[10px] text-center text-slate-500 font-medium">
                    ১০০% সার্জিক্যাল মেটাল
                  </p>
                </div>

                {/* COMPACT EXPLORE ACTION BUTTON */}
                <div className="pt-1">
                  <div
                    className={`w-full py-1 px-2 rounded-lg text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                      isCenter
                        ? 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-700'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>কালেকশন দেখুন</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* LEFT / RIGHT NAV ARROWS */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="absolute left-0.5 sm:left-2 z-40 p-1.5 sm:p-2 rounded-full bg-white/95 text-slate-700 hover:text-indigo-600 hover:bg-white shadow-md border border-slate-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="পূর্ববর্তী ক্যাটাগরি"
          aria-label="Previous Category"
        >
          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-0.5 sm:right-2 z-40 p-1.5 sm:p-2 rounded-full bg-white/95 text-slate-700 hover:text-indigo-600 hover:bg-white shadow-md border border-slate-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="পরবর্তী ক্যাটাগরি"
          aria-label="Next Category"
        >
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* COMPACT BOTTOM DOT INDICATORS */}
      <div className="flex items-center justify-center gap-1.5 mt-1">
        {categories.map((cat, idx) => (
          <button
            key={cat.id}
            onClick={() => setActiveIndex(idx)}
            className={`transition-all rounded-full cursor-pointer ${
              idx === activeIndex
                ? 'w-5 h-1.5 bg-indigo-600 shadow-xs'
                : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'
            }`}
            title={cat.name}
            aria-label={`Jump to ${cat.name}`}
          />
        ))}
      </div>
    </div>
  );
};
