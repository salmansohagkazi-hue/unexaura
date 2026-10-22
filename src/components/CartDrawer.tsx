import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShoppingCart,
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  CreditCard,
  ShoppingBag
} from 'lucide-react';
import { isAyatulKursiProduct } from '../utils/delivery';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, params?: any) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onNavigate }) => {
  const {
    cart,
    removeFromCart,
    updateCartQty,
    getCartSubtotal,
    getCartCount,
    formatPrice,
    deliveryDetails
  } = useApp();

  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const totalItems = getCartCount();
  const subtotal = getCartSubtotal();

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden={!isOpen}
    >
      {/* SEMI-TRANSPARENT BACKDROP (CLICK TO CLOSE) */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* SLIDE-OVER DRAWER (NOT FULL SCREEN ON MOBILE: 82% WIDTH SO BACKDROP IS VISIBLE) */}
      <div
        ref={drawerRef}
        className={`fixed inset-y-0 right-0 w-[84%] sm:w-[380px] md:max-w-md bg-white shadow-2xl flex flex-col z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* DRAWER HEADER (EXACTLY AS IN SCREENSHOT 1) */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#6366f1]" />
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Shopping Cart
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close cart"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* DRAWER BODY: ITEMS LIST */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 divide-y divide-slate-100">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 my-auto">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">আপনার কার্ট খালি</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  পছন্দের স্টেইনলেস স্টিল ওয়াল আর্ট কার্টে যোগ করুন।
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onNavigate('shop');
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#6366f1] hover:bg-[#4f46e5] transition shadow-md cursor-pointer"
              >
                পণ্য দেখুন (Shop Designs)
              </button>
            </div>
          ) : (
            cart.map((item, idx) => {
              const product = item.product;
              const isAyatul = isAyatulKursiProduct(product);
              const unitPrice = item.selectedSize ? item.selectedSize.price : product.price;
              const oldPrice = isAyatul ? undefined : (item.selectedSize?.old_price || product.old_price);
              const discountPercent = !isAyatul && oldPrice && oldPrice > unitPrice
                ? Math.round(((oldPrice - unitPrice) / oldPrice) * 100)
                : null;

              return (
                <div
                  key={`${product.id}-${item.selectedSize?.id || 'standard'}-${idx}`}
                  className="pt-4 first:pt-0 flex items-start gap-3 group"
                >
                  {/* THUMBNAIL WITH DISCOUNT BADGE */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {discountPercent && (
                      <span className="absolute bottom-1 left-1 bg-black/85 text-white text-[10px] font-black px-1.5 py-0.2 rounded">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>

                  {/* ITEM DETAILS & QUANTITY CONTROLS */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                    <div>
                      <h4
                        onClick={() => {
                          onClose();
                          onNavigate('product', { slug: product.slug });
                        }}
                        className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-1 hover:text-[#6366f1] cursor-pointer transition-colors"
                        title={product.name}
                      >
                        {product.name}
                      </h4>
                      {item.selectedSize && (
                        <p className="text-[10px] text-slate-500 font-medium">
                          {item.selectedSize.name}
                        </p>
                      )}
                    </div>

                    {/* PRICING & QUANTITY ROW */}
                    <div className="flex items-end justify-between gap-2 mt-1.5">
                      <div>
                        {oldPrice && oldPrice > unitPrice && (
                          <span className="text-[11px] text-slate-400 line-through block leading-none">
                            {formatPrice(oldPrice)}
                          </span>
                        )}
                        <span className="text-sm font-black text-slate-900">
                          {formatPrice(unitPrice)}
                        </span>
                      </div>

                      {/* QUANTITY CONTROLS (TRASH, NUMBER, PLUS) */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.quantity <= 1) {
                              removeFromCart(product.id, item.selectedSize?.id);
                            } else {
                              updateCartQty(product.id, item.quantity - 1, item.selectedSize?.id);
                            }
                          }}
                          className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-red-600 hover:bg-slate-50 transition cursor-pointer"
                          title={item.quantity <= 1 ? 'Remove' : 'Decrease'}
                        >
                          {item.quantity <= 1 ? (
                            <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                          ) : (
                            <Minus className="w-3 h-3 text-slate-600" />
                          )}
                        </button>

                        <span className="w-5 text-center text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateCartQty(product.id, item.quantity + 1, item.selectedSize?.id)}
                          disabled={item.quantity >= product.stock}
                          className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                          title="Increase"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* DRAWER FOOTER: SUB-TOTAL, CHECKOUT BUTTONS & SECURITY NOTE */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 bg-white border-t border-slate-100 space-y-3 shadow-lg">
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Subtotal ({totalItems} items)</span>
                <span className="font-bold text-slate-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span className="font-medium text-slate-500">
                  {deliveryDetails.baseCharge === 0 ? 'ফ্রি ডেলিভারি' : 'Not Calculated'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-base font-black text-slate-900">
                <span>Total</span>
                <span className="text-lg font-black text-[#0f3d44]">
                  {formatPrice(subtotal)}
                </span>
              </div>
            </div>

            {/* ACTION BUTTONS (EXACTLY MATCHING SCREENSHOT 1) */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigate('checkout');
                }}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-black text-white bg-[#6366f1] hover:bg-[#4f46e5] shadow-lg shadow-indigo-600/25 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4 text-white" />
                <span>Proceed to Checkout</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigate('checkout');
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-[#6366f1] hover:text-[#4f46e5] bg-white hover:bg-indigo-50/50 border border-[#6366f1]/40 active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Go to Cart</span>
              </button>
            </div>

            {/* SECURITY ASSURANCE */}
            <div className="pt-1 flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
              <CreditCard className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span>Digital payments are secured with encryption</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
