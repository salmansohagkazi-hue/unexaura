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
  Database
} from 'lucide-react';

export const GoogleSheetsSync: React.FC = () => {
  const { orders, settings, setSettings, showToast } = useApp();

  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [manualSheetId, setManualSheetId] = useState('');
  const [syncSuccessCount, setSyncSuccessCount] = useState<number | null>(null);

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
      
      // Save sheet info in settings
      setSettings({
        ...settings,
        google_sheet_id: sheetInfo.spreadsheetId,
        google_sheet_url: sheetInfo.spreadsheetUrl,
        google_sheet_autosync_enabled: true
      });

      showToast('Google Sheet created successfully!');

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

  const handleLinkManualSheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSheetId.trim()) return;

    let cleanId = manualSheetId.trim();
    // Extract ID if full Google Sheets URL provided
    const match = cleanId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match) {
      cleanId = match[1];
    }

    const url = `https://docs.google.com/spreadsheets/d/${cleanId}`;
    setSettings({
      ...settings,
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
      {/* CARD 1: ACCOUNT CONNECTION STATUS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Google Sheets Live Order Synchronization</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold border border-emerald-300">
                  Real-time OAuth API
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                গ্রাহকের সকল অর্ডার সরাসরি আপনার গুগল ড্রাইভে স্প্রেডশিট হিসেবে অটো-সেভ হয়ে যাবে।
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
              {/* Official Google Sign-in Material Button */}
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
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
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
                  onChange={(e) => setSettings({ ...settings, google_sheet_autosync_enabled: e.target.checked })}
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
                নিচের &ldquo;Create New Google Sheet&rdquo; বাটনটি চাপুন অথবা আপনার ড্রাইভে থাকা একটি স্প্রেডশিটের লিংক বসিয়ে কানেক্ট করুন।
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
              className="w-full py-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
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
              className="w-full py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
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

      {/* CARD 2: PREVIEW COLUMN STRUCTURE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          <h3 className="text-sm font-extrabold text-slate-900">
            Google Sheets Field Mapping Reference
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          The following columns are automatically formatted and synced into your Google Sheet:
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {[
            'Date & Time',
            'Order #',
            'Customer Name',
            'Mobile Number',
            'Email Address',
            'Shipping Address',
            'City',
            'Delivery Zone',
            'Items Summary',
            'Total Weight (g)',
            'Delivery Fee (BDT)',
            'Subtotal (BDT)',
            'Total Amount (BDT)',
            'Payment Method',
            'Payment Details',
            'Payment Status',
            'Order Status',
            'Tracking Number',
            'Courier Partner'
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
