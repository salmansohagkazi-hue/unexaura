import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SeeOnWallModal } from './components/SeeOnWallModal';
import { WhatsAppButton } from './components/WhatsAppButton';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { MyAccountPage } from './pages/MyAccountPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminPage } from './pages/AdminPage';
import { ExportPage } from './pages/ExportPage';
import { Product } from './types';
import { initAnalytics, trackPageView } from './utils/analytics';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [productSlug, setProductSlug] = useState<string | null>(null);
  const [lastOrderNumber, setLastOrderNumber] = useState<string>('');
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [seeOnWallProduct, setSeeOnWallProduct] = useState<Product | null>(null);
  const [accountTab, setAccountTab] = useState<'dashboard' | 'orders' | 'tracking' | 'wishlist' | 'profile' | 'password'>('dashboard');
  const [shopCategoryId, setShopCategoryId] = useState<number | 'all'>('all');
  const [adminTab, setAdminTab] = useState<'products' | 'orders' | 'categories' | 'coupons' | 'media' | 'shipping' | 'security' | 'sheets'>('orders');

  const { products, categories } = useApp();

  // Helper to resolve category ID from URL parameter (ID or slug or name)
  const resolveCatParam = (val: string | null): number | 'all' => {
    if (!val || val === 'all') return 'all';
    const num = Number(val);
    if (!isNaN(num) && num > 0) return num;
    const clean = val.toLowerCase().trim();
    const match = categories.find(
      (c) =>
        c.slug?.toLowerCase() === clean ||
        c.name.toLowerCase().replace(/[^a-z0-9]/g, '-').includes(clean) ||
        clean.includes(c.slug?.toLowerCase() || '')
    );
    return match ? match.id : 'all';
  };

  // Initialize GA4 and Meta Pixel on mount
  useEffect(() => {
    initAnalytics();
  }, []);

  // Support direct URL deep-linking (Pathname, Hash, and Search Query)
  const syncRouteFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const directProd = params.get('product') || params.get('p') || params.get('slug');
    const directPage = params.get('page');
    const directCat = params.get('cat') || params.get('category') || params.get('catId') || params.get('c');
    const pathname = window.location.pathname.toLowerCase().replace(/^\/+|\/+$/g, '');
    const hash = window.location.hash.toLowerCase().replace(/^#+/, '');

    if (pathname === 'admin' || pathname === 'staff' || hash === 'admin' || params.has('admin')) {
      setActiveTab('admin');
    } else if (directProd) {
      setProductSlug(directProd);
      setActiveTab('product');
    } else if (directCat) {
      const resolvedCat = resolveCatParam(directCat);
      setShopCategoryId(resolvedCat);
      setActiveTab('shop');
    } else if (directPage) {
      setActiveTab(directPage);
    } else if (pathname === 'shop' || pathname === 'cart' || pathname === 'checkout' || pathname === 'account') {
      setActiveTab(pathname);
    }
  };

  useEffect(() => {
    syncRouteFromUrl();
  }, [categories]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      syncRouteFromUrl();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [categories]);

  // Track SPA page view on activeTab, category, or productSlug changes
  useEffect(() => {
    let title = 'UNEX AURA - 3D Islamic Wall Decor';
    let path = '/';

    if (activeTab === 'home') {
      title = 'UNEX AURA - 3D Islamic Wall Decor';
      path = '/';
    } else if (activeTab === 'product') {
      const p = products.find((prod) => prod.slug === productSlug || prod.id === Number(productSlug));
      title = p ? `${p.name} - UNEX AURA` : 'Product Details - UNEX AURA';
      path = productSlug ? `/?product=${productSlug}` : '/product';
    } else if (activeTab === 'shop') {
      const activeCat = categories.find((c) => c.id === shopCategoryId);
      title = activeCat ? `${activeCat.name} - UNEX AURA` : 'Shop Catalog - UNEX AURA';
      path = shopCategoryId !== 'all' ? `/?page=shop&cat=${shopCategoryId}` : '/shop';
    } else if (activeTab === 'cart') {
      title = 'Shopping Cart - UNEX AURA';
      path = '/cart';
    } else if (activeTab === 'checkout') {
      title = 'Checkout - UNEX AURA';
      path = '/checkout';
    } else if (activeTab === 'ordersuccess' || activeTab === 'order-success') {
      title = 'Order Confirmed - UNEX AURA';
      path = '/order-success';
    } else {
      title = `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} - UNEX AURA`;
      path = `/${activeTab}`;
    }

    trackPageView(title, path);
  }, [activeTab, productSlug, shopCategoryId, products, categories]);

  const handleNavigate = (page: string, params?: any) => {
    if (page === 'shop') {
      let targetCat: number | 'all' = 'all';
      if (params?.cat !== undefined) {
        targetCat = params.cat;
      } else if (params?.catId !== undefined) {
        targetCat = params.catId;
      }
      setShopCategoryId(targetCat);
      if (targetCat !== 'all') {
        window.history.pushState({}, '', `?page=shop&cat=${targetCat}`);
      } else {
        window.history.pushState({}, '', '?page=shop');
      }
    } else if (page === 'product' && params?.slug) {
      setProductSlug(params.slug);
      // Update URL search query without reloading page so links can be shared
      window.history.pushState({}, '', `?product=${params.slug}`);
    } else if (page === 'ordersuccess' || page === 'order-success') {
      if (params?.order) {
        setLastOrder(params.order);
        setLastOrderNumber(params.order.order_number);
      } else if (params?.orderNumber) {
        setLastOrderNumber(params.orderNumber);
      }
      window.history.pushState({}, '', '?page=order-success');
    } else if (page === 'cart') {
      window.history.pushState({}, '', '?page=cart');
    } else if (page === 'checkout') {
      window.history.pushState({}, '', '?page=checkout');
    } else if (page === 'account') {
      if (params?.tab) {
        setAccountTab(params.tab);
      } else {
        setAccountTab('dashboard');
      }
      window.history.pushState({}, '', '?page=account');
    } else if (page === 'admin' || page === 'staff') {
      if (params?.tab) {
        setAdminTab(params.tab);
      } else {
        setAdminTab('orders');
      }
      setActiveTab('admin');
      window.history.pushState({}, '', '?page=admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    } else if (page === 'home') {
      window.history.pushState({}, '', '/');
    }
    setActiveTab(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSeeOnWall = (product?: Product) => {
    if (product) {
      setSeeOnWallProduct(product);
    } else {
      // Default to first featured product or first catalog item
      setSeeOnWallProduct(products[0] || null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-800 selection:bg-teal-500 selection:text-white">
      {/* HEADER NAVBAR */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab, params) => handleNavigate(tab, params)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenSeeOnWall={() => handleOpenSeeOnWall()}
      />

      {/* MAIN DYNAMIC CONTENT */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onOpenWallModal={(prod) => handleOpenSeeOnWall(prod)}
          />
        )}

        {activeTab === 'shop' && (
          <ShopPage
            onNavigate={handleNavigate}
            onOpenWallModal={(prod) => handleOpenSeeOnWall(prod)}
            initialSearch={searchQuery}
            initialCatId={shopCategoryId}
          />
        )}

        {activeTab === 'product' && (
          <ProductPage
            slug={productSlug || products[0]?.slug || 'surah-al-ikhlas-modern-circle'}
            onNavigate={handleNavigate}
            onOpenWallModal={(prod) => handleOpenSeeOnWall(prod)}
          />
        )}

        {activeTab === 'cart' && (
          <CartPage onNavigate={handleNavigate} />
        )}

        {activeTab === 'checkout' && (
          <CheckoutPage onNavigate={handleNavigate} />
        )}

        {(activeTab === 'ordersuccess' || activeTab === 'order-success') && (
          <OrderSuccessPage
            order={lastOrder}
            orderNumber={lastOrderNumber || 'UA-1001'}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'account' && (
          <MyAccountPage
            onNavigate={handleNavigate}
            initialTab={accountTab}
            onOpenWallModal={(prod) => handleOpenSeeOnWall(prod)}
          />
        )}

        {activeTab === 'login' && (
          <LoginPage onNavigate={handleNavigate} />
        )}

        {activeTab === 'register' && (
          <RegisterPage onNavigate={handleNavigate} />
        )}

        {activeTab === 'admin' && (
          <AdminPage onNavigate={handleNavigate} initialTab={adminTab} />
        )}

        {activeTab === 'export' && (
          <ExportPage />
        )}
      </main>

      {/* FOOTER */}
      <Footer onNavigate={handleNavigate} />

      {/* WALL & QUICK VIEW PREVIEW MODAL */}
      {seeOnWallProduct && (
        <SeeOnWallModal
          product={seeOnWallProduct}
          onClose={() => setSeeOnWallProduct(null)}
          onNavigate={handleNavigate}
        />
      )}

      {/* FLOATING WHATSAPP SUPPORT BUTTON */}
      <WhatsAppButton phoneNumber="01623319639" />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
