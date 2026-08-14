import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Layers,
  Download,
  Database,
  CheckCircle,
  FileCode,
  Code,
  Sparkles,
  Copy,
  Globe,
  Layout,
  ShoppingCart,
  ChevronRight,
  Eye,
  FileJson,
  Package
} from 'lucide-react';
import {
  buildHeroSectionTemplate,
  buildCategoriesSectionTemplate,
  buildDealOfTheDaySectionTemplate,
  buildFeatureBarSectionTemplate,
  buildTestimonialsSectionTemplate,
  buildCartFlowsCheckoutSectionTemplate,
  buildFAQSectionTemplate,
  buildFullLandingPageTemplate,
  ElementorTemplate
} from '../utils/elementorJsonGenerator';

export const ExportPage: React.FC = () => {
  const { products, categories, showToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [selectedJsonPreview, setSelectedJsonPreview] = useState<{ title: string; json: string } | null>(null);

  // Elementor Templates Map
  const elementorTemplatesList: Array<{ id: string; name: string; desc: string; icon: string; filename: string; getJson: () => ElementorTemplate }> = [
    {
      id: 'full_landing',
      name: 'Full Landing Page Template (All Sections)',
      desc: 'Elementor Page template containing all 7 sections merged with CartFlows integration',
      icon: '🚀',
      filename: 'unex_aura_full_elementor_landing_page.json',
      getJson: buildFullLandingPageTemplate
    },
    {
      id: 'hero',
      name: '1. Hero Section (16:9 Showcase & Headline)',
      desc: 'Top hero section with headline, video/image container and main CTA button',
      icon: '✨',
      filename: 'unex_aura_elementor_hero_section.json',
      getJson: buildHeroSectionTemplate
    },
    {
      id: 'categories',
      name: '2. Category Grid Section',
      desc: 'Grid layout of Islamic Art, Wall Clocks, Minimalist and Custom Nameplate categories',
      icon: '🖼️',
      filename: 'unex_aura_elementor_category_grid.json',
      getJson: buildCategoriesSectionTemplate
    },
    {
      id: 'deal',
      name: '3. Deal of the Day Spotlight Section',
      desc: 'High converting daily offer spotlight with timer badge and quick buy button',
      icon: '🔥',
      filename: 'unex_aura_elementor_deal_of_day.json',
      getJson: buildDealOfTheDaySectionTemplate
    },
    {
      id: 'features',
      name: '4. Features & Guarantee Strip Section',
      desc: 'Icon boxes for Free Delivery, Rust-Proof Warranty, Custom Sizing & Support',
      icon: '🛡️',
      filename: 'unex_aura_elementor_features_strip.json',
      getJson: buildFeatureBarSectionTemplate
    },
    {
      id: 'testimonials',
      name: '5. Customer Reviews Section',
      desc: 'Testimonial cards with star ratings and verified buyer feedback',
      icon: '⭐',
      filename: 'unex_aura_elementor_testimonials.json',
      getJson: buildTestimonialsSectionTemplate
    },
    {
      id: 'checkout',
      name: '6. CartFlows Express Checkout Section',
      desc: 'Dedicated checkout section with [cartflows_checkout] shortcode widget & trust badge',
      icon: '🛒',
      filename: 'unex_aura_cartflows_checkout_section.json',
      getJson: buildCartFlowsCheckoutSectionTemplate
    },
    {
      id: 'faq',
      name: '7. FAQ Accordion Section',
      desc: 'Editable Elementor Accordion with common installation and rust-proof Q&As',
      icon: '❓',
      filename: 'unex_aura_elementor_faq_section.json',
      getJson: buildFAQSectionTemplate
    }
  ];

  const handleDownloadElementorJson = (filename: string, templateObj: ElementorTemplate) => {
    const jsonStr = JSON.stringify(templateObj, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded ${filename}!`);
  };

  const handleDownloadAllElementorJsons = () => {
    elementorTemplatesList.forEach((item, index) => {
      setTimeout(() => {
        handleDownloadElementorJson(item.filename, item.getJson());
      }, index * 250);
    });
    showToast('Downloading all 8 Elementor & CartFlows JSON files...');
  };

  // Generate WooCommerce Product CSV
  const generateWooCommerceCSV = () => {
    const headers = [
      'ID', 'Type', 'SKU', 'Name', 'Published', 'Is featured?', 'Visibility in catalog',
      'Short description', 'Description', 'Tax status', 'In stock?', 'Stock', 'Regular price',
      'Sale price', 'Weight (kg)', 'Categories', 'Images'
    ];

    const rows = products.map((p, idx) => {
      const weightKg = (p.weight_grams / 1000).toFixed(2);
      return [
        p.id,
        'simple',
        p.sku || `UNEX-${100 + idx}`,
        `"${p.name.replace(/"/g, '""')}"`,
        1,
        p.featured ? 1 : 0,
        'visible',
        `"${(p.material + ' - ' + p.size_dimensions).replace(/"/g, '""')}"`,
        `"${(p.description || '').replace(/"/g, '""')}"`,
        'taxable',
        1,
        p.stock || 20,
        p.old_price || p.price,
        p.price,
        weightKg,
        `"${p.category_name || 'Wall Decor'}"`,
        `"${p.image_url}"`
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  };

  const handleDownloadCSV = () => {
    const csvContent = generateWooCommerceCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'unex_aura_woocommerce_products.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('WooCommerce Products CSV downloaded successfully!');
  };

  // Generate WordPress SQL Dump
  const generateSQLDump = () => {
    return `-- =========================================================
-- UNEX AURA - WordPress / MySQL Database Dump
-- Compatible with WooCommerce & Custom WordPress Plugins
-- Generated At: ${new Date().toISOString()}
-- =========================================================

SET FOREIGN_KEY_CHECKS=0;

-- --------------------------------------------------------
-- Table structure for \`wp_unex_products\`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`wp_unex_products\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(255) NOT NULL,
  \`slug\` VARCHAR(255) NOT NULL,
  \`category_id\` INT(11) NOT NULL,
  \`price\` DECIMAL(10,2) NOT NULL,
  \`old_price\` DECIMAL(10,2) DEFAULT NULL,
  \`weight_grams\` INT(11) NOT NULL DEFAULT 1500,
  \`size_dimensions\` VARCHAR(100) DEFAULT NULL,
  \`material\` VARCHAR(255) DEFAULT 'Surgical Stainless Steel',
  \`description\` TEXT,
  \`image_url\` TEXT NOT NULL,
  \`featured\` TINYINT(1) DEFAULT 0,
  \`stock\` INT(11) DEFAULT 10,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table \`wp_unex_products\`
${products.map(p => `INSERT INTO \`wp_unex_products\` (\`id\`, \`name\`, \`slug\`, \`category_id\`, \`price\`, \`old_price\`, \`weight_grams\`, \`size_dimensions\`, \`material\`, \`description\`, \`image_url\`, \`featured\`, \`stock\`) VALUES (${p.id}, '${p.name.replace(/'/g, "\\'")}', '${p.slug}', ${p.category_id}, ${p.price}, ${p.old_price || 'NULL'}, ${p.weight_grams}, '${p.size_dimensions}', '${p.material}', '${(p.description || '').replace(/'/g, "\\'")}', '${p.image_url}', ${p.featured ? 1 : 0}, ${p.stock});`).join('\n')}

-- --------------------------------------------------------
-- Table structure for \`wp_unex_categories\`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`wp_unex_categories\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(255) NOT NULL,
  \`slug\` VARCHAR(255) NOT NULL,
  \`icon\` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

${categories.map(c => `INSERT INTO \`wp_unex_categories\` (\`id\`, \`name\`, \`slug\`, \`icon\`) VALUES (${c.id}, '${c.name.replace(/'/g, "\\'")}', '${c.slug}', '${c.icon}');`).join('\n')}

SET FOREIGN_KEY_CHECKS=1;
`;
  };

  const handleDownloadSQL = () => {
    const sql = generateSQLDump();
    const blob = new Blob([sql], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'unex_aura_wordpress_dump.sql');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('WordPress SQL Dump downloaded!');
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(generateSQLDump());
    setCopied(true);
    showToast('SQL schema copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-amber-600 via-[#4f46e5] to-purple-700 rounded-3xl p-8 text-white shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 text-white border border-white/30 text-xs font-bold">
          <Globe className="w-4 h-4 text-amber-300" />
          <span>WordPress, Elementor &amp; CartFlows Integration Hub</span>
        </div>
        <h1 className="text-3xl font-black">WordPress &amp; Elementor Export Suite</h1>
        <p className="text-sm text-amber-100 max-w-2xl">
          আপনার ওয়ার্ডপ্রেস ওয়েবসাইটে Elementor এবং CartFlows এর সাহায্যে ল্যান্ডিং পেজটি সরাসরি ইমপোর্ট করার জন্য সেকশন-বাই-সেকশন JSON ফাইল ডাউনলোড করুন।
        </p>
      </div>

      {/* ELEMENTOR JSON TEMPLATES SECTION - MAIN REQUEST */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-indigo-100 shadow-lg space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold mb-2">
              <Layout className="w-4 h-4 text-indigo-600" />
              <span>Native Elementor JSON Templates</span>
            </div>
            <h2 className="text-2xl font-black text-[#0f3d44]">Elementor Section-by-Section JSON Export</h2>
            <p className="text-xs text-slate-500 mt-1">
              প্রতিটি সেকশন আলাদাভাবে ইমপোর্ট করে এডিট করতে পারবেন। কোনো র এইচটিএমএল (HTML) কোড নয়, এলিমেন্টরের নিজস্ব উইজেট (Headings, Text, Buttons, Images, Accordion, CartFlows) দিয়ে তৈরি।
            </p>
          </div>

          <button
            onClick={handleDownloadAllElementorJsons}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-500 via-indigo-600 to-pink-600 text-white text-xs font-extrabold hover:opacity-95 shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Package className="w-4 h-4" />
            <span>Download All JSONs (Zip Package)</span>
          </button>
        </div>

        {/* TEMPLATES LIST GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {elementorTemplatesList.map((tpl) => (
            <div
              key={tpl.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                tpl.id === 'full_landing'
                  ? 'bg-gradient-to-br from-indigo-50/80 via-purple-50/50 to-pink-50/50 border-indigo-300 md:col-span-2'
                  : 'bg-slate-50/70 hover:bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tpl.icon}</span>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#0f3d44] flex items-center gap-2">
                      <span>{tpl.name}</span>
                      {tpl.id === 'checkout' && (
                        <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold">
                          CartFlows Ready
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{tpl.desc}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                <button
                  onClick={() => handleDownloadElementorJson(tpl.filename, tpl.getJson())}
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-[#0f3d44] hover:bg-indigo-900 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-teal-300" />
                  <span>Download JSON</span>
                </button>

                <button
                  onClick={() => {
                    const jsonStr = JSON.stringify(tpl.getJson(), null, 2);
                    navigator.clipboard.writeText(jsonStr);
                    showToast(`Copied ${tpl.name} JSON to clipboard!`);
                  }}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Copy JSON to clipboard"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>Copy JSON</span>
                </button>

                <button
                  onClick={() => {
                    const jsonStr = JSON.stringify(tpl.getJson(), null, 2);
                    setSelectedJsonPreview({ title: tpl.name, json: jsonStr });
                  }}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Preview JSON Code"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EXPORT OPTIONS CARDS: WOOCOMMERCE & MYSQL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1: WOOCOMMERCE CSV */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <FileCode className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-[#0f3d44]">WooCommerce Product CSV Export</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              ওয়ার্ডপ্রেস WooCommerce প্রোডাক্ট ইমপোর্টার ফরম্যাট অনুযায়ী অল রেডি CSV ফাইল। এটি সরাসরি WordPress Dashboard → Products → Import পেজে আপলোড করলেই সব প্রোডাক্ট ছবিসহ চলে যাবে।
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-2">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> All {products.length} Products with images &amp; prices</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Product weights (grams to KG conversion)</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Categories &amp; SKUs pre-configured</li>
            </ul>
          </div>

          <button
            onClick={handleDownloadCSV}
            className="w-full py-3.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:opacity-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download WooCommerce Products.CSV</span>
          </button>
        </div>

        {/* CARD 2: MYSQL / WORDPRESS SQL DUMP */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-[#0f3d44]">WordPress MySQL Database Dump (.sql)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              phpMyAdmin বা cPanel MySQL ডেটাবেসে সরাসরি SQL run করার জন্য সম্পূর্ণ টেবিল স্কিমা এবং INSERT স্টেটমেন্ট।
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-2">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Table structure <code className="bg-slate-100 px-1 font-mono">wp_unex_products</code></li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Table structure <code className="bg-slate-100 px-1 font-mono">wp_unex_categories</code></li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Fully compatible with MySQL 5.7+ &amp; MariaDB</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCopySQL}
              className="w-1/2 py-3.5 rounded-2xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
            </button>

            <button
              onClick={handleDownloadSQL}
              className="w-1/2 py-3.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] to-[#ec4899] hover:opacity-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download .SQL</span>
            </button>
          </div>
        </div>
      </div>

      {/* WORDPRESS & ELEMENTOR & CARTFLOWS INSTRUCTIONS */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <h3 className="text-lg font-extrabold text-[#0f3d44] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <span>এলিমেন্টর ও কার্টফ্লোস টেমপ্লেট ব্যবহার নির্দেশিকা (How to Import in Elementor &amp; CartFlows)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">১</span>
              <span>Elementor Templates এ আপলোড:</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-700">
              <li>WordPress Admin Panel এ যান।</li>
              <li><strong>Templates → Saved Templates</strong> এ ক্লিক করুন।</li>
              <li>উপরে <strong>Import Templates</strong> বাটনে ক্লিক করে পছন্দমতো সেকশনের <code className="bg-indigo-50 text-indigo-700 font-mono px-1">.json</code> ফাইল সিলেক্ট করুন।</li>
              <li>এখন যেকোনো পেজে Elementor ওপেন করে <strong>Folder Icon</strong> এ ক্লিক করে <strong>My Templates</strong> থেকে ইন্সার্ট করুন!</li>
            </ol>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">২</span>
              <span>CartFlows এ চেকআউট সেটআপ:</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-700">
              <li>CartFlows → Flows এ গিয়ে আপনার Checkout Flow ওপেন করুন।</li>
              <li>Checkout Step টি <strong>Edit with Elementor</strong> এ ওপেন করুন।</li>
              <li><code className="bg-teal-50 text-teal-800 font-mono px-1">unex_aura_cartflows_checkout_section.json</code> ইমপোর্ট ও ইন্সার্ট করুন।</li>
              <li>এটিতে অলরেডি <code className="bg-slate-100 font-mono">[cartflows_checkout]</code> শটকোড এড করা আছে যা সরাসরি ১-ক্লিক চেকআউট প্যানেল দেখাবে।</li>
            </ol>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">৩</span>
              <span>WooCommerce প্রোডাক্টস ইমপোর্ট:</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-700">
              <li>WordPress Admin Panel এ যান।</li>
              <li><strong>Products → Import</strong> এ সিলেক্ট করুন।</li>
              <li>উপরে ডাউনলোড করা <code className="bg-purple-50 text-purple-700 font-mono px-1">.csv</code> ফাইলটি সিলেক্ট করে আপলোড দিন।</li>
              <li>আপনার ওয়ার্ডপ্রেস শপে সব ক্যালিগ্রাফি ও ডেকোর প্রোডাক্ট দাম ও ছবিসহ কানেক্ট হয়ে যাবে।</li>
            </ol>
          </div>
        </div>
      </div>

      {/* JSON PREVIEW MODAL */}
      {selectedJsonPreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 text-slate-100 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-800 overflow-hidden">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileJson className="w-5 h-5 text-teal-400" />
                <h3 className="font-extrabold text-sm text-white">{selectedJsonPreview.title}</h3>
              </div>
              <button
                onClick={() => setSelectedJsonPreview(null)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 font-mono text-xs text-emerald-400 leading-relaxed bg-slate-950/80">
              <pre className="whitespace-pre-wrap">{selectedJsonPreview.json}</pre>
            </div>
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedJsonPreview.json);
                  showToast('JSON code copied!');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-900 bg-teal-400 hover:bg-teal-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Raw JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

