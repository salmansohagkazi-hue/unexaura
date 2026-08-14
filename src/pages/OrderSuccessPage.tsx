import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useApp } from '../context/AppContext';
import { trackPurchase } from '../utils/analytics';
import {
  CheckCircle2,
  Download,
  FileText,
  Truck,
  Home,
  Copy,
  Check,
  ShieldCheck,
  Package,
  Clock,
  MessageCircle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  HeartHandshake
} from 'lucide-react';

interface OrderSuccessPageProps {
  order?: any;
  orderNumber?: string;
  onNavigate: (page: string, params?: any) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({
  order: initialOrder,
  orderNumber: propOrderNumber,
  onNavigate
}) => {
  const { formatPrice, showToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [fetchedOrder, setFetchedOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If order object is missing but orderNumber exists, attempt to fetch from server API
  useEffect(() => {
    if (!initialOrder && propOrderNumber) {
      setIsLoading(true);
      fetch('/api/orders')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.orders)) {
            const match = data.orders.find((o: any) => o.order_number === propOrderNumber);
            if (match) {
              setFetchedOrder(match);
            }
          }
        })
        .catch(err => console.error('Error fetching order:', err))
        .finally(() => setIsLoading(false));
    }
  }, [initialOrder, propOrderNumber]);

  const order = initialOrder || fetchedOrder;
  const orderNumber = order?.order_number || propOrderNumber || 'UA-1001';

  // Ensure purchase event is tracked (deduplicated automatically)
  useEffect(() => {
    if (order) {
      trackPurchase(order);
    }
  }, [order]);

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    showToast('অর্ডার নম্বর কপি করা হয়েছে!');
    setTimeout(() => setCopied(false), 2500);
  };

  const isDhaka = order?.delivery_zone === 'dhaka' || (order?.city || '').toLowerCase().includes('dhaka');
  const deliveryEst = isDhaka ? '২৪ - ৪৮ ঘণ্টার মধ্যে (Inside Dhaka)' : '২ - ৩ কার্যদিবসের মধ্যে (Outside Dhaka)';

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const printableInvoiceRef = useRef<HTMLDivElement>(null);

  const handleDownloadInvoice = async () => {
    if (!order) return;
    setIsGeneratingPDF(true);
    showToast('PDF ইনভয়েস ডাউনলোড প্রস্তুত করা হচ্ছে...');

    try {
      if (printableInvoiceRef.current) {
        const canvas = await html2canvas(printableInvoiceRef.current, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`UNEX_AURA_Invoice_${orderNumber}.pdf`);
        showToast('PDF ইনভয়েস সফলভাবে ডাউনলোড হয়েছে!');
      } else {
        throw new Error('Printable invoice element not found');
      }
    } catch (err) {
      console.error('PDF Generation Error:', err);
      // Fallback preview
      const itemsHtml = (order.items || []).map((item: any) => {
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
  <title>UNEX AURA Official Invoice - ${orderNumber}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f1f5f9; color: #1e293b; padding: 20px; margin: 0; }
    .invoice-card { max-width: 700px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #cbd5e1; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .logo { font-size: 28px; font-weight: 900; background: linear-gradient(to right, #14b8a6, #4f46e5, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .header-table { width: 100%; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; }
  </style>
</head>
<body>
  <div class="invoice-card">
    <table class="header-table">
      <tr>
        <td><div class="logo">UNEX AURA</div></td>
        <td style="text-align:right;"><strong>INVOICE #${orderNumber}</strong></td>
      </tr>
    </table>
    <p><strong>Customer:</strong> ${order.user_name || 'Customer'}</p>
    <p><strong>Phone:</strong> ${order.user_phone || 'N/A'}</p>
    <table width="100%">${itemsHtml}</table>
    <h3 style="text-align:right;">Total: ৳${order.total_amount || 0}</h3>
  </div>
</body>
</html>`;

      const printWin = window.open('', '_blank', 'width=800,height=900');
      if (printWin) {
        printWin.document.open();
        printWin.document.write(invoiceHtml);
        printWin.document.close();
      }
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-14 space-y-8 selection:bg-teal-500 selection:text-white">
      {/* CLEAN WHITE UNEX AURA BRANDED CONFIRMATION CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl relative overflow-hidden text-slate-800">
        {/* Subtle Ambient Decorative Glows */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 text-center space-y-5">
          {/* UNEX AURA LOGO WITH SMALL "unique experience" UNDERNEATH */}
          <div className="inline-flex flex-col items-center justify-center">
            <span className="text-2xl sm:text-3xl font-black tracking-tight whitespace-nowrap bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] via-[#9333ea] to-[#ec4899] bg-clip-text text-transparent leading-none">
              UNEX AURA
            </span>
            <span className="text-[9px] sm:text-[10px] tracking-[0.25em] text-[#0f3d44] font-black lowercase opacity-90 mt-1">
              unique experience
            </span>
          </div>

          {/* Animated Success Icon Badge */}
          <div className="relative inline-flex items-center justify-center pt-1">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center animate-pulse">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <CheckCircle2 className="w-10 h-10" />
              </div>
            </div>
          </div>

          {/* Bengali Header & UNEX AURA Message */}
          <div className="space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-black tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>অর্ডার কনফার্মড • Order Confirmed</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#0f3d44] pt-1 leading-tight">
              ধন্যবাদ! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed pt-1">
              ইউনেক্স অরা (UNEX AURA) এর প্রিমিয়াম ৩ডি লেজার-কাট মেটাল ওয়াল আর্ট পছন্দ করার জন্য আপনাকে আন্তরিক ধন্যবাদ! আপনার কাস্টম অর্ডারটি আমাদের লেজার হ্যান্ড-পলিশিং কারখানায় প্রসেসিংয়ের জন্য শিডিউল করা হয়েছে।
            </p>
          </div>

          {/* SERIAL ORDER NUMBER HIGHLIGHT CARD */}
          <div className="max-w-xl mx-auto bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-800 block">
                আপনার ইউনিক অর্ডার সিরিয়াল নম্বর (Order Serial)
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-[#4f46e5]">
                  {orderNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyOrderNumber}
                  className="p-1.5 rounded-lg bg-white shadow-xs hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all cursor-pointer"
                  title="Copy Order Number"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
              <span className="text-[10px] text-slate-500 font-bold block">আনুমানিক ডেলিভারি সময়</span>
              <span className="text-xs sm:text-sm font-black text-[#0f3d44] block mt-0.5">
                {deliveryEst}
              </span>
            </div>
          </div>
        </div>
      </div>



      {/* FULL ORDER INVOICE & CUSTOMER RECEIPT */}
      {order && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-black text-base text-[#0f3d44]">
              অর্ডার মেমো ও শিপিং বিবরণী (Order Summary & Invoice)
            </h3>
            <button
              type="button"
              disabled={isGeneratingPDF}
              onClick={handleDownloadInvoice}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 via-indigo-600 to-pink-600 hover:opacity-95 shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>PDF তৈরি হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>PDF ইনভয়েস ডাউনলোড করুন</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-extrabold text-[#0f3d44] text-xs block mb-1">গ্রাহকের নাম ও মোবাইল (Recipient):</span>
              <p className="font-bold text-slate-800">{order.user_name || 'Customer'}</p>
              <p className="font-mono text-slate-700">{order.user_phone || 'Mobile provided'}</p>
              {order.user_email && <p className="text-slate-500">{order.user_email}</p>}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-extrabold text-[#0f3d44] text-xs block mb-1">ডেলিভারি ঠিকানা (Shipping Address):</span>
              <p className="font-semibold text-slate-800">{order.shipping_address}</p>
              <p className="text-slate-600">{order.city || 'Dhaka'} ({isDhaka ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে'})</p>
              <div className="pt-1">
                <span className="text-[11px] font-extrabold text-[#0f3d44]">পেমেন্ট মেথড (Payment Method):</span>
                <p className="text-emerald-700 font-extrabold text-xs pt-0.5">
                  {(order.payment_method || 'cod') === 'cod' ? 'ক্যাশ অন ডেলিভারি (Cash on Delivery)' : (order.payment_method || 'COD').toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* ITEM LIST */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-extrabold text-[#0f3d44] block">অর্ডার করা প্রিমিয়াম ওয়াল আর্ট:</span>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="p-3.5 sm:p-4 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image_url}
                      alt=""
                      className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
                    />
                    <div>
                      <h4 className="font-extrabold text-[#0f3d44] text-xs sm:text-sm">{item.product_name}</h4>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5 flex flex-wrap items-center gap-2">
                        <span>পরিমাণ: <strong>{item.quantity} টি</strong></span>
                        <span>•</span>
                        <span>উপাদান: <strong className="text-[#0f3d44] font-bold">{item.material || item.selected_material || 'Laser-Cut Steel'}</strong></span>
                        {item.selected_size_name && (
                          <>
                            <span>•</span>
                            <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                              সাইজ: {item.selected_size_name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-black text-[#0f3d44] text-xs sm:text-sm">
                      {formatPrice((item.price || 0) * (item.quantity || 1))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FINANCIAL SUMMARY */}
          <div className="pt-3 border-t border-slate-200 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>প্রোডাক্ট সাব টোটাল (Subtotal):</span>
              <span className="font-bold text-slate-800">{formatPrice(order.subtotal_amount || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>ডেলিভারি চার্জ (Courier Delivery):</span>
              <span className="font-bold text-slate-800">
                {order.delivery_charge === 0 ? (
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-black border border-emerald-100">
                    ফ্রি ডেলিভারি (FREE)
                  </span>
                ) : (
                  formatPrice(order.delivery_charge || 0)
                )}
              </span>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between text-base sm:text-lg font-black text-[#0f3d44]">
              <span>সর্বমোট প্রদেয় টাকা (Total Amount):</span>
              <span className="text-[#4f46e5] font-mono text-xl sm:text-2xl">{formatPrice(order.total_amount || 0)}</span>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER ASSURANCE & SUPPORT BANNER */}
      <div className="bg-gradient-to-r from-teal-50 via-indigo-50 to-amber-50 p-5 rounded-2xl border border-teal-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-[#0f3d44]">যে কোনো প্রশ্ন বা সাহায্য পেতে কাস্টমার কেয়ার</h4>
            <p className="text-[11px] text-slate-600">২৪/৭ হটলাইন সেবা: 01623319639 | সাপোর্ট সময়: প্রতিদিন সকাল ১০টা - রাত ১০টা</p>
          </div>
        </div>

        <a
          href="https://wa.me/8801623319639"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition-all flex items-center gap-1.5 shrink-0"
        >
          <span>হোয়াটসঅ্যাপ মেসেজ</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* ACTION BUTTONS WITH PROMINENT "GO TO HOME PAGE" BUTTON */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* PROMINENT GO TO HOME PAGE BUTTON */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-black text-slate-900 bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-400/20 hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 group border border-amber-500/30"
        >
          <Home className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>হোম পেজে ফিরে যান (Go to Home Page)</span>
        </button>

        {/* TRACK ORDER STATUS BUTTON */}
        <button
          type="button"
          onClick={() => onNavigate('account', { tab: 'tracking' })}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-[#0f3d44] via-[#4f46e5] to-[#9333ea] hover:opacity-95 shadow-lg shadow-indigo-500/20 hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Truck className="w-4 h-4 text-teal-300" />
          <span>অর্ডার ট্র্যাকিং দেখুন (Track Status)</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      {/* HIDDEN A4 PRINTABLE INVOICE TEMPLATE FOR HIGH-RES JSPDF GENERATION */}
      {order && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <div
            ref={printableInvoiceRef}
            className="w-[750px] bg-white p-10 text-slate-900 border border-slate-300 rounded-none shadow-none font-sans"
            style={{ fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}
          >
            {/* INVOICE HEADER */}
            <div className="flex justify-between items-start border-b-2 border-slate-200 pb-6 mb-6">
              <div>
                <div className="text-3xl font-black bg-gradient-to-r from-teal-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
                  UNEX AURA
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#0f3d44] mt-1">
                  unique experience
                </div>
                <div className="text-xs text-slate-500 font-semibold mt-1">
                  3D Laser-Cut Metal & Steel Wall Art
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-indigo-600 tracking-wide uppercase">
                  OFFICIAL INVOICE
                </div>
                <div className="text-lg font-black text-[#0f3d44] mt-0.5 font-mono">
                  #{orderNumber}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-1">
                  তারিখ: {order.created_at || new Date().toISOString().split('T')[0]}
                </div>
              </div>
            </div>

            {/* CUSTOMER & SHIPPING INFO */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6 text-xs leading-relaxed space-y-1">
              <div className="font-extrabold text-[#0f3d44] uppercase tracking-wider text-[11px] mb-2 border-l-4 border-teal-500 pl-2">
                গ্রাহক ও শিপিং ঠিকানা (Customer & Shipping)
              </div>
              <div><strong className="text-slate-900">নাম:</strong> {order.user_name || 'Customer'}</div>
              <div><strong className="text-slate-900">মোবাইল নম্বর:</strong> {order.user_phone || '01623319639'}</div>
              <div><strong className="text-slate-900">শিপিং ঠিকানা:</strong> {order.shipping_address}, {order.city || 'Dhaka'}</div>
              <div><strong className="text-slate-900">পেমেন্ট মেথড:</strong> {(order.payment_method || 'cod') === 'cod' ? 'ক্যাশ অন ডেলিভারি (Cash on Delivery)' : (order.payment_method || '').toUpperCase()}</div>
            </div>

            {/* ORDERED ITEMS TABLE */}
            <div className="mb-6">
              <div className="font-extrabold text-[#0f3d44] uppercase tracking-wider text-[11px] mb-3 border-l-4 border-teal-500 pl-2">
                অর্ডারকৃত পণ্য তালিকা (Ordered Wall Art Items)
              </div>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#0f3d44] text-white">
                    <th className="p-3 font-bold uppercase tracking-wider rounded-l-lg">পণ্য ও উপাদান</th>
                    <th className="p-3 font-bold uppercase tracking-wider text-center">পরিমাণ</th>
                    <th className="p-3 font-bold uppercase tracking-wider text-right rounded-r-lg">মূল্য</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {order.items?.map((item: any, idx: number) => {
                    const itemMat = item.material || item.selected_material || 'Laser-Cut Steel';
                    return (
                      <tr key={idx}>
                        <td className="p-3 py-3.5">
                          <div className="font-bold text-[#0f3d44] text-sm">{item.product_name}</div>
                          {item.selected_size_name && (
                            <div className="text-[11px] text-indigo-600 font-medium mt-0.5">সাইজ: {item.selected_size_name}</div>
                          )}
                          <div className="text-[11px] text-slate-500 mt-0.5">উপাদান (Material): <strong className="text-slate-800">{itemMat}</strong></div>
                        </td>
                        <td className="p-3 py-3.5 text-center font-bold text-slate-800 text-sm">
                          {item.quantity} টি
                        </td>
                        <td className="p-3 py-3.5 text-right font-black text-[#0f3d44] text-sm">
                          ৳{(item.price || 0) * (item.quantity || 1)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* PRICING BREAKDOWN */}
            <div className="border-t-2 border-slate-200 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>প্রোডাক্ট সাবটোটাল:</span>
                <strong className="text-slate-900 font-bold">৳{order.subtotal_amount || 0}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>কুরিয়ার ডেলিভারি চার্জ:</span>
                <strong className="text-slate-900 font-bold">{order.delivery_charge === 0 ? 'ফ্রি (FREE)' : '৳' + order.delivery_charge}</strong>
              </div>
              <div className="flex justify-between items-center text-base font-black text-[#0f3d44] pt-3 border-t border-slate-300">
                <span>সর্বমোট প্রদেয় মূল্য (Total Payable Amount):</span>
                <span className="text-indigo-600 text-xl font-mono">৳{order.total_amount || 0}</span>
              </div>
            </div>

            {/* FOOTER */}
            <div className="mt-10 pt-6 border-t border-slate-200 text-center text-xs text-slate-500 space-y-1">
              <p className="font-bold text-[#0f3d44]">ইউনেক্স অরা (UNEX AURA) এর সাথে কেনাকাটার জন্য ধন্যবাদ!</p>
              <p>২৪/৭ কাস্টমার কেয়ার হটলাইন: 01623319639 | ওয়েবসাইট: unexaura.com</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
