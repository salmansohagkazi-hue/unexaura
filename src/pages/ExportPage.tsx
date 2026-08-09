import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Layers, Download, Database, CheckCircle, FileCode, Code, Sparkles, Copy, Globe } from 'lucide-react';

export const ExportPage: React.FC = () => {
  const { products, categories, showToast } = useApp();
  const [copied, setCopied] = useState(false);

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-amber-600 via-[#4f46e5] to-purple-700 rounded-3xl p-8 text-white shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 text-white border border-white/30 text-xs font-bold">
          <Globe className="w-4 h-4 text-amber-300" />
          <span>WordPress &amp; WooCommerce Integration Workbench</span>
        </div>
        <h1 className="text-3xl font-black">WordPress Export &amp; Import Suite</h1>
        <p className="text-sm text-amber-100 max-w-2xl">
          ওয়ার্ডপ্রেস ওয়েবসাইট বা WooCommerce এর সাথে সহজেই ডাটা কানেক্ট ও ইমপোর্ট করার জন্য CSV এবং SQL এক্সপোর্টার টুল।
        </p>
      </div>

      {/* EXPORT OPTIONS CARDS */}
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

      {/* WORDPRESS IMPORT INSTRUCTIONS IN BENGALI & ENGLISH */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <h3 className="text-lg font-extrabold text-[#0f3d44] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <span>ওয়ার্ডপ্রেসে কীভাবে কাজ করবেন (WordPress Setup Guide)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">১. WooCommerce প্রোডাক্ট ইমপোর্ট করুন:</h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-700">
              <li>WordPress Admin Panel এ লগইন করুন।</li>
              <li>বাম দিকের মেনু থেকে <strong>Products → Import</strong> এ যান।</li>
              <li>উপরের <strong>Download WooCommerce Products.CSV</strong> বাটনে ক্লিক করে পাওয়া ফাইলটি সিলেক্ট করে আপলোড করুন।</li>
              <li>Run Importer এ ক্লিক করলেই সব লেজার কাট স্টেইনলেস স্টিল আর্ট আপনার শপে এড হয়ে যাবে!</li>
            </ol>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">২. phpMyAdmin ডেটাবেস টেবিল রান করুন:</h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-700">
              <li>আপনার cPanel বা Hosting এ ঢুকে <strong>phpMyAdmin</strong> ওপেন করুন।</li>
              <li>আপনার ওয়ার্ডপ্রেস Database সিলেক্ট করুন।</li>
              <li>উপরে <strong>SQL</strong> ট্যাবে ক্লিক করে Download করা SQL ফাইলের কোডগুলো পেস্ট করে <strong>Go</strong> প্রেস করুন।</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
