import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, Order, Product, TrackingStage } from '../types';
import { ProductCard } from '../components/ProductCard';
import { useSEO } from '../hooks/useSEO';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  User as UserIcon, 
  Lock, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Shield, 
  Heart,
  Search,
  Copy,
  Check,
  ExternalLink,
  PhoneCall,
  MapPin,
  Package,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Navigation,
  Box,
  Flame,
  Layers,
  FileText
} from 'lucide-react';

interface MyAccountPageProps {
  onNavigate: (page: string, params?: any) => void;
  initialTab?: 'dashboard' | 'orders' | 'tracking' | 'wishlist' | 'profile' | 'password';
  onOpenWallModal?: (p: Product) => void;
}

export const MyAccountPage: React.FC<MyAccountPageProps> = ({ onNavigate, initialTab, onOpenWallModal }) => {
  const { user, setUser, formatPrice, showToast, getWishlistProducts, orders, refreshOrders } = useApp();

  useSEO({
    title: 'My Account & Order Tracking',
    description: 'Track your UNEX AURA orders, view order history, manage wishlist, and update account settings.'
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'tracking' | 'wishlist' | 'profile' | 'password'>(initialTab || 'dashboard');
  const [selectedTrackOrderNumber, setSelectedTrackOrderNumber] = useState<string>('');
  const [trackSearchQuery, setTrackSearchQuery] = useState<string>('');
  const [copiedTracking, setCopiedTracking] = useState<boolean>(false);

  const wishlistProducts = getWishlistProducts();

  // Profile Form state
  const [fullName, setFullName] = useState(
    user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Tanvir Hossain'
  );
  const [phone, setPhone] = useState(user?.phone || '01623319639');
  const [address, setAddress] = useState(user?.address || 'House 14, Road 5, Block B, Gulshan 1, Dhaka');
  const [city, setCity] = useState(user?.city || 'Dhaka');

  // Print PDF Invoice function for MyAccountPage
  const handlePrintOrderInvoicePDF = (ord: Order) => {
    if (!ord) return;
    const itemsHtml = (ord.items || []).map((item: any) => {
      const itemMaterial = item.material || item.selected_material || 'Laser-Cut Steel';
      return `
      <tr>
        <td style="padding:10px 12px; border-bottom:1px solid #e2e8f0;">
          <div style="font-weight:bold; color:#0f3d44; font-size:13px;">${item.product_name}</div>
          ${item.selected_size_name ? `<div style="font-size:11px; color:#4f46e5; margin-top:2px;">সাইজ: ${item.selected_size_name}</div>` : ''}
          <div style="font-size:11px; color:#64748b; margin-top:2px;">উপাদান (Material): <strong style="color:#0f3d44;">${itemMaterial}</strong></div>
        </td>
        <td style="padding:10px 12px; border-bottom:1px solid #e2e8f0; text-align:center; font-size:13px; font-weight:bold;">${item.quantity} টি</td>
        <td style="padding:10px 12px; border-bottom:1px solid #e2e8f0; text-align:right; font-size:13px; font-weight:bold; color:#0f3d44;">৳${(item.price || 0) * (item.quantity || 1)}</td>
      </tr>
    `;
    }).join('');

    const invoiceHtml = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>UNEX AURA Official Invoice - ${ord.order_number}</title>
  <style>
    @media print {
      body { background: #ffffff !important; padding: 0 !important; }
      .no-print { display: none !important; }
      .invoice-card { border: none !important; box-shadow: none !important; max-width: 100% !important; padding: 15px !important; }
    }
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f1f5f9; color: #1e293b; padding: 20px; margin: 0; }
    .no-print-bar { max-width: 700px; margin: 0 auto 15px auto; display: flex; justify-content: space-between; align-items: center; background: #0f3d44; color: #fff; padding: 12px 20px; border-radius: 12px; font-size: 13px; }
    .btn-print { background: #14b8a6; color: #fff; border: none; padding: 8px 18px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px; display: inline-flex; align-items: center; gap: 6px; }
    .btn-print:hover { background: #0d9488; }
    .invoice-card { max-width: 700px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #cbd5e1; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .logo { font-size: 28px; font-weight: 900; background: linear-gradient(to right, #14b8a6, #4f46e5, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.5px; }
    .tagline { font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase; color: #0f3d44; font-weight: 800; margin-top: 2px; }
    .header-table { width: 100%; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; }
    .section-title { font-size: 12px; font-weight: 800; color: #0f3d44; margin-bottom: 8px; text-transform: uppercase; border-left: 3px solid #14b8a6; padding-left: 8px; }
    .info-box { background: #f8fafc; padding: 12px 16px; border-radius: 10px; font-size: 12px; margin-bottom: 20px; border: 1px solid #e2e8f0; line-height: 1.7; }
    table.items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    table.items-table th { background: #0f3d44; color: #ffffff; text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    .total-row { font-size: 15px; font-weight: 900; color: #4f46e5; }
    .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 16px; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="no-print-bar no-print">
    <span>📄 <strong>UNEX AURA ইনভয়েস (PDF / Print View)</strong></span>
    <button class="btn-print" onclick="window.print()">🖨️ পিডিএফ সেভ / প্রিন্ট করুন (Save as PDF)</button>
  </div>

  <div class="invoice-card">
    <table class="header-table">
      <tr>
        <td valign="top">
          <div class="logo">UNEX AURA</div>
          <div class="tagline">unique experience</div>
          <div style="font-size:11px; color:#64748b; margin-top:4px;">3D Laser-Cut Metal & Steel Wall Art</div>
        </td>
        <td style="text-align: right;" valign="top">
          <div style="font-size: 16px; font-weight: 900; color: #4f46e5;">OFFICIAL INVOICE (ইনভয়েস)</div>
          <div style="font-size: 16px; font-weight: 900; color: #0f3d44; margin-top: 2px;">#${ord.order_number}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">তারিখ: ${ord.created_at || new Date().toISOString().split('T')[0]}</div>
        </td>
      </tr>
    </table>

    <div class="section-title">গ্রাহক ও শিপিং ঠিকানা</div>
    <div class="info-box">
      <strong>নাম:</strong> ${ord.user_name || 'Customer'}<br>
      <strong>মোবাইল নম্বর:</strong> ${ord.user_phone || '01623319639'}<br>
      <strong>ডেলিভারি ঠিকানা:</strong> ${ord.shipping_address || ''}, ${ord.city || 'Dhaka'}<br>
      <strong>পেমেন্ট মেথড:</strong> ${(ord.payment_method || 'cod') === 'cod' ? 'ক্যাশ অন ডেলিভারি (COD)' : (ord.payment_method || '').toUpperCase()}
    </div>

    <div class="section-title">অর্ডারকৃত পণ্য তালিকা ও উপাদান (Items & Material)</div>
    <table class="items-table">
      <thead>
        <tr>
          <th>পণ্য ও উপাদান</th>
          <th style="text-align:center;">পরিমাণ</th>
          <th style="text-align:right;">মূল্য</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div style="margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 13px;">
      <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
        <span style="color:#64748b;">প্রোডাক্ট সাবটোটাল:</span>
        <strong style="color:#0f3d44;">৳${ord.subtotal_amount || 0}</strong>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
        <span style="color:#64748b;">কুরিয়ার ডেলিভারি চার্জ:</span>
        <strong style="color:#0f3d44;">${ord.delivery_charge === 0 ? 'ফ্রি (FREE)' : '৳' + ord.delivery_charge}</strong>
      </div>
      <div style="display:flex; justify-content:space-between; margin-top:12px; padding-top:12px; border-top:2px solid #0f3d44;" class="total-row">
        <span>সর্বমোট প্রদেয় মূল্য:</span>
        <span>৳${ord.total_amount || 0}</span>
      </div>
    </div>

    <div class="footer">
      <p style="margin:2px 0; font-weight:bold; color:#0f3d44;">ইউনেক্স অরা (UNEX AURA) এর সাথে কেনাকাটার জন্য ধন্যবাদ!</p>
      <p style="margin:2px 0;">২৪/৭ কাস্টমার কেয়ার হটলাইন: 01623319639 | ওয়েবসাইট: unexaura.com</p>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;

    const printWin = window.open('', '_blank', 'width=800,height=900');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(invoiceHtml);
      printWin.document.close();
      showToast('পিডিএফ ইনভয়েস প্রিন্ট প্রভিউ খোলা হচ্ছে...');
    } else {
      showToast('Pop-up blocked. Please allow popups to print PDF invoice.');
    }
  };

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fetchUserOrders = async () => {
    const list = await refreshOrders();
    if (list.length > 0 && !selectedTrackOrderNumber) {
      setSelectedTrackOrderNumber(list[0].order_number);
    }
  };

  useEffect(() => {
    fetchUserOrders();
    const interval = setInterval(fetchUserOrders, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      const nameParts = fullName.trim().split(' ');
      const fName = nameParts[0] || 'User';
      const lName = nameParts.slice(1).join(' ') || '';

      const updatedUser: User = {
        ...user,
        first_name: fName,
        last_name: lName,
        phone,
        address,
        city
      };
      setUser(updatedUser);
      showToast('Profile information updated successfully!');
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      alert('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    showToast('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleLogout = () => {
    setUser(null);
    showToast('Logged out successfully');
    onNavigate('home');
  };

  const handleTrackOrderClick = (orderNum: string) => {
    setSelectedTrackOrderNumber(orderNum);
    setActiveTab('tracking');
  };

  const handleCopyTrackingNumber = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTracking(true);
    showToast(`Copied tracking ID #${code} to clipboard!`);
    setTimeout(() => setCopiedTracking(false), 2500);
  };

  const currentUser = user || {
    id: 1,
    first_name: 'Tanvir',
    last_name: 'Hossain',
    email: 'tanvir@example.com',
    phone: '+8801711223344',
    address: 'House 14, Road 5, Block B, Gulshan 1',
    city: 'Dhaka',
    avatar: 'TH',
    role: 'member' as const
  };

  const totalSpent = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;

  // Tracked order resolution
  const targetSearch = (trackSearchQuery || '').trim().toLowerCase();
  const currentTrackedOrder = orders.find(o => 
    (targetSearch && (
      (o.order_number || '').toLowerCase() === targetSearch ||
      (o.tracking_number && (o.tracking_number || '').toLowerCase() === targetSearch) ||
      (o.user_phone || '').includes(targetSearch)
    )) ||
    (selectedTrackOrderNumber && (o.order_number || '').toLowerCase() === (selectedTrackOrderNumber || '').toLowerCase())
  ) || orders[0];

  const getTrackingStages = (ord?: Order): TrackingStage[] => {
    if (!ord) return [];
    if (ord.tracking_history && ord.tracking_history.length > 0) {
      return ord.tracking_history;
    }

    const isDhaka = ord.delivery_zone === 'dhaka';
    const createdDate = ord.created_at ? ord.created_at.split(' ')[0] : '2026-08-01';

    if (ord.status === 'delivered') {
      return [
        { stage: 'Order Placed & Confirmed', timestamp: `${createdDate} 10:00`, location: 'Ashulia Factory, Dhaka', details: 'Order received into laser cutting queue.', completed: true },
        { stage: 'Precision Laser Cutting', timestamp: `${createdDate} 15:30`, location: 'UNEX Laser Lab, Ashulia', details: 'Surgical Stainless Steel cut & polished.', completed: true },
        { stage: 'Wooden Frame & 3D Spacers Boxed', timestamp: `${createdDate} 18:00`, location: 'Packing Hub, Ashulia', details: 'Packed in shockproof wooden export box.', completed: true },
        { stage: 'Handed to Courier Partner', timestamp: 'Next Day 09:00', location: 'Courier Central Hub', details: `Dispatched via ${ord.courier_name || 'Express Courier Partner'}.`, completed: true },
        { stage: 'Out for Delivery & Handed to Customer', timestamp: 'Delivered', location: ord.city || 'Dhaka', details: 'Package successfully delivered and inspected.', completed: true, current: true }
      ];
    } else if (ord.status === 'shipped') {
      return [
        { stage: 'Order Placed & Confirmed', timestamp: `${createdDate} 10:00`, location: 'Ashulia Factory, Dhaka', details: 'Order received into laser cutting queue.', completed: true },
        { stage: 'Precision Laser Cutting', timestamp: `${createdDate} 15:30`, location: 'UNEX Laser Lab, Ashulia', details: 'Surgical Stainless Steel cut & polished.', completed: true },
        { stage: 'Wooden Frame & 3D Spacers Boxed', timestamp: `${createdDate} 18:00`, location: 'Packing Hub, Ashulia', details: 'Packed in shockproof wooden export box.', completed: true },
        { stage: 'Handed to Courier Partner', timestamp: 'In Transit', location: 'Courier Sorting Hub', details: `Package dispatched with courier tracking #${ord.tracking_number || 'SF-89210'}.`, completed: true, current: true },
        { stage: 'Out for Delivery & Handed to Customer', timestamp: isDhaka ? 'Expected Tomorrow' : 'Expected in 2 Days', location: ord.city || 'Dhaka', details: 'Scheduled for local rider assignment.', completed: false }
      ];
    } else if (ord.status === 'processing') {
      return [
        { stage: 'Order Placed & Confirmed', timestamp: `${createdDate} 10:00`, location: 'Ashulia Factory, Dhaka', details: 'Order received into laser cutting queue.', completed: true },
        { stage: 'Precision Laser Cutting', timestamp: 'In Progress', location: 'UNEX Laser Lab, Ashulia', details: 'Fiber laser cutting and electro-powder coating.', completed: true, current: true },
        { stage: 'Wooden Frame & 3D Spacers Boxed', timestamp: 'Pending', location: 'Packing Hub, Ashulia', details: 'Awaiting laser lab clearance.', completed: false },
        { stage: 'Handed to Courier Partner', timestamp: 'Pending', location: 'Courier Hub', details: 'Awaiting package handover.', completed: false },
        { stage: 'Out for Delivery & Handed to Customer', timestamp: 'Pending', location: ord.city || 'Dhaka', details: 'Awaiting dispatch.', completed: false }
      ];
    } else {
      return [
        { stage: 'Order Placed & Confirmed', timestamp: `${createdDate} 10:00`, location: 'Ashulia Factory, Dhaka', details: 'Order received into laser production queue.', completed: true, current: true },
        { stage: 'Precision Laser Cutting', timestamp: 'Pending Queue', location: 'UNEX Laser Lab, Ashulia', details: 'Surgical Stainless Steel cutting queued.', completed: false },
        { stage: 'Wooden Frame & 3D Spacers Boxed', timestamp: 'Pending Queue', location: 'Packing Hub, Ashulia', details: 'Shockproof export boxing.', completed: false },
        { stage: 'Handed to Courier Partner', timestamp: 'Pending Queue', location: 'Courier Hub', details: 'Awaiting courier pick-up.', completed: false },
        { stage: 'Out for Delivery & Handed to Customer', timestamp: 'Pending Queue', location: ord.city || 'Dhaka', details: 'Final delivery destination.', completed: false }
      ];
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <button onClick={() => onNavigate('home')} className="hover:text-[#4f46e5]">Home</button>
        <span>/</span>
        <span className="text-[#0f3d44] font-bold">My Account</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SIDEBAR (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden lg:sticky lg:top-24 space-y-2">
          {/* USER CARD HEADER */}
          <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] to-[#ec4899] text-white flex items-center justify-center font-bold text-base shadow-md">
                {currentUser.first_name[0]}{currentUser.last_name[0]}
              </div>
              <div>
                <h3 className="font-extrabold text-sm leading-tight text-white">
                  {currentUser.first_name} {currentUser.last_name}
                </h3>
                <span className="text-[11px] text-slate-300 truncate block">{currentUser.email}</span>
              </div>
            </div>
          </div>

          {/* NAV MENU */}
          <div className="p-3 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-indigo-50 text-[#4f46e5]' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === 'orders' ? 'bg-indigo-50 text-[#4f46e5]' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>My Orders ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('tracking')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'tracking' ? 'bg-indigo-50 text-[#4f46e5] font-extrabold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-purple-600" />
                <span>Track Shipping</span>
              </span>
              <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                LIVE
              </span>
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'wishlist' ? 'bg-pink-50 text-pink-600 font-extrabold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Heart className={`w-4 h-4 ${activeTab === 'wishlist' ? 'fill-pink-500 text-pink-500' : ''}`} />
                <span>My Wishlist</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'wishlist' ? 'bg-pink-200 text-pink-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {wishlistProducts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === 'profile' ? 'bg-indigo-50 text-[#4f46e5]' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Profile Information</span>
            </button>

            <button
              onClick={() => setActiveTab('password')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === 'password' ? 'bg-indigo-50 text-[#4f46e5]' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Change Password</span>
            </button>

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                <h2 className="text-xl font-extrabold text-[#0f3d44]">
                  Welcome back, {currentUser.first_name}! 👋
                </h2>
                <p className="text-xs text-slate-500">
                  Manage your recent stainless steel decor orders, delivery tracking, and personal shipping profile.
                </p>
              </div>

              {/* STAT CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                  <span className="text-xs text-slate-400 font-medium">Total Orders</span>
                  <div className="text-2xl font-black text-[#0f3d44]">{orders.length}</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                  <span className="text-xs text-slate-400 font-medium">Delivered</span>
                  <div className="text-2xl font-black text-emerald-600">{deliveredCount}</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                  <span className="text-xs text-slate-400 font-medium">Total Spent</span>
                  <div className="text-2xl font-black text-[#4f46e5]">{formatPrice(totalSpent)}</div>
                </div>
              </div>

              {/* RECENT ORDERS TABLE */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-[#0f3d44]">Recent Orders</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-xs text-[#4f46e5] font-bold hover:underline">
                    View All
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                      <tr>
                        <th className="p-3.5">Order #</th>
                        <th className="p-3.5">Date</th>
                        <th className="p-3.5">Total</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Payment</th>
                        <th className="p-3.5 text-right">Track</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.slice(0, 5).map(o => (
                        <tr key={o.id} className="hover:bg-slate-50/50">
                          <td className="p-3.5 font-bold text-[#4f46e5]">{o.order_number}</td>
                          <td className="p-3.5 text-slate-500">{o.created_at.split(' ')[0]}</td>
                          <td className="p-3.5 font-extrabold text-[#0f3d44]">{formatPrice(o.total_amount)}</td>
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
                          <td className="p-3.5 uppercase text-slate-600 font-medium">{o.payment_method}</td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => handleTrackOrderClick(o.order_number)}
                              className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Truck className="w-3 h-3" />
                              <span>Track</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold text-lg text-[#0f3d44]">All Orders History</h2>
                <span className="text-xs text-slate-500 font-semibold">{orders.length} Total Orders</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Order #</th>
                      <th className="p-3.5">Date &amp; Time</th>
                      <th className="p-3.5">Items</th>
                      <th className="p-3.5">Delivery Fee</th>
                      <th className="p-3.5">Total Amount</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map(o => (
                      <tr key={o.id} className="hover:bg-slate-50/50">
                        <td className="p-3.5 font-bold text-[#4f46e5]">{o.order_number}</td>
                        <td className="p-3.5 text-slate-500">{o.created_at}</td>
                        <td className="p-3.5 text-slate-700 font-medium">{o.items?.length || 1} item(s)</td>
                        <td className="p-3.5 text-slate-600">{o.delivery_charge === 0 ? 'FREE' : formatPrice(o.delivery_charge)}</td>
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
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handlePrintOrderInvoicePDF(o)}
                              className="px-2.5 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                              title="PDF Invoice"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Invoice PDF</span>
                            </button>
                            <button
                              onClick={() => handleTrackOrderClick(o.order_number)}
                              className="px-3 py-1.5 rounded-lg bg-indigo-50 text-[#4f46e5] hover:bg-indigo-100 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Track Package</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: ORDER TRACKING */}
          {activeTab === 'tracking' && (
            <div className="space-y-6">
              {/* SEARCH & ORDER SELECTOR CARD */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold">
                      <Truck className="w-3.5 h-3.5 text-purple-600" />
                      <span>Live Courier &amp; Production Tracker</span>
                    </div>
                    <h2 className="text-xl font-extrabold text-[#0f3d44]">
                      Order Shipping Status
                    </h2>
                    <p className="text-xs text-slate-500">
                      Track your stainless steel artwork from precision laser cutting to doorstep courier delivery.
                    </p>
                  </div>

                  {/* QUICK SEARCH INPUT */}
                  <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={trackSearchQuery}
                      onChange={(e) => setTrackSearchQuery(e.target.value)}
                      placeholder="Search Order # or Phone..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5] transition-all bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* SELECTABLE ORDER PILLS */}
                {orders.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    <span className="text-[11px] font-bold text-slate-400 shrink-0 uppercase tracking-wider">
                      Your Orders:
                    </span>
                    {orders.map(ord => {
                      const isSelected = currentTrackedOrder?.id === ord.id;
                      return (
                        <button
                          key={ord.id}
                          onClick={() => {
                            setTrackSearchQuery('');
                            setSelectedTrackOrderNumber(ord.order_number);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 border ${
                            isSelected
                              ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-transparent shadow-sm'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span>{ord.order_number}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase font-black ${
                            ord.status === 'delivered'
                              ? isSelected ? 'bg-emerald-500/30 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'shipped'
                              ? isSelected ? 'bg-purple-500/30 text-purple-300' : 'bg-purple-100 text-purple-800'
                              : isSelected ? 'bg-blue-500/30 text-blue-300' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {ord.status}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* TRACKED ORDER CONTENT */}
              {!currentTrackedOrder ? (
                <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-4 max-w-md mx-auto">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800 text-sm">No Order Found</h3>
                    <p className="text-xs text-slate-500">
                      We couldn't find an order matching "{trackSearchQuery}". Please check your order number or phone number.
                    </p>
                  </div>
                  <button
                    onClick={() => setTrackSearchQuery('')}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#4f46e5] hover:bg-indigo-600 transition-colors"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* STATUS BANNER CARD */}
                  <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg space-y-6 relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
                      <Truck className="w-64 h-64 text-white" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-2xl font-black text-white tracking-wide">
                            Order {currentTrackedOrder.order_number}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                            currentTrackedOrder.status === 'delivered' ? 'bg-emerald-500 text-white' :
                            currentTrackedOrder.status === 'shipped' ? 'bg-purple-500 text-white' :
                            currentTrackedOrder.status === 'processing' ? 'bg-blue-500 text-white' :
                            'bg-amber-500 text-white'
                          }`}>
                            {currentTrackedOrder.status === 'shipped' ? 'Out For Delivery / In Transit' : currentTrackedOrder.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          Placed on {currentTrackedOrder.created_at} • Destination: {currentTrackedOrder.city} ({currentTrackedOrder.delivery_zone === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})
                        </p>
                      </div>

                      {/* ESTIMATED DELIVERY BADGE */}
                      <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 rounded-xl space-y-1 shrink-0">
                        <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">
                          Estimated Delivery
                        </span>
                        <div className="text-sm font-extrabold text-emerald-400 flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-emerald-400" />
                          <span>{currentTrackedOrder.estimated_delivery || 'Within 24-48 Hours'}</span>
                        </div>
                      </div>
                    </div>

                    {/* COURIER & TRACKING CODE BAR */}
                    <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl space-y-1">
                        <span className="text-slate-400 text-[11px] font-medium">Courier Partner</span>
                        <div className="font-extrabold text-white flex items-center gap-2">
                          <Truck className="w-4 h-4 text-purple-400" />
                          <span>{currentTrackedOrder.courier_name || 'Express Courier Partner'}</span>
                        </div>
                      </div>

                      <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl space-y-1">
                        <span className="text-slate-400 text-[11px] font-medium">Waybill / Tracking ID</span>
                        <div className="font-mono font-bold text-amber-300 flex items-center gap-2">
                          <span>{currentTrackedOrder.tracking_number || `SF-BD-${currentTrackedOrder.order_number.replace('UA-', '')}`}</span>
                          <button
                            onClick={() => handleCopyTrackingNumber(currentTrackedOrder.tracking_number || `SF-BD-${currentTrackedOrder.order_number.replace('UA-', '')}`)}
                            className="p-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                            title="Copy Tracking Number"
                          >
                            {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl space-y-1">
                        <span className="text-slate-400 text-[11px] font-medium">Courier Support Hotline</span>
                        <div className="font-extrabold text-white flex items-center gap-2">
                          <PhoneCall className="w-4 h-4 text-indigo-400" />
                          <a href={`tel:${currentTrackedOrder.courier_phone || '+8801700998877'}`} className="hover:underline text-indigo-300">
                            {currentTrackedOrder.courier_phone || '+8801700998877'}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* VISUAL STEPPER TIMELINE */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <h3 className="font-extrabold text-base text-[#0f3d44] flex items-center gap-2">
                        <Navigation className="w-5 h-5 text-[#4f46e5]" />
                        <span>Live Delivery Progress Timeline</span>
                      </h3>
                      <span className="text-xs text-slate-400 font-bold">5 Stage Precision Status</span>
                    </div>

                    <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                      {getTrackingStages(currentTrackedOrder).map((stage, idx) => {
                        const isDone = stage.completed;
                        const isCurrent = stage.current;

                        return (
                          <div key={idx} className="relative flex items-start gap-4 group">
                            {/* STEP ICON / BADGE */}
                            <div className={`absolute -left-6 sm:-left-8 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                              isDone
                                ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                                : isCurrent
                                ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 animate-pulse'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}>
                              {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                            </div>

                            {/* STEP CARD DETAILS */}
                            <div className={`flex-1 p-4 rounded-xl border transition-all ${
                              isCurrent
                                ? 'bg-indigo-50/50 border-indigo-200 shadow-xs'
                                : isDone
                                ? 'bg-white border-slate-200'
                                : 'bg-slate-50/50 border-slate-200/60 opacity-60'
                            }`}>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                <h4 className={`font-extrabold text-xs sm:text-sm ${
                                  isCurrent ? 'text-[#4f46e5]' : isDone ? 'text-slate-800' : 'text-slate-500'
                                }`}>
                                  {stage.stage}
                                </h4>
                                <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                                  {stage.timestamp}
                                </span>
                              </div>

                              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                {stage.details}
                              </p>

                              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{stage.location}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* SHIPPING & ORDER BREAKDOWN GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* SHIPPING & RECIPIENT INFO */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                      <h3 className="font-extrabold text-sm text-[#0f3d44] border-b border-slate-100 pb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#4f46e5]" />
                        <span>Delivery Address &amp; Recipient</span>
                      </h3>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-400 font-medium">Recipient Name:</span>
                          <span className="font-bold text-slate-800">{currentTrackedOrder.user_name}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-400 font-medium">Contact Phone:</span>
                          <span className="font-mono font-bold text-slate-800">{currentTrackedOrder.user_phone}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-400 font-medium">Shipping Address:</span>
                          <span className="font-bold text-slate-800 text-right max-w-[200px]">{currentTrackedOrder.shipping_address}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400 font-medium">City / Zone:</span>
                          <span className="font-bold text-slate-800">{currentTrackedOrder.city} ({currentTrackedOrder.delivery_zone === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
                        </div>
                      </div>
                    </div>

                    {/* PAYMENT & FINANCIAL BREAKDOWN */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                      <h3 className="font-extrabold text-sm text-[#0f3d44] border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#14b8a6]" />
                        <span>Payment &amp; Delivery Fee Details</span>
                      </h3>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-400 font-medium">Payment Method:</span>
                          <span className="font-bold text-slate-800 uppercase">{currentTrackedOrder.payment_method}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-400 font-medium">Payment Status:</span>
                          <span className={`font-extrabold text-[11px] px-2 py-0.5 rounded-full uppercase ${
                            currentTrackedOrder.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {currentTrackedOrder.payment_status}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-400 font-medium">Items Subtotal:</span>
                          <span className="font-bold text-slate-800">{formatPrice(currentTrackedOrder.subtotal_amount)}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-400 font-medium">Delivery Charge:</span>
                          <span className="font-bold text-slate-800">
                            {currentTrackedOrder.delivery_charge === 0 ? 'FREE Shipping' : formatPrice(currentTrackedOrder.delivery_charge)}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 text-sm font-extrabold text-[#0f3d44]">
                          <span>Grand Total:</span>
                          <span className="text-[#4f46e5] text-base">{formatPrice(currentTrackedOrder.total_amount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PACKAGE ITEMS LIST */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                    <h3 className="font-extrabold text-sm text-[#0f3d44] border-b border-slate-100 pb-3 flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#ec4899]" />
                      <span>Items in Package ({currentTrackedOrder.items?.length || 1})</span>
                    </h3>

                    <div className="divide-y divide-slate-100">
                      {currentTrackedOrder.items?.map((item, i) => (
                        <div key={i} className="py-3 flex items-center justify-between gap-4 text-xs">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image_url}
                              alt={item.product_name}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <h4 className="font-extrabold text-slate-800 line-clamp-1">{item.product_name}</h4>
                              <p className="text-[11px] text-slate-400">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <div className="font-black text-[#0f3d44] shrink-0">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200 text-xs font-bold">
                    <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
                    <span>Saved Favorites</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-[#0f3d44]">
                    My Saved Wishlist ({wishlistProducts.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Wall decor items you saved to review later, add to cart, or visualize on your wall.
                  </p>
                </div>

                {wishlistProducts.length > 0 && (
                  <button
                    onClick={() => onNavigate('shop')}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#4f46e5] bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
                  >
                    Explore More Artwork
                  </button>
                )}
              </div>

              {wishlistProducts.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-4 max-w-lg mx-auto">
                  <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center mx-auto border border-pink-100 shadow-sm">
                    <Heart className="w-8 h-8 fill-pink-500/20 text-pink-500" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-800 text-base">Your Wishlist is Empty</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Save your favorite laser-cut stainless steel wall art pieces by tapping the heart icon on any product card!
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('shop')}
                    className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] via-[#9333ea] to-[#ec4899] hover:opacity-95 shadow-md cursor-pointer"
                  >
                    Browse Wall Art Catalog
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onSelectProduct={(prod) => onNavigate('product', { slug: prod.slug })}
                      onOpenWallModal={(prod) => onOpenWallModal ? onOpenWallModal(prod) : onNavigate('product', { slug: prod.slug })}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
              <h2 className="font-extrabold text-lg text-[#0f3d44]">Edit Profile Information</h2>

              <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Tanvir Hossain / আপনার পূর্ণ নাম"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f3d44]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">Email cannot be changed</span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f3d44]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Full Address</label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House/Flat #, Road #, Area, Thana, District / বাসা/ফ্ল্যাট নং, রোড, এলাকা, থানা, জেলা"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#0f3d44]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] via-[#9333ea] to-[#ec4899] hover:opacity-95 shadow-md cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: PASSWORD */}
          {activeTab === 'password' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 max-w-md">
              <h2 className="font-extrabold text-lg text-[#0f3d44]">Change Password</h2>

              <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Current Password *</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f3d44]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">New Password (min 6 chars) *</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f3d44]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f3d44]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md cursor-pointer"
                >
                  Update Password
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
