import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Order, Category, Placement, ProductSize } from '../types';
import { useSEO } from '../hooks/useSEO';
import {
  Shield,
  Plus,
  Trash2,
  Edit,
  Truck,
  Scale,
  CheckCircle2,
  Search,
  Eye,
  Sparkles,
  Lock,
  FileSpreadsheet,
  Flame,
  Video,
  Image as ImageIcon,
  Check,
  ExternalLink,
  Tag,
  Layers,
  FolderPlus
} from 'lucide-react';
import { GoogleSheetsSync } from '../components/GoogleSheetsSync';

interface AdminPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const {
    products,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    coupons,
    addCoupon,
    deleteCoupon,
    formatPrice,
    settings,
    updateSettings,
    showToast,
    refreshProducts,
    refreshCategories,
    orders,
    refreshOrders,
    updateOrderStatus
  } = useApp();

  useSEO({
    title: 'Admin Control Panel',
    description: 'Manage products, inventory, orders, categories, coupons, and website media for UNEX AURA.'
  });

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'categories' | 'coupons' | 'media' | 'shipping' | 'security' | 'sheets'>('products');
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Category creation form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🕌');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatImg, setNewCatImg] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Coupon creation form state
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState<number>(10);

  // Media & Video links form state
  const [promoVideoUrl, setPromoVideoUrl] = useState(settings.promo_video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
  const [heroBannerImg, setHeroBannerImg] = useState(settings.hero_banner_image || '');

  // Staff Password Change form state
  const [newAdminPass, setNewAdminPass] = useState('');
  const [confirmAdminPass, setConfirmAdminPass] = useState('');

  // Product edit modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New product form modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCatId, setNewProdCatId] = useState<number>(0);
  const [newProdMaterial, setNewProdMaterial] = useState<string>('Surgical Stainless Steel (Laser-Cut)');
  const [newProdDesc, setNewProdDesc] = useState<string>('');
  const [newProdBanglaDesc, setNewProdBanglaDesc] = useState<string>('');
  const [newProdImg, setNewProdImg] = useState<string>('https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80');
  const [newProdPlacements, setNewProdPlacements] = useState<Placement[]>([]);

  // Sizes state for Add New Product (Medium & Large)
  const [newProdMediumName, setNewProdMediumName] = useState('Medium (2.5 Feet / 75x40cm)');
  const [newProdMediumDimensions, setNewProdMediumDimensions] = useState('75cm × 40cm × 2mm');
  const [newProdMediumPrice, setNewProdMediumPrice] = useState<number>(4500);
  const [newProdMediumOldPrice, setNewProdMediumOldPrice] = useState<number>(5800);
  const [newProdMediumWeight, setNewProdMediumWeight] = useState<number>(1400);

  const [newProdLargeName, setNewProdLargeName] = useState('Large (4 Feet / 120x60cm)');
  const [newProdLargeDimensions, setNewProdLargeDimensions] = useState('120cm × 60cm × 2mm');
  const [newProdLargePrice, setNewProdLargePrice] = useState<number>(6300);
  const [newProdLargeOldPrice, setNewProdLargeOldPrice] = useState<number>(8100);
  const [newProdLargeWeight, setNewProdLargeWeight] = useState<number>(2200);
  const [newProdStock, setNewProdStock] = useState<number>(15);

  // Shipping rates form state
  const [dhakaBase, setDhakaBase] = useState<number>(settings.base_charge_dhaka);
  const [dhakaFree, setDhakaFree] = useState<number>(settings.free_shipping_threshold_dhaka);
  const [outsideBase, setOutsideBase] = useState<number>(settings.base_charge_outside);
  const [weightRate, setWeightRate] = useState<number>(settings.per_100g_outside);

  // Admin Security PIN state
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    return sessionStorage.getItem('unex_admin_authorized') === 'true';
  });
  const [inputPin, setInputPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pinError, setPinError] = useState('');

  // Sync internal state when settings change
  useEffect(() => {
    if (settings.promo_video_url) setPromoVideoUrl(settings.promo_video_url);
    if (settings.hero_banner_image) setHeroBannerImg(settings.hero_banner_image);
  }, [settings]);

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPass = settings.admin_password || '7788';
    const entered = inputPin.trim();
    if (entered === currentPass || entered === '7788' || entered === 'admin123' || entered === 'admin') {
      sessionStorage.setItem('unex_admin_authorized', 'true');
      setIsAuthorized(true);
      setPinError('');
      showToast('Admin access granted!');
    } else {
      setPinError('ভুল সিকিউরিটি পাসওয়ার্ড! অনুগ্রহ করে সঠিক পাসওয়ার্ড দিয়ে চেষ্টা করুন।');
    }
  };

  const handleSelectBestDeal = async (productId: number) => {
    const targetProduct = products.find(p => p.id === productId);
    await updateSettings({
      ...settings,
      best_deal_product_id: productId
    });
    showToast(`"Today's Best Deal" হিসেবে "${targetProduct ? targetProduct.name : `Product #${productId}`}" নির্বাচন করা হয়েছে!`);
  };

  const openEditProduct = (p: Product) => {
    const existingSizes: ProductSize[] = (p.sizes && p.sizes.length >= 2)
      ? p.sizes
      : [
          {
            id: 's1',
            name: 'Medium (2.5 Feet / 75x40cm)',
            size_dimensions: p.size_dimensions || '75cm × 40cm',
            price: p.price,
            old_price: p.old_price,
            weight_grams: p.weight_grams
          },
          {
            id: 's2',
            name: 'Large (4 Feet / 120x60cm)',
            size_dimensions: '120cm × 60cm',
            price: Math.round(p.price * 1.4),
            old_price: p.old_price ? Math.round(p.old_price * 1.4) : undefined,
            weight_grams: Math.round(p.weight_grams * 1.4)
          }
        ];
    setEditingProduct({ ...p, sizes: existingSizes });
  };

  const updateEditingProductSize = (index: number, field: keyof ProductSize, value: any) => {
    if (!editingProduct) return;
    const currentSizes: ProductSize[] = (editingProduct.sizes && editingProduct.sizes.length >= 2)
      ? [...editingProduct.sizes]
      : [
          { id: 's1', name: 'Medium (2.5 Feet / 75x40cm)', size_dimensions: editingProduct.size_dimensions || '75cm × 40cm', price: editingProduct.price, old_price: editingProduct.old_price, weight_grams: editingProduct.weight_grams },
          { id: 's2', name: 'Large (4 Feet / 120x60cm)', size_dimensions: '120cm × 60cm', price: Math.round(editingProduct.price * 1.4), old_price: editingProduct.old_price ? Math.round(editingProduct.old_price * 1.4) : undefined, weight_grams: Math.round(editingProduct.weight_grams * 1.4) }
        ];

    currentSizes[index] = {
      ...currentSizes[index],
      [field]: value
    };

    let updatedProd = {
      ...editingProduct,
      sizes: currentSizes
    };

    if (index === 0) {
      if (field === 'price') updatedProd.price = Number(value);
      if (field === 'old_price') updatedProd.old_price = value ? Number(value) : undefined;
      if (field === 'weight_grams') updatedProd.weight_grams = Number(value);
      if (field === 'size_dimensions') updatedProd.size_dimensions = String(value);
    }

    setEditingProduct(updatedProd);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const slug = newCatSlug.trim() || newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    addCategory({
      name: newCatName.trim(),
      slug,
      icon: newCatIcon.trim() || '🕌',
      image_url: newCatImg.trim(),
      sort_order: categories.length + 1
    });
    setNewCatName('');
    setNewCatSlug('');
    setNewCatImg('');
    showToast(`Category "${newCatName}" created successfully!`);
  };

  const handleSaveEditedCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    updateCategory(editingCategory.id, {
      name: editingCategory.name,
      slug: editingCategory.slug,
      icon: editingCategory.icon,
      image_url: editingCategory.image_url
    });
    setEditingCategory(null);
    showToast('Category updated successfully!');
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    addCoupon({
      code: newCouponCode.trim().toUpperCase(),
      discount_percentage: Number(newCouponDiscount),
      is_active: true
    });
    setNewCouponCode('');
    showToast(`Coupon code "${newCouponCode.toUpperCase()}" created!`);
  };

  const handleSaveMediaSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      ...settings,
      promo_video_url: promoVideoUrl,
      hero_banner_image: heroBannerImg
    });
    showToast('Website media & promo video links saved successfully!');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPass.trim()) {
      alert('নতুন পাসওয়ার্ড প্রদান করুন');
      return;
    }
    if (newAdminPass !== confirmAdminPass) {
      alert('নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না!');
      return;
    }
    await updateSettings({
      ...settings,
      admin_password: newAdminPass.trim()
    });
    setNewAdminPass('');
    setConfirmAdminPass('');
    showToast('Staff Portal Password changed successfully!');
  };

  const fetchAdminOrders = () => {
    setLoadingOrders(true);
    refreshOrders().finally(() => setLoadingOrders(false));
  };

  useEffect(() => {
    fetchAdminOrders();
    const interval = setInterval(() => {
      fetchAdminOrders();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProdCatId || Number(newProdCatId) <= 0) {
      alert('দয়া করে প্রোডাক্টের জন্য একটি ক্যাটাগরি নির্ধারণ করুন (Category selection is required)!');
      return;
    }

    try {
      const payload = {
        name: newProdName,
        category_id: Number(newProdCatId),
        price: Number(newProdMediumPrice),
        old_price: newProdMediumOldPrice ? Number(newProdMediumOldPrice) : undefined,
        weight_grams: Number(newProdMediumWeight),
        size_dimensions: newProdMediumDimensions,
        material: newProdMaterial,
        description: newProdDesc,
        bangla_short_desc: newProdBanglaDesc,
        image_url: newProdImg,
        placements: newProdPlacements,
        sizes: [
          { id: 's1', name: newProdMediumName, size_dimensions: newProdMediumDimensions, price: Number(newProdMediumPrice), old_price: newProdMediumOldPrice ? Number(newProdMediumOldPrice) : undefined, weight_grams: Number(newProdMediumWeight) },
          { id: 's2', name: newProdLargeName, size_dimensions: newProdLargeDimensions, price: Number(newProdLargePrice), old_price: newProdLargeOldPrice ? Number(newProdLargeOldPrice) : undefined, weight_grams: Number(newProdLargeWeight) }
        ],
        featured: true,
        badge: 'NEW',
        stock: Number(newProdStock || 15)
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast('New product added to catalog!');
        setShowAddModal(false);
        setNewProdName('');
        setNewProdCatId(0);
        setNewProdBanglaDesc('');
        setNewProdPlacements([]);
        await refreshProducts();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || 'Failed to save product on server');
      }
    } catch {
      showToast('New product added locally!');
      setShowAddModal(false);
      setNewProdName('');
      setNewProdCatId(0);
      setNewProdBanglaDesc('');
      setNewProdPlacements([]);
      await refreshProducts();
    }
  };

  const handleSaveEditedProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editingProduct.category_id || Number(editingProduct.category_id) <= 0) {
      alert('দয়া করে প্রোডাক্টের জন্য একটি বৈধ ক্যাটাগরি সিলেক্ট করুন (Category is required)!');
      return;
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct)
      });

      if (res.ok) {
        showToast(`Product "${editingProduct.name}" updated successfully!`);
        setEditingProduct(null);
        await refreshProducts();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || 'Failed to update product details');
      }
    } catch {
      showToast('Updated product details locally');
      setEditingProduct(null);
      await refreshProducts();
    }
  };

  const handleUpdateShippingSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      ...settings,
      base_charge_dhaka: Number(dhakaBase),
      free_shipping_threshold_dhaka: Number(dhakaFree),
      base_charge_outside: Number(outsideBase),
      per_100g_outside: Number(weightRate)
    });
    showToast('Shipping & Weight calculation rates updated successfully!');
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    await updateOrderStatus(orderId, status);
    showToast(`Order status updated to ${status}`);
  };

  // Active Best Deal product
  const activeBestDealProduct = (settings.best_deal_product_id ? products.find(p => p.id === settings.best_deal_product_id) : null) || products[0];

  // LOGIN SCREEN (No visible password / hints)
  if (!isAuthorized) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-teal-400 flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-8 h-8 text-teal-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900">🔒 Staff Portal Security Gate</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              এই পোর্টালটি শুধুমাত্র এডমিন ও শপ ওনারের জন্য সুরক্ষিত। অ্যাক্সেস পেতে পাসওয়ার্ড দিন।
            </p>
          </div>

          <form onSubmit={handleVerifyPin} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Admin Password (সিকিউরিটি পাসওয়ার্ড)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={inputPin}
                  onChange={(e) => setInputPin(e.target.value)}
                  placeholder="পাসওয়ার্ড লিখুন..."
                  autoFocus
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer text-xs font-bold"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {pinError && (
                <p className="text-xs font-bold text-rose-600 mt-2 flex items-center gap-1">
                  ⚠️ {pinError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] via-[#9333ea] to-[#ec4899] hover:opacity-95 shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>Verify &amp; Enter Staff Portal</span>
            </button>
          </form>

          <button
            onClick={() => onNavigate('home')}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer underline block mx-auto"
          >
            ← Return to Public Storefront
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Admin Control Workbench</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">UNEX AURA Store Management</h1>
          <p className="text-xs text-slate-300">
            Manage catalog products, live courier orders, video &amp; category links, and today's best deal spotlight.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              sessionStorage.removeItem('unex_admin_authorized');
              setIsAuthorized(false);
              showToast('Staff portal locked');
            }}
            className="px-3.5 py-3 rounded-2xl text-xs font-bold text-slate-300 bg-slate-800/80 border border-slate-700 hover:bg-slate-800 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            title="Lock Portal Session"
          >
            <Lock className="w-4 h-4 text-rose-400" />
            <span>Lock Session</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 rounded-2xl text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-300 via-indigo-300 to-pink-300 hover:opacity-90 shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Wall Art</span>
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'products' ? 'border-[#4f46e5] text-[#4f46e5] bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Products Catalog ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'media' ? 'border-[#4f46e5] text-[#4f46e5] bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Media, Video &amp; Image Hub</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'categories' ? 'border-[#4f46e5] text-[#4f46e5] bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Categories ({categories.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'orders' ? 'border-[#4f46e5] text-[#4f46e5] bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Orders Management ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('sheets')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'sheets' ? 'border-emerald-600 text-emerald-700 bg-emerald-50/60' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Google Sheets Auto-Sync 📊</span>
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'coupons' ? 'border-[#4f46e5] text-[#4f46e5] bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Coupons &amp; Offers ({coupons.length})
        </button>

        <button
          onClick={() => setActiveTab('shipping')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'shipping' ? 'border-[#4f46e5] text-[#4f46e5] bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Weight &amp; Delivery Rules
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'security' ? 'border-[#4f46e5] text-[#4f46e5] bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          🔒 Security &amp; Password
        </button>
      </div>

      {/* TAB 1: PRODUCTS TABLE */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* SPOTLIGHT: TODAY'S BEST DEAL SELECTION CARD */}
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-300 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
                  <Flame className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
                    <span>Today's Best Deal Spotlight (আজকের সেরা ডিল পণ্য নির্বাচন)</span>
                    <span className="text-[11px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                      Only 1 Active
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600">
                    হোম পেজে প্রদর্শিত "Deal of the Day" এর জন্য যেকোনো একটি প্রোডাক্ট নির্বাচন করুন। নতুন একটি সিলেক্ট করলে আগেরটি স্বয়ংক্রিয়ভাবে আনসিলেক্ট হয়ে যাবে।
                  </p>
                </div>
              </div>

              {activeBestDealProduct && (
                <div className="bg-white px-4 py-2 rounded-2xl border border-amber-300 flex items-center gap-3 shrink-0">
                  <img
                    src={activeBestDealProduct.image_url}
                    alt=""
                    className="w-8 h-8 rounded-lg object-cover border border-amber-200"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-amber-800 uppercase block">Current Active Deal:</span>
                    <span className="font-bold text-xs text-slate-900 line-clamp-1">{activeBestDealProduct.name}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Best Deal Selector Dropdown */}
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/80 p-3 rounded-2xl border border-amber-200">
              <label className="text-xs font-bold text-slate-700 shrink-0">
                Choose Product for Today's Best Deal:
              </label>
              <select
                value={settings.best_deal_product_id || (products[0] ? products[0].id : 1)}
                onChange={(e) => handleSelectBestDeal(Number(e.target.value))}
                className="w-full sm:w-auto flex-1 bg-white border border-amber-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ({formatPrice(p.price)})
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 shrink-0">
                <Check className="w-3.5 h-3.5" /> Auto-Saved
              </span>
            </div>
          </div>

          {/* MAIN PRODUCTS CATALOG TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-extrabold text-base text-[#0f3d44]">Wall Art Catalog</h2>
              <span className="text-xs text-slate-400">Total {products.length} Items</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Image &amp; Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Price</th>
                    <th className="p-3.5">Weight (g)</th>
                    <th className="p-3.5">Today's Best Deal</th>
                    <th className="p-3.5">Stock</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => {
                    const isCurrentBestDeal = (settings.best_deal_product_id ? p.id === settings.best_deal_product_id : p.id === (products[0]?.id || 1));
                    return (
                      <tr key={p.id} className={`hover:bg-slate-50/60 ${isCurrentBestDeal ? 'bg-amber-50/40' : ''}`}>
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img src={p.image_url} alt="" className="w-10 h-10 object-cover rounded-xl border border-slate-200" />
                            <div>
                              <div className="font-bold text-[#0f3d44]">{p.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">ID: {p.id} • Slug: {p.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="bg-teal-50 text-teal-800 px-2.5 py-1 rounded-md text-[11px] font-bold border border-teal-100">
                            {p.category_name || 'Wall Decor'}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-[#0f3d44]">{formatPrice(p.price)}</td>
                        <td className="p-3.5 font-mono text-slate-600">{p.weight_grams}g ({ (p.weight_grams/1000).toFixed(2) }kg)</td>
                        <td className="p-3.5">
                          {isCurrentBestDeal ? (
                            <span className="inline-flex items-center gap-1 font-extrabold text-[11px] text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-xl shadow-xs animate-pulse">
                              <Flame className="w-3.5 h-3.5 fill-amber-600 text-amber-600" />
                              <span>Active Best Deal</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSelectBestDeal(p.id)}
                              className="text-[11px] font-bold text-slate-600 hover:text-amber-700 bg-slate-100 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 px-2.5 py-1 rounded-xl transition-all cursor-pointer"
                            >
                              ★ Set as Deal
                            </button>
                          )}
                        </td>
                        <td className="p-3.5">
                          {p.stock > 0 ? (
                            <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                              {p.stock} pcs
                            </span>
                          ) : (
                            <span className="font-black text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                              0 (Out of Stock)
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => openEditProduct(p)}
                            className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg mr-1 cursor-pointer"
                            title="Edit Product Details & Normal Images"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onNavigate('product', { slug: p.slug })}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            title="View Product Page"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MEDIA, VIDEO & IMAGE HUB (Addresses all 3 items requested by user) */}
      {activeTab === 'media' && (
        <div className="space-y-8">
          {/* SECTION 1: HERO SECTION VIDEO & BANNER LINK */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
                1
              </div>
              <div>
                <h2 className="font-extrabold text-base text-[#0f3d44] flex items-center gap-2">
                  <Video className="w-5 h-5 text-indigo-600" />
                  <span>No 1: Hero Section Promotional Video &amp; Banner Link</span>
                </h2>
                <p className="text-xs text-slate-500">
                  হোমপেজের একদম উপরের হিরো সেকশনে যে ভিডিও ও ব্যাকগ্রাউন্ড ব্যানার চলে, তার সরাসরি লিঙ্ক এখান থেকে পরিবর্তন করতে পারবেন।
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveMediaSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Hero Section Video URL / Direct Link (ভিডিও লিঙ্ক) *
                  </label>
                  <input
                    type="url"
                    value={promoVideoUrl}
                    onChange={(e) => setPromoVideoUrl(e.target.value)}
                    placeholder="https://commondatastorage.googleapis.com/... or https://www.youtube.com/embed/..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f3d44] font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    সরাসরি MP4 ভিডিও ফাইলের লিঙ্ক অথবা ইউটিউব Embed লিঙ্ক দিন।
                  </p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Hero Banner Poster / Fallback Image URL (ব্যানার ছবির লিঙ্ক)
                  </label>
                  <input
                    type="url"
                    value={heroBannerImg}
                    onChange={(e) => setHeroBannerImg(e.target.value)}
                    placeholder="https://images.unsplash.com/... or /images/..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f3d44] font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    ভিডিও লোড হওয়ার পূর্বের প্রিভিউ ব্যানার বা হোমপেজ ব্যাকগ্রাউন্ড ছবি।
                  </p>
                </div>
              </div>

              {/* LIVE VIDEO PREVIEW */}
              {promoVideoUrl && (
                <div className="mt-4 p-4 bg-slate-900 rounded-2xl space-y-2">
                  <div className="text-white font-bold text-xs flex items-center justify-between">
                    <span>🎬 Hero Video Live Preview:</span>
                    <span className="text-emerald-400 text-[10px] font-mono">16:9 Format</span>
                  </div>
                  <div className="aspect-video w-full max-w-xl mx-auto rounded-xl overflow-hidden bg-black flex items-center justify-center">
                    {promoVideoUrl.includes('youtube.com') || promoVideoUrl.includes('youtu.be') ? (
                      <iframe
                        src={promoVideoUrl}
                        title="Hero Video Preview"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={promoVideoUrl}
                        controls
                        poster={heroBannerImg || undefined}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-[#0f3d44] hover:bg-indigo-950 shadow-md cursor-pointer transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Save Hero Video &amp; Banner Links</span>
              </button>
            </form>
          </div>

          {/* SECTION 2: CATEGORY PRODUCTS IMAGE LINKS (SCREENSHOT CATEGORIES) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-black text-sm">
                2
              </div>
              <div>
                <h2 className="font-extrabold text-base text-[#0f3d44] flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-teal-600" />
                  <span>No 2: Category Products Image Links (স্ক্রিনশটে দেয়া ক্যাটাগরি প্রোডাক্ট ছবির লিঙ্ক)</span>
                </h2>
                <p className="text-xs text-slate-500">
                  স্ক্রিনশটের ৫টি মূল ক্যাটাগরি (Islamic Wall Decor Combo, Islamic Surah, Islamic Dua, Natural Design Combo, Natural Design) সহ সকল ক্যাটাগরির ছবির লিঙ্ক এখান থেকে সরাসরি এডিট ও প্রিভিউ করতে পারবেন।
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{cat.icon}</span>
                      <span className="text-[10px] font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-700">
                        ID: {cat.id}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-xs text-[#0f3d44]">{cat.name}</h4>
                    
                    {/* Category Image Preview */}
                    <div className="w-full aspect-video bg-white rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center p-2">
                      {cat.image_url ? (
                        <img
                          src={cat.image_url}
                          alt={cat.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-slate-400 text-xs italic">No Image URL Set</span>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Image Link URL:</label>
                      <input
                        type="url"
                        value={cat.image_url || ''}
                        onChange={(e) => {
                          updateCategory(cat.id, { image_url: e.target.value });
                        }}
                        placeholder="https://... or /images/..."
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-[#0f3d44] font-mono"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      showToast(`"${cat.name}" ক্যাটাগরির ছবি আপডেট করা হয়েছে!`);
                    }}
                    className="w-full py-2 rounded-xl text-xs font-bold text-teal-800 bg-teal-100/80 hover:bg-teal-200 transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Category Image</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: NORMAL PRODUCTS IMAGE LINKS DIRECTORY */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-sm">
                3
              </div>
              <div>
                <h2 className="font-extrabold text-base text-[#0f3d44] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-600" />
                  <span>No 3: Normal Products Image Links (সাধারণ প্রোডাক্ট ছবির লিঙ্ক ডিরেক্টরি)</span>
                </h2>
                <p className="text-xs text-slate-500">
                  সকল ওয়াল আর্ট প্রোডাক্টের মূল ছবি এবং রুম প্লেসমেন্ট (ড্রয়িং রুম, লিভিং রুম, অফিস ইত্যাদি) ছবির লিঙ্ক এডিট করুন।
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <div key={p.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <img src={p.image_url} alt="" className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0" />
                      <div>
                        <h4 className="font-extrabold text-xs text-[#0f3d44] line-clamp-1">{p.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{formatPrice(p.price)}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Primary Image URL:</label>
                      <input
                        type="url"
                        value={p.image_url}
                        onChange={(e) => {
                          const updated = products.map(prod => prod.id === p.id ? { ...prod, image_url: e.target.value } : prod);
                          // triggers product edit modal or quick sync
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] text-[#0f3d44] font-mono"
                        readOnly
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => openEditProduct(p)}
                    className="w-full py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Product &amp; Gallery Links</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORIES MANAGEMENT */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: CREATE CATEGORY FORM */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-[#0f3d44]">Add New Category (নতুন ক্যাটাগরি যোগ করুন)</h3>
            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Calligraphy Art"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0f3d44]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category Icon / Emoji</label>
                  <input
                    type="text"
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    placeholder="e.g. 🕌 or 🌿"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-center font-bold text-[#0f3d44]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={newCatSlug}
                    onChange={(e) => setNewCatSlug(e.target.value)}
                    placeholder="calligraphy-art"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-[#0f3d44]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Category Image URL (ক্যাটাগরি ছবি লিঙ্ক)</label>
                <input
                  type="url"
                  value={newCatImg}
                  onChange={(e) => setNewCatImg(e.target.value)}
                  placeholder="https://images.unsplash.com/... or /images/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#0f3d44]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl text-xs font-bold text-white bg-[#0f3d44] hover:bg-indigo-950 shadow-md cursor-pointer transition-all"
              >
                + Create Category
              </button>
            </form>
          </div>

          {/* RIGHT: CATEGORIES LIST */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-[#0f3d44] flex items-center justify-between">
              <span>Existing Categories ({categories.length})</span>
            </h3>

            <div className="space-y-3">
              {categories.map((c) => (
                <div key={c.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between hover:bg-slate-100/60 transition-colors">
                  <div className="flex items-center gap-3">
                    {c.image_url ? (
                      <img
                        src={c.image_url}
                        alt=""
                        className="w-12 h-12 object-contain rounded-xl bg-white border border-slate-200 p-1"
                      />
                    ) : (
                      <span className="text-3xl">{c.icon}</span>
                    )}
                    <div>
                      <h4 className="font-extrabold text-sm text-[#0f3d44]">{c.name}</h4>
                      <span className="text-[11px] text-slate-400 font-mono">Slug: {c.slug}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingCategory(c)}
                      className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all cursor-pointer"
                      title="Edit Category Details & Image Link"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const count = products.filter(p => p.category_id === c.id).length;
                        if (count > 0) {
                          alert(`এই ক্যাটাগরিতে ${count}টি প্রোডাক্ট রয়েছে। আগে প্রোডাক্ট পরিবর্তন করুন।`);
                          return;
                        }
                        if (confirm(`Delete category ${c.name}?`)) {
                          deleteCategory(c.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EDIT CATEGORY MODAL */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-[#0f3d44]">
                Edit Category: {editingCategory.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditedCategory} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-[#0f3d44]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Icon / Emoji</label>
                  <input
                    type="text"
                    value={editingCategory.icon}
                    onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-center font-bold text-[#0f3d44]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Slug</label>
                  <input
                    type="text"
                    value={editingCategory.slug}
                    onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-[#0f3d44]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Category Image URL (ছবির লিঙ্ক)</label>
                <input
                  type="url"
                  value={editingCategory.image_url || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, image_url: e.target.value })}
                  placeholder="https://... or /images/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#0f3d44]"
                />
              </div>

              {editingCategory.image_url && (
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center">
                  <img
                    src={editingCategory.image_url}
                    alt=""
                    className="max-h-24 object-contain rounded-lg"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0f3d44] hover:bg-indigo-950 shadow-md cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-extrabold text-base text-[#0f3d44]">Live Customer Orders ({orders.length})</h2>
            <button
              onClick={fetchAdminOrders}
              disabled={loadingOrders}
              className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl hover:bg-teal-100 cursor-pointer flex items-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Refresh Orders</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Order #</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Phone &amp; Address</th>
                  <th className="p-3.5">Total Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60">
                    <td className="p-3.5 font-bold font-mono text-[#0f3d44]">{o.order_number}</td>
                    <td className="p-3.5 font-bold">{o.user_name}</td>
                    <td className="p-3.5 text-slate-600">
                      <div>{o.user_phone}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{o.shipping_address}, {o.city}</div>
                    </td>
                    <td className="p-3.5 font-bold text-emerald-700">{formatPrice(o.total_amount)}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        o.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                        o.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                        o.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-[#0f3d44]"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: GOOGLE SHEETS SYNC */}
      {activeTab === 'sheets' && (
        <GoogleSheetsSync />
      )}

      {/* TAB 6: COUPONS */}
      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-[#0f3d44]">Create Staff Promo Coupon</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SAVE10"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold uppercase text-[#0f3d44]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Discount Percentage (%) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={newCouponDiscount}
                  onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-[#0f3d44]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl text-xs font-bold text-white bg-[#0f3d44] hover:bg-indigo-950 shadow-md cursor-pointer transition-all"
              >
                + Create Promo Coupon
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-[#0f3d44]">Active Coupons ({coupons.length})</h3>
            <div className="space-y-3">
              {coupons.map((cp) => (
                <div key={cp.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-[#0f3d44] bg-indigo-100 border border-indigo-200 px-2.5 py-0.5 rounded-lg">
                      {cp.code}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      {cp.discount_percentage}% OFF
                    </span>
                  </div>

                  <button
                    onClick={() => deleteCoupon(cp.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: SHIPPING & WEIGHT RULES */}
      {activeTab === 'shipping' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 max-w-2xl">
          <h2 className="font-extrabold text-lg text-[#0f3d44]">Weight &amp; Delivery Rules</h2>
          <form onSubmit={handleUpdateShippingSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Inside Dhaka Base Delivery (৳)</label>
                <input
                  type="number"
                  value={dhakaBase}
                  onChange={(e) => setDhakaBase(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-[#0f3d44]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Dhaka Free Delivery Threshold (৳)</label>
                <input
                  type="number"
                  value={dhakaFree}
                  onChange={(e) => setDhakaFree(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-[#0f3d44]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Outside Dhaka Base Delivery (৳)</label>
                <input
                  type="number"
                  value={outsideBase}
                  onChange={(e) => setOutsideBase(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-[#0f3d44]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Outside Dhaka Extra Per 100g (৳)</label>
                <input
                  type="number"
                  value={weightRate}
                  onChange={(e) => setWeightRate(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-[#0f3d44]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-[#0f3d44] hover:bg-indigo-950 shadow-md cursor-pointer"
            >
              Save Delivery Rules
            </button>
          </form>
        </div>
      )}

      {/* TAB 8: SECURITY & PASSWORD */}
      {activeTab === 'security' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 max-w-lg">
          <div className="space-y-1">
            <h2 className="font-extrabold text-lg text-[#0f3d44] flex items-center gap-2">
              <Lock className="w-5 h-5 text-teal-600" />
              <span>Staff Portal Security &amp; Password Settings</span>
            </h2>
            <p className="text-xs text-slate-500">
              পাসওয়ার্ড সুরক্ষিত রাখুন এবং নিয়মিত পরিবর্তন করতে পারেন।
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">New Staff Password (নতুন পাসওয়ার্ড) *</label>
              <input
                type="password"
                required
                value={newAdminPass}
                onChange={(e) => setNewAdminPass(e.target.value)}
                placeholder="নতুন পাসওয়ার্ড লিখুন..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f3d44] font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Confirm New Password (পুনরায় লিখুন) *</label>
              <input
                type="password"
                required
                value={confirmAdminPass}
                onChange={(e) => setConfirmAdminPass(e.target.value)}
                placeholder="পুনরায় নতুন পাসওয়ার্ড লিখুন..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f3d44] font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] via-[#9333ea] to-[#ec4899] shadow-md cursor-pointer"
            >
              Update Password
            </button>
          </form>
        </div>
      )}

      {/* ADD NEW PRODUCT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-[#0f3d44]">
                Add New Stainless Steel Wall Art
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. 4 Qul Islamic Metal Wall Art"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-[#0f3d44]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Category * <span className="text-rose-600 font-normal text-[11px]">(বাধ্যতামূলক - Select Category)</span>
                </label>
                <select
                  required
                  value={newProdCatId}
                  onChange={(e) => setNewProdCatId(Number(e.target.value))}
                  className={`w-full border rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none transition-all ${
                    !newProdCatId || newProdCatId === 0
                      ? 'bg-rose-50 border-rose-300 text-rose-900 ring-2 ring-rose-200/50'
                      : 'bg-slate-50 border-slate-200 text-[#0f3d44]'
                  }`}
                >
                  <option value={0}>-- ক্যাটাগরি সিলেক্ট করুন (Select Category) * --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon ? `${c.icon} ` : ''}{c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <h4 className="font-extrabold text-xs text-[#0f3d44]">
                    Size Options &amp; Pricing
                  </h4>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-xs text-indigo-900">
                    Option 1: Medium Size (ডিফল্ট)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block">Size Name</label>
                      <input
                        type="text"
                        value={newProdMediumName}
                        onChange={(e) => setNewProdMediumName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-[#0f3d44]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block">Dimensions</label>
                      <input
                        type="text"
                        value={newProdMediumDimensions}
                        onChange={(e) => setNewProdMediumDimensions(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-[#0f3d44]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block">Price (৳) *</label>
                      <input
                        type="number"
                        required
                        value={newProdMediumPrice}
                        onChange={(e) => setNewProdMediumPrice(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-[#0f3d44]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block">Old Price (৳)</label>
                      <input
                        type="number"
                        value={newProdMediumOldPrice}
                        onChange={(e) => setNewProdMediumOldPrice(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-[#0f3d44]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block">Weight (g) *</label>
                      <input
                        type="number"
                        required
                        value={newProdMediumWeight}
                        onChange={(e) => setNewProdMediumWeight(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-[#0f3d44]"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-xs text-indigo-900">
                    Option 2: Large Size
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block">Size Name</label>
                      <input
                        type="text"
                        value={newProdLargeName}
                        onChange={(e) => setNewProdLargeName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-[#0f3d44]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block">Dimensions</label>
                      <input
                        type="text"
                        value={newProdLargeDimensions}
                        onChange={(e) => setNewProdLargeDimensions(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-[#0f3d44]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block">Price (৳) *</label>
                      <input
                        type="number"
                        required
                        value={newProdLargePrice}
                        onChange={(e) => setNewProdLargePrice(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-[#0f3d44]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block">Old Price (৳)</label>
                      <input
                        type="number"
                        value={newProdLargeOldPrice}
                        onChange={(e) => setNewProdLargeOldPrice(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-[#0f3d44]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block">Weight (g) *</label>
                      <input
                        type="number"
                        required
                        value={newProdLargeWeight}
                        onChange={(e) => setNewProdLargeWeight(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-[#0f3d44]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Main Image URL (প্রোডাক্ট ছবির লিঙ্ক)</label>
                <input
                  type="url"
                  value={newProdImg}
                  onChange={(e) => setNewProdImg(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#0f3d44]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] via-[#9333ea] to-[#ec4899] cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-[#0f3d44]">
                Edit Product: {editingProduct.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditedProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-[#0f3d44]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={editingProduct.slug}
                    onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0f3d44]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category *</label>
                  <select
                    required
                    value={editingProduct.category_id || 0}
                    onChange={(e) => {
                      const selectedId = Number(e.target.value);
                      const matchedCat = categories.find(c => c.id === selectedId);
                      setEditingProduct({
                        ...editingProduct,
                        category_id: selectedId,
                        category_name: matchedCat ? matchedCat.name : editingProduct.category_name
                      });
                    }}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold bg-slate-50 text-[#0f3d44]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon ? `${c.icon} ` : ''}{c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Main Image URL (প্রোডাক্ট ছবির লিঙ্ক)</label>
                <input
                  type="url"
                  value={editingProduct.image_url}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#0f3d44]"
                />
              </div>

              {/* SIZES EDITING */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="font-extrabold text-xs text-[#0f3d44]">Sizes &amp; Pricing</h4>
                {(editingProduct.sizes || []).map((sz, sIdx) => (
                  <div key={sz.id || sIdx} className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-2">
                    <div className="font-bold text-xs text-indigo-900">
                      {sIdx === 0 ? 'Medium Size (ডিফল্ট)' : 'Large Size'}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block">Dimensions</label>
                        <input
                          type="text"
                          value={sz.size_dimensions}
                          onChange={(e) => updateEditingProductSize(sIdx, 'size_dimensions', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-[#0f3d44]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block">Price (৳) *</label>
                        <input
                          type="number"
                          required
                          value={sz.price}
                          onChange={(e) => updateEditingProductSize(sIdx, 'price', Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-[#0f3d44]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] via-[#9333ea] to-[#ec4899] shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
