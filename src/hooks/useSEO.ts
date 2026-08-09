import { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  productData?: {
    name: string;
    description?: string;
    price: number;
    currency?: string;
    image?: string;
    inStock?: boolean;
    brand?: string;
  };
}

/**
 * Custom React Hook to dynamically update document title, meta tags, OpenGraph, Twitter Cards,
 * and JSON-LD Structured Data for Search Engine Optimization (SEO).
 */
export function useSEO({
  title,
  description,
  keywords,
  ogImage,
  ogType = 'website',
  canonicalUrl,
  productData
}: SEOProps) {
  useEffect(() => {
    // Default brand site title & description
    const siteName = 'UNEX AURA | Luxury 3D Islamic Wall Decor';
    const defaultDesc = 'UNEX AURA - বাংলাদেশের সেরা লাক্সারি থ্রিডি ইসলামিক ওয়াল আর্ট ও ক্যালিগ্রাফি কালেকশন। দেওয়ালে লাগানোর জন্য ডাবল সাইড টেপযুক্ত আধুনিক ইসলামিক ডেকোর।';

    // 1. Update Document Title
    const formattedTitle = title ? `${title} | UNEX AURA` : siteName;
    document.title = formattedTitle;

    // Helper to update or create meta tag
    const setMetaTag = (selector: string, attributeName: string, attributeValue: string, content: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Update Meta Description
    const metaDesc = description || defaultDesc;
    setMetaTag('meta[name="description"]', 'name', 'description', metaDesc);

    // 3. Update Meta Keywords if provided
    if (keywords) {
      setMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords);
    } else {
      setMetaTag(
        'meta[name="keywords"]',
        'name',
        'keywords',
        'UNEX AURA, Islamic Wall Art Bangladesh, 3D Calligraphy, Ayatul Kursi Wall Hanging, Home Decor BD, Islamic Gift'
      );
    }

    // 4. Update OpenGraph Tags
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', formattedTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', metaDesc);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', productData ? 'product' : ogType);
    if (ogImage || productData?.image) {
      setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage || productData?.image || '');
    }
    const currentUrl = canonicalUrl || window.location.href;
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', currentUrl);

    // 5. Update Twitter Card Tags
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', formattedTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', metaDesc);
    if (ogImage || productData?.image) {
      setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage || productData?.image || '');
    }

    // 6. JSON-LD Schema structured data for Rich Snippets (Search Engines)
    let scriptTag = document.querySelector('script[id="json-ld-seo"]');
    if (productData) {
      const jsonLd = {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        'name': productData.name,
        'image': [productData.image || ogImage || ''],
        'description': productData.description || metaDesc,
        'brand': {
          '@type': 'Brand',
          'name': productData.brand || 'UNEX AURA'
        },
        'offers': {
          '@type': 'Offer',
          'url': currentUrl,
          'priceCurrency': productData.currency || 'BDT',
          'price': productData.price,
          'availability': productData.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
        }
      };

      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'json-ld-seo';
        scriptTag.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(jsonLd);
    } else {
      if (scriptTag) {
        scriptTag.remove();
      }
    }
  }, [title, description, keywords, ogImage, ogType, canonicalUrl, productData]);
}
