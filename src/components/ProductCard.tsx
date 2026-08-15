import React, { useState } from 'react';
import { Product, ProductSize } from '../types';
import { useApp } from '../context/AppContext';
import { Eye, ShoppingBag, Star, Heart, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (p: Product) => void;
  onOpenWallModal: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onOpenWallModal,
}) => {
  const { addToCart, formatPrice, toggleWishlist, isInWishlist } = useApp();
  const isWishlisted = isInWishlist(product.id);

  // 2 sizes per product: Medium (index 0, default) and Large (index 1)
  const availableSizes: ProductSize[] = (product.sizes && product.sizes.length >= 2)
    ? product.sizes
    : [
        {
          id: 's1',
          name: 'Medium (2.5 Feet / 75x40cm)',
          size_dimensions: product.size_dimensions || '75cm × 40cm',
          price: product.price,
          old_price: product.old_price,
          weight_grams: product.weight_grams
        },
        {
          id: 's2',
          name: 'Large (4 Feet / 120x60cm)',
          size_dimensions: '120cm × 60cm',
          price: Math.round(product.price * 1.4),
          old_price: product.old_price ? Math.round(product.old_price * 1.4) : undefined,
          weight_grams: Math.round(product.weight_grams * 1.4)
        }
      ];

  // Default ALWAYS to index 0 (Small size)
  const [selectedSizeIdx, setSelectedSizeIdx] = useState<number>(0);
  const activeSize = availableSizes[selectedSizeIdx] || availableSizes[0];

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-transparent hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* PRODUCT BADGE (OR OUT OF STOCK OVERRIDE) */}
      {product.stock <= 0 ? (
        <div className="absolute top-3 left-3 z-10">
          <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full shadow-xs text-white bg-gradient-to-r from-red-600 to-rose-700 animate-pulse">
            OUT OF STOCK (স্টক শেষ)
          </span>
        </div>
      ) : product.badge ? (
        <div className="absolute top-3 left-3 z-10">
          <span className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full shadow-xs text-white ${
            product.badge === 'HOT' ? 'bg-gradient-to-r from-red-500 to-pink-600' :
            product.badge === 'NEW' ? 'bg-gradient-to-r from-emerald-500 to-teal-600' :
            'bg-gradient-to-r from-amber-500 to-orange-600'
          }`}>
            {product.badge}
          </span>
        </div>
      ) : null}

      {/* QUICK ACTION OVERLAY BUTTONS (WISHLIST & SEE ON WALL) */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`p-2 rounded-full shadow-md backdrop-blur-sm transition-all hover:scale-110 flex items-center justify-center cursor-pointer ${
            isWishlisted
              ? 'bg-pink-50 text-pink-600 ring-2 ring-pink-300'
              : 'bg-white/90 hover:bg-white text-slate-700 hover:text-pink-600'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-pink-500 text-pink-500' : ''}`} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenWallModal(product);
          }}
          className="bg-white/90 hover:bg-white text-slate-800 hover:text-[#9333ea] p-2 rounded-full shadow-md backdrop-blur-sm transition-all hover:scale-110 flex items-center justify-center cursor-pointer group/wall"
          title="Quick View / Product Details (পণ্য দেখুন)"
        >
          <Eye className="w-4 h-4 text-[#9333ea]" />
        </button>
      </div>

      {/* PRODUCT IMAGE CONTAINER */}
      <div
        onClick={() => onSelectProduct(product)}
        className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer group-hover:opacity-95"
      >
        <img
          src={product.image_url}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* HOVER OVERLAY TEASER */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
          <span className="text-[11px] text-white font-medium flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full">
            <Eye className="w-3.5 h-3.5 text-teal-300" />
            <span>পণ্য দেখুন &amp; ওয়ালে প্লেসমেন্ট (Quick View)</span>
          </span>
        </div>
      </div>

      {/* CARD BODY */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          {/* CATEGORY & MATERIAL TAG */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100/80">
              {product.category_name || 'Wall Decor'}
            </span>
          </div>

          {/* PRODUCT TITLE */}
          <h3
            onClick={() => onSelectProduct(product)}
            className="font-bold text-[#0f3d44] text-sm sm:text-base leading-snug line-clamp-2 hover:text-[#4f46e5] cursor-pointer transition-colors"
          >
            {product.name}
          </h3>

          {/* RATING ROW */}
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex items-center text-amber-400 text-xs bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="ml-1 font-bold text-slate-800">{product.rating || 4.9}</span>
            </div>
          </div>

          {/* HIGHLY VISIBLE & COMPACT SIZE SELECTION TOGGLE */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-[#0f3d44] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                <span>Select Size (সাইজ):</span>
              </span>
              <span className="text-teal-700 font-extrabold bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200 text-[10px]">
                {activeSize.size_dimensions}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80">
              {availableSizes.slice(0, 2).map((sz, idx) => {
                const isSelected = selectedSizeIdx === idx;
                const labelName = sz.name.split('(')[0].trim() || (idx === 0 ? 'Medium' : 'Large');
                return (
                  <button
                    key={sz.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSizeIdx(idx);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-extrabold transition-all flex items-center justify-between cursor-pointer select-none ${
                      isSelected
                        ? 'bg-[#0f3d44] text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200/70'
                    }`}
                  >
                    <div className="flex items-center gap-1 truncate">
                      {isSelected && <Check className="w-3 h-3 text-teal-300 shrink-0" />}
                      <span className="truncate">{labelName}</span>
                    </div>
                    <span className={`text-[10px] ml-1 shrink-0 font-extrabold ${isSelected ? 'text-teal-200' : 'text-indigo-600'}`}>
                      {formatPrice(sz.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* PRICING & ACTIONS */}
        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          <div className="flex items-baseline justify-between gap-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-black text-[#0f3d44]">
                {formatPrice(activeSize.price)}
              </span>
              {activeSize.old_price && (
                <span className="text-xs text-slate-400 line-through">
                  {formatPrice(activeSize.old_price)}
                </span>
              )}
            </div>
            <div className="text-[10px] text-emerald-800 font-bold bg-emerald-50/90 px-2 py-0.5 rounded-lg border border-emerald-200/80 leading-snug text-center">
              <div>দেওয়ালে লাগানোর জন্য</div>
              <div className="text-emerald-700">ডাবল সাইড টেপ রয়েছে</div>
            </div>
          </div>

          {/* DUAL ACTION BUTTONS: SHOP NOW & ADD TO CART (OR OUT OF STOCK BUTTON) */}
          {product.stock <= 0 ? (
            <button
              type="button"
              disabled
              className="w-full py-2.5 px-3 rounded-xl text-xs font-black text-slate-500 bg-slate-200 border border-slate-300 opacity-90 cursor-not-allowed select-none flex items-center justify-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
              <span>স্টক শেষ (Out of Stock)</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectProduct(product);
                }}
                className="py-2.5 px-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-indigo-50 hover:text-[#4f46e5] border border-slate-200 transition-all flex items-center justify-center gap-1 cursor-pointer select-none"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">Shop Now</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product, 1, activeSize);
                }}
                className="py-2.5 px-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] via-[#9333ea] to-[#ec4899] hover:opacity-95 shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer select-none"
              >
                <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Add to Cart</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

