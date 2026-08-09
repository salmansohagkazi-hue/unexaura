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

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [productSlug, setProductSlug] = useState<string | null>(null);
  const [lastOrderNumber, setLastOrderNumber] = useState<string>('');
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [seeOnWallProduct, setSeeOnWallProduct] = useState<Product | null>(null);
  const [accountTab, setAccountTab] = useState<'dashboard' | 'orders' | 'tracking' | 'wishlist' | 'profile' | 'password'>('dashboard');
  const [shopCategoryId, setShopCategoryId] = useState<number | 'all'>('all');

  const { products } = useApp();

  // Support direct URL deep-linking for Facebook Ads landing pages (e.g., ?product=ayatul-kursi-regal-3d)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const directProd = params.get('product') || params.get('p') || params.get('slug');
    const directPage = params.get('page');

    if (directProd) {
      setProductSlug(directProd);
      setActiveTab('product');
    } else if (directPage) {
      setActiveTab(directPage);
    }
  }, []);

  const handleNavigate = (page: string, params?: any) => {
    if (page === 'shop') {
      if (params?.cat !== undefined) {
        setShopCategoryId(params.cat);
      } else if (params?.catId !== undefined) {
        setShopCategoryId(params.catId);
      } else {
        setShopCategoryId('all');
      }
    } else if (page === 'product' && params?.slug) {
      setProductSlug(params.slug);
      // Update URL search query without reloading page so links can be shared
      window.history.pushState({}, '', `?product=${params.slug}`);
    } else if ((page === 'ordersuccess' || page === 'order-success')) {
      if (params?.order) {
        setLastOrder(params.order);
        setLastOrderNumber(params.order.order_number);
      } else if (params?.orderNumber) {
        setLastOrderNumber(params.orderNumber);
      }
    } else if (page === 'account') {
      if (params?.tab) {
        setAccountTab(params.tab);
      } else {
        setAccountTab('dashboard');
      }
    } else if (page === 'home') {
      window.history.pushState({}, '', window.location.pathname);
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
          <AdminPage onNavigate={handleNavigate} />
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
