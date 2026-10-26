import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, CartItem, User, CurrencyConfig, StoreSettings, ProductSize, Coupon, Order } from '../types';
import { CURRENCIES, INITIAL_SETTINGS, INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_COUPONS } from '../data/mockData';
import { calculateDeliveryFee, DeliveryFeeDetails, isAyatulKursiProduct } from '../utils/delivery';
import { getAccessToken } from '../lib/firebase';
import { appendOrdersToSheet } from '../lib/googleSheets';
import { trackAddToCart, trackPurchase } from '../utils/analytics';
import {
  saveOrderToSupabase,
  updateOrderStatusInSupabase,
  updateOrderInSupabase,
  deleteOrderFromSupabase,
  saveProductToSupabase,
  deleteProductFromSupabase,
  updateProductStockInSupabase,
  saveCategoryToSupabase,
  deleteCategoryFromSupabase
} from '../lib/supabase';

interface AppContextType {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  user: User | null;
  currency: CurrencyConfig;
  currencies: CurrencyConfig[];
  settings: StoreSettings;
  deliveryZone: 'none' | 'dhaka' | 'outside_dhaka';
  deliveryCharge: number;
  codFee: number;
  deliveryDetails: DeliveryFeeDetails;
  activeModalProduct: Product | null;
  toastMessage: string | null;
  wishlist: number[];
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  orders: Order[];

  setDeliveryZone: (zone: 'none' | 'dhaka' | 'outside_dhaka') => void;
  setCurrencyCode: (code: CurrencyConfig['code']) => void;
  addToCart: (product: Product, quantity?: number, selectedSize?: ProductSize, openDrawer?: boolean) => void;
  directCheckout: (product: Product, quantity?: number, selectedSize?: ProductSize) => void;
  updateCartQty: (productId: number, quantity: number, sizeId?: string) => void;
  removeFromCart: (productId: number, sizeId?: string) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getCartSubtotal: () => number;
  getCartWeight: () => number;
  formatPrice: (bdtAmount: number) => string;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  setActiveModalProduct: (p: Product | null) => void;
  showToast: (msg: string) => void;
  setUser: (u: User | null) => void;
  refreshProducts: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshOrders: () => Promise<Order[]>;
  restoreOrders: (ordersList: Order[]) => Promise<boolean>;
  addOrder: (orderPayload: any) => Promise<Order>;
  updateOrderStatus: (orderId: number, status: string, paymentStatus?: string) => Promise<boolean>;
  updateOrderPrice: (orderId: number | string, updates: { total_amount?: number; subtotal_amount?: number; discount_amount?: number; delivery_charge?: number; order_notes?: string }) => Promise<boolean>;
  deleteOrder: (id: number | string) => Promise<boolean>;
  syncOrderToGoogleSheet: (order: Order | any) => Promise<{ success: boolean; message: string }>;
  sendToSteadfastCourier: (orderId: number | string, customNote?: string) => Promise<{ success: boolean; message: string; tracking_code?: string; consignment_id?: string | number }>;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;

  toggleWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  getWishlistCount: () => number;
  getWishlistProducts: () => Product[];

  // Product Management
  addProduct: (product: any) => Promise<Product>;
  updateProduct: (product: Product) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;
  updateProductStock: (id: number, stock: number) => Promise<boolean>;

  // Coupon Management
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  addCoupon: (coupon: Omit<Coupon, 'id'>) => void;
  deleteCoupon: (id: number) => void;

  // Category Management
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: number, cat: Partial<Category>) => void;
  deleteCategory: (id: number) => void;

  // Google Sheets Inventory 2-Way Synchronization
  syncInventoryFromSheet: (webhookUrl?: string) => Promise<{ success: boolean; message: string; count?: number }>;
  pushCatalogToSheet: (webhookUrl?: string) => Promise<{ success: boolean; message: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('unex_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: Product) => {
            if (p.id === 10 || p.name?.includes('আয়াতুল কুরসি') || p.slug?.includes('ayatul-kursi')) {
              const cleaned = { ...p, old_price: undefined };
              if (cleaned.sizes) {
                cleaned.sizes = cleaned.sizes.map((s) => ({ ...s, old_price: undefined }));
              }
              return cleaned;
            }
            return p;
          });
        }
      }
    } catch {}
    return INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('unex_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return INITIAL_CATEGORIES;
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('unex_store_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If the saved video was the old demo video, replace it with the new Cloudinary video
        const promoVideo = (!parsed.promo_video_url || parsed.promo_video_url.includes('commondatastorage.googleapis.com') || parsed.promo_video_url.includes('lv_7612302823652445456_20260818160449'))
          ? INITIAL_SETTINGS.promo_video_url
          : parsed.promo_video_url;
        return {
          ...INITIAL_SETTINGS,
          ...parsed,
          google_sheet_webhook_url: (parsed.google_sheet_webhook_url && parsed.google_sheet_webhook_url.trim()) ? parsed.google_sheet_webhook_url : INITIAL_SETTINGS.google_sheet_webhook_url,
          steadfast_api_key: (parsed.steadfast_api_key && parsed.steadfast_api_key.trim()) ? parsed.steadfast_api_key : INITIAL_SETTINGS.steadfast_api_key,
          steadfast_secret_key: (parsed.steadfast_secret_key && parsed.steadfast_secret_key.trim()) ? parsed.steadfast_secret_key : INITIAL_SETTINGS.steadfast_secret_key,
          steadfast_enabled: true,
          promo_video_url: promoVideo,
          best_deal_product_id: parsed.best_deal_product_id || 7
        };
      }
    } catch {}
    return INITIAL_SETTINGS;
  });
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('unex_coupons');
      return saved ? JSON.parse(saved) : INITIAL_COUPONS;
    } catch {
      return INITIAL_COUPONS;
    }
  });
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('unex_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('unex_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currency, setCurrency] = useState<CurrencyConfig>(CURRENCIES[0]);
  const [deliveryZone, setDeliveryZone] = useState<'none' | 'dhaka' | 'outside_dhaka'>('none');
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryFeeDetails>(() => calculateDeliveryFee(0, 'none', 0, INITIAL_SETTINGS.free_shipping_threshold_dhaka));
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
  const [codFee, setCodFee] = useState<number>(0);
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const openCartDrawer = () => setIsCartDrawerOpen(true);
  const closeCartDrawer = () => setIsCartDrawerOpen(false);
  const [wishlist, setWishlist] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('unex_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('unex_placed_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const seenIds = new Set<string | number>();
          return parsed.map((o: Order, idx: number) => {
            let item = o;
            if (item.order_number === 'UA-1009' && item.id === 2) {
              item = { ...item, id: 1009 };
            }
            if (seenIds.has(item.id)) {
              const num = parseInt(String(item.order_number || '').replace(/\D/g, ''), 10);
              item = { ...item, id: num || (Date.now() + idx) };
            }
            seenIds.add(item.id);
            return item;
          });
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // Save cart, wishlist & coupons
  useEffect(() => {
    localStorage.setItem('unex_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('unex_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('unex_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('unex_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('unex_user');
    }
  }, [user]);

  const refreshOrders = async (): Promise<Order[]> => {
    try {
      const res = await fetch('/api/orders');
      let serverOrders: Order[] = [];
      if (res.ok) {
        const data = await res.json();
        serverOrders = data.orders || [];
      }

      let localOrders: Order[] = [];
      try {
        localOrders = JSON.parse(localStorage.getItem('unex_placed_orders') || '[]');
      } catch {}

      // Merge & deduplicate by order_number without losing any order
      const map = new Map<string, Order>();

      // 1. First include existing React state orders
      orders.forEach(o => {
        if (o && o.order_number) map.set(String(o.order_number), o);
      });

      // 2. Include local storage orders
      localOrders.forEach(o => {
        if (o && o.order_number) {
          if (!map.has(String(o.order_number))) {
            map.set(String(o.order_number), o);
          } else {
            map.set(String(o.order_number), { ...map.get(String(o.order_number))!, ...o });
          }
        }
      });

      // 3. Include server orders
      serverOrders.forEach(o => {
        if (o && o.order_number) {
          if (!map.has(String(o.order_number))) {
            map.set(String(o.order_number), o);
          } else {
            map.set(String(o.order_number), { ...map.get(String(o.order_number))!, ...o });
          }
        }
      });

      const seenIds = new Set<string | number>();
      const merged = Array.from(map.values()).map((o, idx) => {
        let item = o;
        if (item.order_number === 'UA-1009' && item.id === 2) {
          item = { ...item, id: 1009 };
        }
        if (seenIds.has(item.id)) {
          const num = parseInt(String(item.order_number || '').replace(/\D/g, ''), 10);
          item = { ...item, id: num || (Date.now() + idx) };
        }
        seenIds.add(item.id);
        return item;
      }).sort((a, b) => {
        const numA = parseInt(String(a.order_number || '').replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(String(b.order_number || '').replace(/\D/g, ''), 10) || 0;
        return numB - numA;
      });

      setOrders(merged);
      try {
        localStorage.setItem('unex_placed_orders', JSON.stringify(merged));
      } catch {}

      // Background sync unsaved local orders to server DB
      const unsyncedLocals = merged.filter(m => m && m.order_number && !serverOrders.some(so => so.order_number === m.order_number));
      if (unsyncedLocals.length > 0) {
        fetch('/api/orders/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientOrders: unsyncedLocals })
        }).catch(() => {});
      }

      return merged;
    } catch (e) {
      console.warn('Orders refresh error, falling back to local storage:', e);
      try {
        const localOrders = JSON.parse(localStorage.getItem('unex_placed_orders') || '[]');
        setOrders(localOrders);
        return localOrders;
      } catch {
        return orders;
      }
    }
  };

  const restoreOrders = async (ordersList: Order[]): Promise<boolean> => {
    if (!Array.isArray(ordersList) || ordersList.length === 0) return false;
    try {
      const res = await fetch('/api/orders/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: ordersList })
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.orders)) {
          setOrders(data.orders);
          localStorage.setItem('unex_placed_orders', JSON.stringify(data.orders));
          return true;
        }
      }
    } catch (e) {
      console.warn('API restore failed, applying local merge fallback:', e);
    }

    try {
      const map = new Map<string, Order>();
      orders.forEach(o => { if (o && o.order_number) map.set(String(o.order_number), o); });
      ordersList.forEach(o => { if (o && o.order_number) map.set(String(o.order_number), o); });
      const merged = Array.from(map.values()).sort((a, b) => {
        const numA = parseInt(String(a.order_number || '').replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(String(b.order_number || '').replace(/\D/g, ''), 10) || 0;
        return numB - numA;
      });
      setOrders(merged);
      localStorage.setItem('unex_placed_orders', JSON.stringify(merged));
      return true;
    } catch {
      return false;
    }
  };

  const addOrder = async (orderPayload: any): Promise<Order> => {
    let existingLocal: Order[] = [];
    try {
      existingLocal = JSON.parse(localStorage.getItem('unex_placed_orders') || '[]');
    } catch {}

    // Find highest serial across current orders and existing local orders
    let clientMaxSerial = 1002;
    const existingOrderNumbers: string[] = [];

    [...orders, ...existingLocal].forEach(o => {
      if (o && o.order_number) {
        existingOrderNumbers.push(o.order_number);
        const match = String(o.order_number).match(/\d+/);
        if (match) {
          const val = parseInt(match[0], 10);
          if (!isNaN(val) && val > clientMaxSerial) {
            clientMaxSerial = val;
          }
        }
      }
    });

    // Extract Meta _fbp and _fbc cookies for Conversions API deduplication & matching
    let fbp = '';
    let fbc = '';
    try {
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split('; ');
        for (const cookie of cookies) {
          if (cookie.startsWith('_fbp=')) fbp = cookie.split('=')[1];
          if (cookie.startsWith('_fbc=')) fbc = cookie.split('=')[1];
        }
      }
    } catch {}

    const fullPayload = {
      ...orderPayload,
      client_max_serial: clientMaxSerial,
      existing_order_numbers: existingOrderNumbers,
      fbp: fbp,
      fbc: fbc
    };

    let createdOrder: Order | null = null;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullPayload)
      });

      if (res.ok) {
        const data = await res.json();
        createdOrder = data.order;
      }
    } catch (err) {
      console.warn('Network issue creating order on server:', err);
    }

    if (!createdOrder) {
      // Local fallback creation
      const nextSerial = clientMaxSerial + 1;
      const subtotal = orderPayload.subtotal_amount || cart.reduce((sum, item) => sum + (item.selectedSize ? item.selectedSize.price : item.product.price) * item.quantity, 0);
      const deliveryChargeVal = orderPayload.delivery_charge !== undefined ? orderPayload.delivery_charge : deliveryCharge;

      createdOrder = {
        id: Date.now(),
        order_number: 'UA-' + nextSerial,
        user_id: orderPayload.user_id || (user ? user.id : null),
        user_name: orderPayload.user_name || 'Customer',
        user_email: orderPayload.user_email || '',
        user_phone: orderPayload.user_phone || '',
        shipping_address: orderPayload.shipping_address || '',
        city: orderPayload.city || 'Dhaka',
        delivery_zone: orderPayload.delivery_zone || deliveryZone,
        total_weight_grams: orderPayload.total_weight_grams || 1000,
        delivery_charge: deliveryChargeVal,
        subtotal_amount: subtotal,
        total_amount: subtotal + deliveryChargeVal,
        payment_method: orderPayload.payment_method || 'cod',
        payment_status: orderPayload.payment_method === 'stripe' ? 'paid' : 'unpaid',
        status: 'pending',
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        tracking_number: 'SF-BD-' + Math.floor(100000 + Math.random() * 900000),
        courier_name: orderPayload.delivery_zone === 'dhaka' ? 'Express Courier Partner' : 'Express Logistics Partner',
        courier_phone: '01623319639',
        estimated_delivery: orderPayload.delivery_zone === 'dhaka' ? 'Within 24-48 Hours' : 'Within 3-5 Business Days',
        tracking_history: [
          { stage: 'Order Placed & Confirmed', timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16), location: 'Tejgaon Factory, Dhaka', details: 'Order received into laser production queue.', completed: true, current: true },
          { stage: 'Precision Laser Cutting', timestamp: 'Pending Queue', location: 'UNEX Laser Lab', details: 'Laser cutting and polishing (Stainless Steel / MS Steel based on design specs).', completed: false },
          { stage: 'Wooden Frame & 3D Hardware Packaging', timestamp: 'Pending Queue', location: 'Packing Hub, Tejgaon', details: 'Custom export boxing with wall mounting spacers.', completed: false },
          { stage: 'Handed to Courier Partner', timestamp: 'Pending Dispatch', location: 'Courier Sorting Hub', details: 'Awaiting courier pick-up.', completed: false },
          { stage: 'Out for Delivery & Handed to Customer', timestamp: 'Pending Delivery', location: orderPayload.city || 'Dhaka', details: 'Final delivery address destination.', completed: false }
        ],
        order_notes: orderPayload.order_notes || '',
        items: orderPayload.items || []
      };
    }

    // Save to local storage & state without overwriting ANY existing orders
    const allMap = new Map<string, Order>();
    orders.forEach(o => { if (o && o.order_number) allMap.set(String(o.order_number), o); });
    existingLocal.forEach(o => { if (o && o.order_number) allMap.set(String(o.order_number), o); });
    allMap.set(String(createdOrder.order_number), createdOrder);

    const updatedMerged = Array.from(allMap.values()).sort((a, b) => {
      const numA = parseInt(String(a.order_number || '').replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(String(b.order_number || '').replace(/\D/g, ''), 10) || 0;
      return numB - numA;
    });

    setOrders(updatedMerged);
    try {
      localStorage.setItem('unex_placed_orders', JSON.stringify(updatedMerged));
    } catch {}

    // Helper to sync an order to Google Sheets
    const syncOrderToGoogleSheet = async (order: any): Promise<{ success: boolean; message: string }> => {
      if (!order) return { success: false, message: 'অর্ডারের তথ্য পাওয়া যায়নি' };
      const targetWebhook = settings.google_sheet_webhook_url || INITIAL_SETTINGS.google_sheet_webhook_url;
      if (!targetWebhook) return { success: false, message: 'Google Sheets Webhook URL কনফিগার করা নেই' };

      try {
        const itemsSummary = Array.isArray(order.items)
          ? order.items.map((it: any) => `${it.product_name || it.name || 'Product'}${it.selected_size_name ? ` (${it.selected_size_name})` : ''} x${it.quantity || 1}`).join('; ')
          : 'N/A';

        const payload = {
          timestamp: order.created_at || new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }),
          order_number: order.order_number,
          customer_name: order.user_name || order.customer_name || 'Customer',
          customer_phone: order.user_phone || order.customer_phone || '',
          customer_email: order.user_email || order.customer_email || '',
          shipping_address: order.shipping_address || order.customer_address || '',
          city: order.city || order.district || '',
          delivery_zone: order.delivery_zone === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka',
          items_summary: itemsSummary,
          total_weight_grams: order.total_weight_grams || 0,
          delivery_fee: order.delivery_charge !== undefined ? order.delivery_charge : 0,
          subtotal: order.subtotal_amount !== undefined ? order.subtotal_amount : 0,
          total_amount: order.total_amount || 0,
          payment_method: order.payment_method === 'cod' ? 'ক্যাশ অন ডেলিভারি (Cash on Delivery)' : order.payment_method,
          payment_details: order.payment_details || order.payment_method || 'N/A',
          payment_status: order.payment_status || 'Pending',
          status: order.status || 'Confirmed'
        };

        // 1. Direct browser fetch with mode: 'no-cors'
        fetch(targetWebhook, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(e => console.warn('Direct client webhook ping error:', e));

        // 2. Server-side proxy fetch (ensures server container also dispatches cleanly)
        await fetch('/api/google-sheets/sync-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order, webhook_url: targetWebhook })
        }).catch(e => console.warn('Server sync order ping error:', e));

        // 3. OAuth Sheet append if configured
        if (settings.google_sheet_id && settings.google_sheet_autosync_enabled !== false) {
          const token = getAccessToken();
          if (token) {
            appendOrdersToSheet(token, settings.google_sheet_id, [order]).catch(() => {});
          }
        }

        showToast(`অর্ডার #${order.order_number} সফলভাবে Google Sheet এ সিঙ্ক হয়েছে!`);
        return { success: true, message: 'Google Sheet এ যুক্ত হয়েছে' };
      } catch (err: any) {
        console.warn('Google Sheets sync error:', err);
        return { success: false, message: err.message || 'Sync failed' };
      }
    };

    // Auto-sync to Google Sheets:
    // If google_sheet_sync_on_confirmed_only is false, sync immediately; otherwise wait until order is confirmed by Admin
    if (settings.google_sheet_sync_on_confirmed_only === false && createdOrder) {
      syncOrderToGoogleSheet(createdOrder).catch(e => console.warn('Immediate sheet sync error:', e));
    }

    // Save to Supabase Cloud Database in background (Realtime sync)
    if (createdOrder) {
      saveOrderToSupabase(createdOrder).catch(e => {
        console.warn('Supabase order auto-sync notification:', e);
      });
    }

    // Trigger GA4 & Meta Pixel Purchase event
    if (createdOrder) {
      trackPurchase(createdOrder);
    }

    return createdOrder;
  };

  const syncOrderToGoogleSheet = async (order: any): Promise<{ success: boolean; message: string }> => {
    if (!order) return { success: false, message: 'অর্ডারের তথ্য পাওয়া যায়নি' };
    const targetWebhook = settings.google_sheet_webhook_url || INITIAL_SETTINGS.google_sheet_webhook_url;
    if (!targetWebhook) return { success: false, message: 'Google Sheets Webhook URL কনফিগার করা নেই' };

    try {
      const itemsSummary = Array.isArray(order.items)
        ? order.items.map((it: any) => `${it.product_name || it.name || 'Product'}${it.selected_size_name ? ` (${it.selected_size_name})` : ''} x${it.quantity || 1}`).join('; ')
        : 'N/A';

      const payload = {
        timestamp: order.created_at || new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }),
        order_number: order.order_number,
        customer_name: order.user_name || order.customer_name || 'Customer',
        customer_phone: order.user_phone || order.customer_phone || '',
        customer_email: order.user_email || order.customer_email || '',
        shipping_address: order.shipping_address || order.customer_address || '',
        city: order.city || order.district || '',
        delivery_zone: order.delivery_zone === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka',
        items_summary: itemsSummary,
        total_weight_grams: order.total_weight_grams || 0,
        delivery_fee: order.delivery_charge !== undefined ? order.delivery_charge : 0,
        subtotal: order.subtotal_amount !== undefined ? order.subtotal_amount : 0,
        total_amount: order.total_amount || 0,
        payment_method: order.payment_method === 'cod' ? 'ক্যাশ অন ডেলিভারি (Cash on Delivery)' : order.payment_method,
        payment_details: order.payment_details || order.payment_method || 'N/A',
        payment_status: order.payment_status || 'Pending',
        status: order.status || 'Confirmed'
      };

      fetch(targetWebhook, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(e => console.warn('Direct client webhook ping error:', e));

      await fetch('/api/google-sheets/sync-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order, webhook_url: targetWebhook })
      }).catch(e => console.warn('Server sync order ping error:', e));

      if (settings.google_sheet_id && settings.google_sheet_autosync_enabled !== false) {
        const token = getAccessToken();
        if (token) {
          appendOrdersToSheet(token, settings.google_sheet_id, [order]).catch(() => {});
        }
      }

      showToast(`অর্ডার #${order.order_number} সফলভাবে Google Sheet এ সিঙ্ক হয়েছে!`);
      return { success: true, message: 'Google Sheet এ যুক্ত হয়েছে' };
    } catch (err: any) {
      console.warn('Google Sheets sync error:', err);
      return { success: false, message: err.message || 'Sync failed' };
    }
  };

  const updateOrderStatus = async (orderId: number, status: string, paymentStatus?: string): Promise<boolean> => {
    let orderToSync: Order | undefined;

    setOrders(prev => {
      const updated = prev.map(o => {
        if (o.id === orderId || String(o.order_number) === String(orderId)) {
          const updatedOrd = {
            ...o,
            status: status as any,
            payment_status: paymentStatus ? (paymentStatus as any) : o.payment_status
          };
          orderToSync = updatedOrd;
          return updatedOrd;
        }
        return o;
      });
      try {
        localStorage.setItem('unex_placed_orders', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, payment_status: paymentStatus })
      });
    } catch (e) {
      console.warn('Order status update on server failed, updated locally:', e);
    }

    // Direct client sync to Supabase orders table
    updateOrderStatusInSupabase(orderId, status, paymentStatus).catch(e => {
      console.warn('Supabase order status sync warning:', e);
    });

    // AUTOMATIC GOOGLE SHEET SYNC ON ORDER CONFIRMATION
    if ((status === 'confirmed' || status === 'processing') && orderToSync) {
      syncOrderToGoogleSheet(orderToSync).catch(e => console.warn('Google Sheet auto sync error on confirm:', e));
    }

    return true;
  };

  const updateOrderPrice = async (
    orderId: number | string,
    updates: {
      total_amount?: number;
      subtotal_amount?: number;
      discount_amount?: number;
      delivery_charge?: number;
      order_notes?: string;
    }
  ): Promise<boolean> => {
    setOrders(prev => {
      const updated = prev.map(o => {
        if (String(o.id) === String(orderId) || String(o.order_number) === String(orderId)) {
          return {
            ...o,
            total_amount: updates.total_amount !== undefined ? Number(updates.total_amount) : o.total_amount,
            subtotal_amount: updates.subtotal_amount !== undefined ? Number(updates.subtotal_amount) : o.subtotal_amount,
            discount_amount: updates.discount_amount !== undefined ? Number(updates.discount_amount) : o.discount_amount,
            delivery_charge: updates.delivery_charge !== undefined ? Number(updates.delivery_charge) : o.delivery_charge,
            order_notes: updates.order_notes !== undefined ? updates.order_notes : o.order_notes
          };
        }
        return o;
      });
      try {
        localStorage.setItem('unex_placed_orders', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (e) {
      console.warn('Order price update on server failed, updated locally:', e);
    }

    // Direct client sync to Supabase orders table
    updateOrderInSupabase(orderId, updates).catch(e => {
      console.warn('Supabase order price sync warning:', e);
    });

    showToast('অর্ডারের মূল্য সফলভাবে পরিবর্তন করা হয়েছে!');
    return true;
  };

  const sendToSteadfastCourier = async (
    orderId: number | string,
    customNote?: string
  ): Promise<{ success: boolean; message: string; tracking_code?: string; consignment_id?: string | number }> => {
    const targetOrder = orders.find(o => String(o.id) === String(orderId) || String(o.order_number) === String(orderId));
    if (!targetOrder) {
      return { success: false, message: 'অর্ডার পাওয়া যায়নি' };
    }

    const activeApiKey = (settings.steadfast_api_key || 'mjhiiwurrcir7uqf1kaxi5t8quc4ql4t').trim();
    const activeSecretKey = (settings.steadfast_secret_key || '3vtq7ghmlmjk1y7ormoqot6l').trim();

    if (!activeApiKey || !activeSecretKey) {
      return { success: false, message: 'Steadfast API Key বা Secret Key পাওয়া যায়নি। সেটিংস থেকে কনফিগার করুন।' };
    }

    // Clean phone number (Steadfast expects standard Bangladeshi 11 digits: e.g. 017xxxxxxxx)
    let cleanPhone = String(targetOrder.user_phone || '').trim().replace(/[^\d+]/g, '');
    if (cleanPhone.startsWith('+880')) {
      cleanPhone = '0' + cleanPhone.substring(4);
    } else if (cleanPhone.startsWith('880')) {
      cleanPhone = '0' + cleanPhone.substring(3);
    }

    const recipientName = String(targetOrder.user_name || 'Customer').trim();
    const recipientAddress = String(targetOrder.shipping_address || 'Dhaka').trim();
    const codAmount = targetOrder.payment_status === 'paid' ? 0 : Math.round(Number(targetOrder.total_amount || 0));
    const parcelNote = String(customNote || targetOrder.order_notes || 'Handle with care - Laser cut metal wall art').trim();
    const invoiceNum = String(targetOrder.order_number || `UA-${Date.now()}`);

    let booked = false;
    let trackingCode = '';
    let consignmentId: string | number = '';
    let lastErrorMessage = '';

    // STRATEGY 1: Direct Steadfast Gateway API via portal.packzy.com
    // (Full CORS supported with Access-Control-Allow-Origin: *, works on custom domains like unexaura.xyz, static CDNs, and serverless hosts)
    try {
      const directRes = await fetch('https://portal.packzy.com/api/v1/create_order', {
        method: 'POST',
        headers: {
          'api-key': activeApiKey,
          'secret-key': activeSecretKey,
          'content-type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({
          invoice: invoiceNum,
          recipient_name: recipientName,
          recipient_phone: cleanPhone,
          recipient_address: recipientAddress,
          cod_amount: codAmount,
          note: parcelNote
        })
      });

      const directText = await directRes.text();
      let directData: any = {};
      try {
        directData = JSON.parse(directText);
      } catch {
        directData = { message: directText };
      }

      if (directRes.ok && (directData.status === 200 || directData.status === 201)) {
        const consignment = directData.consignment || directData;
        trackingCode = consignment?.tracking_code || directData?.tracking_code || '';
        consignmentId = consignment?.consignment_id || directData?.consignment_id || '';
        booked = true;
      } else {
        if (directData?.errors && typeof directData.errors === 'object') {
          const firstKey = Object.keys(directData.errors)[0];
          lastErrorMessage = Array.isArray(directData.errors[firstKey])
            ? directData.errors[firstKey][0]
            : JSON.stringify(directData.errors);
        } else {
          lastErrorMessage = directData?.message || '';
        }
      }
    } catch (directErr: any) {
      console.warn('Direct Steadfast API attempt error, attempting backend proxy:', directErr);
    }

    // STRATEGY 2: Backend Proxy (/api/courier/steadfast/create-order)
    // Used if direct call was blocked or failed
    if (!booked && !lastErrorMessage) {
      try {
        const proxyRes = await fetch('/api/courier/steadfast/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            order_id: targetOrder.id,
            invoice: invoiceNum,
            recipient_name: recipientName,
            recipient_phone: cleanPhone,
            recipient_address: recipientAddress,
            cod_amount: codAmount,
            note: parcelNote,
            api_key: activeApiKey,
            secret_key: activeSecretKey
          })
        });

        const proxyText = await proxyRes.text();
        let proxyData: any = {};
        try {
          proxyData = JSON.parse(proxyText);
        } catch {
          proxyData = { message: proxyText };
        }

        if (proxyRes.ok && proxyData.success) {
          trackingCode = proxyData.tracking_code || '';
          consignmentId = proxyData.consignment_id || '';
          booked = true;
        } else {
          lastErrorMessage = proxyData.message || lastErrorMessage;
        }
      } catch (proxyErr: any) {
        console.warn('Proxy Steadfast API attempt error:', proxyErr);
        if (!lastErrorMessage) {
          lastErrorMessage = proxyErr.message || 'নেটওয়ার্ক সংযোগে সমস্যা হয়েছে';
        }
      }
    }

    if (!booked) {
      return {
        success: false,
        message: lastErrorMessage || 'স্টেডফাস্ট কুরিয়ারে বুকিং করতে ব্যর্থ হয়েছে'
      };
    }

    // Update React orders state
    setOrders(prev => {
      const updated = prev.map(o => {
        if (String(o.id) === String(orderId) || String(o.order_number) === String(orderId)) {
          return {
            ...o,
            status: 'shipped' as const,
            courier_name: 'Steadfast Courier',
            tracking_number: trackingCode,
            steadfast_tracking_code: trackingCode,
            steadfast_consignment_id: consignmentId,
            steadfast_status: 'in_review'
          };
        }
        return o;
      });
      try {
        localStorage.setItem('unex_placed_orders', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Dual-sync to Supabase database (Real-time cloud persistence)
    updateOrderInSupabase(targetOrder.order_number, {
      status: 'shipped',
      tracking_number: trackingCode,
      courier_name: 'Steadfast Courier'
    }).catch(e => console.warn('[Supabase Courier Sync]:', e));

    showToast(`সফলভাবে স্টেডফাস্ট কুরিয়ারে বুক করা হয়েছে! ট্র্যাকিং: ${trackingCode}`);
    return {
      success: true,
      message: 'স্টেডফাস্ট কুরিয়ারে বুকিং সফল হয়েছে',
      tracking_code: trackingCode,
      consignment_id: consignmentId
    };
  };

  const deleteOrder = async (orderId: number | string): Promise<boolean> => {
    setOrders(prev => {
      const updated = prev.filter(o => String(o.id) !== String(orderId) && String(o.order_number) !== String(orderId));
      try {
        localStorage.setItem('unex_placed_orders', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Order delete on server failed, deleted locally:', e);
    }

    // Direct client sync to Supabase orders table
    deleteOrderFromSupabase(orderId).catch(e => {
      console.warn('Supabase order delete warning:', e);
    });

    return true;
  };

  // Fetch products, categories & orders on mount
  const refreshProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.products) && data.products.length > 0) {
          const currentCats = categories.length > 0 ? categories : INITIAL_CATEGORIES;
          const enriched = data.products.map((p: Product) => {
            const matchedCat = currentCats.find(c => c.id === p.category_id);
            return {
              ...p,
              category_name: matchedCat ? matchedCat.name : p.category_name
            };
          });
          setProducts(enriched);
          try {
            localStorage.setItem('unex_products', JSON.stringify(enriched));
          } catch {}
        }
      }
    } catch (e) {
      console.warn('API connection falling back to local state:', e);
    }
  };

  const refreshCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
          try {
            localStorage.setItem('unex_categories', JSON.stringify(data.categories));
          } catch {}
        }
      }
    } catch (e) {
      console.warn('API connection falling back to local state:', e);
    }
  };

  const refreshSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
      }
    } catch (e) {
      console.warn('Settings fetch error:', e);
    }
  };

  useEffect(() => {
    refreshProducts();
    refreshCategories();
    refreshSettings();
    refreshOrders();
  }, []);

  // Update active currency from settings or user selection
  useEffect(() => {
    const match = CURRENCIES.find(c => c.code === settings.active_currency);
    if (match) setCurrency(match);
  }, [settings.active_currency]);

  // Calculate weight-based delivery charge:
  // Products <= 1 kg (1000g): Inside Dhaka 80 BDT, Outside Dhaka 130 BDT
  // Weight > 1 kg: Increases according to courier weight ratio
  useEffect(() => {
    const totalWeight = cart.reduce((sum, item) => {
      const w = (item.selectedSize ? item.selectedSize.weight_grams : item.product.weight_grams) || 0;
      return sum + (w * item.quantity);
    }, 0);

    const subtotal = cart.reduce((sum, item) => {
      const p = item.selectedSize ? item.selectedSize.price : item.product.price;
      return sum + (p * item.quantity);
    }, 0);

    const details = calculateDeliveryFee(
      totalWeight,
      deliveryZone,
      subtotal,
      settings.free_shipping_threshold_dhaka
    );

    setDeliveryDetails(details);
    setDeliveryCharge(details.baseCharge);
    setCodFee(details.codFee);
  }, [cart, deliveryZone, settings]);

  const setCurrencyCode = (code: CurrencyConfig['code']) => {
    const found = CURRENCIES.find(c => c.code === code);
    if (found) {
      setCurrency(found);
      setSettings(prev => ({ ...prev, active_currency: code }));
      showToast(`Currency changed to ${found.name} (${found.symbol})`);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const addToCart = (product: Product, quantity: number = 1, selectedSize?: ProductSize, openDrawer: boolean = true) => {
    if (product.stock <= 0) {
      showToast(`দুঃখিত! "${product.name}" প্রোডাক্টটি বর্তমানে স্টক আউট (Out of Stock)।`);
      return;
    }

    const sizeToUse = selectedSize || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);

    let addedSuccessfully = true;

    setCart(prev => {
      const existingIndex = prev.findIndex(item =>
        item.product.id === product.id &&
        ((!item.selectedSize && !sizeToUse) || (item.selectedSize?.id === sizeToUse?.id))
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        if (newQty > product.stock) {
          showToast(`দুঃখিত! স্টকে সর্বোচ্চ ${product.stock} টি রয়েছে।`);
          updated[existingIndex].quantity = product.stock;
          addedSuccessfully = false;
        } else {
          updated[existingIndex].quantity = newQty;
        }
        return updated;
      }
      const initialQty = Math.min(quantity, product.stock);
      return [...prev, { product, quantity: initialQty, selectedSize: sizeToUse }];
    });

    if (addedSuccessfully) {
      const sizeStr = sizeToUse ? ` (${sizeToUse.name})` : '';
      showToast(`Added "${product.name}"${sizeStr} to cart!`);
      if (openDrawer) {
        setIsCartDrawerOpen(true);
      } else {
        setIsCartDrawerOpen(false);
      }
      trackAddToCart(
        {
          id: product.id,
          name: product.name,
          price: sizeToUse ? sizeToUse.price : product.price,
          category_name: product.category_name,
          slug: product.slug
        },
        quantity,
        sizeToUse?.name
      );
    }
  };

  const directCheckout = (product: Product, quantity: number = 1, selectedSize?: ProductSize) => {
    setIsCartDrawerOpen(false);
    addToCart(product, quantity, selectedSize, false);
  };

  const updateCartQty = (productId: number, quantity: number, sizeId?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, sizeId);
      return;
    }
    setCart(prev => prev.map(item => {
      const isSameProduct = item.product.id === productId;
      const isSameSize = sizeId ? item.selectedSize?.id === sizeId : true;
      return (isSameProduct && isSameSize) ? { ...item, quantity } : item;
    }));
  };

  const removeFromCart = (productId: number, sizeId?: string) => {
    setCart(prev => prev.filter(item => {
      if (item.product.id !== productId) return true;
      if (sizeId && item.selectedSize?.id !== sizeId) return true;
      return false;
    }));
    showToast('Item removed from cart');
  };

  const clearCart = () => setCart([]);

  const getCartCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);

  const getCartSubtotal = () => cart.reduce((sum, item) => {
    const price = item.selectedSize ? item.selectedSize.price : item.product.price;
    return sum + (price * item.quantity);
  }, 0);

  const getCartWeight = () => cart.reduce((sum, item) => {
    const weight = item.selectedSize ? item.selectedSize.weight_grams : item.product.weight_grams;
    return sum + (weight * item.quantity);
  }, 0);

  const formatPrice = (bdtAmount: number) => {
    if (currency.code === 'BDT') {
      return `৳${Math.round(bdtAmount).toLocaleString()}`;
    }
    const converted = bdtAmount * currency.rate;
    return `${currency.symbol}${converted.toFixed(2)}`;
  };

  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('unex_store_settings', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
          try {
            localStorage.setItem('unex_store_settings', JSON.stringify(data.settings));
          } catch {}
        }
      }
    } catch {
      // Offline / static hosting fallback
    }
  };

  // Product Management
  const addProduct = async (prodPayload: any): Promise<Product> => {
    const nextId = (Math.max(0, ...products.map(p => p.id)) + 1) || Date.now();
    const newProd: Product = {
      ...prodPayload,
      id: prodPayload.id || nextId,
      slug: prodPayload.slug || (prodPayload.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')
    };

    setProducts(prev => {
      const updated = [newProd, ...prev];
      try {
        localStorage.setItem('unex_products', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProd)
      });
    } catch (e) {
      console.warn('Product saved locally:', e);
    }

    // Direct sync to Supabase products table
    saveProductToSupabase(newProd).catch(e => console.warn('Supabase addProduct note:', e));

    return newProd;
  };

  const updateProduct = async (productToUpdate: Product): Promise<boolean> => {
    setProducts(prev => {
      const updated = prev.map(p => p.id === productToUpdate.id ? { ...p, ...productToUpdate } : p);
      try {
        localStorage.setItem('unex_products', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productToUpdate)
      });
    } catch (e) {
      console.warn('Product updated locally:', e);
    }

    // Direct sync to Supabase products table
    saveProductToSupabase(productToUpdate).catch(e => console.warn('Supabase updateProduct note:', e));

    return true;
  };

  const deleteProduct = async (id: number): Promise<boolean> => {
    setProducts(prev => {
      const updated = prev.filter(p => p.id !== id);
      try {
        localStorage.setItem('unex_products', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
    } catch {}

    // Direct sync to Supabase products table
    deleteProductFromSupabase(id).catch(e => console.warn('Supabase deleteProduct note:', e));

    return true;
  };

  const updateProductStock = async (id: number, stock: number): Promise<boolean> => {
    const safeStock = Math.max(0, Number(stock || 0));
    setProducts(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, stock: safeStock } : p);
      try {
        localStorage.setItem('unex_products', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await fetch(`/api/products/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: safeStock })
      });
    } catch (e) {
      console.warn('Product stock updated locally:', e);
    }

    // Direct sync to Supabase products table
    updateProductStockInSupabase(id, safeStock).catch(e => console.warn('Supabase stock update note:', e));
    return true;
  };

  // Coupons management
  const applyCoupon = (code: string) => {
    if (!code) return { success: false, message: 'কুপন কোড প্রদান করুন।' };
    const match = coupons.find(c => (c.code || '').trim().toUpperCase() === (code || '').trim().toUpperCase() && c.is_active);
    if (!match) {
      return { success: false, message: 'ইনভ্যালিড কুপন কোড! অনুগ্রহ করে সঠিক কোড দিন।' };
    }
    setAppliedCoupon(match);
    return { success: true, message: `কুপন "${match.code}" সফলভাবে অ্যাপ্লাই করা হয়েছে! (${match.discount_percentage}% ডিসকাউন্ট)` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('কুপন ডিসকাউন্ট রিমুভ করা হয়েছে');
  };

  const addCoupon = (newCoupon: Omit<Coupon, 'id'>) => {
    const newId = Date.now();
    setCoupons(prev => {
      const updated = [...prev, { ...newCoupon, id: newId }];
      try {
        localStorage.setItem('unex_coupons', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast(`কুপন কোড "${newCoupon.code}" যোগ করা হয়েছে!`);
  };

  const deleteCoupon = (id: number) => {
    setCoupons(prev => {
      const updated = prev.filter(c => c.id !== id);
      try {
        localStorage.setItem('unex_coupons', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast('কুপন মুছে ফেলা হয়েছে');
  };

  // Category management
  const addCategory = (catData: Omit<Category, 'id'>) => {
    const newId = (Math.max(0, ...categories.map(c => c.id)) + 1) || Date.now();
    const newCat: Category = {
      ...catData,
      id: newId,
      slug: catData.slug || (catData.name || '').toLowerCase().replace(/\s+/g, '-')
    };
    setCategories(prev => {
      const updated = [...prev, newCat];
      try {
        localStorage.setItem('unex_categories', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCat)
    }).catch(() => {});

    // Direct sync to Supabase categories table
    saveCategoryToSupabase(newCat).catch(e => console.warn('Supabase addCategory note:', e));

    showToast(`ক্যাটাগরি "${newCat.name}" তৈরি করা হয়েছে!`);
  };

  const updateCategory = (id: number, catData: Partial<Category>) => {
    setCategories(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, ...catData } : c);
      try {
        localStorage.setItem('unex_categories', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...catData })
    }).catch(() => {});

    // Direct sync to Supabase categories table
    saveCategoryToSupabase({ id, ...catData }).catch(e => console.warn('Supabase updateCategory note:', e));

    showToast('ক্যাটাগরি আপডেট করা হয়েছে!');
  };

  const deleteCategory = (id: number) => {
    setCategories(prev => {
      const updated = prev.filter(c => c.id !== id);
      try {
        localStorage.setItem('unex_categories', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    fetch(`/api/categories/${id}`, { method: 'DELETE' }).catch(() => {});
    fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id })
    }).catch(() => {});

    // Direct sync to Supabase categories table
    deleteCategoryFromSupabase(id).catch(e => console.warn('Supabase deleteCategory note:', e));

    showToast('ক্যাটাগরি মুছে ফেলা হয়েছে');
  };

  // Google Sheets Inventory 2-Way Synchronization Handlers
  const syncInventoryFromSheet = async (webhookUrl?: string): Promise<{ success: boolean; message: string; count?: number }> => {
    try {
      const url = webhookUrl || settings.google_sheet_webhook_url || INITIAL_SETTINGS.google_sheet_webhook_url;
      if (!url) {
        return { success: false, message: 'Google Sheet Webhook URL পাওয়া যায়নি।' };
      }

      const res = await fetch(`/api/inventory/pull-from-sheet?webhook_url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        if (Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
          try {
            localStorage.setItem('unex_products', JSON.stringify(data.products));
          } catch {}
        }
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
          try {
            localStorage.setItem('unex_categories', JSON.stringify(data.categories));
          } catch {}
        }
        showToast(data.message || 'গুগল শিট থেকে সফলভাবে ইনভেন্টরি সিঙ্ক হয়েছে!');
        return { success: true, message: data.message, count: data.products_count };
      } else {
        return { success: false, message: data.message || 'সিঙ্ক ব্যর্থ হয়েছে।' };
      }
    } catch (e: any) {
      return { success: false, message: e.message || 'সার্ভার সংযোগ সমস্যা।' };
    }
  };

  const pushCatalogToSheet = async (webhookUrl?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const url = webhookUrl || settings.google_sheet_webhook_url || INITIAL_SETTINGS.google_sheet_webhook_url;
      if (!url) {
        return { success: false, message: 'Google Sheet Webhook URL পাওয়া যায়নি।' };
      }

      const res = await fetch('/api/inventory/push-to-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhook_url: url })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'গুগল শিটে সম্পূর্ণ ক্যাটালগ এক্সপোর্ট হয়েছে!');
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'ক্যাটালগ এক্সপোর্ট ব্যর্থ হয়েছে।' };
      }
    } catch (e: any) {
      return { success: false, message: e.message || 'সার্ভার সংযোগ সমস্যা।' };
    }
  };

  const toggleWishlist = (productId: number) => {
    const targetProduct = products.find(p => p.id === productId);
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast(targetProduct ? `Removed "${targetProduct.name}" from wishlist` : 'Removed item from wishlist');
        return prev.filter(id => id !== productId);
      } else {
        showToast(targetProduct ? `Saved "${targetProduct.name}" to your wishlist!` : 'Saved to wishlist!');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: number) => wishlist.includes(productId);
  const getWishlistCount = () => wishlist.length;
  const getWishlistProducts = () => products.filter(p => wishlist.includes(p.id));

  return (
    <AppContext.Provider value={{
      products,
      categories,
      cart,
      user,
      currency,
      currencies: CURRENCIES,
      settings,
      deliveryZone,
      deliveryCharge,
      codFee,
      deliveryDetails,
      activeModalProduct,
      toastMessage,
      wishlist,
      coupons,
      appliedCoupon,
      orders,
      setDeliveryZone,
      setCurrencyCode,
      addToCart,
      directCheckout,
      updateCartQty,
      removeFromCart,
      clearCart,
      getCartCount,
      getCartSubtotal,
      getCartWeight,
      formatPrice,
      isCartDrawerOpen,
      setIsCartDrawerOpen,
      openCartDrawer,
      closeCartDrawer,
      setActiveModalProduct,
      showToast,
      setUser,
      refreshProducts,
      refreshCategories,
      refreshOrders,
      restoreOrders,
      addOrder,
      updateOrderStatus,
      updateOrderPrice,
      deleteOrder,
      syncOrderToGoogleSheet,
      sendToSteadfastCourier,
      updateSettings,
      addProduct,
      updateProduct,
      deleteProduct,
      updateProductStock,
      toggleWishlist,
      isInWishlist,
      getWishlistCount,
      getWishlistProducts,
      applyCoupon,
      removeCoupon,
      addCoupon,
      deleteCoupon,
      addCategory,
      updateCategory,
      deleteCategory,
      syncInventoryFromSheet,
      pushCatalogToSheet
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
