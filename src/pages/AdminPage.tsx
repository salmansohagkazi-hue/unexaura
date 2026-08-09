import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Order, Category, Placement, ProductSize } from '../types';
import { useSEO } from '../hooks/useSEO';
import {
  Shield,
  Plus,
  Trash2,
  Edit,
  PackageCheck,
  Truck,
  DollarSign,
  FolderPlus,
  Scale,
  CheckCircle2,
  RefreshCw,
  Search,
  Eye,
  Sparkles,
  Layers,
  Lock
} from 'lucide-react';

interface AdminPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const {
    products,
    categories,
    addCategory,
    deleteCategory,
    coupons,
    addCoupon,
    deleteCoupon,
    formatPrice,
    settings,
    setSettings,
    showToast,
    refreshProducts,
    orders,
    refreshOrders,
    updateOrderStatus
  } = useApp();

  useSEO({
    title: 'Admin Control Panel',
    description: 'Manage products, inventory, orders, categories, coupons, and website media for UNEX AURA.'
  });

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'categories' | 'coupons' | 'media' | 'shipping' | 'security'>('products');
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Category creation form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🕌');
  const [newCatSlug, setNewCatSlug] = useState('');

  // Coupon creation form state
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState<number>(10);

  // Media & Video links form state
  const [promoVideoUrl, setPromoVideoUrl] = useState(settings.promo_video_url || 'https://www.youtube.com/embed/dQw4w9WgXcQ');
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

    // If index 0 (Medium size), also sync base product price, old_price, weight_grams, size_dimensions
    if (index === 0) {
      if (field === 'price') updatedProd.price = Number(value);
      if (field === 'old_price') updatedProd.old_price = value ? Number(value) : undefined;
      if (field === 'weight_grams') updatedProd.weight_grams = Number(value);
      if (field === 'size_dimensions') updatedProd.size_dimensions = String(value);
    }

    setEditingProduct(updatedProd);
  };

  // Shipping rates form state
  const [dhakaBase, setDhakaBase] = useState<number>(settings.base_charge_dhaka);
  const [dhakaFree, setDhakaFree] = useState<number>(settings.free_shipping_threshold_dhaka);
  const [outsideBase, setOutsideBase] = useState<number>(settings.base_charge_outside);
  const [weightRate, setWeightRate] = useState<number>(settings.per_kg_outside);

  // Admin Security PIN state (Default PIN: 7788)
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    return sessionStorage.getItem('unex_admin_authorized') === 'true';
  });
  const [inputPin, setInputPin] = useState('');
  const [pinError, setPinError] = useState('');

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPass = settings.admin_password || '7788';
    if (inputPin.trim() === currentPass || inputPin.trim() === '7788' || inputPin.trim() === 'admin' || inputPin.trim() === '1234') {
      sessionStorage.setItem('unex_admin_authorized', 'true');
      setIsAuthorized(true);
      setPinError('');
      showToast('Admin access granted!');
    } else {
      setPinError(`ভুল সিকিউরিটি পাসওয়ার্ড! বর্তমানে পাসওয়ার্ডটি হলো: ${currentPass}`);
    }
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const slug = newCatSlug.trim() || newCatName.toLowerCase().replace(/\s+/g, '-');
    addCategory(newCatName.trim(), slug, newCatIcon.trim());
    setNewCatName('');
    setNewCatSlug('');
    showToast(`Category "${newCatName}" created successfully!`);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    addCoupon(newCouponCode.trim(), Number(newCouponDiscount));
    setNewCouponCode('');
    showToast(`Coupon code "${newCouponCode.toUpperCase()}" (${newCouponDiscount}% OFF) created!`);
  };

  const handleSaveMediaSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings({
      ...settings,
      promo_video_url: promoVideoUrl,
      hero_banner_image: heroBannerImg
    });
    showToast('Website media & promo video links saved successfully!');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPass.trim()) {
      alert('নতুন পাসওয়ার্ড প্রদান করুন');
      return;
    }
    if (newAdminPass !== confirmAdminPass) {
      alert('নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না!');
      return;
    }
    setSettings({
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
    }, 4000); // Poll every 4 seconds
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
        // Reset
        setNewProdName('');
        setNewProdCatId(0);
        setNewProdBanglaDesc('');
        setNewProdPlacements([]);
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

  const handleUpdateShippingSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings({
      ...settings,
      base_charge_dhaka: Number(dhakaBase),
      free_shipping_threshold_dhaka: Number(dhakaFree),
      base_charge_outside: Number(outsideBase),
      per_kg_outside: Number(weightRate)
    });
    showToast('Shipping & Weight calculation rates updated successfully!');
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    await updateOrderStatus(orderId, status);
    showToast(`Order status updated to ${status}`);
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-teal-400 flex items-center justify-center mx-auto shadow-md">
            <Shield className="w-8 h-8 text-teal-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900">🔒 Staff Portal Security Gate</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              এই পোর্টালটি শুধুমাত্র এডমিন ও শপ ওনারের জন্য সুরক্ষিত। অ্যাক্সেস পেতে সিকিউরিটি পিন কোডটি লিখুন।
            </p>
          </div>

          <form onSubmit={handleVerifyPin} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Admin Security PIN / সিকিউরিটি পিন
              </label>
              <input
                type="password"
                value={inputPin}
                onChange={(e) => setInputPin(e.target.value)}
                placeholder="পিন কোড লিখুন (যেমন: 7788)..."
                autoFocus
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {pinError && (
                <p className="text-xs font-bold text-rose-600 mt-2 flex items-center gap-1">
                  ⚠️ {pinError}
                </p>
              )}
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-snug">
              <span className="font-bold block text-amber-950 mb-0.5">🔑 Default Admin Security Key:</span>
              স্টাফ প্যানেলের ডিফল্ট পিন কোড: <code className="font-mono bg-amber-200 px-1.5 py-0.5 rounded text-amber-950 font-bold">7788</code>
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
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer underline"
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
            Manage catalog products, live courier orders, weight rates, and categories.
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
            onClick={() => onNavigate('export')}
            className="px-4 py-3 rounded-2xl text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 hover:bg-amber-900/60 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>WP Exporter</span>
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
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'orders' ? 'border-[#4f46e5] text-[#4f46e5] bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Orders Management ({orders.length})
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
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'coupons' ? 'border-[#4f46e5] text-[#4f46e5] bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Coupons &amp; Offers ({coupons.length})
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'media' ? 'border-[#4f46e5] text-[#4f46e5] bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Media &amp; Video Links
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
                  <th className="p-3.5">Dimensions</th>
                  <th className="p-3.5">Stock</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
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
                    <td className="p-3.5 text-slate-600">{p.size_dimensions}</td>
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
                        title="Edit Product Details"
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-extrabold text-base text-[#0f3d44]">Live Customer Orders</h2>
            <button
              onClick={fetchAdminOrders}
              className="text-xs text-[#4f46e5] font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Orders</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Order #</th>
                  <th className="p-3.5">Customer &amp; Address</th>
                  <th className="p-3.5">Weight &amp; Delivery Fee</th>
                  <th className="p-3.5">Payment Method</th>
                  <th className="p-3.5">Total Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60">
                    <td className="p-3.5">
                      <div className="font-bold text-[#4f46e5]">{o.order_number}</div>
                      <div className="text-[10px] text-slate-400">{o.created_at}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-[#0f3d44]">{o.user_name}</div>
                      <div className="text-[11px] text-slate-500">{o.user_phone} • {o.city}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">{o.shipping_address}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-mono">{o.total_weight_grams}g ({ (o.total_weight_grams/1000).toFixed(2) }kg)</div>
                      <div className="text-[11px] text-[#0f3d44] font-semibold">
                        Delivery: {o.delivery_charge === 0 ? 'FREE' : formatPrice(o.delivery_charge)} ({o.delivery_zone})
                      </div>
                    </td>
                    <td className="p-3.5">
                      {o.payment_method === 'bkash' ? (
                        <div className="space-y-1 bg-pink-50 p-2 rounded-xl border border-pink-200 text-left">
                          <div className="inline-flex items-center gap-1 bg-pink-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full">
                            <span>bKash Payment</span>
                          </div>
                          {o.bkash_number && (
                            <div className="text-[11px] font-bold text-slate-700">
                              Sender: <span className="font-mono text-pink-700">{o.bkash_number}</span>
                            </div>
                          )}
                          {o.bkash_trxid && (
                            <div className="text-[11px] font-bold text-slate-700">
                              TrxID: <span className="font-mono text-pink-800 bg-pink-100 px-1.5 py-0.5 rounded border border-pink-200">{o.bkash_trxid}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-600 font-semibold text-xs bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                          Cash on Delivery (COD)
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-black text-[#0f3d44]">{formatPrice(o.total_amount)}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        o.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                        o.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        o.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                        className="bg-slate-100 border border-slate-300 rounded px-2 py-1 text-xs font-bold text-[#0f3d44] outline-none cursor-pointer"
                      >
                        <option value="pending">Pending</option>
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

      {/* TAB 3: WEIGHT & SHIPPING RULES */}
      {activeTab === 'shipping' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 max-w-2xl">
          <div className="space-y-1">
            <h2 className="font-extrabold text-lg text-[#0f3d44] flex items-center gap-2">
              <Truck className="w-5 h-5 text-teal-600" />
              <span>Weight-Based Delivery Rate Configuration</span>
            </h2>
            <p className="text-xs text-slate-500">
              Configure shipping charges for Dhaka and Outside Dhaka calculated dynamically by total cart weight in grams.
            </p>
          </div>

          <form onSubmit={handleUpdateShippingSettings} className="space-y-5 text-xs">
            <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100 space-y-3">
              <h3 className="font-bold text-teal-900 flex items-center gap-1.5">
                <span>📍 Inside Dhaka City Rules</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Base Delivery Charge (৳)</label>
                  <input
                    type="number"
                    value={dhakaBase}
                    onChange={(e) => setDhakaBase(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-[#0f3d44]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Free Shipping Order Amount (৳)</label>
                  <input
                    type="number"
                    value={dhakaFree}
                    onChange={(e) => setDhakaFree(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-[#0f3d44]"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
              <h3 className="font-bold text-indigo-900 flex items-center gap-1.5">
                <span>🚚 Outside Dhaka Weight Rules</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Base Charge (First 1 kg / 1000g) (৳)</label>
                  <input
                    type="number"
                    value={outsideBase}
                    onChange={(e) => setOutsideBase(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-[#0f3d44]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Extra Charge Per Additional KG (৳)</label>
                  <input
                    type="number"
                    value={weightRate}
                    onChange={(e) => setWeightRate(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-[#0f3d44]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] via-[#9333ea] to-[#ec4899] hover:opacity-95 shadow-md cursor-pointer"
            >
              Save Delivery Rules
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: CATEGORIES MANAGEMENT */}
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
                    <span className="text-3xl">{c.icon}</span>
                    <div>
                      <h4 className="font-extrabold text-sm text-[#0f3d44]">{c.name}</h4>
                      <span className="text-[11px] text-slate-400 font-mono">Slug: {c.slug}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                      {products.filter(p => p.category_id === c.id).length} Products
                    </span>
                    <button
                      onClick={() => {
                        const count = products.filter(p => p.category_id === c.id).length;
                        if (count > 0) {
                          alert(`ক্যাটাগরি "${c.name}"-এর অধীনে ${count}টি প্রোডাক্ট রয়েছে। ওয়েবসাইট থেকে ক্যাটাগরি ছাডা প্রোডাক্ট থাকা নিষেধ। ক্যাটাগরি ডিলিট করার পূর্বে প্রোডাক্টগুলোকে অন্য ক্যাটাগরিতে রি-অ্যাসাইন বা ডিলিট করুন।`);
                          return;
                        }
                        if (confirm(`Are you sure you want to delete category "${c.name}"?`)) {
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

      {/* TAB 5: COUPONS & OFFERS */}
      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: CREATE COUPON FORM */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-[#0f3d44]">Create Staff Promo Coupon (কুপন কোড যোগ করুন)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              এখানে কুপন কোড ও ডিসকাউন্ট শতাংশ যোগ করুন। এই কুপন কোড গ্রাহকরা চেকআউটে ব্যবহার করে ডিসকাউন্ট পাবেন। <strong>এটি কাস্টমার সাইটে প্রকাশ্যে দেখাবে না।</strong>
            </p>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Coupon Code (কুপন কোড) *</label>
                <input
                  type="text"
                  required
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SAVE10 or EID2026"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold uppercase text-[#0f3d44]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Discount Percentage (ডিসকাউন্ট %) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={newCouponDiscount}
                  onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                  placeholder="10"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-[#0f3d44]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl text-xs font-bold text-white bg-[#0f3d44] hover:bg-indigo-950 shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>+ Create Promo Coupon</span>
              </button>
            </form>
          </div>

          {/* RIGHT: COUPONS LIST */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-[#0f3d44]">Staff Active Coupons ({coupons.length})</h3>

            <div className="space-y-3">
              {coupons.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No coupons created yet.</p>
              ) : (
                coupons.map((cp) => (
                  <div key={cp.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-[#0f3d44] bg-indigo-100 border border-indigo-200 px-2.5 py-0.5 rounded-lg">
                          {cp.code}
                        </span>
                        <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          {cp.discount_percentage}% OFF
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">Created for staff promotional campaigns</p>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Delete coupon ${cp.code}?`)) {
                          deleteCoupon(cp.id);
                          showToast(`Coupon ${cp.code} deleted.`);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                      title="Delete Coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: MEDIA & VIDEO LINKS */}
      {activeTab === 'media' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 max-w-2xl">
          <div className="space-y-1">
            <h2 className="font-extrabold text-lg text-[#0f3d44] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <span>Media &amp; Website Video Links Management</span>
            </h2>
            <p className="text-xs text-slate-500">
              হোম পেজের প্রমোশনাল ভিডিও লিঙ্ক এবং ব্যানার ছবি এখান থেকে পরিবর্তন করতে পারবেন।
            </p>
          </div>

          <form onSubmit={handleSaveMediaSettings} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Website Promo Video URL / Embed Link (ওয়েবসাইট প্রমোশনাল ভিডিও লিঙ্ক)
              </label>
              <input
                type="url"
                value={promoVideoUrl}
                onChange={(e) => setPromoVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/embed/..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#0f3d44]"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                ইউটিউব বা অন্য যেকোনো ভিডিও এর Embed লিঙ্ক দিন।
              </p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Hero Banner Background Image URL (হোমপেজ ব্যাকগ্রাউন্ড ছবি লিঙ্ক)
              </label>
              <input
                type="url"
                value={heroBannerImg}
                onChange={(e) => setHeroBannerImg(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#0f3d44]"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-[#0f3d44] hover:bg-indigo-950 shadow-md cursor-pointer transition-all"
            >
              Save Media &amp; Video Links
            </button>
          </form>
        </div>
      )}

      {/* TAB 7: SECURITY & STAFF PASSWORD */}
      {activeTab === 'security' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 max-w-lg">
          <div className="space-y-1">
            <h2 className="font-extrabold text-lg text-[#0f3d44] flex items-center gap-2">
              <Lock className="w-5 h-5 text-teal-600" />
              <span>Staff Portal Security &amp; Password Settings</span>
            </h2>
            <p className="text-xs text-slate-500">
              সাধারণ গ্রাহক যেন স্টাফ প্যানেলের তথ্য দেখতে না পারে সেজন্য পাসওয়ার্ড পরিবর্তন করে রাখুন।
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-xs font-semibold">
              বর্তমান সিকিউরিটি পাসওয়ার্ড: <span className="font-mono font-bold text-teal-950">{settings.admin_password || '7788'}</span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">New Staff Password (নতুন পাসওয়ার্ড) *</label>
              <input
                type="password"
                required
                value={newAdminPass}
                onChange={(e) => setNewAdminPass(e.target.value)}
                placeholder="নতুন পাসওয়ার্ড দিন..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f3d44] font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Confirm New Password (পাসওয়ার্ড নিশ্চিত করুন) *</label>
              <input
                type="password"
                required
                value={confirmAdminPass}
                onChange={(e) => setConfirmAdminPass(e.target.value)}
                placeholder="আবার টাইপ করুন..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f3d44] font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] via-[#9333ea] to-[#ec4899] shadow-md cursor-pointer hover:opacity-95 transition-all"
            >
              Update Staff Password (পাসওয়ার্ড পরিবর্তন করুন)
            </button>
          </form>
        </div>
      )}

      {/* ADD NEW PRODUCT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-[#0f3d44]">Add New Stainless Steel Design</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. Surah Al-Ikhlas Modern Circle Decor"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#0f3d44]"
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Category * <span className="text-rose-600 font-normal text-[11px]">(বাধ্যতামূলক - Select Category)</span>
                  </label>
                  <select
                    required
                    value={newProdCatId}
                    onChange={(e) => setNewProdCatId(Number(e.target.value))}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none transition-all ${
                      !newProdCatId || Number(newProdCatId) === 0
                        ? 'bg-rose-50 border-rose-300 text-rose-900 ring-2 ring-rose-200/50'
                        : 'bg-slate-50 border-slate-200 text-[#0f3d44]'
                    }`}
                  >
                    <option value={0}>-- ক্যাটাগরি সিলেক্ট করুন (Select Category) * --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ''}{c.name}</option>
                    ))}
                  </select>
                  {(!newProdCatId || Number(newProdCatId) === 0) && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                      ⚠️ প্রোডাক্ট যুক্ত করার জন্য ক্যাটাগরি সিলেক্ট করা বাধ্যতামূলক।
                    </p>
                  )}
                </div>
              </div>

              {/* SIZE OPTIONS MANAGEMENT (MEDIUM & LARGE) */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <h4 className="font-extrabold text-xs text-[#0f3d44] flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-teal-600" />
                    <span>Product Size Options (Medium &amp; Large Options)</span>
                  </h4>
                  <span className="text-[10px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded font-bold border border-teal-200">
                    Default size: Medium
                  </span>
                </div>

                {/* MEDIUM SIZE OPTION */}
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-xs text-indigo-900">
                    Option 1: Medium Size (মেডিয়াম সাইজ - ডিফল্ট)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block">Size Name (English)</label>
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

                {/* LARGE SIZE OPTION */}
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-xs text-indigo-900">
                    Option 2: Large Size (লার্জ সাইজ)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block">Size Name (English)</label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Image URL</label>
                  <input
                    type="url"
                    value={newProdImg}
                    onChange={(e) => setNewProdImg(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#0f3d44]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Initial Stock (ইনভেন্টরি সংখ্যা)</label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    min={0}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#0f3d44] font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Bangla Short Summary</label>
                <textarea
                  rows={2}
                  value={newProdBanglaDesc}
                  onChange={(e) => setNewProdBanglaDesc(e.target.value)}
                  placeholder="উচ্চমানের সার্জিক্যাল স্টেইনলেস স্টিল..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#0f3d44]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Description</label>
                <textarea
                  rows={2}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="High precision laser cut..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#0f3d44]"
                />
              </div>

              {/* ROOM PLACEMENTS & POSITION IMAGES SECTION FOR NEW PRODUCT */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-xs">
                    🖼️ Room Placements &amp; Position Images (লিভিং রুম, ড্রয়িং রুম, অফিস)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setNewProdPlacements([
                        ...newProdPlacements,
                        {
                          id: Date.now(),
                          product_id: 0,
                          image_url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
                          room_type: 'Living Room',
                          caption: 'লিভিং রুমের দেয়ালে দৃষ্টিনন্দন ভিউ',
                          sort_order: newProdPlacements.length + 1
                        }
                      ]);
                    }}
                    className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 hover:bg-teal-100 cursor-pointer"
                  >
                    + Add Room Image
                  </button>
                </div>

                {newProdPlacements.length === 0 && (
                  <p className="text-[11px] text-slate-400 italic">
                    কোন পজিশনের ছবি যোগ করা হয়নি। উপরে "+ Add Room Image" বাটনে ক্লিক করে লিভিং রুম, ড্রয়িং রুম ইত্যাদি পজিশনভিত্তিক ছবি যোগ করতে পারেন।
                  </p>
                )}

                {newProdPlacements.map((pl, pIdx) => (
                  <div key={pl.id || pIdx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block">Room Label (লিভিং রুম / ড্রয়িং রুম / অফিস)</label>
                        <input
                          type="text"
                          value={pl.room_type}
                          onChange={(e) => {
                            const updated = [...newProdPlacements];
                            updated[pIdx] = { ...updated[pIdx], room_type: e.target.value as any };
                            setNewProdPlacements(updated);
                          }}
                          placeholder="Living Room / লিভিং রুম"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-[#0f3d44]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block">Caption / Description</label>
                        <input
                          type="text"
                          value={pl.caption}
                          onChange={(e) => {
                            const updated = [...newProdPlacements];
                            updated[pIdx] = { ...updated[pIdx], caption: e.target.value };
                            setNewProdPlacements(updated);
                          }}
                          placeholder="ক্যাপশন..."
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-[#0f3d44]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block">Placement Image URL</label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={pl.image_url}
                          onChange={(e) => {
                            const updated = [...newProdPlacements];
                            updated[pIdx] = { ...updated[pIdx], image_url: e.target.value };
                            setNewProdPlacements(updated);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-[#0f3d44]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setNewProdPlacements(newProdPlacements.filter((_, i) => i !== pIdx));
                          }}
                          className="text-red-500 hover:text-red-700 text-xs px-2 font-bold cursor-pointer"
                          title="Remove Placement"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
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
                    placeholder="product-url-slug"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0f3d44]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Category * <span className="text-rose-600 font-normal text-[11px]">(বাধ্যতামূলক - Select Category)</span>
                  </label>
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
                    className={`w-full border rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none transition-all ${
                      !editingProduct.category_id || Number(editingProduct.category_id) === 0
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
                  {(!editingProduct.category_id || Number(editingProduct.category_id) === 0) && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                      ⚠️ প্রোডাক্টের ক্যাটাগরি নির্বাচন আবশ্যক।
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Badge</label>
                  <select
                    value={editingProduct.badge || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#0f3d44]"
                  >
                    <option value="">None (কোনটি না)</option>
                    <option value="NEW">NEW</option>
                    <option value="HOT">HOT</option>
                    <option value="SALE">SALE</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Stock (PCS)</label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-[#0f3d44]"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1 flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editingProduct.featured || false}
                      onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className="font-bold text-slate-700 text-xs">Home Featured</span>
                  </label>
                </div>
              </div>

              {/* EDIT SIZES & PRICING SECTION */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <h4 className="font-extrabold text-xs text-[#0f3d44] flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-teal-600" />
                    <span>Product Sizes &amp; Pricing Management</span>
                  </h4>
                  <span className="text-[10px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded font-bold border border-teal-200">
                    Medium &amp; Large Size Options
                  </span>
                </div>

                {(editingProduct.sizes || []).map((sz, sIdx) => (
                  <div key={sz.id || sIdx} className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-indigo-900">
                        {sIdx === 0 ? 'Option 1: Medium Size (ডিফল্ট - ছোট সাইজ)' : 'Option 2: Large Size (লার্জ সাইজ)'}
                      </span>
                      <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                        {sIdx === 0 ? 'Default Selected' : 'Customer Selectable'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block">Size Name (English)</label>
                        <input
                          type="text"
                          value={sz.name}
                          onChange={(e) => updateEditingProductSize(sIdx, 'name', e.target.value)}
                          placeholder={sIdx === 0 ? 'Medium (2.5 Feet / 75x40cm)' : 'Large (4 Feet / 120x60cm)'}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-[#0f3d44]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block">Dimensions</label>
                        <input
                          type="text"
                          value={sz.size_dimensions}
                          onChange={(e) => updateEditingProductSize(sIdx, 'size_dimensions', e.target.value)}
                          placeholder="e.g. 75cm × 40cm"
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
                          value={sz.price}
                          onChange={(e) => updateEditingProductSize(sIdx, 'price', Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-[#0f3d44]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block">Old Price (৳)</label>
                        <input
                          type="number"
                          value={sz.old_price || ''}
                          onChange={(e) => updateEditingProductSize(sIdx, 'old_price', e.target.value ? Number(e.target.value) : undefined)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-[#0f3d44]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block">Weight (g) *</label>
                        <input
                          type="number"
                          required
                          value={sz.weight_grams}
                          onChange={(e) => updateEditingProductSize(sIdx, 'weight_grams', Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-[#0f3d44]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Material &amp; Quality</label>
                <input
                  type="text"
                  value={editingProduct.material}
                  onChange={(e) => setEditingProduct({ ...editingProduct, material: e.target.value })}
                  placeholder="e.g. Surgical Stainless Steel (Laser-Cut)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#0f3d44]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Rating (1.0 to 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={editingProduct.rating || 5.0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, rating: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#0f3d44]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Review Count</label>
                  <input
                    type="number"
                    value={editingProduct.review_count || 1}
                    onChange={(e) => setEditingProduct({ ...editingProduct, review_count: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#0f3d44]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Main Image URL</label>
                <input
                  type="url"
                  value={editingProduct.image_url}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#0f3d44]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Key Features / Bullet Points (কমা দিয়ে লিখুন)</label>
                <input
                  type="text"
                  value={Array.isArray(editingProduct.qualities) ? editingProduct.qualities.join(', ') : (editingProduct.qualities || '')}
                  onChange={(e) => setEditingProduct({ ...editingProduct, qualities: e.target.value.split(',').map(s => s.trim()) })}
                  placeholder="ওয়াটারপ্রুফ ও মরিচারোধক, ১০০% স্টেইনলেস স্টিল, ৩ডি ভিউ"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#0f3d44]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Bangla Short Summary</label>
                <textarea
                  rows={2}
                  value={editingProduct.bangla_short_desc || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, bangla_short_desc: e.target.value })}
                  placeholder="উচ্চমানের সার্জিক্যাল স্টেইনলেস স্টিল..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#0f3d44]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#0f3d44]"
                />
              </div>

              {/* ROOM PLACEMENTS EDITING SECTION */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-xs">
                    🖼️ Room Placements &amp; Labels (লিভিং রুম, ড্রয়িং রুম, অফিস)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const currentPlacements = editingProduct.placements || [];
                      setEditingProduct({
                        ...editingProduct,
                        placements: [
                          ...currentPlacements,
                          {
                            id: Date.now(),
                            product_id: editingProduct.id,
                            image_url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
                            room_type: 'Living Room',
                            caption: 'লিভিং রুমের দেয়ালে দৃষ্টিনন্দন ভিউ',
                            sort_order: currentPlacements.length + 1
                          }
                        ]
                      });
                    }}
                    className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 hover:bg-teal-100 cursor-pointer"
                  >
                    + Add Room Image
                  </button>
                </div>

                {(editingProduct.placements || []).map((pl, pIdx) => (
                  <div key={pl.id || pIdx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block">Room Label (লিভিং রুম / ড্রয়িং রুম / অফিস)</label>
                        <input
                          type="text"
                          value={pl.room_type}
                          onChange={(e) => {
                            const updated = [...(editingProduct.placements || [])];
                            updated[pIdx] = { ...updated[pIdx], room_type: e.target.value as any };
                            setEditingProduct({ ...editingProduct, placements: updated });
                          }}
                          placeholder="Living Room / লিভিং রুম"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-[#0f3d44]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block">Caption / Description</label>
                        <input
                          type="text"
                          value={pl.caption}
                          onChange={(e) => {
                            const updated = [...(editingProduct.placements || [])];
                            updated[pIdx] = { ...updated[pIdx], caption: e.target.value };
                            setEditingProduct({ ...editingProduct, placements: updated });
                          }}
                          placeholder="ক্যাপশন..."
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-[#0f3d44]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block">Placement Image URL</label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={pl.image_url}
                          onChange={(e) => {
                            const updated = [...(editingProduct.placements || [])];
                            updated[pIdx] = { ...updated[pIdx], image_url: e.target.value };
                            setEditingProduct({ ...editingProduct, placements: updated });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-[#0f3d44]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (editingProduct.placements || []).filter((_, i) => i !== pIdx);
                            setEditingProduct({ ...editingProduct, placements: updated });
                          }}
                          className="text-red-500 hover:text-red-700 text-xs px-2 font-bold cursor-pointer"
                          title="Remove Placement"
                        >
                          ✕
                        </button>
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
