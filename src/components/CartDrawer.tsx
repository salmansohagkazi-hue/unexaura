import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShoppingCart,
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  ShoppingBag,
  Sparkles
} from 'lucide-react';

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
      className={`fixed inset-0 z-50 transition-visibility duration-300 ${
        isOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
      }`}
      aria-hidden={!isOpen}
    >
      {/* SEMI-TRANSPARENT BACKDROP */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 cursor-pointer ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* SLIDE-OVER DRAWER PANEL FROM RIGHT */}
      <div
        ref={drawerRef}
        className={`fixed inset-y-0 right-0 max-w-full flex w-full sm:max-w-md bg-white shadow-2xl flex-col z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* DRAWER HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Shopping Cart</span>
                {totalItems > 0 && (
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                    {totalItems} টি পণ্য
                  </span>
                )}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close cart drawer"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* DRAWER BODY: ITEMS LIST */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 divide-y divide-slate-100">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 my-auto">
              <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">আপনার কার্ট খালি</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  আপনার পছন্দের প্রিমিয়াম স্টেইনলেস স্টিল ইসলামিক ওয়াল আর্ট কার্টে যুক্ত করুন।
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onNavigate('shop');
                }}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                পণ্য দেখুন (Browse Products)
              </button>
            </div>
          ) : (
            cart.map((item, idx) => {
              const product = item.product;
              const unitPrice = item.selectedSize ? item.selectedSize.price : product.price;
              const oldPrice = item.selectedSize?.old_price || product.old_price;
              const discountPercent = oldPrice && oldPrice > unitPrice
                ? Math.round(((oldPrice - unitPrice) / oldPrice) * 100)
                : null;

              return (
                <div
                  key={`${product.id}-${item.selectedSize?.id || 'standard'}-${idx}`}
                  className="pt-3.5 first:pt-0 flex items-start gap-3.5 group"
                >
                  {/* THUMBNAIL WITH DISCOUNT BADGE */}
                  <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {discountPercent && (
                      <span className="absolute bottom-1 left-1 bg-black/80 backdrop-blur-xs text-white text-[10px] font-black px-1.5 py-0.5 rounded-md border border-white/20">
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
                        className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2 hover:text-indigo-600 cursor-pointer transition-colors"
                      >
                        {product.name}
                      </h4>
                      {item.selectedSize && (
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          সাইজ: {item.selectedSize.name}
                        </p>
                      )}
                    </div>

                    {/* PRICING & QUANTITY ROW (EXACTLY AS IN SCREENSHOT 2) */}
                    <div className="flex items-center justify-between gap-2 mt-2">
                      <div className="flex flex-col">
                        {oldPrice && oldPrice > unitPrice && (
                          <span className="text-[11px] text-slate-400 line-through">
                            {formatPrice(oldPrice)}
                          </span>
                        )}
                        <span className="text-sm sm:text-base font-extrabold text-slate-900">
                          {formatPrice(unitPrice)}
                        </span>
                      </div>

                      {/* QUANTITY CONTROL BUTTONS */}
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-0.5">
                        {item.quantity === 1 ? (
                          <button
                            type="button"
                            onClick={() => removeFromCart(product.id, item.selectedSize?.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => updateCartQty(product.id, item.quantity - 1, item.selectedSize?.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-200 transition cursor-pointer font-bold"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <span className="w-6 text-center text-xs font-black text-slate-800">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateCartQty(product.id, item.quantity + 1, item.selectedSize?.id)}
                          disabled={item.quantity >= product.stock}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-200 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                          title="Increase quantity"
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
          <div className="p-4 sm:p-5 bg-white border-t border-slate-100 space-y-3.5 shadow-lg">
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

            {/* ACTION BUTTONS (EXACTLY MATCHING SCREENSHOT 2) */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigate('checkout');
                }}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Proceed to Checkout</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigate('cart');
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-white hover:bg-indigo-50/50 border border-indigo-200 active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Go to Cart</span>
              </button>
            </div>

            {/* SECURITY ASSURANCE */}
            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
              <CreditCard className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span>Digital payments are secured with encryption</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
