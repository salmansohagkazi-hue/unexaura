import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, CartItem, User, CurrencyConfig, StoreSettings, ProductSize, Coupon, Order } from '../types';
import { CURRENCIES, INITIAL_SETTINGS, INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_COUPONS } from '../data/mockData';
import { calculateDeliveryFee, DeliveryFeeDetails, isAyatulKursiProduct } from '../utils/delivery';
import { getAccessToken } from '../lib/firebase';
import { appendOrdersToSheet } from '../lib/googleSheets';
import { trackAddToCart, trackPurchase } from '../utils/analytics';

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
  addToCart: (product: Product, quantity?: number, selectedSize?: ProductSize) => void;
  updateCartQty: (productId: number, quantity: number, sizeId?: string) => void;
  removeFromCart: (productId: number, sizeId?: string) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getCartSubtotal: () => number;
  getCartWeight: () => number;
  formatPrice: (bdtAmount: number) => string;
  setActiveModalProduct: (p: Product | null) => void;
  showToast: (msg: string) => void;
  setUser: (u: User | null) => void;
  refreshProducts: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshOrders: () => Promise<Order[]>;
  restoreOrders: (ordersList: Order[]) => Promise<boolean>;
  addOrder: (orderPayload: any) => Promise<Order>;
  updateOrderStatus: (orderId: number, status: string, paymentStatus?: string) => Promise<boolean>;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;

  toggleWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  getWishlistCount: () => number;
  getWishlistProducts: () => Product[];

  // Product Management
  addProduct: (product: any) => Promise<Product>;
  updateProduct: (product: Product) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;

  // Coupon Management
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  addCoupon: (coupon: Omit<Coupon, 'id'>) => void;
  deleteCoupon: (id: number) => void;

  // Category Management
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: number, cat: Partial<Category>) => void;
  deleteCategory: (id: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('unex_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out deleted old mock products (id 1 to 6)
          const validInitialIds = new Set(INITIAL_PRODUCTS.map(p => p.id));
          const updated = INITIAL_PRODUCTS.map(initP => {
            const savedP = parsed.find((p: Product) => p.id === initP.id);
            return savedP ? { ...initP, ...savedP, category_id: initP.category_id, category_name: initP.category_name, image_url: initP.image_url, room_images: initP.room_images, sizes: initP.sizes } : initP;
          });
          const customAdminProducts = parsed.filter((p: Product) => !validInitialIds.has(p.id) && p.id > 10);
          return [...updated, ...customAdminProducts];
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
          return INITIAL_CATEGORIES.map(initC => {
            const savedC = parsed.find((c: Category) => c.id === initC.id || c.slug === initC.slug);
            return savedC ? { ...savedC, image_url: initC.image_url, name: initC.name, item_count: initC.item_count } : initC;
          });
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
      return saved ? JSON.parse(saved) : [];
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

      // Merge & deduplicate by order_number
      const map = new Map<string, Order>();
      localOrders.forEach(o => {
        if (o && o.order_number) map.set(String(o.order_number), o);
      });
      serverOrders.forEach(o => {
        if (o && o.order_number) map.set(String(o.order_number), o);
      });

      const merged = Array.from(map.values()).sort((a, b) => {
        const numA = parseInt(String(a.order_number || '').replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(String(b.order_number || '').replace(/\D/g, ''), 10) || 0;
        return numB - numA;
      });

      setOrders(merged);
      try {
        localStorage.setItem('unex_placed_orders', JSON.stringify(merged));
      } catch {}

      // Background sync unsaved local orders to server DB
      const unsyncedLocals = localOrders.filter(lo => lo && lo.order_number && !serverOrders.some(so => so.order_number === lo.order_number));
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

    const fullPayload = {
      ...orderPayload,
      client_max_serial: clientMaxSerial,
      existing_order_numbers: existingOrderNumbers
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

    // Save to local storage & state without overwriting existing orders
    const updatedLocal = [createdOrder, ...existingLocal.filter(o => o.order_number !== createdOrder!.order_number)];
    setOrders(updatedLocal);
    try {
      localStorage.setItem('unex_placed_orders', JSON.stringify(updatedLocal));
    } catch {}

    // Auto-sync to Google Sheets Webhook (24/7 background sync without OAuth token expiry)
    const targetWebhook = settings.google_sheet_webhook_url || INITIAL_SETTINGS.google_sheet_webhook_url;
    if (targetWebhook && createdOrder) {
      try {
        const itemsSummary = Array.isArray(createdOrder.items)
          ? createdOrder.items.map((it: any) => `${it.product_name || it.name || 'Product'}${it.selected_size_name ? ` (${it.selected_size_name})` : ''} x${it.quantity || 1}`).join('; ')
          : 'N/A';

        const payload = {
          timestamp: createdOrder.created_at || new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }),
          order_number: createdOrder.order_number,
          customer_name: createdOrder.user_name || 'Customer',
          customer_phone: createdOrder.user_phone || '',
          customer_email: createdOrder.user_email || '',
          shipping_address: createdOrder.shipping_address || '',
          city: createdOrder.city || '',
          delivery_zone: createdOrder.delivery_zone === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka',
          items_summary: itemsSummary,
          total_weight_grams: createdOrder.total_weight_grams || 0,
          delivery_fee: createdOrder.delivery_charge !== undefined ? createdOrder.delivery_charge : 0,
          subtotal: createdOrder.subtotal_amount !== undefined ? createdOrder.subtotal_amount : 0,
          total_amount: createdOrder.total_amount || 0,
          payment_method: createdOrder.payment_method === 'cod' ? 'ক্যাশ অন ডেলিভারি (Cash on Delivery)' : createdOrder.payment_method,
          payment_details: createdOrder.payment_details || 'N/A',
          payment_status: createdOrder.payment_status || 'Pending',
          status: createdOrder.status || 'Pending'
        };

        // 1. Direct browser fetch with mode: 'no-cors' (fire-and-forget direct to Google Apps Script)
        fetch(targetWebhook, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(e => console.warn('Direct client webhook ping error:', e));

        // 2. Server-side proxy fetch (ensures server container also dispatches cleanly)
        fetch('/api/google-sheets/sync-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: createdOrder, webhook_url: targetWebhook })
        }).catch(e => console.warn('Server sync order ping error:', e));
      } catch (err) {
        console.warn('Webhook auto-sync error:', err);
      }
    }

    // Auto-sync to Google Sheets if connected via Google Drive OAuth
    if (settings.google_sheet_id && settings.google_sheet_autosync_enabled !== false) {
      const token = getAccessToken();
      if (token) {
        appendOrdersToSheet(token, settings.google_sheet_id, [createdOrder]).catch(e => {
          console.warn('Background Google Sheets auto-sync error:', e);
        });
      }
    }

    // Trigger GA4 & Meta Pixel Purchase event
    if (createdOrder) {
      trackPurchase(createdOrder);
    }

    return createdOrder;
  };

  const updateOrderStatus = async (orderId: number, status: string, paymentStatus?: string): Promise<boolean> => {
    setOrders(prev => {
      const updated = prev.map(o => o.id === orderId ? { ...o, status: status as any, payment_status: paymentStatus ? (paymentStatus as any) : o.payment_status } : o);
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
      return true;
    } catch (e) {
      console.warn('Order status update on server failed, updated locally:', e);
      return false;
    }
  };

  // Fetch products, categories & orders on mount
  const refreshProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (data.products) {
          const currentCats = categories.length > 0 ? categories : INITIAL_CATEGORIES;
          const enriched = data.products.map((p: Product) => {
            const matchedCat = currentCats.find(c => c.id === p.category_id);
            return {
              ...p,
              category_name: matchedCat ? matchedCat.name : p.category_name
            };
          });
          setProducts(enriched);
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
        if (data.categories) setCategories(data.categories);
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

  // Calculate weight-based delivery charge & COD fee whenever cart or zone changes
  // Policy: Only Ayatul Kursi has 100% Free Delivery. Other products pay weight-based courier charges.
  // If Ayatul Kursi is in cart with other products, Ayatul Kursi weight is waived (0g) and remaining products pay according to their weight.
  useEffect(() => {
    let ayatulKursiWeight = 0;
    let otherProductsWeight = 0;
    let hasAyatulKursi = false;
    let hasOtherProducts = false;

    cart.forEach(item => {
      const isAyatul = isAyatulKursiProduct(item);
      const w = (item.selectedSize ? item.selectedSize.weight_grams : item.product.weight_grams) || 0;
      const totalItemWeight = w * item.quantity;
      if (isAyatul) {
        hasAyatulKursi = true;
        ayatulKursiWeight += totalItemWeight;
      } else {
        hasOtherProducts = true;
        otherProductsWeight += totalItemWeight;
      }
    });

    const totalWeight = ayatulKursiWeight + otherProductsWeight;
    const billableWeight = hasAyatulKursi ? otherProductsWeight : totalWeight;

    const subtotal = cart.reduce((sum, item) => {
      const p = item.selectedSize ? item.selectedSize.price : item.product.price;
      return sum + (p * item.quantity);
    }, 0);

    const details = calculateDeliveryFee(
      billableWeight,
      deliveryZone,
      subtotal,
      settings.free_shipping_threshold_dhaka,
      {
        isAyatulKursiOnly: hasAyatulKursi && !hasOtherProducts,
        hasAyatulKursi,
        hasOtherProducts,
        ayatulKursiWeight,
        totalWeight
      }
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

  const addToCart = (product: Product, quantity: number = 1, selectedSize?: ProductSize) => {
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
    showToast('ক্যাটাগরি মুছে ফেলা হয়েছে');
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
      updateCartQty,
      removeFromCart,
      clearCart,
      getCartCount,
      getCartSubtotal,
      getCartWeight,
      formatPrice,
      setActiveModalProduct,
      showToast,
      setUser,
      refreshProducts,
      refreshCategories,
      refreshOrders,
      restoreOrders,
      addOrder,
      updateOrderStatus,
      updateSettings,
      addProduct,
      updateProduct,
      deleteProduct,
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
      deleteCategory
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
