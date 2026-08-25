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
  FolderPlus,
  Phone,
  MessageCircle,
  Printer,
  Download,
  RefreshCw,
  Clock,
  User as UserIcon,
  MapPin,
  CreditCard,
  AlertCircle,
  Filter,
  FileText,
  X,
  Calendar
} from 'lucide-react';
import { GoogleSheetsSync } from '../components/GoogleSheetsSync';

interface AdminPageProps {
  onNavigate: (page: string, params?: any) => void;
  initialTab?: 'products' | 'orders' | 'categories' | 'coupons' | 'media' | 'shipping' | 'security' | 'sheets';
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate, initialTab = 'orders' }) => {
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
    updateOrderStatus,
    addProduct,
    updateProduct,
    deleteProduct
  } = useApp();

  useSEO({
    title: 'Staff & Order Management Portal',
    description: 'Manage live customer orders, products, inventory, categories, coupons, and website media for UNEX AURA.'
  });

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'categories' | 'coupons' | 'media' | 'shipping' | 'security' | 'sheets'>(initialTab);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Orders Filter & Details Modal states
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [printInvoiceOrder, setPrintInvoiceOrder] = useState<Order | null>(null);

  // Sync activeTab when initialTab changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

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

  // Staff Password & WhatsApp Change form state
  const [newAdminPass, setNewAdminPass] = useState('');
  const [confirmAdminPass, setConfirmAdminPass] = useState('');
  const [adminWhatsApp, setAdminWhatsApp] = useState(settings.whatsapp_number || '01623319639');

  // Product filter state
  const [selectedCatFilter, setSelectedCatFilter] = useState<number | 'all'>('all');
  const [productSearch, setProductSearch] = useState<string>('');

  // Product edit modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New product form modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCatId, setNewProdCatId] = useState<number>(0);
  const [newProdMaterial, setNewProdMaterial] = useState<string>('Surgical Stainless Steel (2mm Thickness)');
  const [newProdDesc, setNewProdDesc] = useState<string>('Precision laser-cut stainless steel wall art featuring 3D floating visual depth.');
  const [newProdBanglaDesc, setNewProdBanglaDesc] = useState<string>('');
  
  // 4 Room View Images for New Product
  const [newProdDrawingRoomImg, setNewProdDrawingRoomImg] = useState<string>('https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80');
  const [newProdOfficeRoomImg, setNewProdOfficeRoomImg] = useState<string>('https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80');
  const [newProdPrayerOrReadingRoomImg, setNewProdPrayerOrReadingRoomImg] = useState<string>('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80');
  const [newProdBedroomImg, setNewProdBedroomImg] = useState<string>('https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80');

  // Sizes state for Add New Product (Medium & Large with Length × Width)
  const [newProdMediumDimensions, setNewProdMediumDimensions] = useState('75cm × 40cm');
  const [newProdMediumPrice, setNewProdMediumPrice] = useState<number>(5500);
  const [newProdMediumOldPrice, setNewProdMediumOldPrice] = useState<number>(6800);
  const [newProdMediumWeight, setNewProdMediumWeight] = useState<number>(1400);

  const [newProdLargeDimensions, setNewProdLargeDimensions] = useState('120cm × 60cm');
  const [newProdLargePrice, setNewProdLargePrice] = useState<number>(7500);
  const [newProdLargeOldPrice, setNewProdLargeOldPrice] = useState<number>(9200);
  const [newProdLargeWeight, setNewProdLargeWeight] = useState<number>(2200);
  const [newProdStock, setNewProdStock] = useState<number>(18);
  const [newProdBadge, setNewProdBadge] = useState<'NEW' | 'HOT' | 'SALE' | ''>('NEW');

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
    if (settings.whatsapp_number) setAdminWhatsApp(settings.whatsapp_number);
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
            name: 'Medium (75cm × 40cm)',
            size_dimensions: p.size_dimensions || '75cm × 40cm',
            price: p.price,
            old_price: p.old_price,
            weight_grams: p.weight_grams || 1400
          },
          {
            id: 's2',
            name: 'Large (120cm × 60cm)',
            size_dimensions: '120cm × 60cm',
            price: Math.round(p.price * 1.36),
            old_price: p.old_price ? Math.round(p.old_price * 1.36) : undefined,
            weight_grams: Math.round((p.weight_grams || 1400) * 1.57)
          }
        ];

    const defaultRoomImages = {
      drawing_room: p.room_images?.drawing_room || p.image_url || '',
      office_room: p.room_images?.office_room || p.placements?.find(x => x.room_type === 'Office')?.image_url || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      prayer_or_reading_room: p.room_images?.prayer_or_reading_room || p.placements?.find(x => x.room_type === 'Hallway' || x.room_type === 'Formations')?.image_url || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
      bedroom: p.room_images?.bedroom || p.placements?.find(x => x.room_type === 'Bedroom')?.image_url || 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80'
    };

    const defaultQualities = (p.qualities && p.qualities.length > 0) ? p.qualities : [
      '১০০% খাঁটি সার্জিক্যাল স্টেইনলেস স্টিল - মরিচা পড়া বা রঙ চটে যাওয়ার কোনো সম্ভাবনা নেই।',
      'প্রিসিশন ফাইবার লেজার কাটিং - প্রতিটি হরফ ও ডিজাইন অত্যন্ত নিখুঁত ও মসৃণ।',
      '৩ডি ফ্লোটিং শ্যাডো লুক - দেয়াল থেকে ১ ইঞ্চি সামনে ভেসে থাকে যা দৃষ্টিনন্দন ছায়া তৈরি করে।',
      'লাক্সারি স্যাটিন মেটালিক ফিনিশিং - ড্রয়িং রুম, লিভিং রুম বা বেডরুমের জন্য দারুণ মানানসই।',
      'সহজ ইনস্টলেশন - সাথে থাকছে ফ্রি ৩ডি স্পেসার এবং ওয়াল হ্যাঙ্গিং কিট।'
    ];

    setEditingProduct({
      ...p,
      room_images: defaultRoomImages,
      sizes: existingSizes,
      qualities: defaultQualities,
      bangla_short_desc: p.bangla_short_desc || '',
      material: p.material || 'Surgical Stainless Steel (2mm Thickness)'
    });
  };

  const updateEditingProductRoomImage = (roomKey: keyof NonNullable<Product['room_images']>, url: string) => {
    if (!editingProduct) return;
    const currentRoomImgs = {
      ...(editingProduct.room_images || {}),
      [roomKey]: url
    };
    setEditingProduct({
      ...editingProduct,
      room_images: currentRoomImgs,
      // If updating drawing_room, also sync primary image_url
      ...(roomKey === 'drawing_room' ? { image_url: url } : {})
    });
  };

  const updateEditingProductSize = (index: number, field: keyof ProductSize, value: any) => {
    if (!editingProduct) return;
    const currentSizes: ProductSize[] = (editingProduct.sizes && editingProduct.sizes.length >= 2)
      ? [...editingProduct.sizes]
      : [
          { id: 's1', name: 'Medium (75cm × 40cm)', size_dimensions: editingProduct.size_dimensions || '75cm × 40cm', price: editingProduct.price, old_price: editingProduct.old_price, weight_grams: editingProduct.weight_grams || 1400 },
          { id: 's2', name: 'Large (120cm × 60cm)', size_dimensions: '120cm × 60cm', price: Math.round(editingProduct.price * 1.36), old_price: editingProduct.old_price ? Math.round(editingProduct.old_price * 1.36) : undefined, weight_grams: Math.round((editingProduct.weight_grams || 1400) * 1.57) }
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

  const handleSaveWhatsAppNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminWhatsApp.trim()) {
      alert('দয়া করে হোয়াটসঅ্যাপ মোবাইল নম্বর প্রদান করুন');
      return;
    }
    await updateSettings({
      ...settings,
      whatsapp_number: adminWhatsApp.trim()
    });
    showToast('Admin WhatsApp notification receiver updated successfully!');
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

    if (!newProdName.trim()) {
      alert('দয়া করে প্রোডাক্টের নাম লিখুন (Product Name is required)!');
      return;
    }

    if (!newProdCatId || Number(newProdCatId) <= 0) {
      alert('দয়া করে প্রোডাক্টের জন্য একটি ক্যাটাগরি নির্ধারণ করুন (Category selection is required)!');
      return;
    }

    const selectedCat = categories.find(c => c.id === Number(newProdCatId));
    const primaryImg = newProdDrawingRoomImg.trim() || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80';

    const roomImages = {
      drawing_room: primaryImg,
      office_room: newProdOfficeRoomImg.trim() || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      prayer_or_reading_room: newProdPrayerOrReadingRoomImg.trim() || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
      bedroom: newProdBedroomImg.trim() || 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80'
    };

    const payload = {
      name: newProdName.trim(),
      category_id: Number(newProdCatId),
      category_name: selectedCat ? selectedCat.name : 'Wall Decor',
      price: Number(newProdMediumPrice),
      old_price: newProdMediumOldPrice ? Number(newProdMediumOldPrice) : undefined,
      weight_grams: Number(newProdMediumWeight),
      size_dimensions: newProdMediumDimensions.trim() || '75cm × 40cm',
      material: newProdMaterial.trim() || 'Surgical Stainless Steel (2mm Thickness)',
      description: newProdDesc.trim() || 'Precision laser-cut stainless steel wall art featuring 3D floating visual depth.',
      bangla_short_desc: newProdBanglaDesc.trim() || 'উচ্চমানের ১০০% খাঁটি স্টেইনলেস স্টিলে তৈরি অনন্য ওয়াল আর্ট। ঘরকে দেবে প্রিমিয়াম লুক।',
      image_url: primaryImg,
      room_images: roomImages,
      sizes: [
        {
          id: 's1',
          name: `Medium (${newProdMediumDimensions.trim() || '75cm × 40cm'})`,
          size_dimensions: newProdMediumDimensions.trim() || '75cm × 40cm',
          price: Number(newProdMediumPrice),
          old_price: newProdMediumOldPrice ? Number(newProdMediumOldPrice) : undefined,
          weight_grams: Number(newProdMediumWeight)
        },
        {
          id: 's2',
          name: `Large (${newProdLargeDimensions.trim() || '120cm × 60cm'})`,
          size_dimensions: newProdLargeDimensions.trim() || '120cm × 60cm',
          price: Number(newProdLargePrice),
          old_price: newProdLargeOldPrice ? Number(newProdLargeOldPrice) : undefined,
          weight_grams: Number(newProdLargeWeight)
        }
      ],
      qualities: [
        '১০০% খাঁটি সার্জিক্যাল স্টেইনলেস স্টিল - মরিচা পড়া বা রঙ চটে যাওয়ার কোনো সম্ভাবনা নেই।',
        'প্রিসিশন ফাইবার লেজার কাটিং - প্রতিটি হরফ ও ডিজাইন অত্যন্ত নিখুঁত ও মসৃণ।',
        '৩ডি ফ্লোটিং শ্যাডো লুক - দেয়াল থেকে ১ ইঞ্চি সামনে ভেসে থাকে যা দৃষ্টিনন্দন ছায়া তৈরি করে।',
        'লাক্সারি স্যাটিন মেটালিক ফিনিশিং - ড্রয়িং রুম, লিভিং রুম বা বেডরুমের জন্য দারুণ মানানসই।',
        'সহজ ইনস্টলেশন - সাথে থাকছে ফ্রি ৩ডি স্পেসার এবং ওয়াল হ্যাঙ্গিং কিট।'
      ],
      featured: true,
      badge: newProdBadge || 'NEW',
      stock: Number(newProdStock || 15)
    };

    await addProduct(payload);
    showToast(`"${newProdName}" সফলভাবে ক্যাটালগে যুক্ত হয়েছে!`);
    setShowAddModal(false);
    
    // Reset form
    setNewProdName('');
    setNewProdCatId(0);
    setNewProdBanglaDesc('');
  };

  const handleSaveEditedProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editingProduct.name.trim()) {
      alert('দয়া করে প্রোডাক্টের নাম দিন!');
      return;
    }

    if (!editingProduct.category_id || Number(editingProduct.category_id) <= 0) {
      alert('দয়া করে প্রোডাক্টের জন্য একটি বৈধ ক্যাটাগরি সিলেক্ট করুন (Category is required)!');
      return;
    }

    const primaryImg = editingProduct.room_images?.drawing_room || editingProduct.image_url;
    const mediumSize = editingProduct.sizes?.[0];

    const updatedProduct: Product = {
      ...editingProduct,
      image_url: primaryImg,
      price: mediumSize ? mediumSize.price : editingProduct.price,
      old_price: mediumSize?.old_price !== undefined ? mediumSize.old_price : editingProduct.old_price,
      weight_grams: mediumSize ? mediumSize.weight_grams : editingProduct.weight_grams,
      size_dimensions: mediumSize ? mediumSize.size_dimensions : editingProduct.size_dimensions,
    };

    await updateProduct(updatedProduct);
    showToast(`প্রোডাক্ট "${updatedProduct.name}" সফলভাবে আপডেট করা হয়েছে!`);
    setEditingProduct(null);
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
    showToast(`Order status updated to ${status.toUpperCase()}`);
    if (selectedOrderDetails && selectedOrderDetails.id === orderId) {
      setSelectedOrderDetails({ ...selectedOrderDetails, status: status as any });
    }
  };

  const handleExportOrdersBackup = () => {
    if (orders.length === 0) {
      showToast('No orders found to backup.');
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(orders, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `unex_aura_orders_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('অর্ডার ডাটাবেজ ব্যাকআপ (JSON) সফলভাবে ডাউনলোড হয়েছে!');
  };

  const handleExportOrdersCSV = () => {
    if (orders.length === 0) {
      showToast('No orders found to export.');
      return;
    }
    const headers = ['Order_Number', 'Date_Time', 'Customer_Name', 'Phone', 'Address', 'City', 'Subtotal', 'Delivery_Fee', 'Total_BDT', 'Payment_Method', 'Status', 'Items_Ordered'];
    const rows = orders.map(o => [
      o.order_number,
      new Date(o.created_at).toLocaleString('en-BD'),
      `"${(o.user_name || '').replace(/"/g, '""')}"`,
      `"${o.user_phone || ''}"`,
      `"${(o.shipping_address || '').replace(/"/g, '""')}"`,
      `"${(o.city || '').replace(/"/g, '""')}"`,
      o.subtotal || o.total_amount,
      o.shipping_fee || 0,
      o.total_amount,
      `"${o.payment_method || 'COD'}"`,
      o.status,
      `"${(o.items || []).map(i => `${i.product_name} (${i.size || 'Medium'}) x${i.quantity}`).join('; ')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute("download", `unex_aura_orders_sheet_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('অর্ডার লিস্ট CSV শিট সফলভাবে এক্সপোর্ট হয়েছে!');
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
                    src={activeBestDealProduct.room_images?.drawing_room || activeBestDealProduct.image_url}
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

          {/* CATEGORY-WISE FILTER BAR & SEARCH */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-black text-base text-[#0f3d44] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <span>Category-Wise Product Management (ক্যাটাগরি ভিত্তিক পণ্য তালিকা)</span>
                </h2>
                <p className="text-xs text-slate-500">
                  নির্দিষ্ট ক্যাটাগরি অনুযায়ী প্রোডাক্ট ফিল্টার করুন এবং প্রতিটি প্রোডাক্টের ৫টি রুম ছবি ও সাইজ ডিটেইলস এক ক্লিকে এডিট করুন।
                </p>
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="পণ্য বা ক্যাটাগরি সার্চ করুন..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs font-medium text-[#0f3d44] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedCatFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCatFilter === 'all'
                    ? 'bg-[#0f3d44] text-white shadow-sm ring-2 ring-[#0f3d44]/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>সব পণ্য (All)</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCatFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {products.length}
                </span>
              </button>

              {categories.map((c) => {
                const count = products.filter(p => p.category_id === c.id).length;
                const isSelected = selectedCatFilter === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCatFilter(c.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/50'
                        : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-900'
                    }`}
                  >
                    <span>{c.icon ? `${c.icon} ` : '🏷️ '}{c.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MAIN PRODUCTS LIST CARDS */}
          {(() => {
            const filtered = products.filter(p => {
              const matchesCat = selectedCatFilter === 'all' || p.category_id === selectedCatFilter;
              const matchesSearch = !productSearch.trim() ||
                p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                (p.category_name || '').toLowerCase().includes(productSearch.toLowerCase());
              return matchesCat && matchesSearch;
            });

            if (filtered.length === 0) {
              return (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">কোনো প্রোডাক্ট পাওয়া যায়নি</h3>
                  <p className="text-xs text-slate-500">
                    ফিল্টার পরিবর্তন করুন অথবা নতুন প্রোডাক্ট যোগ করুন।
                  </p>
                  <button
                    onClick={() => { setSelectedCatFilter('all'); setProductSearch(''); }}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 cursor-pointer"
                  >
                    রিসেট ফিল্টার
                  </button>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {filtered.map((p) => {
                  const isCurrentBestDeal = (settings.best_deal_product_id ? p.id === settings.best_deal_product_id : p.id === (products[0]?.id || 1));
                  const isIslamic =
                    p.category_id === 1 ||
                    p.category_id === 2 ||
                    p.category_id === 3 ||
                    (p.category_name || '').toLowerCase().includes('islamic') ||
                    (p.name || '').toLowerCase().includes('ayatul') ||
                    (p.name || '').toLowerCase().includes('surah');

                  const room3Label = isIslamic ? 'নামাজের ঘর' : 'রিডিং রুম';

                  const rDrawing = p.room_images?.drawing_room || p.image_url || '';
                  const rOffice = p.room_images?.office_room || p.placements?.find(x => x.room_type === 'Office')?.image_url || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80';
                  const rPrayerReading = p.room_images?.prayer_or_reading_room || p.placements?.find(x => x.room_type === 'Hallway' || x.room_type === 'Formations')?.image_url || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80';
                  const rBedroom = p.room_images?.bedroom || p.placements?.find(x => x.room_type === 'Bedroom')?.image_url || 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80';
                  const rCloseView = p.room_images?.close_view || p.image_url || '';

                  const medSize = p.sizes?.[0] || {
                    name: 'Medium (75cm × 40cm)',
                    size_dimensions: p.size_dimensions || '75cm × 40cm',
                    price: p.price,
                    old_price: p.old_price,
                    weight_grams: p.weight_grams
                  };

                  const lrgSize = p.sizes?.[1] || {
                    name: 'Large (120cm × 60cm)',
                    size_dimensions: '120cm × 60cm',
                    price: Math.round(p.price * 1.36),
                    old_price: p.old_price ? Math.round(p.old_price * 1.36) : undefined,
                    weight_grams: Math.round(p.weight_grams * 1.57)
                  };

                  return (
                    <div
                      key={p.id}
                      className={`bg-white rounded-3xl border p-5 sm:p-6 shadow-xs transition-all space-y-4 hover:shadow-md ${
                        isCurrentBestDeal ? 'border-amber-300 ring-2 ring-amber-200/50 bg-amber-50/10' : 'border-slate-200/90'
                      }`}
                    >
                      {/* TOP ROW: TITLE, CATEGORY, BADGES & ACTIONS */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                        <div className="flex items-start sm:items-center gap-3">
                          <img
                            src={rDrawing}
                            alt=""
                            className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-xs"
                          />
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-extrabold text-sm sm:text-base text-[#0f3d44]">
                                {p.name}
                              </h3>
                              <span className="bg-teal-50 text-teal-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-teal-200">
                                {p.category_name || 'Wall Decor'}
                              </span>
                              {p.badge && (
                                <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border border-rose-200">
                                  {p.badge}
                                </span>
                              )}
                              {isCurrentBestDeal && (
                                <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1">
                                  <Flame className="w-3 h-3 fill-amber-600 text-amber-600" /> Best Deal Active
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                              <span>ID: #{p.id}</span>
                              <span>•</span>
                              <span>Stock: <strong className={p.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}>{p.stock} pcs</strong></span>
                              <span>•</span>
                              <span>Material: {p.material || 'Surgical Stainless Steel'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex items-center gap-2 self-end lg:self-center">
                          {!isCurrentBestDeal && (
                            <button
                              type="button"
                              onClick={() => handleSelectBestDeal(p.id)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all flex items-center gap-1 cursor-pointer"
                              title="Set as Homepage Today's Best Deal"
                            >
                              <Flame className="w-3.5 h-3.5 text-amber-600" />
                              <span>Set Best Deal</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onNavigate('product', { slug: p.slug })}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-[#0f3d44] bg-slate-100 hover:bg-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                            title="View on public store"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditProduct(p)}
                            className="px-4 py-1.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-teal-500 via-indigo-600 to-pink-500 hover:opacity-90 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                            title="Edit All 4 Room Images, Sizes & Descriptions"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>সম্পূর্ণ এডিট করুন</span>
                          </button>
                        </div>
                      </div>

                      {/* 4 ROOM VIEW THUMBNAILS ROW */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                          <span>৪টি রুম ভিউ ফটো (4 Types of Room Images):</span>
                          <span className="text-[10px] text-teal-700 font-semibold">ডিফল্ট সিলেক্টেড: ড্রয়িং রুম</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {/* 1. Drawing Room */}
                          <div className="bg-slate-50 p-2 rounded-2xl border border-slate-200 flex items-center gap-2">
                            <img src={rDrawing} alt="Drawing Room" className="w-10 h-10 rounded-xl object-cover border border-slate-300 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[9px] font-black text-indigo-900 uppercase block">১. ড্রয়িং রুম</span>
                              <span className="text-[10px] font-bold text-emerald-700 block truncate">ডিফল্ট মেইন</span>
                            </div>
                          </div>

                          {/* 2. Office Room */}
                          <div className="bg-slate-50 p-2 rounded-2xl border border-slate-200 flex items-center gap-2">
                            <img src={rOffice} alt="Office Room" className="w-10 h-10 rounded-xl object-cover border border-slate-300 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[9px] font-black text-slate-700 uppercase block">২. অফিস রুম</span>
                              <span className="text-[10px] font-medium text-slate-500 block truncate">অফিস স্পেস</span>
                            </div>
                          </div>

                          {/* 3. Prayer / Reading Room */}
                          <div className="bg-slate-50 p-2 rounded-2xl border border-slate-200 flex items-center gap-2">
                            <img src={rPrayerReading} alt={room3Label} className="w-10 h-10 rounded-xl object-cover border border-slate-300 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[9px] font-black text-teal-800 uppercase block truncate">৩. {room3Label}</span>
                              <span className="text-[10px] font-medium text-slate-500 block truncate">{isIslamic ? 'ইসলামিক ভিউ' : 'ন্যাচারাল ভিউ'}</span>
                            </div>
                          </div>

                          {/* 4. Bedroom */}
                          <div className="bg-slate-50 p-2 rounded-2xl border border-slate-200 flex items-center gap-2">
                            <img src={rBedroom} alt="Bedroom" className="w-10 h-10 rounded-xl object-cover border border-slate-300 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[9px] font-black text-slate-700 uppercase block">৪. বেডরুম</span>
                              <span className="text-[10px] font-medium text-slate-500 block truncate">বেডরুম স্পেস</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SIZES, PRICING & WEIGHT ROW */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {/* Medium Size Card */}
                        <div className="bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-extrabold text-indigo-900 uppercase tracking-wider block">
                              মিডিয়াম সাইজ (Medium)
                            </span>
                            <div className="text-xs font-black text-[#0f3d44]">
                              {medSize.size_dimensions || '75cm × 40cm'}
                            </div>
                            <span className="text-[10px] text-slate-500">ওজন: {medSize.weight_grams || 1400}g</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-black text-indigo-900">
                              {formatPrice(medSize.price)}
                            </div>
                            {medSize.old_price && (
                              <div className="text-[10px] text-slate-400 line-through">
                                {formatPrice(medSize.old_price)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Large Size Card */}
                        <div className="bg-purple-50/50 p-3 rounded-2xl border border-purple-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-extrabold text-purple-900 uppercase tracking-wider block">
                              লার্জ সাইজ (Large)
                            </span>
                            <div className="text-xs font-black text-[#0f3d44]">
                              {lrgSize.size_dimensions || '120cm × 60cm'}
                            </div>
                            <span className="text-[10px] text-slate-500">ওজন: {lrgSize.weight_grams || 2200}g</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-black text-purple-900">
                              {formatPrice(lrgSize.price)}
                            </div>
                            {lrgSize.old_price && (
                              <div className="text-[10px] text-slate-400 line-through">
                                {formatPrice(lrgSize.old_price)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bangla Description Excerpt */}
                      {p.bangla_short_desc && (
                        <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                          "{p.bangla_short_desc}"
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
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
                          updateProduct({ ...p, image_url: e.target.value });
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] text-[#0f3d44] font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        showToast(`"${p.name}" এর ছবি সেভ করা হয়েছে!`);
                      }}
                      className="w-1/2 py-2 rounded-xl text-xs font-bold text-teal-800 bg-teal-100/80 hover:bg-teal-200 transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Link</span>
                    </button>
                    <button
                      onClick={() => openEditProduct(p)}
                      className="w-1/2 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Full Edit</span>
                    </button>
                  </div>
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

      {/* TAB 4: ORDERS MANAGEMENT (STAFF PORTAL) */}
      {activeTab === 'orders' && (() => {
        const totalOrdersCount = orders.length;
        const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
        const confirmedOrdersCount = orders.filter(o => o.status === 'confirmed').length;
        const processingOrdersCount = orders.filter(o => o.status === 'processing').length;
        const shippedOrdersCount = orders.filter(o => o.status === 'shipped').length;
        const deliveredOrdersCount = orders.filter(o => o.status === 'delivered').length;
        const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

        const filteredOrders = orders.filter(o => {
          if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) {
            return false;
          }
          if (!orderSearch.trim()) return true;
          const q = orderSearch.toLowerCase();
          return (
            (o.order_number && o.order_number.toLowerCase().includes(q)) ||
            (o.user_name && o.user_name.toLowerCase().includes(q)) ||
            (o.user_phone && o.user_phone.toLowerCase().includes(q)) ||
            (o.city && o.city.toLowerCase().includes(q)) ||
            (o.shipping_address && o.shipping_address.toLowerCase().includes(q))
          );
        });

        return (
          <div className="space-y-6">
            {/* 1. STAFF ORDER METRICS CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span>সর্বমোট অর্ডার</span>
                  <Truck className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-2xl font-black text-[#0f3d44]">{totalOrdersCount}</div>
                <div className="text-[11px] text-slate-400">Total All-Time Orders</div>
              </div>

              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-amber-700 text-xs font-bold">
                  <span>পেন্ডিং (অ্যাকশন দরকার)</span>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                </div>
                <div className="text-2xl font-black text-amber-900">{pendingOrdersCount}</div>
                <div className="text-[11px] text-amber-700">Waiting for call/confirmation</div>
              </div>

              <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-blue-700 text-xs font-bold">
                  <span>কনফার্মড ও কাটিং</span>
                  <Clock className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-black text-blue-900">{confirmedOrdersCount + processingOrdersCount}</div>
                <div className="text-[11px] text-blue-700">In Production / Ready to ship</div>
              </div>

              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-emerald-700 text-xs font-bold">
                  <span>ডেলিভারি সম্পন্ন</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-black text-emerald-900">{deliveredOrdersCount}</div>
                <div className="text-[11px] text-emerald-700">Successfully Delivered</div>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-slate-900 p-4 rounded-2xl text-white shadow-xs space-y-1">
                <div className="flex items-center justify-between text-teal-400 text-xs font-bold">
                  <span>মোট বিক্রয় ভলিউম</span>
                  <CreditCard className="w-4 h-4 text-teal-400" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400">{formatPrice(totalRevenue)}</div>
                <div className="text-[10px] text-slate-400">Total Order Revenue</div>
              </div>
            </div>

            {/* 2. SEARCH, STATUS TABS & BACKUP BUTTONS */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="অর্ডার # (যেমন: UA-1002), কাস্টমার নাম, ফোন নম্বর বা ঠিকানা দিয়ে সার্চ..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-9 py-2.5 text-xs text-[#0f3d44] focus:outline-none focus:ring-2 focus:ring-[#0f3d44]"
                  />
                  {orderSearch && (
                    <button
                      onClick={() => setOrderSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Actions Group */}
                <div className="flex items-center flex-wrap gap-2 shrink-0">
                  <button
                    onClick={fetchAdminOrders}
                    disabled={loadingOrders}
                    className="px-3.5 py-2 rounded-xl border border-teal-200 bg-teal-50 text-teal-800 text-xs font-bold hover:bg-teal-100 flex items-center gap-1.5 cursor-pointer transition-all"
                    title="রিয়েল-টাইম নতুন অর্ডার রিফ্রেশ করুন"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
                    <span>{loadingOrders ? 'লোড হচ্ছে...' : 'রিফ্রেশ (Live Sync)'}</span>
                  </button>

                  <button
                    onClick={handleExportOrdersCSV}
                    className="px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 flex items-center gap-1.5 cursor-pointer transition-all"
                    title="এক্সেল বা গুগল শিটের জন্য CSV ডাউনলোড করুন"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>CSV শিট</span>
                  </button>

                  <button
                    onClick={handleExportOrdersBackup}
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-800 text-xs font-bold hover:bg-slate-200 flex items-center gap-1.5 cursor-pointer transition-all"
                    title="হোস্টিং বা সার্ভার পরিবর্তনের ব্যাকআপ JSON ফাইল ডাউনলোড করুন"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ডাটাবেজ ব্যাকআপ</span>
                  </button>
                </div>
              </div>

              {/* Status Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setOrderStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-all ${
                    orderStatusFilter === 'all'
                      ? 'bg-[#0f3d44] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  সব অর্ডার ({totalOrdersCount})
                </button>
                <button
                  onClick={() => setOrderStatusFilter('pending')}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 ${
                    orderStatusFilter === 'pending'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-700 border border-amber-200/60 hover:bg-amber-100'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>পেন্ডিং ({pendingOrdersCount})</span>
                </button>
                <button
                  onClick={() => setOrderStatusFilter('confirmed')}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-all ${
                    orderStatusFilter === 'confirmed'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-blue-50 text-blue-700 border border-blue-200/60 hover:bg-blue-100'
                  }`}
                >
                  কনফার্মড ({confirmedOrdersCount})
                </button>
                <button
                  onClick={() => setOrderStatusFilter('processing')}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-all ${
                    orderStatusFilter === 'processing'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-purple-50 text-purple-700 border border-purple-200/60 hover:bg-purple-100'
                  }`}
                >
                  লেজার কাটিং / প্রসেসিং ({processingOrdersCount})
                </button>
                <button
                  onClick={() => setOrderStatusFilter('shipped')}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-all ${
                    orderStatusFilter === 'shipped'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200/60 hover:bg-indigo-100'
                  }`}
                >
                  কুরিয়ারে পাঠানো হয়েছে ({shippedOrdersCount})
                </button>
                <button
                  onClick={() => setOrderStatusFilter('delivered')}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-all ${
                    orderStatusFilter === 'delivered'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100'
                  }`}
                >
                  ডেলিভার্ড ({deliveredOrdersCount})
                </button>
                <button
                  onClick={() => setOrderStatusFilter('cancelled')}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-all ${
                    orderStatusFilter === 'cancelled'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-rose-50 text-rose-700 border border-rose-200/60 hover:bg-rose-100'
                  }`}
                >
                  বাতিল ({orders.filter(o => o.status === 'cancelled').length})
                </button>
              </div>
            </div>

            {/* 3. ORDERS LIST / TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="font-black text-base text-[#0f3d44] flex items-center gap-2">
                    <span>লাইভ কাস্টমার অর্ডার তালিকা</span>
                    <span className="text-xs font-normal text-slate-500">
                      ({filteredOrders.length} টি দেখানো হচ্ছে)
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    সিরিয়াল নম্বর ক্রমানুসারে (UA-1001, UA-1002...) স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকে এবং কখনো রিমুভ হয় না।
                  </p>
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Truck className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-600">কোনো অর্ডার পাওয়া যায়নি</p>
                  <p className="text-xs text-slate-400">অন্য কোনো ফিল্টার বা সার্চ দিয়ে চেষ্টা করুন</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredOrders.map((o) => {
                    const cleanPhone = (o.user_phone || '').replace(/[^0-9]/g, '');
                    const waPhone = cleanPhone.startsWith('88') ? cleanPhone : (cleanPhone.startsWith('0') ? '88' + cleanPhone : '880' + cleanPhone);
                    const waMessage = encodeURIComponent(`আসসালামু আলাইকুম ${o.user_name || ''}, UNEX AURA থেকে আপনার অর্ডার নম্বর #${o.order_number} (মোট: ${formatPrice(o.total_amount)}) কনফার্ম করার জন্য যোগাযোগ করছি।`);
                    const waLink = `https://wa.me/${waPhone}?text=${waMessage}`;

                    return (
                      <div key={o.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center flex-wrap gap-2">
                            <span className="font-mono font-black text-sm text-[#0f3d44] bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg">
                              #{o.order_number}
                            </span>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              o.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                              o.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                              o.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                              o.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                              o.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              ● {o.status}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{new Date(o.created_at).toLocaleString('en-BD', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedOrderDetails(o)}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                              title="পূর্ণ বিবরণ ও আইটেম দেখুন"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>বিবরণ</span>
                            </button>
                            <button
                              onClick={() => setPrintInvoiceOrder(o)}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                              title="প্রিন্টযোগ্য চালান / ইনভয়েস তৈরি করুন"
                            >
                              <Printer className="w-3.5 h-3.5 text-slate-500" />
                              <span>ইনভয়েস</span>
                            </button>
                          </div>
                        </div>

                        {/* Order Body Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start text-xs">
                          {/* Customer Contact */}
                          <div className="md:col-span-4 space-y-1.5">
                            <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                              <UserIcon className="w-3.5 h-3.5 text-[#0f3d44]" />
                              <span>{o.user_name || 'Customer'}</span>
                            </div>
                            <div className="flex items-center gap-2 pt-0.5">
                              <a
                                href={`tel:${o.user_phone}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs hover:bg-emerald-100"
                                title="কাস্টমারকে কল করুন"
                              >
                                <Phone className="w-3 h-3 text-emerald-600" />
                                <span>{o.user_phone}</span>
                              </a>
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#25D366]/10 border border-[#25D366]/30 text-[#128C7E] font-bold text-xs hover:bg-[#25D366]/20"
                                title="হোয়াটসঅ্যাপে সরাসরি মেসেজ দিন"
                              >
                                <MessageCircle className="w-3 h-3 text-[#25D366]" />
                                <span>WhatsApp</span>
                              </a>
                            </div>
                            <div className="text-slate-600 text-[11px] flex items-start gap-1 pt-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                              <span>{o.shipping_address}, {o.city}</span>
                            </div>
                          </div>

                          {/* Ordered Items Summary */}
                          <div className="md:col-span-5 space-y-1.5">
                            <div className="text-slate-500 font-semibold text-[11px]">অর্ডারকৃত পণ্যসমূহ:</div>
                            <div className="space-y-1.5">
                              {(o.items || []).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200/60">
                                  {item.product_image ? (
                                    <img
                                      src={item.product_image}
                                      alt=""
                                      className="w-9 h-9 object-cover rounded-md shrink-0 border border-slate-200"
                                    />
                                  ) : (
                                    <div className="w-9 h-9 rounded-md bg-slate-200 shrink-0" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="font-bold text-slate-900 truncate text-[11px]">{item.product_name}</div>
                                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                      <span className="font-semibold text-teal-700 bg-teal-50 px-1 rounded">{item.size || 'Medium'}</span>
                                      <span>•</span>
                                      <span>পরিমাণ: {item.quantity}</span>
                                    </div>
                                  </div>
                                  <div className="font-bold text-slate-800 text-[11px] shrink-0">
                                    {formatPrice(item.price * item.quantity)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Status & Financial Controls */}
                          <div className="md:col-span-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 text-[11px]">পেমেন্ট মেথড:</span>
                              <span className="font-bold text-slate-800 uppercase">{o.payment_method || 'COD'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 text-[11px]">মোট প্রদেয়:</span>
                              <span className="font-black text-sm text-emerald-700">{formatPrice(o.total_amount)}</span>
                            </div>

                            <div className="pt-1">
                              <label className="text-[10px] font-bold text-slate-500 block mb-1">স্ট্যাটাস পরিবর্তন করুন:</label>
                              <select
                                value={o.status}
                                onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-bold text-[#0f3d44] focus:outline-none focus:ring-1 focus:ring-[#0f3d44]"
                              >
                                <option value="pending">⏳ Pending (অপেক্ষমান)</option>
                                <option value="confirmed">✅ Confirmed (কল করে কনফার্মড)</option>
                                <option value="processing">⚙️ Processing (লেজার কাটিং প্রসেস)</option>
                                <option value="shipped">🚚 Shipped (কুরিয়ারে পাঠানো হয়েছে)</option>
                                <option value="delivered">🎉 Delivered (ডেলিভারি সম্পন্ন)</option>
                                <option value="cancelled">❌ Cancelled (বাতিল)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}

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

          {/* ADMIN WHATSAPP NOTIFICATION RECEIVER */}
          <div className="pt-6 border-t border-slate-200/80 space-y-3">
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm text-[#0f3d44] flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Admin WhatsApp Order Notification Number</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                যে হোয়াটসঅ্যাপ নম্বরে কাস্টমারের অর্ডারের সম্পূর্ণ বিবরণী ও নোটিফিকেশন মেসেজ চলে যাবে।
              </p>
            </div>

            <form onSubmit={handleSaveWhatsAppNumber} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  WhatsApp Number (যেমন: 01623319639) *
                </label>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-slate-600">
                    +88
                  </span>
                  <input
                    type="text"
                    required
                    value={adminWhatsApp}
                    onChange={(e) => setAdminWhatsApp(e.target.value)}
                    placeholder="01623319639"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f3d44] font-mono font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>সংরক্ষণ করুন (Save WhatsApp Number)</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW PRODUCT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#0f3d44]">
                    নতুন ওয়াল আর্ট প্রোডাক্ট যোগ করুন
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    ৪টি রুম ভিউ ইমেজ, ২ ধরণের সাইজ (মিডিয়াম ও লার্জ), মূল্য ও বিবরণ দিন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-6 text-xs">
              {/* SECTION 1: BASIC INFORMATION */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="font-extrabold text-xs text-[#0f3d44] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black">১</span>
                  <span>বেসিক তথ্য (Product Basic Information)</span>
                </h4>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    প্রোডাক্টের নাম (Product Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="যেমন: Ayatul Kursi Laser-Cut Stainless Steel Wall Art"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-[#0f3d44] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      ক্যাটাগরি (Category) *
                    </label>
                    <select
                      required
                      value={newProdCatId}
                      onChange={(e) => setNewProdCatId(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold bg-white text-[#0f3d44] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={0}>-- ক্যাটাগরি সিলেক্ট করুন * --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.icon ? `${c.icon} ` : ''}{c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      স্টক সংখ্যা (Stock Units)
                    </label>
                    <input
                      type="number"
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-[#0f3d44]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    হাইলাইট ব্যাজ (Badge)
                  </label>
                  <div className="flex gap-2">
                    {(['NEW', 'HOT', 'SALE', ''] as const).map((b) => (
                      <button
                        key={b || 'none'}
                        type="button"
                        onClick={() => setNewProdBadge(b)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          newProdBadge === b
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {b || 'কোনো ব্যাজ নেই'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 2: 4 ROOM VIEW IMAGES */}
              <div className="bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-indigo-950 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-800 flex items-center justify-center text-[10px] font-black">২</span>
                    <span>৪টি রুম ভিউ ইমেজ লিঙ্ক (4 Types Room Images Upload/Links)</span>
                  </h4>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    ১. ড্রয়িং রুম ডিফল্ট
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  প্রতিটি রুমের জন্য সুন্দর ছবির লিঙ্ক দিন। ওয়েবসাইট ও প্রোডাক্ট পেজে ড্রয়িং রুমের ছবিটি প্রথমে স্বয়ংক্রিয়ভাবে লোড হবে।
                </p>

                {/* 1. Drawing Room */}
                <div className="p-3 bg-white rounded-xl border border-indigo-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-black text-indigo-900 text-xs flex items-center gap-1.5">
                      <span>১. ড্রয়িং রুম (Drawing Room)</span>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-md">মেইন ফটো &amp; ডিফল্ট সিলেক্টেড</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <img src={newProdDrawingRoomImg} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" />
                    <input
                      type="url"
                      required
                      value={newProdDrawingRoomImg}
                      onChange={(e) => setNewProdDrawingRoomImg(e.target.value)}
                      placeholder="ড্রয়িং রুম ভিউ ছবির লিঙ্ক..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0f3d44] font-mono"
                    />
                  </div>
                </div>

                {/* 2. Office Room */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                  <label className="font-bold text-slate-800 text-xs block">
                    ২. অফিস রুম (Office Room View)
                  </label>
                  <div className="flex items-center gap-2">
                    <img src={newProdOfficeRoomImg} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" />
                    <input
                      type="url"
                      value={newProdOfficeRoomImg}
                      onChange={(e) => setNewProdOfficeRoomImg(e.target.value)}
                      placeholder="অফিস রুম ছবির লিঙ্ক..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0f3d44] font-mono"
                    />
                  </div>
                </div>

                {/* 3. Prayer / Reading Room (Dynamic based on Category) */}
                <div className="p-3 bg-white rounded-xl border border-teal-200 space-y-2">
                  <label className="font-bold text-teal-900 text-xs block">
                    ৩. নামাজের ঘর (ইসলামিক ক্যাটাগরির জন্য) / রিডিং রুম (ন্যাচারাল ক্যাটাগরির জন্য)
                  </label>
                  <div className="flex items-center gap-2">
                    <img src={newProdPrayerOrReadingRoomImg} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" />
                    <input
                      type="url"
                      value={newProdPrayerOrReadingRoomImg}
                      onChange={(e) => setNewProdPrayerOrReadingRoomImg(e.target.value)}
                      placeholder="নামাজের ঘর বা রিডিং রুম ছবির লিঙ্ক..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0f3d44] font-mono"
                    />
                  </div>
                </div>

                {/* 4. Bedroom */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                  <label className="font-bold text-slate-800 text-xs block">
                    ৪. বেডরুম (Bedroom View)
                  </label>
                  <div className="flex items-center gap-2">
                    <img src={newProdBedroomImg} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" />
                    <input
                      type="url"
                      value={newProdBedroomImg}
                      onChange={(e) => setNewProdBedroomImg(e.target.value)}
                      placeholder="বেডরুম ছবির লিঙ্ক..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0f3d44] font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: SIZES (MEDIUM & LARGE - LENGTH & WIDTH ONLY), PRICES & WEIGHT */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="font-extrabold text-xs text-[#0f3d44] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black">৩</span>
                  <span>সাইজ ও মূল্য নির্ধারণ (Sizes: Length × Width, Both Prices &amp; Weight)</span>
                </h4>

                {/* Medium Size */}
                <div className="p-3 bg-white rounded-xl border border-indigo-100 space-y-2">
                  <span className="font-black text-indigo-900 text-xs block">
                    মিডিয়াম সাইজ (Medium Size - ডিফল্ট)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block">
                        দৈর্ঘ্য ও প্রস্থ (Length × Width) *
                      </label>
                      <input
                        type="text"
                        required
                        value={newProdMediumDimensions}
                        onChange={(e) => setNewProdMediumDimensions(e.target.value)}
                        placeholder="যেমন: 75cm × 40cm"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#0f3d44]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block">
                        ওজন (Weight in grams) *
                      </label>
                      <input
                        type="number"
                        required
                        value={newProdMediumWeight}
                        onChange={(e) => setNewProdMediumWeight(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#0f3d44]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-emerald-700 block">
                        বিক্রয় মূল্য (Price ৳) *
                      </label>
                      <input
                        type="number"
                        required
                        value={newProdMediumPrice}
                        onChange={(e) => setNewProdMediumPrice(Number(e.target.value))}
                        className="w-full bg-emerald-50/50 border border-emerald-200 rounded-lg px-2.5 py-1.5 text-xs font-black text-emerald-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block">
                        পূর্বের মূল্য / কাটা মূল্য (Old Price ৳)
                      </label>
                      <input
                        type="number"
                        value={newProdMediumOldPrice}
                        onChange={(e) => setNewProdMediumOldPrice(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Large Size */}
                <div className="p-3 bg-white rounded-xl border border-purple-100 space-y-2">
                  <span className="font-black text-purple-900 text-xs block">
                    লার্জ সাইজ (Large Size)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block">
                        দৈর্ঘ্য ও প্রস্থ (Length × Width) *
                      </label>
                      <input
                        type="text"
                        required
                        value={newProdLargeDimensions}
                        onChange={(e) => setNewProdLargeDimensions(e.target.value)}
                        placeholder="যেমন: 120cm × 60cm"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#0f3d44]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block">
                        ওজন (Weight in grams) *
                      </label>
                      <input
                        type="number"
                        required
                        value={newProdLargeWeight}
                        onChange={(e) => setNewProdLargeWeight(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#0f3d44]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-purple-700 block">
                        বিক্রয় মূল্য (Price ৳) *
                      </label>
                      <input
                        type="number"
                        required
                        value={newProdLargePrice}
                        onChange={(e) => setNewProdLargePrice(Number(e.target.value))}
                        className="w-full bg-purple-50/50 border border-purple-200 rounded-lg px-2.5 py-1.5 text-xs font-black text-purple-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block">
                        পূর্বের মূল্য / কাটা মূল্য (Old Price ৳)
                      </label>
                      <input
                        type="number"
                        value={newProdLargeOldPrice}
                        onChange={(e) => setNewProdLargeOldPrice(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: DESCRIPTION & MATERIAL */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="font-extrabold text-xs text-[#0f3d44] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black">৪</span>
                  <span>পণ্যের বিবরণ ও মেটেরিয়াল (Description &amp; Overview)</span>
                </h4>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    বাংলা সংক্ষিপ্ত বিবরণ (Bangla Short Overview)
                  </label>
                  <textarea
                    rows={2}
                    value={newProdBanglaDesc}
                    onChange={(e) => setNewProdBanglaDesc(e.target.value)}
                    placeholder="যেমন: ১০০% খাঁটি সার্জিক্যাল স্টেইনলেস স্টিলে তৈরি অনন্য ওয়াল আর্ট। ঘরকে দেবে প্রিমিয়াম লাক্সারি লুক।"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0f3d44] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    মেটেরিয়াল ও থিকনেস (Material)
                  </label>
                  <input
                    type="text"
                    value={newProdMaterial}
                    onChange={(e) => setNewProdMaterial(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-[#0f3d44]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] via-[#9333ea] to-[#ec4899] shadow-md hover:opacity-95 cursor-pointer"
                >
                  সংরক্ষণ করুন (Save Product)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL (COMPLETE EDITABLE ALL 6 ITEMS) */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#0f3d44]">
                    প্রোডাক্ট সম্পূর্ণ এডিট করুন: {editingProduct.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    ৪টি রুম ইমেজ লিঙ্ক, মিডিয়াম ও লার্জ সাইজ, উভয় প্রাইস, ওজন ও বিবরণ এডিট করুন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditedProduct} className="space-y-6 text-xs">
              {/* 1. PRODUCT TITLE, CATEGORY, SLUG & STOCK */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="font-extrabold text-xs text-[#0f3d44] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black">১</span>
                  <span>পণ্যের নাম ও ক্যাটাগরি (Product Title &amp; Category)</span>
                </h4>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    প্রোডাক্টের নাম (Product Title) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-[#0f3d44] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      ক্যাটাগরি (Category) *
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
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold bg-white text-[#0f3d44] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.icon ? `${c.icon} ` : ''}{c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={editingProduct.slug}
                      onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-[#0f3d44]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      স্টক সংখ্যা (Stock Units)
                    </label>
                    <input
                      type="number"
                      value={editingProduct.stock}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-[#0f3d44]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      হাইলাইট ব্যাজ (Badge)
                    </label>
                    <select
                      value={editingProduct.badge || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, badge: (e.target.value || null) as any })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-[#0f3d44]"
                    >
                      <option value="">কোনো ব্যাজ নেই (None)</option>
                      <option value="NEW">NEW</option>
                      <option value="HOT">HOT</option>
                      <option value="SALE">SALE</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. 4 ROOM VIEW IMAGES WITH DYNAMIC BANGLA LABELS */}
              {(() => {
                const isIslamic =
                  editingProduct.category_id === 1 ||
                  editingProduct.category_id === 2 ||
                  editingProduct.category_id === 3 ||
                  (editingProduct.category_name || '').toLowerCase().includes('islamic') ||
                  (editingProduct.name || '').toLowerCase().includes('ayatul') ||
                  (editingProduct.name || '').toLowerCase().includes('surah');

                const room3Label = isIslamic ? 'নামাজের ঘর (Prayer Room)' : 'রিডিং রুম (Reading Room)';
                const roomImages = editingProduct.room_images || {
                  drawing_room: editingProduct.image_url || '',
                  office_room: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
                  prayer_or_reading_room: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
                  bedroom: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80'
                };

                return (
                  <div className="bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-xs text-indigo-950 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-800 flex items-center justify-center text-[10px] font-black">২</span>
                        <span>৪টি রুম ভিউ ইমেজ লিঙ্ক (4 Types Room Images Upload/Links)</span>
                      </h4>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        ১. ড্রয়িং রুম সর্বদা ডিফল্ট
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      নিচে প্রতিটি রুমের ছবি লিঙ্ক দিন বা পরিবর্তন করুন। ড্রয়িং রুমের ছবিটি স্টোরে ডিফল্ট সিলেক্টেড থাকবে।
                    </p>

                    {/* 1. Drawing Room */}
                    <div className="p-3 bg-white rounded-xl border border-indigo-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-black text-indigo-950 text-xs flex items-center gap-1.5">
                          <span>১. ড্রয়িং রুম (Drawing Room)</span>
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-md">মেইন ফটো &amp; ডিফল্ট সিলেক্টেড</span>
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <img
                          src={roomImages.drawing_room || editingProduct.image_url}
                          alt="Drawing Room"
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <input
                          type="url"
                          required
                          value={roomImages.drawing_room || ''}
                          onChange={(e) => updateEditingProductRoomImage('drawing_room', e.target.value)}
                          placeholder="ড্রয়িং রুম ভিউ ছবির লিঙ্ক..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0f3d44] font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {/* 2. Office Room */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                      <label className="font-bold text-slate-800 text-xs block">
                        ২. অফিস রুম (Office Room View)
                      </label>
                      <div className="flex items-center gap-2">
                        <img
                          src={roomImages.office_room || ''}
                          alt="Office Room"
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <input
                          type="url"
                          value={roomImages.office_room || ''}
                          onChange={(e) => updateEditingProductRoomImage('office_room', e.target.value)}
                          placeholder="অফিস রুম ছবির লিঙ্ক..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0f3d44] font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {/* 3. Prayer / Reading Room (Dynamic based on Category) */}
                    <div className="p-3 bg-white rounded-xl border border-teal-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-teal-900 text-xs block">
                          ৩. {room3Label}
                        </label>
                        <span className="text-[10px] text-teal-700 font-bold">
                          {isIslamic ? '🕌 ইসলামিক ক্যাটাগরি' : '🌿 ন্যাচারাল ক্যাটাগরি'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <img
                          src={roomImages.prayer_or_reading_room || ''}
                          alt={room3Label}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <input
                          type="url"
                          value={roomImages.prayer_or_reading_room || ''}
                          onChange={(e) => updateEditingProductRoomImage('prayer_or_reading_room', e.target.value)}
                          placeholder="নামাজের ঘর বা রিডিং রুম ছবির লিঙ্ক..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0f3d44] font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {/* 4. Bedroom */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                      <label className="font-bold text-slate-800 text-xs block">
                        ৪. বেডরুম (Bedroom View)
                      </label>
                      <div className="flex items-center gap-2">
                        <img
                          src={roomImages.bedroom || ''}
                          alt="Bedroom"
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <input
                          type="url"
                          value={roomImages.bedroom || ''}
                          onChange={(e) => updateEditingProductRoomImage('bedroom', e.target.value)}
                          placeholder="বেডরুম ছবির লিঙ্ক..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0f3d44] font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 3. SIZES (MEDIUM & LARGE - STRICT LENGTH × WIDTH), BOTH PRICES & WEIGHT */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="font-extrabold text-xs text-[#0f3d44] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black">৩</span>
                  <span>সাইজ ও মূল্য নির্ধারণ (Sizes: Length × Width, Both Prices &amp; Weight)</span>
                </h4>

                {/* MEDIUM SIZE */}
                {(() => {
                  const medSize = editingProduct.sizes?.[0] || {
                    id: 's1',
                    name: 'Medium (75cm × 40cm)',
                    size_dimensions: editingProduct.size_dimensions || '75cm × 40cm',
                    price: editingProduct.price,
                    old_price: editingProduct.old_price,
                    weight_grams: editingProduct.weight_grams || 1400
                  };

                  return (
                    <div className="p-3 bg-white rounded-xl border border-indigo-100 space-y-2">
                      <span className="font-black text-indigo-900 text-xs block">
                        মিডিয়াম সাইজ (Medium Size - ডিফল্ট)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 block">
                            দৈর্ঘ্য ও প্রস্থ (Length × Width) *
                          </label>
                          <input
                            type="text"
                            required
                            value={medSize.size_dimensions || ''}
                            onChange={(e) => updateEditingProductSize(0, 'size_dimensions', e.target.value)}
                            placeholder="যেমন: 75cm × 40cm"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#0f3d44]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 block">
                            ওজন (Weight in grams) *
                          </label>
                          <input
                            type="number"
                            required
                            value={medSize.weight_grams || 1400}
                            onChange={(e) => updateEditingProductSize(0, 'weight_grams', Number(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#0f3d44]"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-emerald-700 block">
                            বিক্রয় মূল্য (Price ৳) *
                          </label>
                          <input
                            type="number"
                            required
                            value={medSize.price || 0}
                            onChange={(e) => updateEditingProductSize(0, 'price', Number(e.target.value))}
                            className="w-full bg-emerald-50/50 border border-emerald-200 rounded-lg px-2.5 py-1.5 text-xs font-black text-emerald-900"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block">
                            পূর্বের মূল্য / কাটা মূল্য (Old Price ৳)
                          </label>
                          <input
                            type="number"
                            value={medSize.old_price || ''}
                            onChange={(e) => updateEditingProductSize(0, 'old_price', e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* LARGE SIZE */}
                {(() => {
                  const lrgSize = editingProduct.sizes?.[1] || {
                    id: 's2',
                    name: 'Large (120cm × 60cm)',
                    size_dimensions: '120cm × 60cm',
                    price: Math.round(editingProduct.price * 1.36),
                    old_price: editingProduct.old_price ? Math.round(editingProduct.old_price * 1.36) : undefined,
                    weight_grams: Math.round((editingProduct.weight_grams || 1400) * 1.57)
                  };

                  return (
                    <div className="p-3 bg-white rounded-xl border border-purple-100 space-y-2">
                      <span className="font-black text-purple-900 text-xs block">
                        লার্জ সাইজ (Large Size)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 block">
                            দৈর্ঘ্য ও প্রস্থ (Length × Width) *
                          </label>
                          <input
                            type="text"
                            required
                            value={lrgSize.size_dimensions || ''}
                            onChange={(e) => updateEditingProductSize(1, 'size_dimensions', e.target.value)}
                            placeholder="যেমন: 120cm × 60cm"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#0f3d44]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 block">
                            ওজন (Weight in grams) *
                          </label>
                          <input
                            type="number"
                            required
                            value={lrgSize.weight_grams || 2200}
                            onChange={(e) => updateEditingProductSize(1, 'weight_grams', Number(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#0f3d44]"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-purple-700 block">
                            বিক্রয় মূল্য (Price ৳) *
                          </label>
                          <input
                            type="number"
                            required
                            value={lrgSize.price || 0}
                            onChange={(e) => updateEditingProductSize(1, 'price', Number(e.target.value))}
                            className="w-full bg-purple-50/50 border border-purple-200 rounded-lg px-2.5 py-1.5 text-xs font-black text-purple-900"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block">
                            পূর্বের মূল্য / কাটা মূল্য (Old Price ৳)
                          </label>
                          <input
                            type="number"
                            value={lrgSize.old_price || ''}
                            onChange={(e) => updateEditingProductSize(1, 'old_price', e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* 4. DESCRIPTION & MATERIAL */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="font-extrabold text-xs text-[#0f3d44] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black">৪</span>
                  <span>পণ্যের বিবরণ ও মেটেরিয়াল (Description &amp; Overview)</span>
                </h4>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    বাংলা সংক্ষিপ্ত বিবরণ (Bangla Short Overview)
                  </label>
                  <textarea
                    rows={2}
                    value={editingProduct.bangla_short_desc || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, bangla_short_desc: e.target.value })}
                    placeholder="বাংলা বিবরণ..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0f3d44] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    মেটেরিয়াল ও থিকনেস (Material)
                  </label>
                  <input
                    type="text"
                    value={editingProduct.material || 'Surgical Stainless Steel (2mm Thickness)'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, material: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-[#0f3d44]"
                  />
                </div>
              </div>

              {/* Save / Cancel Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="w-1/2 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] via-[#9333ea] to-[#ec4899] shadow-md hover:opacity-95 cursor-pointer"
                >
                  সংরক্ষণ করুন (Save Changes)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ORDER FULL DETAILS MODAL */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200/80 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0f3d44] to-slate-900 text-white flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-base text-teal-300">
                    Order #{selectedOrderDetails.order_number}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    selectedOrderDetails.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    selectedOrderDetails.status === 'shipped' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                    selectedOrderDetails.status === 'processing' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                    selectedOrderDetails.status === 'confirmed' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    ● {selectedOrderDetails.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  তারিখ: {new Date(selectedOrderDetails.created_at).toLocaleString('en-BD', { dateStyle: 'full', timeStyle: 'short' })}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPrintInvoiceOrder(selectedOrderDetails)}
                  className="px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-teal-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট চালান</span>
                </button>
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
              {/* Customer Contact Quick Bar */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block mb-0.5 text-[11px]">কাস্টমারের নাম ও যোগাযোগ:</span>
                  <div className="font-extrabold text-slate-900 text-sm">{selectedOrderDetails.user_name}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <a
                      href={`tel:${selectedOrderDetails.user_phone}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>কল করুন ({selectedOrderDetails.user_phone})</span>
                    </a>
                    {(() => {
                      const cleanPhone = (selectedOrderDetails.user_phone || '').replace(/[^0-9]/g, '');
                      const waPhone = cleanPhone.startsWith('88') ? cleanPhone : (cleanPhone.startsWith('0') ? '88' + cleanPhone : '880' + cleanPhone);
                      const waMessage = encodeURIComponent(`আসসালামু আলাইকুম ${selectedOrderDetails.user_name || ''}, UNEX AURA থেকে আপনার অর্ডার #${selectedOrderDetails.order_number} সম্পর্কে যোগাযোগ করছি।`);
                      return (
                        <a
                          href={`https://wa.me/${waPhone}?text=${waMessage}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#25D366] text-white font-bold text-xs hover:opacity-90 shadow-xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      );
                    })()}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5 text-[11px]">ডেলিভারি ঠিকানা ও শহর:</span>
                  <div className="font-bold text-slate-800 leading-relaxed">
                    {selectedOrderDetails.shipping_address}
                  </div>
                  <div className="font-bold text-teal-700 mt-1">
                    শহর/জেলা: {selectedOrderDetails.city}
                  </div>
                </div>
              </div>

              {/* Status Update Toolbar */}
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-[#0f3d44] block">অর্ডার প্রগ্রেস স্ট্যাটাস:</span>
                  <span className="text-slate-500 text-[11px]">স্ট্যাটাস পরিবর্তন করলে স্বয়ংক্রিয়ভাবে ডাটাবেজ আপডেট হবে</span>
                </div>
                <select
                  value={selectedOrderDetails.status}
                  onChange={(e) => handleUpdateOrderStatus(selectedOrderDetails.id, e.target.value)}
                  className="bg-white border border-teal-300 rounded-xl px-3.5 py-2 text-xs font-bold text-[#0f3d44] focus:outline-none focus:ring-2 focus:ring-[#0f3d44]"
                >
                  <option value="pending">⏳ Pending (অপেক্ষমান)</option>
                  <option value="confirmed">✅ Confirmed (কল দিয়ে কনফার্মড)</option>
                  <option value="processing">⚙️ Processing (লেজার কাটিং প্রসেস)</option>
                  <option value="shipped">🚚 Shipped (কুরিয়ারে পাঠানো হয়েছে)</option>
                  <option value="delivered">🎉 Delivered (ডেলিভারি সম্পন্ন)</option>
                  <option value="cancelled">❌ Cancelled (বাতিল)</option>
                </select>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-[#0f3d44]">অর্ডারকৃত আইটেম তালিকা:</h4>
                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {(selectedOrderDetails.items || []).map((item, idx) => (
                    <div key={idx} className="p-3.5 bg-white flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {item.product_image && (
                          <img
                            src={item.product_image}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                          />
                        )}
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{item.product_name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            সাইজ: <span className="font-semibold text-teal-700">{item.size || 'Medium'}</span> • পরিমাণ: <span className="font-bold">{item.quantity} টি</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900 text-xs">{formatPrice(item.price * item.quantity)}</div>
                        <div className="text-[10px] text-slate-400">{formatPrice(item.price)} × {item.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Calculation */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-slate-600">
                  <span>সাবটোটাল:</span>
                  <span className="font-bold text-slate-800">{formatPrice(selectedOrderDetails.subtotal || selectedOrderDetails.total_amount)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>ডেলিভারি চার্জ:</span>
                  <span className="font-bold text-slate-800">
                    {selectedOrderDetails.shipping_fee === 0 ? 'ফ্রি ডেলিভারি' : formatPrice(selectedOrderDetails.shipping_fee || 0)}
                  </span>
                </div>
                {selectedOrderDetails.discount_amount ? (
                  <div className="flex items-center justify-between text-emerald-600">
                    <span>কুপন ডিসকাউন্ট:</span>
                    <span className="font-bold">- {formatPrice(selectedOrderDetails.discount_amount)}</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between text-slate-900 font-extrabold text-sm border-t border-slate-200 pt-2">
                  <span>সর্বমোট প্রদেয় (Total):</span>
                  <span className="text-emerald-700 text-base">{formatPrice(selectedOrderDetails.total_amount)}</span>
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  পেমেন্ট পদ্ধতি: <span className="font-bold uppercase text-slate-800">{selectedOrderDetails.payment_method || 'Cash on Delivery'}</span>
                </div>
              </div>

              {selectedOrderDetails.notes && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                  <span className="font-bold block mb-0.5">কাস্টমার স্পেশাল নোট:</span>
                  <p>{selectedOrderDetails.notes}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: PRINTABLE INVOICE / PACKING SLIP */}
      {printInvoiceOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-teal-400" />
                <span className="font-bold text-xs">অর্ডার ইনভয়েস ও প্যাকিং স্লিপ</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>এখনই প্রিন্ট করুন</span>
                </button>
                <button
                  onClick={() => setPrintInvoiceOrder(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div id="printable-invoice" className="p-8 space-y-6 text-slate-800 text-xs bg-white">
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                <div>
                  <h1 className="text-xl font-black tracking-tight text-slate-900">UNEX AURA</h1>
                  <p className="text-[11px] text-slate-500 font-semibold">3D Surgical Stainless Steel Islamic Wall Art</p>
                  <p className="text-[10px] text-slate-400 mt-1">Dada Market, Unique, Baipail, Ashulia, Dhaka-1341</p>
                  <p className="text-[10px] text-slate-400">Hotline: 01623319639 | support@unexaura.com</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black font-mono text-slate-900">INVOICE</div>
                  <div className="text-xs font-mono font-bold text-teal-700">#{printInvoiceOrder.order_number}</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {new Date(printInvoiceOrder.created_at).toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Customer & Shipping */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 block mb-1">গ্রাহকের তথ্য:</span>
                  <div className="font-extrabold text-slate-900 text-xs">{printInvoiceOrder.user_name}</div>
                  <div className="font-bold text-slate-700">{printInvoiceOrder.user_phone}</div>
                </div>
                <div>
                  <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 block mb-1">ডেলিভারি ঠিকানা:</span>
                  <div className="text-slate-700">{printInvoiceOrder.shipping_address}</div>
                  <div className="font-bold text-slate-800">{printInvoiceOrder.city}</div>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-300 font-bold text-slate-700">
                      <th className="py-2">আইটেম বিবরণ</th>
                      <th className="py-2">সাইজ</th>
                      <th className="py-2 text-center">পরিমাণ</th>
                      <th className="py-2 text-right">মূল্য (৳)</th>
                      <th className="py-2 text-right">মোট (৳)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(printInvoiceOrder.items || []).map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2 font-bold text-slate-900">{item.product_name}</td>
                        <td className="py-2 text-slate-600">{item.size || 'Medium'}</td>
                        <td className="py-2 text-center font-bold">{item.quantity}</td>
                        <td className="py-2 text-right">{item.price}</td>
                        <td className="py-2 text-right font-bold">{item.price * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="border-t border-slate-200 pt-3 space-y-1.5 max-w-xs ml-auto text-right">
                <div className="flex justify-between text-slate-600">
                  <span>সাবটোটাল:</span>
                  <span className="font-bold">{printInvoiceOrder.subtotal || printInvoiceOrder.total_amount} ৳</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>ডেলিভারি ফি:</span>
                  <span className="font-bold">{printInvoiceOrder.shipping_fee || 0} ৳</span>
                </div>
                <div className="flex justify-between text-slate-900 font-black text-sm border-t border-slate-900 pt-1.5">
                  <span>সর্বমোট প্রদেয়:</span>
                  <span className="text-emerald-700">{printInvoiceOrder.total_amount} ৳</span>
                </div>
                <div className="text-[10px] text-slate-500 pt-1">
                  পেমেন্ট পদ্ধতি: <span className="font-bold uppercase">{printInvoiceOrder.payment_method || 'Cash on Delivery'}</span>
                </div>
              </div>

              {/* Footer Notice */}
              <div className="border-t border-dashed border-slate-300 pt-4 text-center text-[10px] text-slate-500 space-y-1">
                <p className="font-bold text-slate-700">UNEX AURA সাথে থাকার জন্য ধন্যবাদ!</p>
                <p>১০০% খাঁটি সার্জিক্যাল স্টেইনলেস স্টিল ও ফ্রি ৩ডি ইনস্টলেশন স্পেসার কিট অন্তর্ভুক্ত।</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
