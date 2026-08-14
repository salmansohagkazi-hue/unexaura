declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

export const GA_MEASUREMENT_ID = 'G-L77SWL7ZH6';
export const META_PIXEL_ID = '1788008482378644';

// Set to prevent duplicate Purchase events across re-renders
const trackedPurchases = new Set<string>();
let lastPageViewPath = '';

/**
 * Dynamically loads and initializes Google Analytics 4 and Meta Pixel
 */
export const initAnalytics = (): void => {
  if (typeof window === 'undefined') return;

  // 1. Initialize GA4 if not already present
  if (!document.getElementById('ga4-gtag-script')) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    // Disable automatic pageview because we trigger page_view manually on SPA route changes
    window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });

    const script = document.createElement('script');
    script.id = 'ga4-gtag-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }

  // 2. Initialize Meta Pixel if not already present
  if (!document.getElementById('meta-pixel-script')) {
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.id = 'meta-pixel-script';
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    if (window.fbq) {
      window.fbq('init', META_PIXEL_ID);
    }
  }
};

/**
 * Tracks SPA Page View for GA4 & Meta Pixel
 */
export const trackPageView = (pageTitle: string, pagePath: string): void => {
  if (typeof window === 'undefined') return;

  // Deduplicate page view calls if on the exact same route
  if (lastPageViewPath === pagePath) {
    return;
  }
  lastPageViewPath = pagePath;

  // Track GA4 page_view
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: pageTitle,
      page_location: window.location.href,
      page_path: pagePath,
    });
  }

  // Track Meta Pixel PageView
  if (window.fbq) {
    window.fbq('track', 'PageView');
  }
};

/**
 * Tracks ViewContent / view_item when a product detail page or preview modal is opened
 */
export const trackViewItem = (product: {
  id: string | number;
  name: string;
  price: number;
  category?: string;
  category_name?: string;
  slug?: string;
}): void => {
  if (typeof window === 'undefined' || !product) return;

  const productId = String(product.id || product.slug || '');
  const categoryName = product.category_name || product.category || 'Islamic Wall Decor';

  // GA4 view_item
  if (window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'BDT',
      value: product.price,
      items: [
        {
          item_id: productId,
          item_name: product.name,
          price: product.price,
          item_category: categoryName,
          quantity: 1,
        },
      ],
    });
  }

  // Meta Pixel ViewContent
  if (window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_ids: [productId],
      content_name: product.name,
      content_type: 'product',
      value: product.price,
      currency: 'BDT',
    });
  }
};

/**
 * Tracks AddToCart / add_to_cart when a product is added to the cart
 */
export const trackAddToCart = (
  product: {
    id: string | number;
    name: string;
    price: number;
    category?: string;
    category_name?: string;
    slug?: string;
  },
  quantity: number = 1,
  selectedSizeName?: string
): void => {
  if (typeof window === 'undefined' || !product) return;

  const productId = String(product.id || product.slug || '');
  const categoryName = product.category_name || product.category || 'Islamic Wall Decor';
  const itemTotal = product.price * quantity;

  // GA4 add_to_cart
  if (window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'BDT',
      value: itemTotal,
      items: [
        {
          item_id: productId,
          item_name: product.name + (selectedSizeName ? ` (${selectedSizeName})` : ''),
          price: product.price,
          quantity: quantity,
          item_category: categoryName,
        },
      ],
    });
  }

  // Meta Pixel AddToCart
  if (window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_ids: [productId],
      content_name: product.name,
      content_type: 'product',
      value: itemTotal,
      currency: 'BDT',
    });
  }
};

/**
 * Tracks InitiateCheckout / begin_checkout when checkout starts
 */
export const trackBeginCheckout = (
  cartItems: Array<{
    product: any;
    quantity: number;
    selectedSize?: any;
  }>,
  totalValue: number
): void => {
  if (typeof window === 'undefined' || !cartItems || cartItems.length === 0) return;

  const items = cartItems.map((item) => {
    const itemPrice = item.selectedSize ? item.selectedSize.price : item.product.price;
    return {
      item_id: String(item.product.id || item.product.slug || ''),
      item_name: item.product.name + (item.selectedSize?.name ? ` (${item.selectedSize.name})` : ''),
      price: itemPrice,
      quantity: item.quantity,
      item_category: item.product.category_name || item.product.category || 'Islamic Wall Decor',
    };
  });

  const contentIds = cartItems.map((item) => String(item.product.id || item.product.slug || ''));
  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // GA4 begin_checkout
  if (window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: 'BDT',
      value: totalValue,
      items: items,
    });
  }

  // Meta Pixel InitiateCheckout
  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_ids: contentIds,
      content_type: 'product',
      num_items: totalQuantity,
      value: totalValue,
      currency: 'BDT',
    });
  }
};

/**
 * Tracks Purchase / purchase when an order is successfully completed
 */
export const trackPurchase = (order: {
  id?: string | number;
  order_number?: string;
  total_amount?: number;
  subtotal_amount?: number;
  delivery_charge?: number;
  items: any[];
}): void => {
  if (typeof window === 'undefined' || !order) return;

  const orderNum = String(order.order_number || order.id || '');
  if (!orderNum) return;

  // Prevent duplicate purchase events
  if (trackedPurchases.has(orderNum)) {
    return;
  }
  try {
    if (sessionStorage.getItem(`tracked_purchase_${orderNum}`)) {
      return;
    }
  } catch {}

  trackedPurchases.add(orderNum);
  try {
    sessionStorage.setItem(`tracked_purchase_${orderNum}`, 'true');
  } catch {}

  const orderTotal = order.total_amount || 0;
  const items = (order.items || []).map((item: any) => ({
    item_id: String(item.product_id || item.product?.id || item.product_name),
    item_name: item.product_name || item.product?.name || 'Wall Decor',
    price: item.price || 0,
    quantity: item.quantity || 1,
  }));

  const contentIds = (order.items || []).map((item: any) =>
    String(item.product_id || item.product?.id || item.product_name)
  );
  const totalNumItems = (order.items || []).reduce((sum: number, i: any) => sum + (i.quantity || 1), 0);

  // GA4 purchase
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: orderNum,
      value: orderTotal,
      currency: 'BDT',
      shipping: order.delivery_charge || 0,
      items: items,
    });
  }

  // Meta Pixel Purchase
  if (window.fbq) {
    window.fbq('track', 'Purchase', {
      content_ids: contentIds,
      content_type: 'product',
      value: orderTotal,
      currency: 'BDT',
      order_id: orderNum,
      num_items: totalNumItems,
    });
  }
};

/**
 * Tracks Lead / generate_lead when customer submits an inquiry or contact/WhatsApp action
 */
export const trackLead = (leadType: string, details?: any): void => {
  if (typeof window === 'undefined') return;

  // GA4 generate_lead
  if (window.gtag) {
    window.gtag('event', 'generate_lead', {
      currency: 'BDT',
      value: details?.value || 0,
      lead_type: leadType,
    });
  }

  // Meta Pixel Lead
  if (window.fbq) {
    window.fbq('track', 'Lead', {
      content_name: leadType,
      currency: 'BDT',
    });
  }
};
