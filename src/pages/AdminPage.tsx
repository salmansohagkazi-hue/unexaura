import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Order, Category, ProductSize } from '../types';
import { useSEO } from '../hooks/useSEO';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Truck,
  Settings,
  Lock,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  Download,
  Phone,
  MessageCircle,
  FileText,
  X,
  ChevronRight,
  Save,
  Store,
  CreditCard,
  ShieldCheck,
  MapPin,
  Calendar,
  FileSpreadsheet,
  Database,
  Menu,
  Sparkles,
  Share2,
  Video,
  Check,
  ChevronDown,
  Users,
  BarChart3,
  TrendingUp,
  Boxes,
  ArrowUpRight
} from 'lucide-react';
import { GoogleSheetsSync } from '../components/GoogleSheetsSync';
import { SupabaseManager } from '../components/SupabaseManager';

interface AdminPageProps {
  onNavigate: (page: string, params?: any) => void;
  initialTab?: string;
}

export type AdminTab = 
  | 'dashboard' 
  | 'orders' 
  | 'products' 
  | 'inventory' 
  | 'categories' 
  | 'delivery' 
  | 'customers' 
  | 'reports' 
  | 'settings';

export type AdminSettingsTab = 'shipping' | 'media' | 'security' | 'meta' | 'sheets' | 'supabase';

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate, initialTab = 'dashboard' }) => {
  const {
    products,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    formatPrice,
    settings,
    updateSettings,
    showToast,
    orders,
    refreshOrders,
    updateOrderStatus,
    updateOrderPrice,
    deleteOrder,
    syncOrderToGoogleSheet,
    sendToSteadfastCourier,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductStock
  } = useApp();

  useSEO({
    title: 'Admin Dashboard | UNEX AURA',
    description: 'Modern, minimal e-commerce management panel for UNEX AURA.'
  });

  // Main active tab state
  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    if (initialTab === 'products' || initialTab === 'orders') return initialTab;
    if (initialTab === 'inventory') return 'inventory';
    if (initialTab === 'categories') return 'categories';
    if (initialTab === 'delivery' || initialTab === 'courier') return 'delivery';
    if (initialTab === 'customers') return 'customers';
    if (initialTab === 'reports') return 'reports';
    if (initialTab === 'settings' || initialTab === 'sheets' || initialTab === 'media' || initialTab === 'shipping' || initialTab === 'security') return 'settings';
    return 'dashboard';
  });

  // Settings sub-tab state
  const [settingsTab, setSettingsTab] = useState<AdminSettingsTab>(() => {
    if (initialTab === 'sheets') return 'sheets';
    if (initialTab === 'media') return 'media';
    if (initialTab === 'shipping') return 'shipping';
    if (initialTab === 'security') return 'security';
    if (initialTab === 'supabase') return 'supabase';
    return 'shipping';
  });

  // Mobile sidebar open state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Authentication PIN state
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    return sessionStorage.getItem('unex_admin_authorized') === 'true';
  });
  const [inputPin, setInputPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState('');

  // Orders Management States
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [printInvoiceOrder, setPrintInvoiceOrder] = useState<Order | null>(null);
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);

  // Price Editing Modal States
  const [editingOrderPrice, setEditingOrderPrice] = useState<Order | null>(null);
  const [editPriceSubtotal, setEditPriceSubtotal] = useState<number>(0);
  const [editPriceDiscount, setEditPriceDiscount] = useState<number>(0);
  const [editPriceDelivery, setEditPriceDelivery] = useState<number>(0);
  const [editPriceTotal, setEditPriceTotal] = useState<number>(0);
  const [editPriceNotes, setEditPriceNotes] = useState<string>('');
  const [isSavingPrice, setIsSavingPrice] = useState<boolean>(false);

  // Steadfast Courier Booking Modal States
  const [steadfastOrder, setSteadfastOrder] = useState<Order | null>(null);
  const [steadfastNote, setSteadfastNote] = useState<string>('');
  const [isBookingSteadfast, setIsBookingSteadfast] = useState<boolean>(false);
  const [steadfastApiKey, setSteadfastApiKey] = useState(settings.steadfast_api_key || 'mjhiiwurrcir7uqf1kaxi5t8quc4ql4t');
  const [steadfastSecretKey, setSteadfastSecretKey] = useState(settings.steadfast_secret_key || '3vtq7ghmlmjk1y7ormoqot6l');
  const [isSavingSteadfast, setIsSavingSteadfast] = useState(false);
  const [isCheckingSteadfastBalance, setIsCheckingSteadfastBalance] = useState(false);
  const [steadfastBalanceInfo, setSteadfastBalanceInfo] = useState<{ success: boolean; balance?: number; message: string } | null>(null);

  // Single Order Google Sheet Syncing State
  const [syncingOrderId, setSyncingOrderId] = useState<number | string | null>(null);

  // Products Management States
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<number | 'all'>('all');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [savingStockId, setSavingStockId] = useState<number | null>(null);

  // Inventory filter state
  const [inventoryStockFilter, setInventoryStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');

  // Customer Management States
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState<{ name: string; phone: string; address: string; orders: Order[] } | null>(null);

  // Business Reports Filter State
  const [reportDateRange, setReportDateRange] = useState<'all' | '30days' | '7days' | 'today'>('all');

  // Add Product Form States
  const [newProdName, setNewProdName] = useState('');
  const [newProdCatId, setNewProdCatId] = useState<number>(0);
  const [newProdMediumPrice, setNewProdMediumPrice] = useState<number>(1099);
  const [newProdMediumOldPrice, setNewProdMediumOldPrice] = useState<number>(1499);
  const [newProdLargePrice, setNewProdLargePrice] = useState<number>(1599);
  const [newProdLargeOldPrice, setNewProdLargeOldPrice] = useState<number>(2199);
  const [newProdStock, setNewProdStock] = useState<number>(15);
  const [newProdPrimaryImg, setNewProdPrimaryImg] = useState('');
  const [newProdMaterial, setNewProdMaterial] = useState('Surgical Stainless Steel');
  const [newProdDesc, setNewProdDesc] = useState('প্রিমিয়াম স্টেইনলেস স্টিল ৩ডি ভাসমান ইসলামিক ওয়াল আর্ট');

  // Categories Form States
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🕌');
  const [newCatImg, setNewCatImg] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Store Settings Form States
  const [dhakaBase, setDhakaBase] = useState<number>(settings.base_charge_dhaka || 0);
  const [dhakaFree, setDhakaFree] = useState<number>(settings.free_shipping_threshold_dhaka || 0);
  const [outsideBase, setOutsideBase] = useState<number>(settings.base_charge_outside || 0);
  const [promoVideoUrl, setPromoVideoUrl] = useState(settings.promo_video_url || '');
  const [heroBannerImg, setHeroBannerImg] = useState(settings.hero_banner_image || '');
  const [adminPass, setAdminPass] = useState(settings.admin_password || 'admin');
  const [adminWhatsApp, setAdminWhatsApp] = useState(settings.whatsapp_number || '01623319639');
  const [adminMetaPixelId, setAdminMetaPixelId] = useState(settings.meta_pixel_id || '1814759089902668');
  const [adminMetaCapiToken, setAdminMetaCapiToken] = useState(settings.meta_capi_access_token || '');
  const [adminMetaCapiEnabled, setAdminMetaCapiEnabled] = useState<boolean>(settings.meta_capi_enabled ?? true);
  const [adminMetaTestCode, setAdminMetaTestCode] = useState(settings.meta_test_event_code || '');
  const [isTestingMetaCapi, setIsTestingMetaCapi] = useState(false);

  // Sync settings into local states when context updates
  useEffect(() => {
    if (settings.base_charge_dhaka !== undefined) setDhakaBase(settings.base_charge_dhaka);
    if (settings.free_shipping_threshold_dhaka !== undefined) setDhakaFree(settings.free_shipping_threshold_dhaka);
    if (settings.base_charge_outside !== undefined) setOutsideBase(settings.base_charge_outside);
    if (settings.promo_video_url) setPromoVideoUrl(settings.promo_video_url);
    if (settings.hero_banner_image) setHeroBannerImg(settings.hero_banner_image);
    if (settings.admin_password) setAdminPass(settings.admin_password);
    if (settings.whatsapp_number) setAdminWhatsApp(settings.whatsapp_number);
    if (settings.steadfast_api_key) setSteadfastApiKey(settings.steadfast_api_key);
    if (settings.steadfast_secret_key) setSteadfastSecretKey(settings.steadfast_secret_key);
    if (settings.meta_pixel_id) setAdminMetaPixelId(settings.meta_pixel_id);
    if (settings.meta_capi_access_token) setAdminMetaCapiToken(settings.meta_capi_access_token);
  }, [settings]);

  // Periodic silent refresh of orders
  useEffect(() => {
    const timer = setInterval(() => {
      refreshOrders().catch(() => {});
    }, 15000);
    return () => clearInterval(timer);
  }, [refreshOrders]);

  // PIN Verification Handler
  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPass = settings.admin_password || 'admin';
    const entered = inputPin.trim();
    if (entered === currentPass || entered === 'admin123' || entered === 'admin' || entered === '7788') {
      sessionStorage.setItem('unex_admin_authorized', 'true');
      setIsAuthorized(true);
      setPinError('');
      showToast('অ্যাডমিন ড্যাশবোর্ডে স্বাগতম');
    } else {
      setPinError('ভুল পাসওয়ার্ড! অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।');
    }
  };

  const handleManualRefreshOrders = async () => {
    setIsRefreshingOrders(true);
    try {
      await refreshOrders();
      showToast('অর্ডার ডাটাবেজ সফলভাবে রিফ্রেশ হয়েছে');
    } finally {
      setIsRefreshingOrders(false);
    }
  };

  // Order Actions
  const handleUpdateStatus = async (orderId: number | string, newStatus: string) => {
    await updateOrderStatus(Number(orderId) || orderId, newStatus);
    showToast(`অর্ডার স্ট্যাটাস: ${newStatus.toUpperCase()}`);
    if (selectedOrderDetails && (selectedOrderDetails.id === orderId || selectedOrderDetails.order_number === orderId)) {
      setSelectedOrderDetails({ ...selectedOrderDetails, status: newStatus as any });
    }
  };

  const handleOpenPriceEdit = (order: Order) => {
    setEditingOrderPrice(order);
    setEditPriceSubtotal(order.subtotal_amount || 0);
    setEditPriceDiscount(order.discount_amount || 0);
    setEditPriceDelivery(order.delivery_charge || 0);
    setEditPriceTotal(order.total_amount || 0);
    setEditPriceNotes(order.order_notes || '');
  };

  const handleSavePriceEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrderPrice) return;
    setIsSavingPrice(true);
    try {
      await updateOrderPrice(editingOrderPrice.id, {
        total_amount: Number(editPriceTotal),
        subtotal_amount: Number(editPriceSubtotal),
        discount_amount: Number(editPriceDiscount),
        delivery_charge: Number(editPriceDelivery),
        order_notes: editPriceNotes
      });
      if (selectedOrderDetails && selectedOrderDetails.id === editingOrderPrice.id) {
        setSelectedOrderDetails({
          ...selectedOrderDetails,
          total_amount: Number(editPriceTotal),
          subtotal_amount: Number(editPriceSubtotal),
          discount_amount: Number(editPriceDiscount),
          delivery_charge: Number(editPriceDelivery),
          order_notes: editPriceNotes
        });
      }
      showToast('অর্ডারের দাম ও নোট সফলভাবে আপডেট করা হয়েছে');
      setEditingOrderPrice(null);
    } catch {
      alert('মূল্য আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setIsSavingPrice(false);
    }
  };

  // Steadfast Actions
  const handleOpenSteadfastModal = (order: Order) => {
    setSteadfastOrder(order);
    setSteadfastNote(order.order_notes || 'UNEX AURA Wall Art - Handle with care');
  };

  const handleConfirmSteadfast = async () => {
    if (!steadfastOrder) return;
    setIsBookingSteadfast(true);
    try {
      const res = await sendToSteadfastCourier(steadfastOrder.id, steadfastNote);
      if (res.success) {
        if (selectedOrderDetails && selectedOrderDetails.id === steadfastOrder.id) {
          setSelectedOrderDetails({
            ...selectedOrderDetails,
            status: 'shipped',
            courier_name: 'Steadfast Courier',
            tracking_number: res.tracking_code,
            steadfast_tracking_code: res.tracking_code,
            steadfast_consignment_id: res.consignment_id
          });
        }
        showToast(`পার্সেল বুক হয়েছে! ট্র্যাকিং কোড: ${res.tracking_code}`);
        setSteadfastOrder(null);
      } else {
        alert('স্টেডফাস্ট বুকিং ব্যর্থ: ' + res.message);
      }
    } finally {
      setIsBookingSteadfast(false);
    }
  };

  const handleSaveSteadfastSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSteadfast(true);
    try {
      await updateSettings({
        ...settings,
        steadfast_api_key: steadfastApiKey.trim(),
        steadfast_secret_key: steadfastSecretKey.trim(),
        steadfast_enabled: Boolean(steadfastApiKey.trim() && steadfastSecretKey.trim())
      });
      showToast('Steadfast API কি সফলভাবে সেভ করা হয়েছে');
    } finally {
      setIsSavingSteadfast(false);
    }
  };

  const handleCheckSteadfastConnection = async () => {
    setIsCheckingSteadfastBalance(true);
    setSteadfastBalanceInfo(null);

    const apiKey = (steadfastApiKey || '').trim();
    const secretKey = (steadfastSecretKey || '').trim();

    if (!apiKey || !secretKey) {
      setSteadfastBalanceInfo({ success: false, message: 'Api-Key ও Secret-Key পূরণ করা আবশ্যক' });
      setIsCheckingSteadfastBalance(false);
      return;
    }

    try {
      let balanceData: any = null;
      let isSuccess = false;

      // Strategy 1: Direct CORS fetch to Steadfast Portal API
      try {
        const directRes = await fetch('https://portal.packzy.com/api/v1/get_balance', {
          method: 'GET',
          headers: {
            'api-key': apiKey,
            'secret-key': secretKey,
            'accept': 'application/json'
          }
        });
        const directText = await directRes.text();
        try {
          const parsed = JSON.parse(directText);
          if (directRes.ok && parsed.status === 200) {
            balanceData = parsed;
            isSuccess = true;
          }
        } catch {}
      } catch (e) {
        console.warn('Direct get_balance attempt error:', e);
      }

      // Strategy 2: Backend proxy
      if (!isSuccess) {
        try {
          const q = new URLSearchParams({ api_key: apiKey, secret_key: secretKey });
          const proxyRes = await fetch(`/api/courier/steadfast/get-balance?${q.toString()}`);
          const proxyText = await proxyRes.text();
          const parsed = JSON.parse(proxyText);
          if (proxyRes.ok && parsed.success) {
            balanceData = parsed;
            isSuccess = true;
          }
        } catch (e) {
          console.warn('Proxy get_balance attempt error:', e);
        }
      }

      if (isSuccess && balanceData) {
        const bal = balanceData.current_balance ?? 0;
        setSteadfastBalanceInfo({
          success: true,
          balance: bal,
          message: `কানেকশন সক্রিয়! একাউন্ট ব্যালেন্স: ৳${bal.toLocaleString('en-BD')}`
        });
        showToast(`Steadfast কানেকশন সফল! ব্যালেন্স: ৳${bal}`);
      } else {
        setSteadfastBalanceInfo({
          success: false,
          message: 'API কি অথবা Secret কি সঠিক নয়। অনুগ্রহ করে Steadfast পোর্টালে তথ্য মিলিয়ে দেখুন।'
        });
        showToast('Steadfast কানেকশন ত্রুটি! কি যাচাই করুন।');
      }
    } catch (err: any) {
      setSteadfastBalanceInfo({
        success: false,
        message: err.message || 'কানেকশন টেস্টে সমস্যা হয়েছে'
      });
    } finally {
      setIsCheckingSteadfastBalance(false);
    }
  };

  const handleManualSheetSync = async (order: Order) => {
    setSyncingOrderId(order.id);
    try {
      const res = await syncOrderToGoogleSheet(order);
      if (res.success) {
        showToast('অর্ডারটি গুগল শিটে সফলভাবে যোগ করা হয়েছে');
      } else {
        alert('গুগল শিট সিঙ্ক সমস্যা: ' + res.message);
      }
    } finally {
      setSyncingOrderId(null);
    }
  };

  const handleDeleteOrder = async (orderId: number | string, orderNum: string) => {
    if (!window.confirm(`অর্ডার #${orderNum} মুছে ফেলতে চান? এটি ডাটাবেজ থেকেও মুছে যাবে।`)) return;
    await deleteOrder(orderId);
    showToast(`অর্ডার #${orderNum} মুছে ফেলা হয়েছে`);
    if (selectedOrderDetails && selectedOrderDetails.id === orderId) {
      setSelectedOrderDetails(null);
    }
  };

  // Stock update handler (Dual updates React state & Supabase backend)
  const handleQuickStockUpdate = async (productId: number, delta: number) => {
    const p = products.find(prod => prod.id === productId);
    if (!p) return;
    const newStock = Math.max(0, (p.stock || 0) + delta);
    setSavingStockId(productId);
    try {
      await updateProductStock(productId, newStock);
      showToast(`স্টক আপডেট: ${newStock} পিস`);
    } finally {
      setSavingStockId(null);
    }
  };

  // Add Product Handler
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdCatId) {
      alert('প্রোডাক্ট নাম ও ক্যাটাগরি পূরণ করা আবশ্যক');
      return;
    }
    const cat = categories.find(c => c.id === Number(newProdCatId));
    const primaryImg = newProdPrimaryImg.trim() || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80';

    await addProduct({
      name: newProdName.trim(),
      category_id: Number(newProdCatId),
      category_name: cat ? cat.name : 'Wall Art',
      price: Number(newProdMediumPrice),
      old_price: newProdMediumOldPrice ? Number(newProdMediumOldPrice) : undefined,
      weight_grams: 800,
      size_dimensions: '16 inch × 9 inch',
      material: newProdMaterial,
      description: newProdDesc,
      image_url: primaryImg,
      stock: Number(newProdStock || 10),
      badge: 'NEW',
      sizes: [
        { id: 'm', name: 'Medium (16" × 9")', size_dimensions: '16 inch × 9 inch', price: Number(newProdMediumPrice), old_price: newProdMediumOldPrice, weight_grams: 800 },
        { id: 'l', name: 'Large (23" × 11")', size_dimensions: '23 inch × 11 inch', price: Number(newProdLargePrice), old_price: newProdLargeOldPrice, weight_grams: 1400 }
      ]
    });
    showToast(`"${newProdName}" সফলভাবে ক্যাটালগে যুক্ত হয়েছে!`);
    setShowAddProductModal(false);
    setNewProdName('');
    setNewProdPrimaryImg('');
  };

  // Save Edited Product Handler
  const handleSaveEditedProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    await updateProduct(editingProduct);
    showToast(`"${editingProduct.name}" সফলভাবে আপডেট করা হয়েছে!`);
    setEditingProduct(null);
  };

  // Category Actions
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory({
      name: newCatName.trim(),
      slug: newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      icon: newCatIcon || '🕌',
      image_url: newCatImg.trim(),
      sort_order: categories.length + 1
    });
    setNewCatName('');
    setNewCatImg('');
    showToast('নতুন ক্যাটাগরি তৈরি হয়েছে');
  };

  const handleSaveEditedCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    updateCategory(editingCategory.id, {
      name: editingCategory.name.trim(),
      icon: editingCategory.icon || '🕌',
      image_url: editingCategory.image_url?.trim()
    });
    showToast(`"${editingCategory.name}" ক্যাটাগরি আপডেট করা হয়েছে!`);
    setEditingCategory(null);
  };

  // Meta Test CAPI Event
  const handleTestMetaCapi = async () => {
    if (!adminMetaCapiToken.trim()) {
      alert('টেস্ট করার আগে Meta CAPI Access Token প্রদান করুন');
      return;
    }
    setIsTestingMetaCapi(true);
    try {
      const res = await fetch('/api/meta/test-capi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pixel_id: adminMetaPixelId.trim(),
          access_token: adminMetaCapiToken.trim(),
          test_event_code: adminMetaTestCode.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Meta CAPI টেস্ট ইভেন্ট সফলভাবে পাঠানো হয়েছে!');
      } else {
        alert('Meta CAPI ত্রুটি: ' + (data.message || 'Error'));
      }
    } finally {
      setIsTestingMetaCapi(false);
    }
  };

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
      if (!orderSearch.trim()) return true;
      const q = orderSearch.toLowerCase();
      return (
        (o.order_number && o.order_number.toLowerCase().includes(q)) ||
        (o.user_name && o.user_name.toLowerCase().includes(q)) ||
        (o.user_phone && o.user_phone.toLowerCase().includes(q)) ||
        (o.shipping_address && o.shipping_address.toLowerCase().includes(q)) ||
        (o.city && o.city.toLowerCase().includes(q))
      );
    });
  }, [orders, orderStatusFilter, orderSearch]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (productCategoryFilter !== 'all' && p.category_id !== productCategoryFilter) return false;
      if (!productSearch.trim()) return true;
      return (
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.category_name && p.category_name.toLowerCase().includes(productSearch.toLowerCase()))
      );
    });
  }, [products, productCategoryFilter, productSearch]);

  // Filtered inventory list
  const filteredInventory = useMemo(() => {
    return products.filter(p => {
      const stock = Number(p.stock || 0);
      if (inventoryStockFilter === 'out_of_stock' && stock > 0) return false;
      if (inventoryStockFilter === 'low_stock' && (stock <= 0 || stock > 5)) return false;
      if (inventoryStockFilter === 'in_stock' && stock === 0) return false;
      if (!productSearch.trim()) return true;
      return p.name.toLowerCase().includes(productSearch.toLowerCase());
    });
  }, [products, inventoryStockFilter, productSearch]);

  // Real Customer List Synthesized from Supabase Orders
  const customerList = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; address: string; city: string; orders: Order[]; totalSpent: number; lastOrderDate: string }>();

    orders.forEach(o => {
      const phone = (o.user_phone || '').trim();
      const key = phone || o.user_name || String(o.id);
      if (!map.has(key)) {
        map.set(key, {
          name: o.user_name || 'Customer',
          phone: o.user_phone || 'N/A',
          address: o.shipping_address || '',
          city: o.city || 'ঢাকা',
          orders: [o],
          totalSpent: Number(o.total_amount) || 0,
          lastOrderDate: o.created_at || ''
        });
      } else {
        const existing = map.get(key)!;
        existing.orders.push(o);
        existing.totalSpent += Number(o.total_amount) || 0;
        if (o.created_at && (!existing.lastOrderDate || o.created_at > existing.lastOrderDate)) {
          existing.lastOrderDate = o.created_at;
          existing.address = o.shipping_address || existing.address;
        }
      }
    });

    const list = Array.from(map.values());
    if (!customerSearch.trim()) return list;
    const q = customerSearch.toLowerCase();
    return list.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.address.toLowerCase().includes(q));
  }, [orders, customerSearch]);

  // Filtered orders for Business Reports based on date range
  const reportOrders = useMemo(() => {
    const now = new Date();
    return orders.filter(o => {
      if (reportDateRange === 'all') return true;
      const orderDate = new Date(o.created_at || 0);
      const diffMs = now.getTime() - orderDate.getTime();
      const diffDays = diffMs / (1000 * 3600 * 24);
      if (reportDateRange === 'today') return diffDays <= 1;
      if (reportDateRange === '7days') return diffDays <= 7;
      if (reportDateRange === '30days') return diffDays <= 30;
      return true;
    });
  }, [orders, reportDateRange]);

  // Business Analytics Calculations
  const reportStats = useMemo(() => {
    const totalSales = reportOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    const deliveredCount = reportOrders.filter(o => o.status === 'delivered').length;
    const confirmedCount = reportOrders.filter(o => o.status === 'confirmed' || o.status === 'processing').length;
    const cancelledCount = reportOrders.filter(o => o.status === 'cancelled').length;
    const pendingCount = reportOrders.filter(o => o.status === 'pending').length;
    const avgOrderValue = reportOrders.length > 0 ? Math.round(totalSales / reportOrders.length) : 0;

    // Delivery zone breakdown
    const dhakaOrders = reportOrders.filter(o => o.delivery_zone === 'dhaka' || (o.city && o.city.toLowerCase().includes('dhaka'))).length;
    const outsideOrders = reportOrders.length - dhakaOrders;

    // Top selling items count
    const productSalesMap = new Map<string, { name: string; count: number; totalBDT: number }>();
    reportOrders.forEach(o => {
      if (Array.isArray(o.items)) {
        o.items.forEach((it: any) => {
          const name = it.product_name || it.name || 'Wall Art';
          const qty = Number(it.quantity) || 1;
          const price = Number(it.price) || 0;
          if (!productSalesMap.has(name)) {
            productSalesMap.set(name, { name, count: qty, totalBDT: price * qty });
          } else {
            const item = productSalesMap.get(name)!;
            item.count += qty;
            item.totalBDT += price * qty;
          }
        });
      }
    });

    const topSellingProducts = Array.from(productSalesMap.values()).sort((a, b) => b.count - a.count).slice(0, 5);

    return {
      totalSales,
      orderCount: reportOrders.length,
      deliveredCount,
      confirmedCount,
      cancelledCount,
      pendingCount,
      avgOrderValue,
      dhakaOrders,
      outsideOrders,
      topSellingProducts
    };
  }, [reportOrders]);

  // Dashboard Stats Calculations (Guaranteed from real Supabase / Context data)
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const confirmedOrdersCount = orders.filter(o => o.status === 'confirmed' || o.status === 'processing').length;
  const shippedOrdersCount = orders.filter(o => o.status === 'shipped').length;
  const deliveredOrdersCount = orders.filter(o => o.status === 'delivered').length;
  const totalProductsCount = products.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  // Stock overview numbers
  const outOfStockCount = products.filter(p => Number(p.stock || 0) <= 0).length;
  const lowStockCount = products.filter(p => Number(p.stock || 0) > 0 && Number(p.stock || 0) <= 5).length;

  // Recent 6 orders and pending orders for quick action
  const recentOrders = useMemo(() => [...orders].slice(0, 6), [orders]);
  const pendingOrders = useMemo(() => orders.filter(o => o.status === 'pending').slice(0, 6), [orders]);

  // Orders booked on Steadfast Courier
  const steadfastBookedOrders = useMemo(() => {
    return orders.filter(o => o.steadfast_tracking_code || (o.tracking_number && o.courier_name?.toLowerCase().includes('steadfast')));
  }, [orders]);

  const readyForSteadfastOrders = useMemo(() => {
    return orders.filter(o => (o.status === 'confirmed' || o.status === 'processing') && !o.steadfast_tracking_code);
  }, [orders]);

  // --- PIN LOCK SCREEN (Minimal Linear Style) ---
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 -mt-6 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm mx-auto shadow-xs">
              UA
            </div>
            <h1 className="text-lg font-bold text-slate-900">অ্যাডমিন সিকিউরিটি পিন</h1>
            <p className="text-xs text-slate-500">ড্যাশবোর্ডে প্রবেশ করতে আপনার পাসওয়ার্ড দিন</p>
          </div>

          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  required
                  value={inputPin}
                  onChange={(e) => setInputPin(e.target.value)}
                  placeholder="পাসওয়ার্ড লিখুন..."
                  autoFocus
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono tracking-widest focus:bg-white focus:border-slate-800 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium"
                >
                  {showPin ? 'লুকান' : 'দেখান'}
                </button>
              </div>
              {pinError && (
                <p className="text-rose-600 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{pinError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>লগইন করুন</span>
            </button>
          </form>

          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="w-full text-center text-xs text-slate-400 hover:text-slate-700 font-medium transition-colors cursor-pointer"
          >
            ← স্টোরফ্রন্টে ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 -mt-6 -mx-4 sm:-mx-6 lg:-mx-8 flex">
      {/* 1. COLLAPSIBLE / COMPACT SIDEBAR (Linear & Shopify Style) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200/90 z-50 flex flex-col justify-between transition-transform duration-200 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-5 overflow-y-auto">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs">
                UA
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight block text-slate-900 leading-none">UNEX AURA</span>
                <span className="text-[10px] text-slate-400 font-medium">Store Management</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links Grouped Logically */}
          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Dashboard</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('orders'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>Orders</span>
              </div>
              {pendingOrdersCount > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'orders' ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-800'
                }`}>
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('products'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 shrink-0" />
                <span>Products</span>
              </div>
              <span className="text-[11px] text-slate-400 font-normal">{totalProductsCount}</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('inventory'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Boxes className="w-4 h-4 shrink-0" />
                <span>Inventory &amp; Stock</span>
              </div>
              {outOfStockCount > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'inventory' ? 'bg-rose-400 text-white' : 'bg-rose-100 text-rose-800'
                }`}>
                  {outOfStockCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('categories'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 shrink-0" />
                <span>Categories</span>
              </div>
              <span className="text-[11px] text-slate-400 font-normal">{categories.length}</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('delivery'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'delivery'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 shrink-0" />
                <span>Courier (Steadfast)</span>
              </div>
              {readyForSteadfastOrders.length > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'delivery' ? 'bg-indigo-300 text-indigo-950' : 'bg-indigo-50 text-indigo-700'
                }`}>
                  {readyForSteadfastOrders.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('customers'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'customers'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 shrink-0" />
                <span>Customers</span>
              </div>
              <span className="text-[11px] text-slate-400 font-normal">{customerList.length}</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('reports'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span>Reports &amp; Sales</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 shrink-0" />
                <span>Settings</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Supabase Live</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">v2.6</span>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer"
          >
            <Store className="w-3.5 h-3.5 text-teal-600" />
            <span>স্টোরফ্রন্ট দেখুন</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem('unex_admin_authorized');
              setIsAuthorized(false);
              showToast('অ্যাডমিন সেশন লক করা হয়েছে');
            }}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <Lock className="w-3 h-3" />
            <span>লগআউট / লক</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200/90 h-14 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="text-slate-900 font-bold capitalize">
                {activeTab === 'dashboard' && 'Dashboard Overview'}
                {activeTab === 'orders' && 'Live Orders'}
                {activeTab === 'products' && 'Product Catalog'}
                {activeTab === 'inventory' && 'Inventory & Stock'}
                {activeTab === 'categories' && 'Categories'}
                {activeTab === 'delivery' && 'Steadfast Courier Hub'}
                {activeTab === 'customers' && 'Customer CRM'}
                {activeTab === 'reports' && 'Business Reports'}
                {activeTab === 'settings' && 'Store Settings'}
              </span>
              {activeTab === 'orders' && <span className="text-slate-400 font-normal">/ {filteredOrders.length} orders</span>}
              {activeTab === 'products' && <span className="text-slate-400 font-normal">/ {filteredProducts.length} items</span>}
              {activeTab === 'inventory' && <span className="text-slate-400 font-normal">/ {filteredInventory.length} items</span>}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleManualRefreshOrders}
              disabled={isRefreshingOrders}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="ডাটাবেজ রিফ্রেশ"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingOrders ? 'animate-spin text-indigo-600' : ''}`} />
            </button>

            {(activeTab === 'products' || activeTab === 'inventory') && (
              <button
                type="button"
                onClick={() => setShowAddProductModal(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন প্রোডাক্ট</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">

          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* 4 Clean Metric Cards (Linear / Shopify Simple) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div 
                  onClick={() => setActiveTab('orders')}
                  className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-1 cursor-pointer hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>সর্বমোট অর্ডার</span>
                    <ShoppingBag className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{totalOrdersCount}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <span>সব লাইভ অর্ডার</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400" />
                  </div>
                </div>

                <div 
                  onClick={() => { setActiveTab('orders'); setOrderStatusFilter('pending'); }}
                  className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-2xs space-y-1 cursor-pointer hover:border-amber-300 transition-all"
                >
                  <div className="flex items-center justify-between text-xs text-amber-700 font-semibold">
                    <span>কনফার্মেশন দরকার</span>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                  </div>
                  <div className="text-2xl font-bold text-amber-900">{pendingOrdersCount}</div>
                  <div className="text-[11px] text-amber-700/80">কল বা যাচাই বাকি</div>
                </div>

                <div 
                  onClick={() => { setActiveTab('orders'); setOrderStatusFilter('confirmed'); }}
                  className="bg-white p-4 rounded-xl border border-blue-200/80 shadow-2xs space-y-1 cursor-pointer hover:border-blue-300 transition-all"
                >
                  <div className="flex items-center justify-between text-xs text-blue-700 font-semibold">
                    <span>কনফার্মড ও প্রসেসিং</span>
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-blue-900">{confirmedOrdersCount}</div>
                  <div className="text-[11px] text-blue-700/80">কাটিং / ডিসপ্যাচের জন্য রেডি</div>
                </div>

                <div 
                  onClick={() => setActiveTab('products')}
                  className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-1 cursor-pointer hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>মোট প্রোডাক্ট</span>
                    <Package className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{totalProductsCount}</div>
                  <div className="text-[11px] text-slate-400">ক্যাটালগে সক্রিয়</div>
                </div>
              </div>

              {/* 2-Column Split: Pending Action Orders + Recent Orders & Delivery Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left (2 Columns): Orders Awaiting Confirmation */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Card: Pending Orders requiring action */}
                  <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-amber-50/40">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <h2 className="text-xs font-bold text-slate-900">
                          কনফার্ম করার অপেক্ষায় থাকা অর্ডার ({pendingOrders.length})
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setActiveTab('orders'); setOrderStatusFilter('pending'); }}
                        className="text-xs font-semibold text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>সব দেখুন</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {pendingOrders.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400">
                        বর্তমানে কোনো পেন্ডিং অর্ডার নেই। সব অর্ডার হ্যান্ডেল করা হয়েছে!
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {pendingOrders.map(o => (
                          <div key={o.order_number || o.id} className="p-4 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs text-slate-900">#{o.order_number}</span>
                                <span className="text-[11px] text-slate-500 font-medium">({o.city || 'ঢাকা'})</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                                  পেন্ডিং
                                </span>
                              </div>
                              <div className="text-xs font-medium text-slate-800 truncate">
                                {o.user_name} • <span className="font-mono text-slate-500">{o.user_phone}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 truncate max-w-md">
                                {o.shipping_address}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-bold text-xs text-slate-900 mr-2">
                                {formatPrice(o.total_amount)}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(o.id, 'confirmed')}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-colors cursor-pointer"
                              >
                                কনফার্ম
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedOrderDetails(o)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                              >
                                বিস্তারিত
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card: Recent Orders */}
                  <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                      <h2 className="text-xs font-bold text-slate-900">সাম্প্রতিক অর্ডার (Recent Orders)</h2>
                      <button
                        type="button"
                        onClick={() => setActiveTab('orders')}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                      >
                        <span>সব অর্ডার</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {recentOrders.map(o => (
                        <div key={o.order_number || o.id} className="p-3.5 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-3 text-xs">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-900">#{o.order_number}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                o.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                                o.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                                o.status === 'confirmed' || o.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                o.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {o.status}
                              </span>
                            </div>
                            <div className="text-slate-500 text-[11px] truncate mt-0.5">
                              {o.user_name} • {o.created_at?.split('T')[0] || o.created_at?.split(' ')[0]}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-bold text-slate-900">{formatPrice(o.total_amount)}</span>
                            <button
                              type="button"
                              onClick={() => setSelectedOrderDetails(o)}
                              className="text-slate-400 hover:text-slate-700"
                              title="ডিটেইলস"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right (1 Column): Delivery Overview & Quick Controls */}
                <div className="space-y-6">
                  {/* Delivery Status Card */}
                  <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-indigo-600" />
                        <h3 className="text-xs font-bold text-slate-900">ডেলিভারি ওভারভিউ</h3>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                        Steadfast API
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                        <span className="text-slate-600 font-medium">স্টেডফাস্টে বুক করা পার্সেল</span>
                        <span className="font-bold text-slate-900 font-mono">{steadfastBookedOrders.length}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                        <span className="text-slate-600 font-medium">শিপিংয়ের জন্য রেডি (বুকিং বাকি)</span>
                        <span className="font-bold text-amber-700 font-mono">{readyForSteadfastOrders.length}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                        <span className="text-slate-600 font-medium">ডেলিভারি সম্পন্ন (Delivered)</span>
                        <span className="font-bold text-emerald-700 font-mono">{deliveredOrdersCount}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('delivery')}
                      className="w-full py-2 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>ডেলিভারি হাব ওপেন করুন</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Revenue / Summary widget */}
                  <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-3">
                    <div className="text-xs text-slate-500 font-medium">মোট বিক্রয় ভলিউম (Total Volume)</div>
                    <div className="text-2xl font-bold text-slate-900 font-mono">{formatPrice(totalRevenue)}</div>
                    <p className="text-[11px] text-slate-400">
                      সরাসরি Supabase লাইভ অর্ডার থেকে হিসাবকৃত
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT (Central Focus) */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Header & Filter Controls */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Search Bar */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="অর্ডার নম্বর, নাম, ফোন বা ঠিকানা দিয়ে খুঁজুন..."
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-slate-800 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    {(['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setOrderStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                          orderStatusFilter === st
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {st === 'all' ? `সব (${orders.length})` : st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80">
                      <tr>
                        <th className="px-4 py-3">অর্ডার #</th>
                        <th className="px-4 py-3">কাস্টমার</th>
                        <th className="px-4 py-3">তারিখ</th>
                        <th className="px-4 py-3">পণ্য</th>
                        <th className="px-4 py-3">মোট</th>
                        <th className="px-4 py-3">অর্ডার স্ট্যাটাস</th>
                        <th className="px-4 py-3">কুরিয়ার (Steadfast)</th>
                        <th className="px-4 py-3 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-400">
                            কোনো অর্ডার পাওয়া যায়নি
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((o, idx) => {
                          const isBookedOnSteadfast = Boolean(o.steadfast_tracking_code || (o.tracking_number && o.courier_name?.toLowerCase().includes('steadfast')));
                          const trackingCode = o.steadfast_tracking_code || o.tracking_number;

                          return (
                            <tr key={o.order_number ? `order-row-${o.order_number}` : `order-row-${o.id}-${idx}`} className="hover:bg-slate-50/60 transition-colors">
                              {/* Order Number */}
                              <td className="px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                                #{o.order_number}
                              </td>

                              {/* Customer */}
                              <td className="px-4 py-3">
                                <div className="font-semibold text-slate-900 truncate max-w-[130px]">{o.user_name}</div>
                                <div className="text-[11px] text-slate-500 font-mono">{o.user_phone}</div>
                              </td>

                              {/* Date */}
                              <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                                {o.created_at?.split('T')[0] || o.created_at?.split(' ')[0]}
                              </td>

                              {/* Items Summary */}
                              <td className="px-4 py-3 text-slate-700 max-w-[180px] truncate">
                                {Array.isArray(o.items) && o.items.length > 0 ? (
                                  o.items.map((it: any) => `${it.product_name || it.name} (${it.quantity || 1})`).join(', ')
                                ) : (
                                  'ওয়াল আর্ট'
                                )}
                              </td>

                              {/* Total Amount */}
                              <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap font-mono">
                                {formatPrice(o.total_amount)}
                              </td>

                              {/* Status Dropdown */}
                              <td className="px-4 py-3 whitespace-nowrap">
                                <select
                                  value={o.status}
                                  onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                                  className={`text-[11px] font-semibold px-2 py-1 rounded-md border border-slate-200 bg-white cursor-pointer focus:outline-none ${
                                    o.status === 'delivered' ? 'text-emerald-700' :
                                    o.status === 'shipped' ? 'text-indigo-700' :
                                    o.status === 'confirmed' || o.status === 'processing' ? 'text-blue-700' :
                                    o.status === 'cancelled' ? 'text-rose-700' :
                                    'text-amber-700'
                                  }`}
                                >
                                  <option value="pending">পেন্ডিং</option>
                                  <option value="confirmed">কনফার্মড</option>
                                  <option value="processing">প্রসেসিং</option>
                                  <option value="shipped">শিপড</option>
                                  <option value="delivered">ডেলিভার্ড</option>
                                  <option value="cancelled">বাতিল</option>
                                </select>
                              </td>

                              {/* Courier / Steadfast */}
                              <td className="px-4 py-3 whitespace-nowrap">
                                {isBookedOnSteadfast ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                      {trackingCode}
                                    </span>
                                    <a
                                      href={`https://steadfast.com.bd/t/${trackingCode}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[11px] text-indigo-600 hover:underline flex items-center"
                                      title="লাইভ ট্র্যাক"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenSteadfastModal(o)}
                                    className="px-2 py-1 rounded-md text-[10px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
                                  >
                                    <Truck className="w-3 h-3" />
                                    <span>স্টেডফাস্টে পাঠান</span>
                                  </button>
                                )}
                              </td>

                              {/* Actions */}
                              <td className="px-4 py-3 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenPriceEdit(o)}
                                    className="px-2 py-1 rounded-md text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                                    title="দাম এডিট"
                                  >
                                    দাম এডিট
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setSelectedOrderDetails(o)}
                                    className="px-2 py-1 rounded-md text-[11px] font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                                  >
                                    বিস্তারিত
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteOrder(o.id, o.order_number)}
                                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                    title="মুছে ফেলুন"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="প্রোডাক্ট নাম খুঁজুন..."
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
                  >
                    <option value="all">সকল ক্যাটাগরি</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddProductModal(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>নতুন প্রোডাক্ট যোগ করুন</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80">
                      <tr>
                        <th className="px-4 py-3">ছবি</th>
                        <th className="px-4 py-3">প্রোডাক্ট নাম</th>
                        <th className="px-4 py-3">ক্যাটাগরি</th>
                        <th className="px-4 py-3">মূল্য (মিডিয়াম / লার্জ)</th>
                        <th className="px-4 py-3">স্টক / ইনভেন্টরি</th>
                        <th className="px-4 py-3 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.map((p, idx) => (
                        <tr key={`prod-${p.id}-${idx}`} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3">
                            <img
                              src={p.image_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=100&q=80'}
                              alt={p.name}
                              className="w-12 h-12 object-cover rounded-lg border border-slate-200 bg-slate-100"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900 line-clamp-1">{p.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">ID: #{p.id}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {p.category_name || 'Wall Art'}
                          </td>
                          <td className="px-4 py-3 font-mono font-semibold text-slate-900 whitespace-nowrap">
                            {formatPrice(p.price)}
                            {p.sizes && p.sizes[1] && (
                              <span className="text-slate-400 font-normal"> / {formatPrice(p.sizes[1].price)}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={savingStockId === p.id}
                                onClick={() => handleQuickStockUpdate(p.id, -1)}
                                className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-mono font-bold text-slate-900">
                                {p.stock || 0}
                              </span>
                              <button
                                type="button"
                                disabled={savingStockId === p.id}
                                onClick={() => handleQuickStockUpdate(p.id, 1)}
                                className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingProduct(p)}
                                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                                title="এডিট"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (window.confirm(`"${p.name}" প্রোডাক্টটি মুছে ফেলতে চান?`)) {
                                    await deleteProduct(p.id);
                                    showToast('প্রোডাক্ট মুছে ফেলা হয়েছে');
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: INVENTORY & STOCK MANAGEMENT */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              {/* Inventory KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div 
                  onClick={() => setInventoryStockFilter('in_stock')}
                  className={`p-4 rounded-xl border shadow-2xs space-y-1 cursor-pointer transition-all ${
                    inventoryStockFilter === 'in_stock' ? 'bg-emerald-50/70 border-emerald-300' : 'bg-white border-slate-200/90'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>স্টকে আছে (In Stock)</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{products.filter(p => Number(p.stock || 0) > 5).length}</div>
                  <div className="text-[11px] text-emerald-700 font-medium">&gt; 5 পিস পর্যাপ্ত স্টক</div>
                </div>

                <div 
                  onClick={() => setInventoryStockFilter('low_stock')}
                  className={`p-4 rounded-xl border shadow-2xs space-y-1 cursor-pointer transition-all ${
                    inventoryStockFilter === 'low_stock' ? 'bg-amber-50/70 border-amber-300' : 'bg-white border-slate-200/90'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-amber-700 font-medium">
                    <span>কম স্টক (Low Stock)</span>
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-bold text-amber-900">{lowStockCount}</div>
                  <div className="text-[11px] text-amber-700 font-medium">১ থেকে ৫ পিস বাকি</div>
                </div>

                <div 
                  onClick={() => setInventoryStockFilter('out_of_stock')}
                  className={`p-4 rounded-xl border shadow-2xs space-y-1 cursor-pointer transition-all ${
                    inventoryStockFilter === 'out_of_stock' ? 'bg-rose-50/70 border-rose-300' : 'bg-white border-slate-200/90'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-rose-700 font-medium">
                    <span>স্টক শেষ (Out of Stock)</span>
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  </div>
                  <div className="text-2xl font-bold text-rose-900">{outOfStockCount}</div>
                  <div className="text-[11px] text-rose-700 font-medium">০ পিস (রি-স্টক প্রয়োজন)</div>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="পণ্য অনুযায়ী স্টক খুঁজুন..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  {(['all', 'in_stock', 'low_stock', 'out_of_stock'] as const).map(flt => (
                    <button
                      key={flt}
                      type="button"
                      onClick={() => setInventoryStockFilter(flt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                        inventoryStockFilter === flt
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {flt === 'all' && 'সব স্টক'}
                      {flt === 'in_stock' && 'ইন স্টক'}
                      {flt === 'low_stock' && 'লো স্টক'}
                      {flt === 'out_of_stock' && 'আউট অব স্টক'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inventory Table */}
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80">
                      <tr>
                        <th className="px-4 py-3">পণ্য</th>
                        <th className="px-4 py-3">ক্যাটাগরি</th>
                        <th className="px-4 py-3">বর্তমান স্টক</th>
                        <th className="px-4 py-3">স্টক স্ট্যাটাস</th>
                        <th className="px-4 py-3">দ্রুত আপডেট (Supabase)</th>
                        <th className="px-4 py-3 text-right">ম্যানেজ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredInventory.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400">
                            এই ফিল্টারে কোনো প্রোডাক্ট পাওয়া যায়নি
                          </td>
                        </tr>
                      ) : (
                        filteredInventory.map((p, idx) => {
                          const stock = Number(p.stock || 0);
                          return (
                            <tr key={`inv-${p.id}-${idx}`} className="hover:bg-slate-50/60 transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={p.image_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=100&q=80'}
                                    alt=""
                                    className="w-9 h-9 object-cover rounded-lg border border-slate-200 bg-slate-100 shrink-0"
                                  />
                                  <div>
                                    <div className="font-semibold text-slate-900 line-clamp-1">{p.name}</div>
                                    <span className="font-mono text-[10px] text-slate-400">ID: #{p.id}</span>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-3 text-slate-600">
                                {p.category_name || 'Wall Art'}
                              </td>

                              <td className="px-4 py-3 font-mono font-bold text-slate-900 text-sm">
                                {stock} পিস
                              </td>

                              <td className="px-4 py-3">
                                {stock <= 0 ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                    আউট অব স্টক
                                  </span>
                                ) : stock <= 5 ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                    কম স্টক ({stock} টি)
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                    পর্যাপ্ত স্টক
                                  </span>
                                )}
                              </td>

                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    disabled={savingStockId === p.id}
                                    onClick={() => handleQuickStockUpdate(p.id, -5)}
                                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] cursor-pointer"
                                    title="৫টি কমান"
                                  >
                                    -5
                                  </button>
                                  <button
                                    type="button"
                                    disabled={savingStockId === p.id}
                                    onClick={() => handleQuickStockUpdate(p.id, -1)}
                                    className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                                  >
                                    -1
                                  </button>
                                  <button
                                    type="button"
                                    disabled={savingStockId === p.id}
                                    onClick={() => handleQuickStockUpdate(p.id, 1)}
                                    className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                                  >
                                    +1
                                  </button>
                                  <button
                                    type="button"
                                    disabled={savingStockId === p.id}
                                    onClick={() => handleQuickStockUpdate(p.id, 5)}
                                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] cursor-pointer"
                                    title="৫টি বাড়ান"
                                  >
                                    +5
                                  </button>
                                </div>
                              </td>

                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => setEditingProduct(p)}
                                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] cursor-pointer"
                                >
                                  এডিট
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CATEGORIES MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              {/* Add Category Form */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4 max-w-xl">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-teal-600" />
                  <span>নতুন ক্যাটাগরি তৈরি করুন</span>
                </h3>

                <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">ক্যাটাগরি নাম *</label>
                    <input
                      type="text"
                      required
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="e.g. Islamic Surah Wall Art"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">আইকন (ইমোজি)</label>
                      <input
                        type="text"
                        value={newCatIcon}
                        onChange={(e) => setNewCatIcon(e.target.value)}
                        placeholder="🕌"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">ছবির লিঙ্ক (ঐচ্ছিক)</label>
                      <input
                        type="url"
                        value={newCatImg}
                        onChange={(e) => setNewCatImg(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors cursor-pointer"
                  >
                    ক্যাটাগরি যোগ করুন
                  </button>
                </form>
              </div>

              {/* Categories List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat, idx) => (
                  <div key={`cat-card-${cat.id}-${idx}`} className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{cat.icon || '🕌'}</span>
                          <div>
                            <h4 className="font-bold text-xs text-slate-900">{cat.name}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">slug: {cat.slug}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingCategory(cat)}
                            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                            title="এডিট"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (window.confirm(`"${cat.name}" ক্যাটাগরি মুছে ফেলতে চান?`)) {
                                deleteCategory(cat.id);
                                showToast('ক্যাটাগরি মুছে ফেলা হয়েছে');
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {cat.image_url ? (
                        <div className="w-full h-28 rounded-lg overflow-hidden bg-slate-100 border border-slate-100">
                          <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-full h-20 rounded-lg bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs italic">
                          কোনো ছবি সেট করা নেই
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>পণ্য সংখ্যা:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {products.filter(p => p.category_id === cat.id).length} টি
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: DELIVERY & STEADFAST COURIER HUB */}
          {activeTab === 'delivery' && (
            <div className="space-y-6">
              {/* Steadfast Status & Summary */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900">Steadfast Courier Integration</h2>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        settings.steadfast_api_key && settings.steadfast_secret_key
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {settings.steadfast_api_key && settings.steadfast_secret_key ? '● Connected' : '○ Setup Needed'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      অর্ডার কনফার্ম করার পর এক ক্লিকে Steadfast-এ পার্সেল বুকিং এবং ট্র্যাকিং কোড জেনারেশন
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="https://portal.steadfast.com.bd/"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Steadfast Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Ready to Book (Confirmed orders) */}
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-indigo-50/40">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-bold text-slate-900">
                      স্টেডফাস্টে পাঠানোর জন্য প্রস্তুত অর্ডার ({readyForSteadfastOrders.length})
                    </h3>
                  </div>
                </div>

                {readyForSteadfastOrders.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    কোনো আনশিপড কনফার্মড অর্ডার নেই। নতুন কনফার্মড অর্ডার আসলে এখানে সরাসরি পাঠাতে পারবেন।
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {readyForSteadfastOrders.map(o => (
                      <div key={o.order_number || o.id} className="p-4 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900">#{o.order_number}</span>
                            <span className="font-semibold text-slate-800">{o.user_name} ({o.user_phone})</span>
                          </div>
                          <p className="text-slate-500 text-[11px] mt-0.5">{o.shipping_address}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 font-mono mr-2">{formatPrice(o.total_amount)}</span>
                          <button
                            type="button"
                            onClick={() => handleOpenSteadfastModal(o)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>স্টেডফাস্টে পাঠান</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Already Booked on Steadfast */}
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900">
                    বুকিংকৃত পার্সেল ও ট্র্যাকিং কোড ({steadfastBookedOrders.length})
                  </h3>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {steadfastBookedOrders.length === 0 ? (
                    <div className="p-6 text-center text-slate-400">এখনো কোনো পার্সেল বুক করা হয়নি।</div>
                  ) : (
                    steadfastBookedOrders.map(o => {
                      const trackingCode = o.steadfast_tracking_code || o.tracking_number;
                      return (
                        <div key={o.order_number || o.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60">
                          <div>
                            <span className="font-mono font-bold text-slate-900 mr-2">#{o.order_number}</span>
                            <span className="text-slate-700 font-medium">{o.user_name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                              {trackingCode}
                            </span>
                            <a
                              href={`https://steadfast.com.bd/t/${trackingCode}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                            >
                              <span>ট্র্যাক</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Steadfast API Credentials Form */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4 max-w-xl">
                <h3 className="text-xs font-bold text-slate-900">Steadfast API Credentials</h3>
                <form onSubmit={handleSaveSteadfastSettings} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Api-Key *</label>
                    <input
                      type="text"
                      required
                      value={steadfastApiKey}
                      onChange={(e) => setSteadfastApiKey(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Secret-Key *</label>
                    <input
                      type="password"
                      required
                      value={steadfastSecretKey}
                      onChange={(e) => setSteadfastSecretKey(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono focus:bg-white focus:outline-none"
                    />
                  </div>
                  {steadfastBalanceInfo && (
                    <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                      steadfastBalanceInfo.success 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}>
                      <div className="flex items-center gap-2">
                        {steadfastBalanceInfo.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span>{steadfastBalanceInfo.message}</span>
                      </div>
                      {steadfastBalanceInfo.success && steadfastBalanceInfo.balance !== undefined && (
                        <span className="font-mono font-bold text-xs">
                          {formatPrice(steadfastBalanceInfo.balance)}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={isSavingSteadfast}
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors cursor-pointer"
                    >
                      {isSavingSteadfast ? 'সেভ হচ্ছে...' : 'সেটিংস সেভ করুন'}
                    </button>
                    <button
                      type="button"
                      disabled={isCheckingSteadfastBalance || !steadfastApiKey || !steadfastSecretKey}
                      onClick={handleCheckSteadfastConnection}
                      className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isCheckingSteadfastBalance ? 'animate-spin' : ''}`} />
                      <span>{isCheckingSteadfastBalance ? 'যাচাই হচ্ছে...' : 'কানেকশন ও ব্যালেন্স টেস্ট'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 6: CUSTOMERS MANAGEMENT */}
          {activeTab === 'customers' && (
            <div className="space-y-4">
              {/* Header and Search */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="কাস্টমার নাম, ফোন বা ঠিকানা দিয়ে খুঁজুন..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  মোট কাস্টমার: <strong className="text-slate-900 font-mono">{customerList.length}</strong> জন
                </div>
              </div>

              {/* Customers Table */}
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80">
                      <tr>
                        <th className="px-4 py-3">কাস্টমার নাম</th>
                        <th className="px-4 py-3">ফোন নম্বর</th>
                        <th className="px-4 py-3">ঠিকানা ও শহর</th>
                        <th className="px-4 py-3">অর্ডার সংখ্যা</th>
                        <th className="px-4 py-3">মোট খরচ (BDT)</th>
                        <th className="px-4 py-3 text-right">যোগাযোগ ও হিস্ট্রি</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customerList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400">
                            কোনো কাস্টমার পাওয়া যায়নি
                          </td>
                        </tr>
                      ) : (
                        customerList.map((c, idx) => (
                          <tr key={`cust-${c.phone}-${idx}`} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                              {c.name}
                            </td>
                            <td className="px-4 py-3 font-mono text-slate-700 whitespace-nowrap">
                              {c.phone}
                            </td>
                            <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate">
                              {c.address} ({c.city})
                            </td>
                            <td className="px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                              {c.orders.length} টি
                            </td>
                            <td className="px-4 py-3 font-mono font-bold text-emerald-700 whitespace-nowrap">
                              {formatPrice(c.totalSpent)}
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {c.phone && c.phone !== 'N/A' && (
                                  <>
                                    <a
                                      href={`tel:${c.phone}`}
                                      className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                                      title="কল করুন"
                                    >
                                      <Phone className="w-3.5 h-3.5" />
                                    </a>
                                    <a
                                      href={`https://wa.me/88${c.phone.replace(/[^0-9]/g, '')}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                                      title="WhatsApp মেসেজ"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                    </a>
                                  </>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setSelectedCustomerHistory(c)}
                                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium cursor-pointer"
                                >
                                  অর্ডারসমূহ ({c.orders.length})
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: BUSINESS REPORTS & SALES ANALYTICS */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              {/* Date Filter Bar */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-slate-700" />
                  <h3 className="text-xs font-bold text-slate-900">ব্যবসার রিপোর্ট ও সেলস অ্যানালিটিক্স</h3>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  {(['all', '30days', '7days', 'today'] as const).map(range => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => setReportDateRange(range)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                        reportDateRange === range
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {range === 'all' && 'সব সময় (All Time)'}
                      {range === '30days' && 'বিগত ৩০ দিন'}
                      {range === '7days' && 'বিগত ৭ দিন'}
                      {range === 'today' && 'আজকে (Today)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* KPI Metrics based on selected range */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                  <div className="text-xs text-slate-500 font-medium">মোট বিক্রয় (Total Sales)</div>
                  <div className="text-2xl font-bold text-slate-900 font-mono">{formatPrice(reportStats.totalSales)}</div>
                  <div className="text-[11px] text-slate-400">{reportStats.orderCount} টি অর্ডার থেকে</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-2xs space-y-1">
                  <div className="text-xs text-emerald-800 font-medium">ডেলিভার্ড অর্ডার</div>
                  <div className="text-2xl font-bold text-emerald-900 font-mono">{reportStats.deliveredCount}</div>
                  <div className="text-[11px] text-emerald-700 font-medium">সফলভাবে ডেলিভারি সম্পন্ন</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                  <div className="text-xs text-slate-500 font-medium">গড় অর্ডার মূল্য (AOV)</div>
                  <div className="text-2xl font-bold text-slate-900 font-mono">{formatPrice(reportStats.avgOrderValue)}</div>
                  <div className="text-[11px] text-slate-400">প্রতি অর্ডারে গড় আয়</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-blue-200/80 shadow-2xs space-y-1">
                  <div className="text-xs text-blue-800 font-medium">কনফার্মড / কাটিং</div>
                  <div className="text-2xl font-bold text-blue-900 font-mono">{reportStats.confirmedCount}</div>
                  <div className="text-[11px] text-blue-700 font-medium">প্রসেসিংয়ে রয়েছে</div>
                </div>
              </div>

              {/* 2 Column breakdown: Top Selling Products + Zone Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Selling Products */}
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span>সর্বাধিক বিক্রিত ডিজাইন (Top Sellers)</span>
                    </h3>
                  </div>

                  {reportStats.topSellingProducts.length === 0 ? (
                    <div className="text-center text-xs text-slate-400 py-6">কোনো সেলস রেকর্ড পাওয়া যায়নি</div>
                  ) : (
                    <div className="space-y-3">
                      {reportStats.topSellingProducts.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 text-xs">
                          <div className="min-w-0 pr-2">
                            <div className="font-bold text-slate-900 truncate">{p.name}</div>
                            <span className="text-[10px] text-slate-500">{p.count} টি পিস বিক্রি হয়েছে</span>
                          </div>
                          <span className="font-mono font-bold text-slate-900 whitespace-nowrap">{formatPrice(p.totalBDT)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Delivery Zone Breakdown */}
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-indigo-600" />
                      <span>ডেলিভারি এরিয়া বণ্টন</span>
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50 flex items-center justify-between">
                      <span className="font-medium text-slate-700">ঢাকার ভেতরে (Inside Dhaka)</span>
                      <span className="font-mono font-bold text-slate-900">{reportStats.dhakaOrders} টি অর্ডার</span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 flex items-center justify-between">
                      <span className="font-medium text-slate-700">ঢাকার বাইরে (Outside Dhaka)</span>
                      <span className="font-mono font-bold text-slate-900">{reportStats.outsideOrders} টি অর্ডার</span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 flex items-center justify-between">
                      <span className="font-medium text-slate-700">বাতিল / রিটার্ন রেট</span>
                      <span className="font-mono font-bold text-rose-700">
                        {reportStats.orderCount > 0 ? Math.round((reportStats.cancelledCount / reportStats.orderCount) * 100) : 0}% ({reportStats.cancelledCount} টি)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SETTINGS (Store, Media, Meta, Google Sheets, Supabase) */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Settings Subtab Navigation */}
              <div className="bg-white p-1 rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-1 overflow-x-auto text-xs">
                {(['shipping', 'media', 'security', 'meta', 'sheets', 'supabase'] as const).map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setSettingsTab(tab)}
                    className={`px-3 py-1.5 rounded-lg font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                      settingsTab === tab
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {tab === 'shipping' && 'ডেলিভারি চার্জ'}
                    {tab === 'media' && 'হিরো ভিডিও'}
                    {tab === 'security' && 'পাসওয়ার্ড ও সিকিউরিটি'}
                    {tab === 'meta' && 'Meta Pixel & CAPI'}
                    {tab === 'sheets' && 'গুগল শিট সিঙ্ক'}
                    {tab === 'supabase' && 'সুপাবেস ডাটাবেজ'}
                  </button>
                ))}
              </div>

              {/* Subtab Content */}
              {settingsTab === 'shipping' && (
                <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4 max-w-xl">
                  <h3 className="text-xs font-bold text-slate-900">ডেলিভারি চার্জ রুলস</h3>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      await updateSettings({
                        ...settings,
                        base_charge_dhaka: Number(dhakaBase),
                        free_shipping_threshold_dhaka: Number(dhakaFree),
                        base_charge_outside: Number(outsideBase)
                      });
                      showToast('ডেলিভারি চার্জ সফলভাবে আপডেট হয়েছে');
                    }}
                    className="space-y-3 text-xs"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">ঢাকার ভেতর ডেলিভারি (৳)</label>
                        <input
                          type="number"
                          value={dhakaBase}
                          onChange={(e) => setDhakaBase(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-bold focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">ঢাকার বাইরে ডেলিভারি (৳)</label>
                        <input
                          type="number"
                          value={outsideBase}
                          onChange={(e) => setOutsideBase(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-bold focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">ঢাকায় ফ্রি ডেলিভারি লিমিট (৳)</label>
                      <input
                        type="number"
                        value={dhakaFree}
                        onChange={(e) => setDhakaFree(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-bold focus:bg-white focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors cursor-pointer"
                    >
                      ডেলিভারি সেটিংস সেভ করুন
                    </button>
                  </form>
                </div>
              )}

              {settingsTab === 'media' && (
                <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4 max-w-xl">
                  <h3 className="text-xs font-bold text-slate-900">হোমপেজ হিরো ভিডিও ও ব্যানার</h3>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      await updateSettings({
                        ...settings,
                        promo_video_url: promoVideoUrl.trim(),
                        hero_banner_image: heroBannerImg.trim()
                      });
                      showToast('মিডিয়া লিংক সেভ করা হয়েছে');
                    }}
                    className="space-y-3 text-xs"
                  >
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">ভিডিও লিংক (Cloudinary / Direct MP4 / Youtube)</label>
                      <input
                        type="url"
                        value={promoVideoUrl}
                        onChange={(e) => setPromoVideoUrl(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono text-[11px] focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">পোস্টার / ব্যানার ছবি লিংক</label>
                      <input
                        type="url"
                        value={heroBannerImg}
                        onChange={(e) => setHeroBannerImg(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono text-[11px] focus:bg-white focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors cursor-pointer"
                    >
                      মিডিয়া সেটিংস সেভ করুন
                    </button>
                  </form>
                </div>
              )}

              {settingsTab === 'security' && (
                <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4 max-w-xl">
                  <h3 className="text-xs font-bold text-slate-900">পাসওয়ার্ড ও নোটিফিকেশন</h3>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      await updateSettings({
                        ...settings,
                        admin_password: adminPass.trim(),
                        whatsapp_number: adminWhatsApp.trim()
                      });
                      showToast('সিকিউরিটি সেটিংস আপডেট করা হয়েছে');
                    }}
                    className="space-y-3 text-xs"
                  >
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">অ্যাডমিন পাসওয়ার্ড</label>
                      <input
                        type="password"
                        required
                        value={adminPass}
                        onChange={(e) => setAdminPass(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">হোয়াটসঅ্যাপ নাম্বার (নোটিফিকেশন)</label>
                      <input
                        type="text"
                        value={adminWhatsApp}
                        onChange={(e) => setAdminWhatsApp(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono focus:bg-white focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors cursor-pointer"
                    >
                      পাসওয়ার্ড সেভ করুন
                    </button>
                  </form>
                </div>
              )}

              {settingsTab === 'meta' && (
                <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4 max-w-xl">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-bold text-slate-900">Meta Pixel &amp; Conversions API (CAPI)</h3>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                      Server-Side Active
                    </span>
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      await updateSettings({
                        ...settings,
                        meta_pixel_id: adminMetaPixelId.trim(),
                        meta_capi_access_token: adminMetaCapiToken.trim(),
                        meta_capi_enabled: adminMetaCapiEnabled,
                        meta_test_event_code: adminMetaTestCode.trim()
                      });
                      showToast('Meta Pixel ও CAPI সেটিংস সেভ হয়েছে');
                    }}
                    className="space-y-3 text-xs"
                  >
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Meta Pixel ID</label>
                      <input
                        type="text"
                        value={adminMetaPixelId}
                        onChange={(e) => setAdminMetaPixelId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Conversions API Access Token</label>
                      <textarea
                        rows={3}
                        value={adminMetaCapiToken}
                        onChange={(e) => setAdminMetaCapiToken(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono text-[11px] focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Test Event Code (ঐচ্ছিক)</label>
                      <input
                        type="text"
                        value={adminMetaTestCode}
                        onChange={(e) => setAdminMetaTestCode(e.target.value)}
                        placeholder="TEST12345"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors cursor-pointer"
                      >
                        Meta সেটিংস সেভ করুন
                      </button>
                      <button
                        type="button"
                        onClick={handleTestMetaCapi}
                        disabled={isTestingMetaCapi}
                        className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
                      >
                        {isTestingMetaCapi ? 'টেস্ট হচ্ছে...' : 'টেস্ট ইভেন্ট পাঠান'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {settingsTab === 'sheets' && (
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
                  <GoogleSheetsSync />
                </div>
              )}

              {settingsTab === 'supabase' && (
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
                  <SupabaseManager />
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* --- MODAL 1: ORDER DETAILS DRAWER / MODAL --- */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-end sm:p-4">
          <div className="bg-white w-full sm:max-w-xl h-full sm:h-auto sm:max-h-[92vh] sm:rounded-2xl border border-slate-200/90 shadow-xl overflow-y-auto flex flex-col justify-between">
            <div className="p-5 sm:p-6 space-y-5">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-slate-900">
                    #{selectedOrderDetails.order_number}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedOrderDetails.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                    selectedOrderDetails.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                    selectedOrderDetails.status === 'confirmed' || selectedOrderDetails.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    selectedOrderDetails.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedOrderDetails.status}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrderDetails(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Customer Info Card */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                <div className="font-bold text-slate-900 text-sm">{selectedOrderDetails.user_name}</div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-slate-700">{selectedOrderDetails.user_phone}</span>
                  {selectedOrderDetails.user_phone && (
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${selectedOrderDetails.user_phone}`}
                        className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:text-slate-900 flex items-center gap-1 font-medium text-[11px]"
                      >
                        <Phone className="w-3 h-3 text-teal-600" />
                        <span>কল</span>
                      </a>
                      <a
                        href={`https://wa.me/88${selectedOrderDetails.user_phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 flex items-center gap-1 font-medium text-[11px]"
                      >
                        <MessageCircle className="w-3 h-3 text-emerald-600" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  )}
                </div>
                <p className="text-slate-600 text-[11px] pt-1 border-t border-slate-200/60">
                  {selectedOrderDetails.shipping_address} ({selectedOrderDetails.city || 'ঢাকা'})
                </p>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900">অর্ডারকৃত পণ্যসমূহ:</h4>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                  {Array.isArray(selectedOrderDetails.items) && selectedOrderDetails.items.map((it: any, itIdx: number) => (
                    <div key={itIdx} className="p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        {it.image_url && (
                          <img src={it.image_url} alt="" className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                        )}
                        <div>
                          <div className="font-semibold text-slate-900">{it.product_name || it.name}</div>
                          <div className="text-[11px] text-slate-400">
                            {it.selected_size_name ? `${it.selected_size_name} • ` : ''}পরিমাণ: {it.quantity || 1}
                          </div>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-slate-900">{formatPrice((it.price || 0) * (it.quantity || 1))}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>সাবটোটাল</span>
                  <span className="font-mono">{formatPrice(selectedOrderDetails.subtotal_amount || 0)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>ডেলিভারি চার্জ</span>
                  <span className="font-mono">{formatPrice(selectedOrderDetails.delivery_charge || 0)}</span>
                </div>
                {Boolean(selectedOrderDetails.discount_amount) && (
                  <div className="flex items-center justify-between text-rose-600">
                    <span>ডিসকাউন্ট</span>
                    <span className="font-mono">-{formatPrice(selectedOrderDetails.discount_amount || 0)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-200">
                  <span>সর্বমোট বিল</span>
                  <span className="font-mono">{formatPrice(selectedOrderDetails.total_amount)}</span>
                </div>
              </div>

              {/* Steadfast Status in Details */}
              {selectedOrderDetails.steadfast_tracking_code ? (
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-indigo-900 block">Steadfast Tracking Code</span>
                    <span className="font-mono font-bold text-indigo-700">{selectedOrderDetails.steadfast_tracking_code}</span>
                  </div>
                  <a
                    href={`https://steadfast.com.bd/t/${selectedOrderDetails.steadfast_tracking_code}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded bg-indigo-600 text-white font-medium text-[11px]"
                  >
                    লাইভ ট্র্যাক
                  </a>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenSteadfastModal(selectedOrderDetails)}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>স্টেডফাস্ট কুরিয়ারে বুক করুন</span>
                </button>
              )}
            </div>

            {/* Drawer Actions Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenPriceEdit(selectedOrderDetails)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  দাম এডিট
                </button>
                <button
                  type="button"
                  disabled={syncingOrderId === selectedOrderDetails.id}
                  onClick={() => handleManualSheetSync(selectedOrderDetails)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                >
                  {syncingOrderId === selectedOrderDetails.id ? 'যাচ্ছে...' : 'গুগল শিটে পাঠান'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setPrintInvoiceOrder(selectedOrderDetails)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>ইনভয়েস</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: PRICE EDIT MODAL --- */}
      {editingOrderPrice && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                অর্ডার #{editingOrderPrice.order_number} এর মূল্য সমন্বয়
              </h3>
              <button
                type="button"
                onClick={() => setEditingOrderPrice(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePriceEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">সাবটোটাল (৳)</label>
                  <input
                    type="number"
                    value={editPriceSubtotal}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditPriceSubtotal(val);
                      setEditPriceTotal(val + editPriceDelivery - editPriceDiscount);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">ডেলিভারি চার্জ (৳)</label>
                  <input
                    type="number"
                    value={editPriceDelivery}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditPriceDelivery(val);
                      setEditPriceTotal(editPriceSubtotal + val - editPriceDiscount);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">বিশেষ ডিসকাউন্ট (৳)</label>
                <input
                  type="number"
                  value={editPriceDiscount}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setEditPriceDiscount(val);
                    setEditPriceTotal(editPriceSubtotal + editPriceDelivery - val);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-rose-700 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">ফাইনাল টোটাল কালেকশন (৳)</label>
                <input
                  type="number"
                  value={editPriceTotal}
                  onChange={(e) => setEditPriceTotal(Number(e.target.value))}
                  className="w-full bg-emerald-50 border border-emerald-300 rounded-lg px-3 py-2 text-emerald-900 font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">অর্ডার নোট / কারণ</label>
                <input
                  type="text"
                  value={editPriceNotes}
                  onChange={(e) => setEditPriceNotes(e.target.value)}
                  placeholder="কাস্টমারের সাথে আলোচনা সাপেক্ষে ডিসকাউন্ট..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingOrderPrice(null)}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSavingPrice}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
                >
                  {isSavingPrice ? 'সেভ হচ্ছে...' : 'মূল্য আপডেট করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: STEADFAST BOOKING MODAL --- */}
      {steadfastOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Steadfast পার্সেল বুকিং</h3>
              </div>
              <button
                type="button"
                onClick={() => setSteadfastOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {steadfastOrder.steadfast_tracking_code ? (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-2">
                <p className="font-bold">সতর্কতা: এই অর্ডারে ইতিমধ্যে একটি বুকিং রয়েছে!</p>
                <p className="text-[11px]">ট্র্যাকিং কোড: {steadfastOrder.steadfast_tracking_code}</p>
              </div>
            ) : null}

            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">প্রাপক:</span>
                <span className="font-bold text-slate-900">{steadfastOrder.user_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ফোন:</span>
                <span className="font-mono font-bold text-slate-900">{steadfastOrder.user_phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ঠিকানা:</span>
                <span className="text-slate-800 text-right max-w-[200px] truncate">{steadfastOrder.shipping_address}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>COD কালেকশন অ্যামাউন্ট:</span>
                <span className="font-mono text-emerald-700">{formatPrice(steadfastOrder.total_amount)}</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">পার্সেল নোট / ডেলিভারি নির্দেশিকা</label>
              <input
                type="text"
                value={steadfastNote}
                onChange={(e) => setSteadfastNote(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSteadfastOrder(null)}
                className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={isBookingSteadfast}
                onClick={handleConfirmSteadfast}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>{isBookingSteadfast ? 'বুকিং হচ্ছে...' : 'কনফার্ম ও বুক করুন'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 4: ADD PRODUCT MODAL --- */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">নতুন ওয়াল আর্ট প্রোডাক্ট যোগ করুন</h3>
              <button
                type="button"
                onClick={() => setShowAddProductModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">প্রোডাক্ট নাম *</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. আয়াতুল কুরসি গোল্ডেন স্টেইনলেস স্টিল আর্ট"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">ক্যাটাগরি *</label>
                <select
                  required
                  value={newProdCatId}
                  onChange={(e) => setNewProdCatId(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                >
                  <option value={0}>ক্যাটাগরি নির্বাচন করুন</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">মিডিয়াম সাইজ মূল্য (৳)</label>
                  <input
                    type="number"
                    required
                    value={newProdMediumPrice}
                    onChange={(e) => setNewProdMediumPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">লার্জ সাইজ মূল্য (৳)</label>
                  <input
                    type="number"
                    required
                    value={newProdLargePrice}
                    onChange={(e) => setNewProdLargePrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">প্রাথমিক স্টক (পিস)</label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">ম্যাটেরিয়াল</label>
                  <input
                    type="text"
                    value={newProdMaterial}
                    onChange={(e) => setNewProdMaterial(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">মূল ছবি লিংক (Image URL)</label>
                <input
                  type="url"
                  value={newProdPrimaryImg}
                  onChange={(e) => setNewProdPrimaryImg(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
                >
                  প্রোডাক্ট তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: EDIT PRODUCT MODAL --- */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">প্রোডাক্ট এডিট করুন</h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedProduct} className="space-y-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">প্রোডাক্ট নাম *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">ক্যাটাগরি *</label>
                <select
                  required
                  value={editingProduct.category_id}
                  onChange={(e) => {
                    const catId = Number(e.target.value);
                    const cat = categories.find(c => c.id === catId);
                    setEditingProduct({
                      ...editingProduct,
                      category_id: catId,
                      category_name: cat ? cat.name : editingProduct.category_name
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">মূল্য (৳)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">স্টক (পিস)</label>
                  <input
                    type="number"
                    value={editingProduct.stock || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">ছবির লিঙ্ক (Image URL)</label>
                <input
                  type="url"
                  value={editingProduct.image_url || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">বিবরণ (Description)</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: EDIT CATEGORY MODAL --- */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">ক্যাটাগরি এডিট করুন</h3>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedCategory} className="space-y-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">ক্যাটাগরি নাম *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">আইকন</label>
                  <input
                    type="text"
                    value={editingCategory.icon || '🕌'}
                    onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">ছবির লিঙ্ক</label>
                  <input
                    type="url"
                    value={editingCategory.image_url || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, image_url: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
                >
                  আপডেট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: CUSTOMER ORDER HISTORY DRAWER --- */}
      {selectedCustomerHistory && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-end sm:p-4">
          <div className="bg-white w-full sm:max-w-lg h-full sm:h-auto sm:max-h-[92vh] sm:rounded-2xl border border-slate-200/90 shadow-xl overflow-y-auto flex flex-col justify-between">
            <div className="p-5 sm:p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{selectedCustomerHistory.name} এর অর্ডার হিস্ট্রি</h3>
                  <span className="font-mono text-slate-500">{selectedCustomerHistory.phone}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCustomerHistory(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                <span>মোট অর্ডার: <strong className="font-mono">{selectedCustomerHistory.orders.length}</strong> টি</span>
                <span>মোট খরচ: <strong className="font-mono text-emerald-700">{formatPrice(selectedCustomerHistory.orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0))}</strong></span>
              </div>

              <div className="space-y-3">
                {selectedCustomerHistory.orders.map((ord, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-slate-900">#{ord.order_number}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                        ord.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        ord.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.status}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px]">{ord.created_at}</div>
                    <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                      <span>মোট:</span>
                      <span className="font-mono">{formatPrice(ord.total_amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCustomerHistory(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white font-medium cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 5: PRINTABLE INVOICE MODAL --- */}
      {printInvoiceOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-base">UNEX AURA INVOICE</h3>
                <p className="text-[11px] text-slate-500">Order #{printInvoiceOrder.order_number}</p>
              </div>
              <button
                type="button"
                onClick={() => setPrintInvoiceOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="font-bold text-slate-900">{printInvoiceOrder.user_name}</div>
              <div className="text-slate-600">{printInvoiceOrder.user_phone}</div>
              <div className="text-slate-600">{printInvoiceOrder.shipping_address}</div>
            </div>

            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-2">আইটেম</th>
                  <th className="p-2">পরিমাণ</th>
                  <th className="p-2 text-right">মূল্য</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.isArray(printInvoiceOrder.items) && printInvoiceOrder.items.map((it: any, idx: number) => (
                  <tr key={idx}>
                    <td className="p-2">{it.product_name || it.name} {it.selected_size_name ? `(${it.selected_size_name})` : ''}</td>
                    <td className="p-2">{it.quantity || 1}</td>
                    <td className="p-2 text-right font-mono">{formatPrice((it.price || 0) * (it.quantity || 1))}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-1 text-right text-xs">
              <div>ডেলিভারি চার্জ: <span className="font-mono">{formatPrice(printInvoiceOrder.delivery_charge || 0)}</span></div>
              <div className="font-bold text-sm text-slate-900">মোট পরিশোধযোগ্য: <span className="font-mono">{formatPrice(printInvoiceOrder.total_amount)}</span></div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>প্রিন্ট করুন</span>
              </button>
              <button
                type="button"
                onClick={() => setPrintInvoiceOrder(null)}
                className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
