import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, googleLogout, getAccessToken } from '../lib/firebase';
import { createOrdersSpreadsheet, appendOrdersToSheet, ensureSheetHeader } from '../lib/googleSheets';
import { useApp } from '../context/AppContext';
import {
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  LogOut,
  Plus,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Database,
  Copy,
  Check,
  Send,
  Zap,
  Code,
  Globe
} from 'lucide-react';

const APPS_SCRIPT_CODE = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Auto-create beautiful Header row if the sheet is completely empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'তারিখ ও সময় (Date)',
        'অর্ডার নম্বর (Order #)',
        'গ্রাহকের নাম (Customer Name)',
        'মোবাইল নম্বর (Phone)',
        'ইমেইল (Email)',
        'ডেলিভারি ঠিকানা (Address)',
        'শহর / জোন (City/Zone)',
        'অর্ডারকৃত পণ্যসমূহ (Items)',
        'মোট ওজন (গ্রাম)',
        'ডেলিভারি চার্জ (টাকা)',
        'সাবটোটাল (টাকা)',
        'সর্বমোট বিল (Total BDT)',
        'পেমেন্ট মাধ্যম (Payment)',
        'পেমেন্ট বিবরণ (TrxID)',
        'পেমেন্ট স্ট্যাটাস (Payment Status)',
        'অর্ডার স্ট্যাটাস (Order Status)'
      ]);
      sheet.getRange(1, 1, 1, 16).setBackground('#0f3d44').setFontColor('#ffffff').setFontWeight('bold');
    }
    
    // Append the incoming order data
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }),
      data.order_number || '',
      data.customer_name || '',
      "'" + (data.customer_phone || ''),
      data.customer_email || '',
      data.shipping_address || '',
      (data.city || '') + ' (' + (data.delivery_zone || '') + ')',
      data.items_summary || '',
      data.total_weight_grams || 0,
      data.delivery_fee || 0,
      data.subtotal || 0,
      data.total_amount || 0,
      data.payment_method || 'Cash on Delivery',
      data.payment_details || 'N/A',
      data.payment_status || 'Pending',
      data.status || 'Pending'
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Order row saved successfully' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

export const GoogleSheetsSync: React.FC = () => {
  const { orders, settings, updateSettings, showToast } = useApp();

  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [manualSheetId, setManualSheetId] = useState('');
  const [syncSuccessCount, setSyncSuccessCount] = useState<number | null>(null);

  // Webhook integration state
  const [webhookUrl, setWebhookUrl] = useState(settings.google_sheet_webhook_url || '');
  const [copiedScript, setCopiedScript] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [testWebhookStatus, setTestWebhookStatus] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (settings.google_sheet_webhook_url) {
      setWebhookUrl(settings.google_sheet_webhook_url);
    }
  }, [settings.google_sheet_webhook_url]);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopiedScript(true);
    showToast('Google Apps Script কোড কপি করা হয়েছে!');
    setTimeout(() => setCopiedScript(false), 3000);
  };

  const handleSaveWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      google_sheet_webhook_url: webhookUrl.trim()
    });
    showToast('Google Sheet Webhook URL সেভ করা হয়েছে!');
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl.trim()) {
      alert('দয়া করে প্রথমে Apps Script Webhook URL বসান।');
      return;
    }

    setIsTestingWebhook(true);
    setTestWebhookStatus(null);
    try {
      const res = await fetch('/api/google-sheets/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          google_sheet_webhook_url: webhookUrl.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setTestWebhookStatus({ success: true, message: data.message });
        showToast('টেস্ট অর্ডার সফলভাবে Google Sheet-এ পাঠানো হয়েছে!');
      } else {
        setTestWebhookStatus({ success: false, message: data.message });
        alert(`ত্রুটি: ${data.message}`);
      }
    } catch (err: any) {
      setTestWebhookStatus({ success: false, message: err.message });
      alert(`Webhook Test Failed: ${err.message}`);
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setAccessToken(res.accessToken);
        showToast(`Signed in as ${res.user.email}`);
      }
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.message?.includes('popup-closed-by-user')) {
        showToast('Google Sign-in popup was closed.');
        return;
      }
      console.error('Google login error:', err);
      alert(`Google Sign-in error: ${err.message || 'Please try again'}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await googleLogout();
    setGoogleUser(null);
    setAccessToken(null);
    showToast('Google account disconnected');
  };

  const handleCreateNewSheet = async () => {
    if (!accessToken) {
      alert('দয়া করে প্রথমে Google একাউন্টে সাইন-ইন করুন (Please sign in to Google first)');
      return;
    }

    setIsCreatingSheet(true);
    try {
      const sheetInfo = await createOrdersSpreadsheet(accessToken);
      
      await updateSettings({
        google_sheet_id: sheetInfo.spreadsheetId,
        google_sheet_url: sheetInfo.spreadsheetUrl,
        google_sheet_autosync_enabled: true
      });

      showToast('Google Sheet created successfully in Google Drive!');

      // Automatically sync existing orders into the new sheet
      if (orders.length > 0) {
        setIsSyncing(true);
        const result = await appendOrdersToSheet(accessToken, sheetInfo.spreadsheetId, orders);
        setSyncSuccessCount(result.updatedRows);
        showToast(`Synced ${orders.length} order(s) into Google Sheet!`);
      }
    } catch (err: any) {
      console.error('Failed to create Google Sheet:', err);
      alert(`Error creating Google Sheet: ${err.message}`);
    } finally {
      setIsCreatingSheet(false);
      setIsSyncing(false);
    }
  };

  const handleSyncAllOrdersNow = async () => {
    if (!settings.google_sheet_id) {
      alert('কোনো Google Sheet লিংক করা নেই! আগে নতুন শিট তৈরি করুন বা শিট আইডি প্রবেশ করান।');
      return;
    }

    let tokenToUse = accessToken;
    if (!tokenToUse) {
      try {
        const res = await googleSignIn();
        if (res) {
          setGoogleUser(res.user);
          tokenToUse = res.accessToken;
          setAccessToken(res.accessToken);
        }
      } catch (e: any) {
        if (e?.code === 'auth/popup-closed-by-user' || e?.message?.includes('popup-closed-by-user')) {
          showToast('Google Sign-in popup was closed.');
          return;
        }
        alert('Google Sign-in required to sync orders to Google Sheets');
        return;
      }
    }

    if (!tokenToUse) return;

    const confirmed = window.confirm(
      `আপনি কি মোট ${orders.length}টি অর্ডার Google Sheet-এ সিঙ্ক করতে চান? (Sync ${orders.length} order(s) to Google Sheets?)`
    );
    if (!confirmed) return;

    setIsSyncing(true);
    try {
      await ensureSheetHeader(tokenToUse, settings.google_sheet_id);
      const result = await appendOrdersToSheet(tokenToUse, settings.google_sheet_id, orders);
      setSyncSuccessCount(result.updatedRows);
      showToast(`মোট ${orders.length}টি অর্ডার সফলভাবে Google Sheet-এ সংযুক্ত হয়েছে!`);
    } catch (err: any) {
      console.error('Sync failed:', err);
      alert(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLinkManualSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSheetId.trim()) return;

    let cleanId = manualSheetId.trim();
    // Extract ID if full Google Sheets URL provided
    const match = cleanId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match) {
      cleanId = match[1];
    }

    const url = `https://docs.google.com/spreadsheets/d/${cleanId}`;
    await updateSettings({
      google_sheet_id: cleanId,
      google_sheet_url: url,
      google_sheet_autosync_enabled: true
    });

    setManualSheetId('');
    showToast('Google Sheet ID linked successfully!');
  };

  const activeSheetUrl = settings.google_sheet_id
    ? settings.google_sheet_url || `https://docs.google.com/spreadsheets/d/${settings.google_sheet_id}`
    : null;

  return (
    <div className="space-y-6">
      {/* BANNER / OVERVIEW */}
      <div className="bg-gradient-to-r from-[#0a2f35] to-[#124e58] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-400/20 via-transparent to-transparent pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-400/20 border border-teal-400/30 text-teal-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>হোস্ট করার পর রিয়েল-টাইম গুগল শিট অর্ডার অটোমেশন</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              ওয়েবসাইটে নতুন অর্ডার আসলে সাথে সাথে Google Sheet-এ জমা হবে
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
              হোস্ট করার পর সারা বাংলাদেশ থেকে যেকেউ যেকোনো সময় অর্ডার করলে সার্ভারের ব্যাকএন্ড স্বয়ংক্রিয়ভাবে আপনার গুগল শিটে একটি নতুন সারি (Row) তৈরি করে সব তথ্য (নাম, মোবাইল, ঠিকানা, পণ্যের নাম, সাইজ, ডেলিভারি ফি, মোট টাকা) ইনসার্ট করে দেবে।
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-center">
              <span className="text-[11px] text-teal-200 block uppercase font-bold tracking-wider">মোট সংরক্ষিত অর্ডার</span>
              <span className="text-2xl font-black text-white">{orders.length} টি</span>
            </div>
          </div>
        </div>
      </div>

      {/* METHOD 1: APPS SCRIPT WEBHOOK (RECOMMENDED 24/7) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-300 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  পদ্ধতি ১: Google Apps Script Webhook (সবচেয়ে নির্ভরযোগ্য ও ২৪/৭ অটোমেটিক)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300 uppercase">
                  সুপারিশকৃত
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                কোনো লগইন বা টোকেন মেয়াদ শেষ হওয়ার ভয় নেই। ব্যাকএন্ড সার্ভার নিজে থেকেই প্রতি অর্ডারে ডাটা শিটে পোস্ট করবে।
              </p>
            </div>
          </div>
        </div>

        {/* STEP BY STEP INSTRUCTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-slate-800">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center font-bold">১</span>
              <span>গুগল শিটে স্ক্রিপ্ট ওপেন করুন</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              আপনার <strong>Google Sheet</strong> ওপেন করুন। ওপরের মেনু থেকে <strong>Extensions ➔ Apps Script</strong> এ ক্লিক করুন।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-slate-800">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center font-bold">২</span>
              <span>নিচের কোড পেস্ট করুন</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              আগের কোড মুছে দিয়ে নিচের <strong>Copy Script Code</strong> বাটন চেপে কপি করা কোডটি পেস্ট করে <strong>Save</strong> আইকনে চাপুন।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-slate-800">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center font-bold">৩</span>
              <span>Deploy as Web App</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              ওপরে <strong>Deploy ➔ New deployment</strong> ➔ সিলেক্ট করুন <strong>Web app</strong> ➔ <em>Who has access</em> দিন <strong>Anyone</strong> ➔ Deploy করে পাওয়া URL টি কপি করুন।
            </p>
          </div>
        </div>

        {/* CODE SNIPPET BOX WITH COPY BUTTON */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Code className="w-4 h-4 text-emerald-600" />
              <span>Google Apps Script প্রস্তুতকৃত কোড:</span>
            </div>
            <button
              onClick={handleCopyCode}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedScript ? 'কপি হয়েছে!' : 'Copy Script Code'}</span>
            </button>
          </div>

          <div className="bg-slate-900 rounded-2xl p-4 text-emerald-300 font-mono text-[11px] max-h-48 overflow-y-auto border border-slate-800">
            <pre className="whitespace-pre-wrap">{APPS_SCRIPT_CODE}</pre>
          </div>
        </div>

        {/* WEBHOOK URL FORM */}
        <form onSubmit={handleSaveWebhook} className="space-y-3 pt-2">
          <label className="block text-xs font-extrabold text-slate-800">
            আপনার Google Apps Script Web App URL পেস্ট করুন:
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-3 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              {webhookUrl && webhookUrl.includes('script.google.com') && (
                <div className="absolute right-3 top-3 text-emerald-600 flex items-center gap-1 text-[11px] font-bold pointer-events-none">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valid Format</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shrink-0 transition-all cursor-pointer shadow-xs"
            >
              Save Webhook URL
            </button>

            <button
              type="button"
              onClick={handleTestWebhook}
              disabled={isTestingWebhook || !webhookUrl.trim()}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer shadow-xs"
            >
              {isTestingWebhook ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>পাঠানো হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test Order Now</span>
                </>
              )}
            </button>
          </div>

          {testWebhookStatus && (
            <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 border ${
              testWebhookStatus.success ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}>
              {testWebhookStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              <span>{testWebhookStatus.message}</span>
            </div>
          )}

          {settings.google_sheet_webhook_url && (
            <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>সার্ভারে Webhook একটিভ রয়েছে! প্রতিটি নতুন অর্ডার এই লিংকে ব্যাকএন্ড থেকে সরাসরি চলে যাবে।</span>
            </p>
          )}
        </form>
      </div>

      {/* METHOD 2: DIRECT GOOGLE DRIVE OAUTH (BUILT-IN) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  পদ্ধতি ২: Google Drive OAuth Direct Connect (১-ক্লিকে ড্রাইভে শিট তৈরি)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold border border-teal-300">
                  Google Drive API
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                আপনার গুগল একাউন্টে লগইন করে সরাসরি গুগল ড্রাইভে নতুন স্প্রেডশিট ফাইল তৈরি বা বিদ্যমান সব অর্ডার একসাথে এক্সপোর্ট করুন।
              </p>
            </div>
          </div>

          {googleUser ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl">
                {googleUser.photoURL ? (
                  <img src={googleUser.photoURL} alt="Avatar" className="w-7 h-7 rounded-full object-cover border border-slate-300" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    {googleUser.email?.charAt(0).toUpperCase() || 'G'}
                  </div>
                )}
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900 leading-tight">{googleUser.displayName || 'Google Account'}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{googleUser.email}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2.5 rounded-2xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all border border-slate-200 cursor-pointer"
                title="Disconnect Google Account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <button
                onClick={handleSignIn}
                disabled={isLoggingIn}
                className="gsi-material-button cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block', width: '20px', height: '20px' }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents font-semibold text-xs">
                    {isLoggingIn ? 'Connecting to Google...' : 'Sign in with Google'}
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* STATUS BANNER */}
        {settings.google_sheet_id ? (
          <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-950">
                    Google Sheet Linked &amp; Active!
                  </p>
                  <p className="text-[11px] text-emerald-800 font-mono mt-0.5">
                    Sheet ID: <span className="bg-emerald-100 px-2 py-0.5 rounded text-emerald-900 font-bold">{settings.google_sheet_id}</span>
                  </p>
                </div>
              </div>

              {activeSheetUrl && (
                <a
                  href={activeSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Open Live Google Sheet</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60 text-[11px] text-emerald-900">
              <label className="flex items-center gap-2 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.google_sheet_autosync_enabled ?? true}
                  onChange={(e) => updateSettings({ google_sheet_autosync_enabled: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span>Auto-sync new customer checkout orders instantly to this sheet</span>
              </label>

              <span className="text-emerald-700 font-medium">
                {orders.length} order(s) available for sync
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-amber-950">No Google Sheet currently connected</p>
              <p className="text-[11px] text-amber-800">
                নিচের &ldquo;Create New Google Sheet in Drive&rdquo; বাটনটি চাপুন অথবা আপনার ড্রাইভে থাকা একটি স্প্রেডশিটের লিংক বসিয়ে কানেক্ট করুন।
              </p>
            </div>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* ACTION 1: CREATE NEW SHEET */}
          <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-3">
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              <h4 className="text-xs font-extrabold text-slate-900">Option 1: Auto-Create Orders Sheet</h4>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Creates a formatted spreadsheet titled <strong className="text-slate-800">&ldquo;UNEX AURA - Customer Orders &amp; Sales Log&rdquo;</strong> with preset column headers in your Google Drive.
            </p>
            <button
              onClick={handleCreateNewSheet}
              disabled={isCreatingSheet}
              className="w-full py-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isCreatingSheet ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Creating Spreadsheet in Drive...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Create New Google Sheet in Drive</span>
                </>
              )}
            </button>
          </div>

          {/* ACTION 2: SYNC NOW BUTTON */}
          <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              <h4 className="text-xs font-extrabold text-slate-900">Option 2: 1-Click Sync All Store Orders</h4>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Export all existing customer orders ({orders.length} orders total) into the linked Google Sheet with complete shipping &amp; pricing details.
            </p>
            <button
              onClick={handleSyncAllOrdersNow}
              disabled={isSyncing || !settings.google_sheet_id}
              className="w-full py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Syncing Orders to Google Sheet...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Sync {orders.length} Order(s) Now</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* MANUAL LINK FORM */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
            <span>Link Existing Google Sheet URL or ID</span>
          </h4>
          <form onSubmit={handleLinkManualSheet} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={manualSheetId}
              onChange={(e) => setManualSheetId(e.target.value)}
              placeholder="Paste Google Sheet URL (e.g., https://docs.google.com/spreadsheets/d/1A2b3C...) or Sheet ID..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-200 hover:bg-slate-300 transition-all cursor-pointer whitespace-nowrap"
            >
              Link Sheet
            </button>
          </form>
        </div>
      </div>

      {/* CARD 3: COLUMN STRUCTURE REFERENCE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          <h3 className="text-sm font-extrabold text-slate-900">
            গুগল শিটে স্বয়ংক্রিয়ভাবে সংরক্ষিত কলামগুলোর তালিকা
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          প্রতিটি অর্ডারে নিচের প্রতিটি কলামের তথ্য স্বয়ংক্রিয়ভাবে নির্ভুলভাবে রেকর্ড করা হবে:
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {[
            'তারিখ ও সময় (Date)',
            'অর্ডার নম্বর (Order #)',
            'গ্রাহকের নাম (Customer Name)',
            'মোবাইল নম্বর (Phone)',
            'ইমেইল (Email)',
            'ডেলিভারি ঠিকানা (Address)',
            'শহর / জোন (City/Zone)',
            'অর্ডারকৃত পণ্যসমূহ (Items & Size)',
            'মোট ওজন (Total Weight)',
            'ডেলিভারি চার্জ (Delivery Fee)',
            'সাবটোটাল (Subtotal)',
            'সর্বমোট বিল (Total BDT)',
            'পেমেন্ট মাধ্যম (Payment Method)',
            'পেমেন্ট বিবরণ (TrxID)',
            'পেমেন্ট স্ট্যাটাস (Payment Status)',
            'অর্ডার স্ট্যাটাস (Order Status)'
          ].map((col, i) => (
            <span key={i} className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200/80 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span>{col}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
