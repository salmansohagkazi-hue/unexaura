import React from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { Eye, ShoppingCart, Zap, Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (p: Product) => void;
  onOpenWallModal: (p: Product) => void;
  onQuickOrder?: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onOpenWallModal,
  onQuickOrder,
}) => {
  const { addToCart, directCheckout, formatPrice, toggleWishlist, isInWishlist } = useApp();
  const isWishlisted = isInWishlist(product.id);

  const discountPercent = product.old_price && product.old_price > product.price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart(product, 1, undefined, true);
  };

  const handleOrderNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // Add product cleanly to cart without opening slide drawer
    directCheckout(product, 1);
    if (onQuickOrder) {
      onQuickOrder(product);
    } else {
      window.dispatchEvent(new CustomEvent('unex_navigate', { detail: { page: 'checkout' } }));
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-400/50 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* BADGE (HOT, NEW, OR OUT OF STOCK) */}
      {product.stock <= 0 ? (
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md shadow-xs text-white bg-red-600">
            স্টক শেষ
          </span>
        </div>
      ) : (
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
          {product.badge && (
            <span className={`text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md shadow-xs text-white ${
              product.badge === 'HOT' ? 'bg-rose-600' :
              product.badge === 'NEW' ? 'bg-emerald-600' :
              'bg-amber-600'
            }`}>
              {product.badge}
            </span>
          )}
        </div>
      )}

      {/* TOP RIGHT ICONS (WISHLIST & 3D WALL PREVIEW) */}
      <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`p-1.5 rounded-full shadow-xs backdrop-blur-md transition-all hover:scale-110 flex items-center justify-center cursor-pointer ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-300'
              : 'bg-white/90 hover:bg-white text-slate-600 hover:text-rose-600'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenWallModal(product);
          }}
          className="bg-white/90 hover:bg-white text-slate-700 hover:text-indigo-600 p-1.5 rounded-full shadow-xs backdrop-blur-md transition-all hover:scale-110 flex items-center justify-center cursor-pointer"
          title="See on wall (দেওয়ালে দেখুন)"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* PRODUCT IMAGE CONTAINER */}
      <div
        onClick={() => onSelectProduct(product)}
        className="relative aspect-square bg-slate-50 overflow-hidden cursor-pointer group-hover:opacity-95"
      >
        <img
          src={product.image_url}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* CARD CONTENT */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* PRODUCT TITLE (2-LINE CLAMP) */}
          <h3
            onClick={() => onSelectProduct(product)}
            className="font-bold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2 hover:text-indigo-600 cursor-pointer transition-colors min-h-[2.5rem]"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* PRICING & DISCOUNT */}
          <div className="pt-0.5 space-y-0.5">
            {product.old_price && product.old_price > product.price ? (
              <div className="text-xs text-slate-400 line-through font-medium">
                {formatPrice(product.old_price)}
              </div>
            ) : (
              <div className="text-xs text-transparent select-none">&nbsp;</div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {formatPrice(product.price)}
              </span>

              {discountPercent && (
                <span className="text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md">
                  -{discountPercent}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* STACKED BUTTONS: Add to Cart (Drawer) & Order Now (Yellow Direct Checkout) */}
        <div className="pt-3 space-y-2 mt-auto">
          {product.stock <= 0 ? (
            <button
              type="button"
              disabled
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed select-none flex items-center justify-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              <span>স্টক শেষ (Out of Stock)</span>
            </button>
          ) : (
            <>
              {/* BUTTON 1: Add to Cart (Sweeps open side drawer) */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition select-none cursor-pointer active:scale-98 shadow-xs"
              >
                <ShoppingCart className="w-4 h-4 shrink-0 text-white" />
                <span>Add to Cart</span>
              </button>

              {/* BUTTON 2: Order Now (Yellow button -> Direct checkout) */}
              <button
                type="button"
                onClick={handleOrderNow}
                className="w-full py-2.5 px-3 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 shadow-sm transition select-none cursor-pointer active:scale-98"
              >
                <Zap className="w-4 h-4 fill-slate-950 text-slate-950 shrink-0" />
                <span>Order Now</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
