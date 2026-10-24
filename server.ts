import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_SETTINGS, CURRENCIES } from './src/data/mockData.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// File path for persistent orders database in hidden .data directory (prevents dev server auto-restart)
const DATA_DIR = path.join(process.cwd(), '.data');
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.warn('Failed to create .data dir:', e);
  }
}
const ORDERS_FILE_PATH = path.join(DATA_DIR, 'orders_db.json');
const BACKUP_ORDERS_FILE_PATH = path.join(process.cwd(), 'public', 'orders_backup.json');
const PERSISTED_ORDERS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'persisted_orders.json');

const PRODUCTS_FILE_PATH = path.join(DATA_DIR, 'products_db.json');
const BACKUP_PRODUCTS_FILE_PATH = path.join(process.cwd(), 'public', 'products_backup.json');

const CATEGORIES_FILE_PATH = path.join(DATA_DIR, 'categories_db.json');
const BACKUP_CATEGORIES_FILE_PATH = path.join(process.cwd(), 'public', 'categories_backup.json');

const SETTINGS_FILE_PATH = path.join(DATA_DIR, 'settings_db.json');
const BACKUP_SETTINGS_FILE_PATH = path.join(process.cwd(), 'public', 'settings_backup.json');

// Initial default orders
const INITIAL_ORDERS: any[] = [
  {
    id: 1,
    order_number: 'UA-1001',
    user_name: 'Tanvir Hossain',
    user_email: 'tanvir@example.com',
    user_phone: '+8801711223344',
    shipping_address: 'House 14, Road 5, Block B, Gulshan 1',
    city: 'Dhaka',
    delivery_zone: 'dhaka',
    total_weight_grams: 2200,
    delivery_charge: 0,
    subtotal_amount: 7500,
    total_amount: 7500,
    payment_method: 'cod',
    payment_status: 'paid',
    status: 'delivered',
    created_at: '2026-07-28 14:30:00',
    tracking_number: 'SF-BD-1001-DH',
    courier_name: 'Express Courier Partner',
    courier_phone: '+8801700998877',
    estimated_delivery: '2026-07-30 (Delivered)',
    tracking_history: [
      { stage: 'Order Placed & Confirmed', timestamp: '2026-07-28 14:30', location: 'Tejgaon Factory, Dhaka', details: 'Order received and payment mode verified.', completed: true },
      { stage: 'Precision Laser Cutting', timestamp: '2026-07-28 18:00', location: 'UNEX Laser Lab', details: 'Surgical Stainless Steel laser cut & hand-polished.', completed: true },
      { stage: 'Wooden Frame & 3D Hardware Packaging', timestamp: '2026-07-29 09:15', location: 'Packing Hub, Tejgaon', details: 'Sealed in shockproof wooden export box with wall spacers.', completed: true },
      { stage: 'Handed to Courier Partner', timestamp: '2026-07-29 14:00', location: 'Express Courier Hub, Dhaka', details: 'Dispatched with Courier Tracking #SF-BD-1001-DH.', completed: true },
      { stage: 'Out for Delivery & Handed to Customer', timestamp: '2026-07-30 11:45', location: 'Gulshan 1, Dhaka', details: 'Package delivered and inspected by recipient.', completed: true, current: true }
    ],
    items: [
      {
        product_id: 1,
        product_name: 'Ayatul Kursi Regal 3D Stainless Steel Wall Art',
        price: 7500,
        quantity: 1,
        image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80',
        weight_grams: 2200
      }
    ]
  },
  {
    id: 2,
    order_number: 'UA-1002',
    user_name: 'Nusrat Jahan',
    user_email: 'nusrat@example.com',
    user_phone: '+8801812345678',
    shipping_address: 'Flat 4A, Sector 3, Uttara',
    city: 'Dhaka',
    delivery_zone: 'dhaka',
    total_weight_grams: 2800,
    delivery_charge: 0,
    subtotal_amount: 8900,
    total_amount: 8900,
    payment_method: 'bkash',
    payment_status: 'paid',
    status: 'shipped',
    created_at: '2026-08-01 10:15:00',
    tracking_number: 'PTH-DH-99211-UT',
    courier_name: 'Pathao Logistics Express',
    courier_phone: '+8801912001122',
    estimated_delivery: '2026-08-04 - 2026-08-05',
    tracking_history: [
      { stage: 'Order Placed & Confirmed', timestamp: '2026-08-01 10:15', location: 'Tejgaon Factory, Dhaka', details: 'bKash Transaction ID verified.', completed: true },
      { stage: 'Precision Laser Cutting', timestamp: '2026-08-01 16:30', location: 'UNEX Laser Lab', details: 'Surgical stainless steel cut and electro-powder coated.', completed: true },
      { stage: 'Wooden Frame & 3D Hardware Packaging', timestamp: '2026-08-02 11:00', location: 'Packing Hub, Tejgaon', details: 'Boxed with custom foam corners and spacer bolts.', completed: true },
      { stage: 'Handed to Courier Partner', timestamp: '2026-08-03 09:30', location: 'Pathao Central Sorting Depot', details: 'Package in transit to Uttara Hub.', completed: true, current: true },
      { stage: 'Out for Delivery & Handed to Customer', timestamp: 'Expected Aug 4-5', location: 'Uttara, Dhaka', details: 'Scheduled for courier rider assignment.', completed: false }
    ],
    items: [
      {
        product_id: 2,
        product_name: 'Surah Al-Ikhlas, Al-Falaq & An-Nas 3-Piece Set',
        price: 8900,
        quantity: 1,
        image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80',
        weight_grams: 2800
      }
    ]
  }
];

// Helper to load orders from disk with multi-tier fallback & merge
function loadOrders(): any[] {
  const map = new Map<string, any>();

  const tryLoadFile = (filePath: string, label: string) => {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach(o => {
            if (o && o.order_number) {
              if (!map.has(String(o.order_number))) {
                map.set(String(o.order_number), o);
              } else {
                // Merge retaining any populated fields
                map.set(String(o.order_number), { ...map.get(String(o.order_number)), ...o });
              }
            }
          });
        }
      }
    } catch (e: any) {
      console.warn(`Failed to read orders from ${label}:`, e.message);
    }
  };

  // 1. Check primary persistent file in src/data
  tryLoadFile(PERSISTED_ORDERS_FILE_PATH, 'src/data/persisted_orders.json');
  // 2. Check public backup file
  tryLoadFile(BACKUP_ORDERS_FILE_PATH, 'public/orders_backup.json');
  // 3. Check .data database file
  tryLoadFile(ORDERS_FILE_PATH, '.data/orders_db.json');

  let loadedOrders = Array.from(map.values());

  if (loadedOrders.length === 0) {
    INITIAL_ORDERS.forEach(o => map.set(String(o.order_number), o));
    loadedOrders = Array.from(map.values());
  }

  // Sort newest first
  loadedOrders.sort((a, b) => {
    const numA = parseInt(String(a.order_number || '').replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(String(b.order_number || '').replace(/\D/g, ''), 10) || 0;
    return numB - numA;
  });

  return loadedOrders;
}

// Helper to save orders to disk across all 3 tiers
function saveOrders(ordersList: any[]) {
  if (!Array.isArray(ordersList)) return;
  const json = JSON.stringify(ordersList, null, 2);

  try {
    fs.writeFileSync(ORDERS_FILE_PATH, json, 'utf-8');
  } catch (e: any) {
    console.error('Failed to save orders to orders_db.json:', e.message);
  }
  try {
    fs.writeFileSync(BACKUP_ORDERS_FILE_PATH, json, 'utf-8');
  } catch (e: any) {
    console.error('Failed to save orders to backup file:', e.message);
  }
  try {
    fs.writeFileSync(PERSISTED_ORDERS_FILE_PATH, json, 'utf-8');
  } catch (e: any) {
    console.error('Failed to save orders to persisted file:', e.message);
  }
}

// Helper to calculate next sequential order number (UA-1003, UA-1004, UA-1005...)
function generateNextOrderNumber(ordersList: any[], clientMaxSerial: number = 0): string {
  let highestSerial = 1002;
  for (const o of ordersList) {
    if (o && o.order_number) {
      const match = String(o.order_number).match(/\d+/);
      if (match) {
        const val = parseInt(match[0], 10);
        if (!isNaN(val) && val > highestSerial) {
          highestSerial = val;
        }
      }
    }
  }
  if (clientMaxSerial > highestSerial) {
    highestSerial = clientMaxSerial;
  }
  const nextVal = highestSerial + 1;
  return `UA-${nextVal}`;
}

// Helper functions to load & save products
function loadProducts(): any[] {
  try {
    if (fs.existsSync(PRODUCTS_FILE_PATH)) {
      const data = JSON.parse(fs.readFileSync(PRODUCTS_FILE_PATH, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e: any) {
    console.warn('Failed to load products from .data/products_db.json:', e.message);
  }
  try {
    if (fs.existsSync(BACKUP_PRODUCTS_FILE_PATH)) {
      const data = JSON.parse(fs.readFileSync(BACKUP_PRODUCTS_FILE_PATH, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}
  return [...INITIAL_PRODUCTS];
}

function saveProducts(list: any[]) {
  if (!Array.isArray(list)) return;
  const json = JSON.stringify(list, null, 2);
  try { fs.writeFileSync(PRODUCTS_FILE_PATH, json, 'utf-8'); } catch (e: any) { console.error('Error writing products_db.json:', e.message); }
  try { fs.writeFileSync(BACKUP_PRODUCTS_FILE_PATH, json, 'utf-8'); } catch (e: any) { console.error('Error writing backup products:', e.message); }
}

// Helper functions to load & save categories
function loadCategories(): any[] {
  try {
    if (fs.existsSync(CATEGORIES_FILE_PATH)) {
      const data = JSON.parse(fs.readFileSync(CATEGORIES_FILE_PATH, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e: any) {
    console.warn('Failed to load categories from .data/categories_db.json:', e.message);
  }
  try {
    if (fs.existsSync(BACKUP_CATEGORIES_FILE_PATH)) {
      const data = JSON.parse(fs.readFileSync(BACKUP_CATEGORIES_FILE_PATH, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}
  return [...INITIAL_CATEGORIES];
}

function saveCategories(list: any[]) {
  if (!Array.isArray(list)) return;
  const json = JSON.stringify(list, null, 2);
  try { fs.writeFileSync(CATEGORIES_FILE_PATH, json, 'utf-8'); } catch (e: any) { console.error('Error writing categories_db.json:', e.message); }
  try { fs.writeFileSync(BACKUP_CATEGORIES_FILE_PATH, json, 'utf-8'); } catch (e: any) { console.error('Error writing backup categories:', e.message); }
}

// Helper functions to load & save settings
function loadSettings(): any {
  let loaded: any = {};
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const data = JSON.parse(fs.readFileSync(SETTINGS_FILE_PATH, 'utf-8'));
      if (data && typeof data === 'object') loaded = data;
    }
  } catch {}
  if (!Object.keys(loaded).length) {
    try {
      if (fs.existsSync(BACKUP_SETTINGS_FILE_PATH)) {
        const data = JSON.parse(fs.readFileSync(BACKUP_SETTINGS_FILE_PATH, 'utf-8'));
        if (data && typeof data === 'object') loaded = data;
      }
    } catch {}
  }
  return {
    ...INITIAL_SETTINGS,
    ...loaded,
    steadfast_api_key: (loaded.steadfast_api_key && loaded.steadfast_api_key.trim()) ? loaded.steadfast_api_key : INITIAL_SETTINGS.steadfast_api_key,
    steadfast_secret_key: (loaded.steadfast_secret_key && loaded.steadfast_secret_key.trim()) ? loaded.steadfast_secret_key : INITIAL_SETTINGS.steadfast_secret_key,
    steadfast_enabled: true
  };
}

function saveSettings(obj: any) {
  if (!obj || typeof obj !== 'object') return;
  const json = JSON.stringify(obj, null, 2);
  try { fs.writeFileSync(SETTINGS_FILE_PATH, json, 'utf-8'); } catch {}
  try { fs.writeFileSync(BACKUP_SETTINGS_FILE_PATH, json, 'utf-8'); } catch {}
}

// In-memory data store initialized with defaults & file persistence
let products = loadProducts();
let categories = loadCategories();
let settings = loadSettings();
let orders: any[] = loadOrders();

// Delivery charge calculator function matching includes/delivery.php
function calculateDeliveryCharge(weightGrams: number, zone: 'dhaka' | 'outside_dhaka', subtotal: number) {
  if (zone === 'dhaka' && settings.free_shipping_threshold_dhaka > 0 && subtotal >= settings.free_shipping_threshold_dhaka) {
    return 0; // Free delivery threshold met
  }

  const baseCharge = zone === 'dhaka' ? settings.base_charge_dhaka : settings.base_charge_outside;
  const per100gRate = zone === 'dhaka' ? settings.per_100g_dhaka : settings.per_100g_outside;

  // Additional weight beyond 1000g (1kg)
  const extraWeightGrams = Math.max(0, weightGrams - 1000);
  const extraUnits = Math.ceil(extraWeightGrams / 100);
  const extraCharge = extraUnits * per100gRate;

  return baseCharge + extraCharge;
}

// Supabase Configuration for Server-Side Persistence
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://vweyqbvhvuwiprtnygbj.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_bUXfOrljoYtQB_3w7F3ARg_3oJwUb6T';

// Helper to fetch orders from Supabase
async function fetchSupabaseOrders(): Promise<any[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((row: any) => ({
      id: Number(row.id) || Date.now(),
      order_number: row.order_id || `UA-${row.id}`,
      user_name: row.customer_name || 'Customer',
      user_phone: row.customer_phone || '',
      shipping_address: row.customer_address || '',
      city: row.district || 'Dhaka',
      delivery_zone: (row.delivery_zone || 'dhaka') as any,
      total_weight_grams: 1000,
      delivery_charge: Number(row.delivery_charge || 0),
      subtotal_amount: Number(row.subtotal || 0),
      discount_amount: Number(row.discount || 0),
      total_amount: Number(row.total_price || 0),
      payment_method: row.payment_method || 'cod',
      payment_status: row.payment_method === 'stripe' ? 'paid' : 'unpaid',
      status: row.status || 'pending',
      created_at: row.created_at || new Date().toISOString(),
      order_notes: row.notes || '',
      items: Array.isArray(row.items) ? row.items : []
    }));
  } catch (err: any) {
    console.warn('[Supabase fetchSupabaseOrders error]:', err.message);
    return [];
  }
}

// Helper to fetch products from Supabase
async function fetchSupabaseProducts(): Promise<any[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=id.asc`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return [];
    return data.map((row: any) => ({
      id: Number(row.id),
      category_id: Number(row.category_id || 1),
      category_name: row.category_name || 'Wall Decor',
      name: row.name,
      slug: row.slug,
      price: Number(row.price || 0),
      old_price: row.old_price ? Number(row.old_price) : undefined,
      weight_grams: Number(row.weight_grams || 1200),
      stock: Number(row.stock !== undefined ? row.stock : 15),
      badge: row.badge || '',
      featured: Boolean(row.featured),
      image_url: row.image_url,
      material: row.material || 'Surgical Stainless Steel',
      thickness: row.thickness || '0.6 mm',
      size_dimensions: row.size_dimensions || '75cm × 40cm',
      description: row.description || '',
      bangla_short_desc: row.bangla_short_desc || '',
      qualities: Array.isArray(row.qualities) ? row.qualities : [],
      sizes: Array.isArray(row.sizes) ? row.sizes : [],
      room_images: row.room_images || {},
      rating: Number(row.rating || 5.0),
      review_count: Number(row.review_count || 0)
    }));
  } catch (err: any) {
    console.warn('[Supabase fetchSupabaseProducts error]:', err.message);
    return [];
  }
}

// Helper to fetch categories from Supabase
async function fetchSupabaseCategories(): Promise<any[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/categories?select=*&order=sort_order.asc`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return [];
    return data.map((row: any) => ({
      id: Number(row.id),
      name: row.name,
      slug: row.slug,
      icon: row.icon || '🕌',
      image_url: row.image_url || '',
      sort_order: Number(row.sort_order || 0)
    }));
  } catch (err: any) {
    console.warn('[Supabase fetchSupabaseCategories error]:', err.message);
    return [];
  }
}

// API ROUTES

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', store: 'UNEX AURA', time: new Date().toISOString() });
});

// GET products
app.get('/api/products', async (req, res) => {
  const { cat, search, sort, badge, min_price, max_price } = req.query;

  // Check Supabase products first
  const supabaseProds = await fetchSupabaseProducts();
  if (supabaseProds.length > 0) {
    products = supabaseProds;
    saveProducts(products);
  }

  let filtered = [...products];

  if (cat) {
    filtered = filtered.filter(p => p.category_id === Number(cat) || p.category_name?.toLowerCase().replace(/\s+/g, '-') === cat);
  }
  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.material.toLowerCase().includes(q));
  }
  if (badge) {
    filtered = filtered.filter(p => p.badge === badge);
  }
  if (min_price) {
    filtered = filtered.filter(p => p.price >= Number(min_price));
  }
  if (max_price) {
    filtered = filtered.filter(p => p.price <= Number(max_price));
  }

  // Sorting
  if (sort === 'price_asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === 'popular') {
    filtered.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
  } else if (sort === 'rating') {
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else {
    // default newest
    filtered.sort((a, b) => b.id - a.id);
  }

  res.json({ success: true, count: filtered.length, products: filtered });
});

// GET single product by slug or id
app.get('/api/products/:slugOrId', (req, res) => {
  const param = req.params.slugOrId;
  const product = products.find(p => p.slug === param || p.id === Number(param));
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, product });
});

// POST Product (Admin Create or Edit)
app.post('/api/products', (req, res) => {
  const {
    id,
    name,
    slug,
    category_id,
    description,
    bangla_short_desc,
    qualities,
    price,
    old_price,
    weight_grams,
    size_dimensions,
    sizes,
    material,
    stock,
    badge,
    featured,
    rating,
    review_count,
    image_url,
    placements
  } = req.body;

  // Validate category_id (must be provided and non-zero)
  if (!category_id || Number(category_id) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'প্রোডাক্টের জন্য ক্যাটাগরি সিলেক্ট করা বাধ্যতামূলক (Selecting a category is mandatory for every product)'
    });
  }

  const cat = categories.find(c => c.id === Number(category_id));
  if (!cat) {
    return res.status(400).json({
      success: false,
      message: 'মনোনীত ক্যাটাগরি খুঁজে পাওয়া যায়নি (Selected category does not exist)'
    });
  }

  if (id) {
    // Edit existing product
    const index = products.findIndex(p => p.id === Number(id));
    if (index !== -1) {
      products[index] = {
        ...products[index],
        name: name || products[index].name,
        slug: slug || name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || products[index].slug,
        category_id: Number(category_id),
        category_name: cat.name,
        description: description !== undefined ? description : products[index].description,
        bangla_short_desc: bangla_short_desc !== undefined ? bangla_short_desc : products[index].bangla_short_desc,
        qualities: Array.isArray(qualities) ? qualities : (qualities ? String(qualities).split(',').map(s => s.trim()) : products[index].qualities),
        price: Number(price),
        old_price: old_price ? Number(old_price) : undefined,
        weight_grams: Number(weight_grams),
        size_dimensions: size_dimensions || products[index].size_dimensions,
        sizes: Array.isArray(sizes) ? sizes : products[index].sizes,
        material: material || products[index].material,
        stock: Number(stock),
        badge: badge !== undefined ? badge : products[index].badge,
        featured: featured !== undefined ? Boolean(featured) : products[index].featured,
        rating: rating !== undefined ? Number(rating) : products[index].rating,
        review_count: review_count !== undefined ? Number(review_count) : products[index].review_count,
        image_url: image_url || products[index].image_url,
        placements: placements !== undefined ? placements : products[index].placements,
      };
      saveProducts(products);

      // Dual-sync update to Supabase products table in background
      try {
        const prodId = Number(id);
        fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${prodId}`, {
          method: 'PATCH',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal'
          },
          body: JSON.stringify({
            name: products[index].name,
            slug: products[index].slug,
            category_id: products[index].category_id,
            category_name: products[index].category_name,
            price: products[index].price,
            old_price: products[index].old_price || null,
            weight_grams: products[index].weight_grams,
            size_dimensions: products[index].size_dimensions,
            material: products[index].material,
            stock: products[index].stock,
            badge: products[index].badge || null,
            featured: products[index].featured,
            image_url: products[index].image_url,
            description: products[index].description,
            bangla_short_desc: products[index].bangla_short_desc,
            qualities: products[index].qualities,
            sizes: products[index].sizes,
            room_images: products[index].room_images,
            updated_at: new Date().toISOString()
          })
        }).catch(e => console.warn('[Supabase Product Update Note]:', e.message));
      } catch (err: any) {
        console.warn('[Supabase Product Update Exception]:', err.message);
      }

      return res.json({ success: true, message: 'Product updated successfully', product: products[index] });
    }
  }

  // Create new product
  const newId = Math.max(...products.map(p => p.id), 0) + 1;
  const prodSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const newProduct = {
    id: newId,
    category_id: Number(category_id),
    category_name: cat.name,
    name,
    slug: prodSlug,
    description: description || '',
    bangla_short_desc: bangla_short_desc || '',
    qualities: Array.isArray(qualities) ? qualities : (qualities ? String(qualities).split(',').map(s => s.trim()) : []),
    price: Number(price),
    old_price: old_price ? Number(old_price) : undefined,
    image_url: image_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80',
    badge: badge || 'NEW',
    stock: Number(stock || 10),
    featured: Boolean(featured),
    weight_grams: Number(weight_grams || 1500),
    size_dimensions: size_dimensions || '80cm × 40cm × 2mm',
    sizes: Array.isArray(sizes) ? sizes : [],
    material: material || 'Surgical Stainless Steel',
    rating: rating ? Number(rating) : 5.0,
    review_count: review_count ? Number(review_count) : 1,
    placements: placements || [],
    created_at: new Date().toISOString().split('T')[0]
  };

  products.push(newProduct);
  saveProducts(products);

  // Dual-sync insert to Supabase products table in background
  try {
    fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({
        category_id: newProduct.category_id,
        category_name: newProduct.category_name,
        name: newProduct.name,
        slug: newProduct.slug,
        price: newProduct.price,
        old_price: newProduct.old_price || null,
        weight_grams: newProduct.weight_grams,
        size_dimensions: newProduct.size_dimensions,
        material: newProduct.material,
        stock: newProduct.stock,
        badge: newProduct.badge || null,
        featured: newProduct.featured,
        image_url: newProduct.image_url,
        description: newProduct.description,
        bangla_short_desc: newProduct.bangla_short_desc,
        qualities: newProduct.qualities,
        sizes: newProduct.sizes,
        created_at: new Date().toISOString()
      })
    }).catch(e => console.warn('[Supabase Product Insert Note]:', e.message));
  } catch (err: any) {
    console.warn('[Supabase Product Insert Exception]:', err.message);
  }

  res.json({ success: true, message: 'Product created successfully', product: newProduct });
});

// DELETE Product
app.delete('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  products = products.filter(p => p.id !== id);
  saveProducts(products);

  // Dual-sync delete from Supabase in background
  try {
    fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
      method: 'DELETE',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    }).catch(e => console.warn('[Supabase Product Delete Note]:', e.message));
  } catch {}

  res.json({ success: true, message: 'Product deleted' });
});

// PATCH update single product stock
app.patch('/api/products/:id/stock', (req, res) => {
  const id = Number(req.params.id);
  const newStock = Math.max(0, Number(req.body.stock || 0));

  const idx = products.findIndex(p => p.id === id);
  if (idx !== -1) {
    products[idx].stock = newStock;
    saveProducts(products);
  }

  // Dual-sync stock update to Supabase in background
  try {
    fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({ stock: newStock, updated_at: new Date().toISOString() })
    }).catch(e => console.warn('[Supabase Stock Update Note]:', e.message));
  } catch {}

  res.json({ success: true, message: 'Stock updated successfully', id, stock: newStock });
});

// GET Categories
app.get('/api/categories', async (req, res) => {
  // Check Supabase categories first
  const supabaseCats = await fetchSupabaseCategories();
  if (supabaseCats.length > 0) {
    categories = supabaseCats;
    saveCategories(categories);
  }

  // calculate item count per category dynamically
  const catsWithCount = categories.map(cat => ({
    ...cat,
    item_count: products.filter(p => p.category_id === cat.id).length
  }));
  res.json({ success: true, categories: catsWithCount });
});

// POST Categories (Admin Create / Edit / Delete)
app.post('/api/categories', (req, res) => {
  const { action, id, name, icon, sort_order } = req.body;

  if (action === 'delete') {
    const productsInCat = products.filter(p => p.category_id === Number(id));
    if (productsInCat.length > 0) {
      return res.status(400).json({
        success: false,
        message: `এই ক্যাটাগরিতে ${productsInCat.length}টি প্রোডাক্ট রয়েছে। ক্যাটাগরি মোছার আগে প্রোডাক্টগুলোকে অন্য ক্যাটাগরিতে স্থানান্তর করুন। (Cannot delete category with ${productsInCat.length} existing products)`
      });
    }
    categories = categories.filter(c => c.id !== Number(id));
    saveCategories(categories);

    // Delete from Supabase
    try {
      fetch(`${SUPABASE_URL}/rest/v1/categories?id=eq.${Number(id)}`, {
        method: 'DELETE',
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
      }).catch(e => console.warn('[Supabase Category Delete Note]:', e.message));
    } catch {}

    return res.json({ success: true, message: 'Category deleted successfully' });
  }

  if (id) {
    // update category
    const idx = categories.findIndex(c => c.id === Number(id));
    if (idx !== -1) {
      categories[idx] = {
        ...categories[idx],
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        icon: icon || categories[idx].icon,
        sort_order: Number(sort_order) || categories[idx].sort_order
      };
      saveCategories(categories);

      // Update in Supabase
      try {
        fetch(`${SUPABASE_URL}/rest/v1/categories?id=eq.${Number(id)}`, {
          method: 'PATCH',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal'
          },
          body: JSON.stringify({
            name: categories[idx].name,
            slug: categories[idx].slug,
            icon: categories[idx].icon,
            sort_order: categories[idx].sort_order
          })
        }).catch(e => console.warn('[Supabase Category Update Note]:', e.message));
      } catch {}

      return res.json({ success: true, message: 'Category updated', category: categories[idx] });
    }
  }

  // add category
  const newId = Math.max(...categories.map(c => c.id), 0) + 1;
  const newCat = {
    id: newId,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    icon: icon || '✨',
    sort_order: Number(sort_order) || categories.length + 1
  };
  categories.push(newCat);
  saveCategories(categories);

  // Insert in Supabase
  try {
    fetch(`${SUPABASE_URL}/rest/v1/categories`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({
        name: newCat.name,
        slug: newCat.slug,
        icon: newCat.icon,
        sort_order: newCat.sort_order,
        created_at: new Date().toISOString()
      })
    }).catch(e => console.warn('[Supabase Category Insert Note]:', e.message));
  } catch {}

  res.json({ success: true, message: 'New category created successfully', category: newCat });
});

// DELETE Category
app.delete('/api/categories/:id', (req, res) => {
  const id = Number(req.params.id);
  const productsInCat = products.filter(p => p.category_id === id);
  if (productsInCat.length > 0) {
    return res.status(400).json({
      success: false,
      message: `এই ক্যাটাগরিতে ${productsInCat.length}টি প্রোডাক্ট রয়েছে। ক্যাটাগরি মোছার আগে প্রোডাক্টগুলোকে অন্য ক্যাটাগরিতে স্থানান্তর করুন।`
    });
  }
  categories = categories.filter(c => c.id !== id);
  saveCategories(categories);

  // Delete from Supabase
  try {
    fetch(`${SUPABASE_URL}/rest/v1/categories?id=eq.${id}`, {
      method: 'DELETE',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    }).catch(e => console.warn('[Supabase Category Delete Note]:', e.message));
  } catch {}

  res.json({ success: true, message: 'Category deleted successfully' });
});

// POST Delivery Charge Calculation
app.post('/api/delivery/calculate', (req, res) => {
  const { weight_grams, zone, subtotal } = req.body;
  const totalWeight = Number(weight_grams || 0);
  const deliveryZone = zone === 'outside_dhaka' ? 'outside_dhaka' : 'dhaka';
  const subtotalAmt = Number(subtotal || 0);

  const fee = calculateDeliveryCharge(totalWeight, deliveryZone, subtotalAmt);

  res.json({
    success: true,
    zone: deliveryZone,
    total_weight_grams: totalWeight,
    subtotal: subtotalAmt,
    delivery_charge: fee,
    free_shipping_applied: deliveryZone === 'dhaka' && fee === 0 && subtotalAmt >= settings.free_shipping_threshold_dhaka,
    free_shipping_threshold: settings.free_shipping_threshold_dhaka
  });
});

// GET & POST Settings
app.get('/api/settings', (req, res) => {
  res.json({ success: true, settings, currencies: CURRENCIES });
});

app.post('/api/settings', (req, res) => {
  settings = { ...settings, ...req.body };
  saveSettings(settings);
  res.json({ success: true, message: 'Settings saved successfully', settings });
});

// Helper to format order into complete, professional WhatsApp text
function formatWhatsAppOrderMessage(order: any, storeName = 'UNEX AURA'): string {
  const isDhaka = order.delivery_zone === 'dhaka' || String(order.city || '').toLowerCase().includes('dhaka');
  const zoneText = isDhaka ? 'ঢাকার ভেতরে (Inside Dhaka)' : 'ঢাকার বাইরে (Outside Dhaka)';

  let paymentText = 'ক্যাশ অন ডেলিভারি (Cash on Delivery)';
  if (order.payment_method === 'bkash') paymentText = 'বিকাশ (bKash)';
  else if (order.payment_method === 'nagad') paymentText = 'নগদ (Nagad)';
  else if (order.payment_method === 'stripe') paymentText = 'অনলাইন কার্ড (Card/Stripe)';

  const itemsList = (order.items || []).map((item: any, idx: number) => {
    const sizeInfo = item.selected_size_name ? ` (সাইজ: ${item.selected_size_name})` : '';
    const itemTotal = ((item.price || 0) * (item.quantity || 1)).toLocaleString('en-BD');
    return `${idx + 1}. *${item.product_name}*${sizeInfo}\n   ▫️ পরিমাণ: ${item.quantity} টি | মোট: ৳${itemTotal}`;
  }).join('\n');

  const formattedDate = order.created_at || new Date().toLocaleString('en-GB');

  return `🛍️ *নতুন অর্ডার রিসিভ হয়েছে - ${storeName}*
━━━━━━━━━━━━━━━━━━━━━━━━
📋 *অর্ডার নম্বর:* #${order.order_number}
📅 *তারিখ ও সময়:* ${formattedDate}

👤 *গ্রাহকের তথ্য (Customer Details):*
▫️ *নাম:* ${order.user_name || 'Customer'}
▫️ *মোবাইল নম্বর:* ${order.user_phone || 'N/A'}
▫️ *ঠিকানা:* ${order.shipping_address || ''}
▫️ *জেলা/শহর:* ${order.city || 'ঢাকা'}
▫️ *ডেলিভারি এরিয়া:* ${zoneText}

📦 *অর্ডারকৃত পণ্যসমূহ (Ordered Items):*
${itemsList || '১. প্রোডাক্ট'}

💰 *বিল ও মূল্য বিবরণ (Financial Summary):*
▫️ প্রোডাক্ট সাব-টোটাল: ৳${(order.subtotal_amount || 0).toLocaleString('en-BD')}
▫️ ডেলিভারি চার্জ: ${order.delivery_charge === 0 ? 'ফ্রি ডেলিভারি (FREE)' : '৳' + (order.delivery_charge || 0).toLocaleString('en-BD')}
${order.discount_amount ? `▫️ কুপন ডিসকাউন্ট: -৳${(order.discount_amount || 0).toLocaleString('en-BD')}\n` : ''}▫️ *সর্বমোট প্রদেয় বিল (Total Bill): ৳${(order.total_amount || 0).toLocaleString('en-BD')}*
▫️ পেমেন্ট মেথড: ${paymentText}
${order.order_notes ? `\n📝 *গ্রাহকের বিশেষ নোট:*\n"${order.order_notes}"\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ *অর্ডারটি প্রস্তুত ও কনফার্ম করার জন্য দ্রুত ব্যবস্থা নিন।*`;
}

// Backend Automated WhatsApp Dispatcher (Zero customer redirect, purely in background)
async function sendWhatsAppOrderNotification(order: any, currentSettings: any) {
  // If auto WhatsApp notification is disabled by store owner, skip completely
  if (currentSettings?.whatsapp_auto_notify_enabled !== true) {
    console.log(`[BACKEND WHATSAPP NOTIFICATION SKIPPED: Feature disabled by admin]`);
    return { dispatched: false, reason: 'Disabled by user settings' };
  }

  const rawPhone = currentSettings.whatsapp_number || process.env.WHATSAPP_PHONE || '01623319639';
  let cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) cleanPhone = '880' + cleanPhone.substring(1);
  else if (!cleanPhone.startsWith('880')) cleanPhone = '880' + cleanPhone;

  const messageText = formatWhatsAppOrderMessage(order);
  console.log(`\n========================================`);
  console.log(`[BACKEND WHATSAPP NOTIFICATION DISPATCHED]`);
  console.log(`Target Phone: +${cleanPhone}`);
  console.log(`Order Number: #${order.order_number}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`========================================\n`);

  const results: any = { dispatched: true, phone: cleanPhone, methods: [] };

  // 1. CallMeBot WhatsApp Gateway API (Free, Instant Direct WhatsApp Bot Message)
  const callMeBotApiKey = currentSettings.whatsapp_api_key || process.env.CALLMEBOT_API_KEY || process.env.WHATSAPP_API_KEY;
  if (callMeBotApiKey) {
    try {
      const callmebotUrl = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodeURIComponent(messageText)}&apikey=${encodeURIComponent(callMeBotApiKey)}`;
      const res = await fetch(callmebotUrl);
      const text = await res.text();
      console.log(`[CallMeBot Gateway Response]:`, text);
      results.methods.push({ service: 'CallMeBot', status: 'success', response: text });
    } catch (e: any) {
      console.error(`[CallMeBot Gateway Error]:`, e.message);
      results.methods.push({ service: 'CallMeBot', status: 'error', error: e.message });
    }
  }

  // 2. Custom WhatsApp Webhook / UltraMsg / Green API / WhatsApp Cloud API / Zapier Webhook
  const webhookUrl = currentSettings.whatsapp_webhook_url || process.env.WHATSAPP_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          to: cleanPhone,
          message: messageText,
          order: order
        })
      });
      const data = await res.text();
      console.log(`[WhatsApp Webhook Response]:`, data);
      results.methods.push({ service: 'Webhook', status: 'success', response: data });
    } catch (e: any) {
      console.error(`[WhatsApp Webhook Error]:`, e.message);
      results.methods.push({ service: 'Webhook', status: 'error', error: e.message });
    }
  }

  return results;
}

// Backend Automated Google Sheet Webhook Dispatcher (Google Apps Script / Webhook)
async function sendGoogleSheetOrderWebhook(order: any, currentSettings: any) {
  const webhookUrl = currentSettings?.google_sheet_webhook_url || process.env.GOOGLE_SHEET_WEBHOOK_URL || INITIAL_SETTINGS.google_sheet_webhook_url;
  if (!webhookUrl || typeof webhookUrl !== 'string' || !webhookUrl.startsWith('http')) {
    console.warn('[Google Sheet Webhook]: No valid webhook URL configured');
    return { dispatched: false, reason: 'No Google Sheet Webhook URL configured' };
  }

  try {
    const itemsSummary = Array.isArray(order.items)
      ? order.items.map((it: any) => `${it.product_name || it.name || 'Product'}${it.selected_size_name ? ` (${it.selected_size_name})` : ''} x${it.quantity || 1}`).join('; ')
      : 'N/A';

    const deliveryFee = order.delivery_charge !== undefined && order.delivery_charge !== null 
      ? Number(order.delivery_charge) 
      : (order.delivery_fee !== undefined ? Number(order.delivery_fee) : 0);

    const subtotal = order.subtotal_amount !== undefined && order.subtotal_amount !== null
      ? Number(order.subtotal_amount)
      : (order.subtotal !== undefined ? Number(order.subtotal) : 0);

    const totalAmount = order.total_amount !== undefined && order.total_amount !== null
      ? Number(order.total_amount)
      : (subtotal + deliveryFee);

    const payload = {
      timestamp: order.created_at || new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }),
      order_number: order.order_number || ('UA-' + Date.now()),
      customer_name: order.customer_name || order.user_name || 'Customer',
      customer_phone: order.customer_phone || order.user_phone || '',
      customer_email: order.customer_email || order.user_email || '',
      shipping_address: order.shipping_address || '',
      city: order.city || '',
      delivery_zone: order.delivery_zone === 'dhaka' ? 'Inside Dhaka' : (order.delivery_zone || 'Outside Dhaka'),
      items_summary: itemsSummary,
      total_weight_grams: order.total_weight_grams || 0,
      delivery_fee: deliveryFee,
      subtotal: subtotal,
      total_amount: totalAmount,
      payment_method: order.payment_method === 'cod' ? 'ক্যাশ অন ডেলিভারি (Cash on Delivery)' : (order.payment_method || 'Cash on Delivery'),
      payment_details: order.payment_details || 'N/A',
      payment_status: order.payment_status || 'Pending',
      status: order.status || 'Pending',
      order: order
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });

    const respText = await res.text();
    console.log(`[Google Sheet Webhook Dispatch]: Order #${order.order_number} sent, status: ${res.status}, response: ${respText}`);
    return { dispatched: true, status: res.status, response: respText };
  } catch (err: any) {
    console.error(`[Google Sheet Webhook Dispatch Error]:`, err.message);
    return { dispatched: false, error: err.message };
  }
}

// Meta Conversions API (CAPI) Helper
function hashSha256(value: string): string | undefined {
  if (!value || typeof value !== 'string') return undefined;
  const cleaned = value.trim().toLowerCase();
  if (!cleaned) return undefined;
  return crypto.createHash('sha256').update(cleaned).digest('hex');
}

function cleanPhoneForMeta(rawPhone: string): string | undefined {
  if (!rawPhone || typeof rawPhone !== 'string') return undefined;
  // Keep only digits
  let digits = rawPhone.replace(/\D/g, '');
  if (!digits) return undefined;
  // If Bangladesh local number (e.g. 017xxxxxxxx or 018xxxxxxxx), prefix with 88
  if (digits.startsWith('01') && digits.length === 11) {
    digits = '88' + digits;
  }
  return digits;
}

async function sendMetaConversionsEvent(eventName: string, eventData: {
  order?: any;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  client_ip?: string;
  client_user_agent?: string;
  fbp?: string;
  fbc?: string;
  event_source_url?: string;
  test_event_code?: string;
}, currentSettings: any) {
  const pixelId = currentSettings?.meta_pixel_id || process.env.META_PIXEL_ID || INITIAL_SETTINGS.meta_pixel_id || '1814759089902668';
  const accessToken = currentSettings?.meta_capi_access_token || process.env.META_CAPI_ACCESS_TOKEN || INITIAL_SETTINGS.meta_capi_access_token;
  const isCapiEnabled = currentSettings?.meta_capi_enabled !== false; // default true if token exists

  if (!isCapiEnabled || !accessToken) {
    return { dispatched: false, reason: 'Meta CAPI is not enabled or access token is missing' };
  }

  try {
    const order = eventData.order || {};
    const rawName = eventData.user_name || order.user_name || order.customer_name || '';
    const nameParts = rawName.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const rawEmail = eventData.user_email || order.user_email || order.customer_email || '';
    const rawPhone = eventData.user_phone || order.user_phone || order.customer_phone || '';
    const cleanedPhone = cleanPhoneForMeta(rawPhone);

    const hashedEmail = hashSha256(rawEmail);
    const hashedPhone = cleanedPhone ? hashSha256(cleanedPhone) : undefined;
    const hashedFn = hashSha256(firstName);
    const hashedLn = hashSha256(lastName);
    const hashedCity = hashSha256(order.city || 'Dhaka');
    const hashedCountry = hashSha256('bd');

    const userData: any = {
      client_user_agent: eventData.client_user_agent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    };

    if (eventData.client_ip && eventData.client_ip !== '127.0.0.1' && eventData.client_ip !== '::1') {
      userData.client_ip_address = eventData.client_ip;
    }
    if (hashedEmail) userData.em = [hashedEmail];
    if (hashedPhone) userData.ph = [hashedPhone];
    if (hashedFn) userData.fn = [hashedFn];
    if (hashedLn) userData.ln = [hashedLn];
    if (hashedCity) userData.ct = [hashedCity];
    userData.country = [hashedCountry];
    if (eventData.fbp) userData.fbp = eventData.fbp;
    if (eventData.fbc) userData.fbc = eventData.fbc;

    const eventId = String(order.order_number || ('UA-' + Date.now()));
    const orderTotal = Number(order.total_amount || 0);

    const contents = Array.isArray(order.items)
      ? order.items.map((it: any) => ({
          id: String(it.product_id || it.id || it.product_name),
          quantity: Number(it.quantity || 1),
          item_price: Number(it.price || 0),
          title: it.product_name || 'Wall Decor'
        }))
      : [];

    const numItems = Array.isArray(order.items)
      ? order.items.reduce((sum: number, it: any) => sum + Number(it.quantity || 1), 0)
      : 1;

    const payloadEvent: any = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: eventData.event_source_url || 'https://unexaura.com/order-success',
      action_source: 'website',
      user_data: userData,
      custom_data: {
        currency: 'BDT',
        value: orderTotal,
        content_type: 'product',
        order_id: eventId,
        num_items: numItems,
        contents: contents
      }
    };

    const payload: any = {
      data: [payloadEvent],
      access_token: accessToken
    };

    const testCode = currentSettings?.meta_test_event_code || eventData.test_event_code;
    if (testCode && testCode.trim()) {
      payload.test_event_code = testCode.trim();
    }

    const apiUrl = `https://graph.facebook.com/v19.0/${pixelId}/events`;
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const resData: any = await res.json();
    console.log(`[Meta CAPI Dispatch]: Event "${eventName}" (order #${eventId}) response:`, JSON.stringify(resData));
    return {
      dispatched: true,
      status: res.status,
      success: res.status >= 200 && res.status < 300 && !resData.error,
      response: resData
    };
  } catch (err: any) {
    console.error(`[Meta CAPI Dispatch Error]:`, err.message);
    return { dispatched: false, error: err.message };
  }
}

// POST Test Meta CAPI
app.post('/api/meta/test-capi', async (req, res) => {
  try {
    const currentSettings = loadSettings();
    const token = req.body?.access_token || currentSettings.meta_capi_access_token || INITIAL_SETTINGS.meta_capi_access_token;
    const pixelId = req.body?.pixel_id || currentSettings.meta_pixel_id || INITIAL_SETTINGS.meta_pixel_id || '1814759089902668';
    const testCode = req.body?.test_event_code || currentSettings.meta_test_event_code || '';

    if (!token) {
      return res.status(400).json({ success: false, message: 'Meta CAPI Access Token পাওয়া যায়নি।' });
    }

    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || 'Mozilla/5.0';

    const testOrder = {
      order_number: 'UA-TEST-' + Math.floor(1000 + Math.random() * 9000),
      user_name: 'Salman Shohag Test',
      user_email: 'salmansohagkazi@gmail.com',
      user_phone: '01711223344',
      city: 'Dhaka',
      total_amount: 1099,
      items: [
        {
          product_id: 10,
          product_name: 'Ayatul Kursi Laser-Cut Wall Art',
          price: 1099,
          quantity: 1
        }
      ]
    };

    const result = await sendMetaConversionsEvent(
      'Purchase',
      {
        order: testOrder,
        client_ip: clientIp,
        client_user_agent: userAgent,
        test_event_code: testCode
      },
      {
        meta_pixel_id: pixelId,
        meta_capi_access_token: token,
        meta_capi_enabled: true,
        meta_test_event_code: testCode
      }
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Meta Conversions API টেস্ট ইভেন্ট সফলভাবে Facebook Events Manager-এ সেন্ড হয়েছে!',
        details: result.response
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Meta API থেকে ত্রুটি পাওয়া গেছে: ' + (result.response?.error?.message || result.error || 'Unknown error'),
        details: result
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Create Order
app.post('/api/orders', (req, res) => {
  const { user_name, user_email, user_phone, shipping_address, city, delivery_zone, payment_method, order_notes, items, fbp, fbc } = req.body;
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || '';
  const clientUserAgent = req.headers['user-agent'] || '';

  if (!items || !items.length) {
    return res.status(400).json({ success: false, message: 'Cart is empty' });
  }

  const zone = delivery_zone === 'outside_dhaka' ? 'outside_dhaka' : 'dhaka';
  let totalWeightGrams = 0;
  let subtotalAmount = 0;

  const orderItems = items.map((item: any) => {
    const product = products.find(p => p.id === Number(item.product_id));
    const price = item.price !== undefined && item.price !== null && Number(item.price) > 0 ? Number(item.price) : (product ? product.price : 0);
    const weight = item.weight_grams !== undefined && item.weight_grams !== null && Number(item.weight_grams) > 0 ? Number(item.weight_grams) : (product ? product.weight_grams : 1000);
    const qty = Number(item.quantity || 1);

    subtotalAmount += price * qty;
    totalWeightGrams += weight * qty;

    return {
      product_id: Number(item.product_id),
      product_name: product ? product.name : item.product_name,
      price,
      quantity: qty,
      image_url: product ? product.image_url : item.image_url,
      weight_grams: weight,
      selected_size_name: item.selected_size_name
    };
  });

  const deliveryCharge = calculateDeliveryCharge(totalWeightGrams, zone, subtotalAmount);
  const totalAmount = subtotalAmount + deliveryCharge;

  // Re-sync freshest orders list from database
  orders = loadOrders();

  let clientMaxSerial = Number(req.body.client_max_serial) || 0;
  if (Array.isArray(req.body.existing_order_numbers)) {
    for (const numStr of req.body.existing_order_numbers) {
      const match = String(numStr).match(/\d+/);
      if (match) {
        const val = parseInt(match[0], 10);
        if (!isNaN(val) && val > clientMaxSerial) {
          clientMaxSerial = val;
        }
      }
    }
  }

  const orderNumber = generateNextOrderNumber(orders, clientMaxSerial);

  const newOrder = {
    id: Date.now(),
    order_number: orderNumber,
    user_id: req.body.user_id || null,
    user_name,
    user_email,
    user_phone,
    shipping_address,
    city: city || 'Dhaka',
    delivery_zone: zone,
    total_weight_grams: totalWeightGrams,
    delivery_charge: deliveryCharge,
    subtotal_amount: subtotalAmount,
    total_amount: totalAmount,
    payment_method,
    bkash_number: req.body.bkash_number || null,
    bkash_trxid: req.body.bkash_trxid || null,
    payment_status: payment_method === 'stripe' ? 'paid' : 'unpaid',
    status: 'pending',
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    tracking_number: 'SF-BD-' + Math.floor(100000 + Math.random() * 900000),
    courier_name: zone === 'dhaka' ? 'Express Courier Partner' : 'Express Logistics Partner',
    courier_phone: '01623319639',
    estimated_delivery: zone === 'dhaka' ? 'Within 24-48 Hours' : 'Within 3-5 Business Days',
    tracking_history: [
      { stage: 'Order Placed & Confirmed', timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16), location: 'Tejgaon Factory, Dhaka', details: 'Order received into laser production queue.', completed: true, current: true },
      { stage: 'Precision Laser Cutting', timestamp: 'Pending Queue', location: 'UNEX Laser Lab', details: 'Laser cutting and polishing (Stainless Steel / MS Steel based on design specs).', completed: false },
      { stage: 'Wooden Frame & 3D Hardware Packaging', timestamp: 'Pending Queue', location: 'Packing Hub, Tejgaon', details: 'Custom export boxing with wall mounting spacers.', completed: false },
      { stage: 'Handed to Courier Partner', timestamp: 'Pending Dispatch', location: 'Courier Sorting Hub', details: 'Awaiting courier pick-up.', completed: false },
      { stage: 'Out for Delivery & Handed to Customer', timestamp: 'Pending Delivery', location: city || 'Dhaka', details: 'Final delivery address destination.', completed: false }
    ],
    order_notes,
    items: orderItems
  };

  // Deduplicate orders array by order_number and id before saving
  const uniqueMap = new Map();
  orders.forEach(o => {
    if (o && o.order_number) {
      uniqueMap.set(String(o.order_number), o);
    }
  });
  orders = Array.from(uniqueMap.values());
  orders.sort((a, b) => {
    const numA = parseInt(String(a.order_number || '').replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(String(b.order_number || '').replace(/\D/g, ''), 10) || 0;
    return numB - numA;
  });

  orders.unshift(newOrder);
  saveOrders(orders);

  // Trigger backend automated WhatsApp message in background only if explicitly enabled
  if (settings?.whatsapp_auto_notify_enabled === true) {
    sendWhatsAppOrderNotification(newOrder, settings).catch(err => {
      console.error('[Background WhatsApp Notification Error]:', err);
    });
  }

  // Trigger backend automated Google Sheet Webhook in background (Zero auth token expiration)
  sendGoogleSheetOrderWebhook(newOrder, settings).catch(err => {
    console.error('[Background Google Sheet Webhook Error]:', err);
  });

  // Trigger Meta Conversions API (CAPI) Server-Side Purchase Event in background
  sendMetaConversionsEvent(
    'Purchase',
    {
      order: newOrder,
      user_name: user_name,
      user_email: user_email,
      user_phone: user_phone,
      client_ip: clientIp,
      client_user_agent: clientUserAgent,
      fbp: fbp,
      fbc: fbc
    },
    settings
  ).catch(err => {
    console.error('[Background Meta CAPI Error]:', err);
  });

  // Dual Redundancy: Dispatch order to Supabase backend in background
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vweyqbvhvuwiprtnygbj.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_bUXfOrljoYtQB_3w7F3ARg_3oJwUb6T';
    fetch(`${supabaseUrl}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({
        order_id: newOrder.order_number,
        customer_name: newOrder.user_name || 'Customer',
        customer_phone: newOrder.user_phone || '',
        customer_address: newOrder.shipping_address || '',
        district: newOrder.city || 'Dhaka',
        delivery_zone: newOrder.delivery_zone || 'dhaka',
        items: newOrder.items || [],
        subtotal: newOrder.subtotal_amount || 0,
        delivery_charge: newOrder.delivery_charge || 0,
        discount: (newOrder as any).discount_amount || 0,
        total_price: newOrder.total_amount || 0,
        payment_method: newOrder.payment_method || 'cod',
        status: newOrder.status || 'pending',
        notes: newOrder.order_notes || '',
        created_at: new Date().toISOString()
      })
    }).then(res => {
      if (!res.ok) {
        res.text().then(t => console.warn('[Supabase Server Order Note]:', res.status, t));
      } else {
        console.log(`[Supabase Server Sync]: Order #${newOrder.order_number} saved to Supabase.`);
      }
    }).catch(err => console.warn('[Supabase Server Sync Catch]:', err.message));
  } catch (err: any) {
    console.warn('[Supabase Server Sync Exception]:', err.message);
  }

  // Automatically decrease product stock for each ordered item
  orderItems.forEach((item: any) => {
    const prodIndex = products.findIndex(p => p.id === Number(item.product_id));
    if (prodIndex !== -1) {
      const currentStock = Number(products[prodIndex].stock || 0);
      products[prodIndex].stock = Math.max(0, currentStock - Number(item.quantity || 1));
    }
  });
  saveProducts(products);

  res.json({
    success: true,
    message: 'Order placed successfully!',
    order: newOrder
  });
});

// POST Test WhatsApp Backend Notification
app.post('/api/whatsapp/test', async (req, res) => {
  const testOrder = {
    order_number: 'UA-TEST-' + Math.floor(100 + Math.random() * 900),
    user_name: req.body.user_name || 'Test Customer (টেস্ট কাস্টমার)',
    user_phone: req.body.phone || settings.whatsapp_number || '01623319639',
    shipping_address: 'House 12, Road 4, Sector 3, Uttara',
    city: 'Dhaka',
    delivery_zone: 'dhaka',
    items: [
      { product_name: 'Ayatul Kursi Regal 3D Stainless Steel Wall Art', selected_size_name: 'Large (36" x 24")', quantity: 1, price: 7500 }
    ],
    subtotal_amount: 7500,
    delivery_charge: 0,
    total_amount: 7500,
    payment_method: 'cod',
    order_notes: 'অ্যাডমিন সেটিংস থেকে টেস্ট WhatsApp নোটিফিকেশন চেক।',
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };

  try {
    const result = await sendWhatsAppOrderNotification(testOrder, { ...settings, ...req.body });
    res.json({ success: true, message: 'WhatsApp message triggered successfully in backend!', result, testOrder });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST Test Google Sheets Webhook Dispatch
app.post('/api/google-sheets/test-webhook', async (req, res) => {
  const testOrder = {
    order_number: 'UA-TEST-' + Math.floor(100 + Math.random() * 900),
    user_name: req.body.user_name || 'Salman Sohag (টেস্ট কাস্টমার)',
    user_phone: req.body.phone || '01623319639',
    user_email: 'customer@example.com',
    shipping_address: 'House 12, Road 4, Sector 3, Uttara',
    city: 'Dhaka',
    delivery_zone: 'dhaka',
    items: [
      { product_name: 'Ayatul Kursi Regal 3D Stainless Steel Wall Art', selected_size_name: 'Large (36" x 24")', quantity: 1, price: 7500 }
    ],
    total_weight_grams: 1500,
    delivery_fee: 0,
    subtotal: 7500,
    total_amount: 7500,
    payment_method: 'Cash on Delivery',
    payment_details: 'COD',
    payment_status: 'Pending',
    status: 'Pending',
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };

  const targetSettings = { ...settings, ...req.body };
  if (!targetSettings.google_sheet_webhook_url) {
    return res.status(400).json({
      success: false,
      message: 'কোনো Webhook URL দেওয়া হয়নি! দয়া করে Apps Script Webhook URL প্রবেশ করান।'
    });
  }

  try {
    const result = await sendGoogleSheetOrderWebhook(testOrder, targetSettings);
    if (result.dispatched) {
      res.json({
        success: true,
        message: 'টেস্ট অর্ডার সফলভাবে Google Sheet Webhook-এ পাঠানো হয়েছে! অনুগ্রহ করে আপনার গুগল শিটটি চেক করুন।',
        result,
        testOrder
      });
    } else {
      res.status(500).json({
        success: false,
        message: `Webhook পাঠাতে ব্যর্থ হয়েছে: ${result.reason || result.error || 'Unknown error'}`,
        result
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Proxy endpoint to sync single order to Google Sheets
app.post('/api/google-sheets/sync-order', async (req, res) => {
  try {
    const order = req.body.order || req.body;
    const targetUrl = req.body.webhook_url || settings.google_sheet_webhook_url || INITIAL_SETTINGS.google_sheet_webhook_url;
    const result = await sendGoogleSheetOrderWebhook(order, { ...settings, google_sheet_webhook_url: targetUrl });
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint to sync all store orders to Google Sheet Webhook
app.post('/api/google-sheets/sync-all', async (req, res) => {
  try {
    const targetUrl = req.body.webhook_url || settings.google_sheet_webhook_url || INITIAL_SETTINGS.google_sheet_webhook_url;
    orders = loadOrders();
    const results = [];
    for (const ord of orders) {
      const r = await sendGoogleSheetOrderWebhook(ord, { ...settings, google_sheet_webhook_url: targetUrl });
      results.push({ order_number: ord.order_number, result: r });
    }
    res.json({ success: true, count: results.length, results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// STEADFAST COURIER INTEGRATION API ENDPOINTS
// ==========================================
app.post('/api/courier/steadfast/create-order', async (req, res) => {
  try {
    const { order_id, invoice, recipient_name, recipient_phone, recipient_address, cod_amount, note, api_key, secret_key } = req.body;
    
    // Retrieve credentials from body or store settings
    const activeApiKey = api_key || settings.steadfast_api_key || process.env.STEADFAST_API_KEY || INITIAL_SETTINGS.steadfast_api_key || 'mjhiiwurrcir7uqf1kaxi5t8quc4ql4t';
    const activeSecretKey = secret_key || settings.steadfast_secret_key || process.env.STEADFAST_SECRET_KEY || INITIAL_SETTINGS.steadfast_secret_key || '3vtq7ghmlmjk1y7ormoqot6l';

    if (!activeApiKey || !activeSecretKey) {
      return res.status(400).json({
        success: false,
        message: 'Steadfast API Key or Secret Key is not configured. Please add them in Admin Settings.'
      });
    }

    if (!recipient_name || !recipient_phone || !recipient_address) {
      return res.status(400).json({
        success: false,
        message: 'Recipient name, phone, and address are required to create a Steadfast parcel.'
      });
    }

    const payload = {
      invoice: String(invoice || order_id || `UA-${Date.now()}`),
      recipient_name: String(recipient_name).trim(),
      recipient_phone: String(recipient_phone).trim(),
      recipient_address: String(recipient_address).trim(),
      cod_amount: Number(cod_amount || 0),
      note: String(note || 'Handle with care - Laser cut metal wall art').trim()
    };

    const sfRes = await fetch('https://portal.steadfast.com.bd/api/v1/create_order', {
      method: 'POST',
      headers: {
        'Api-Key': activeApiKey,
        'Secret-Key': activeSecretKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const sfData: any = await sfRes.json().catch(() => null);

    if (!sfRes.ok || (sfData && sfData.status !== 200 && sfData.status !== 201)) {
      return res.status(sfRes.status || 400).json({
        success: false,
        message: sfData?.message || (sfData?.errors ? JSON.stringify(sfData?.errors) : 'Failed to create parcel on Steadfast Courier'),
        raw: sfData
      });
    }

    const consignment = sfData.consignment || sfData;
    const trackingCode = consignment?.tracking_code || sfData?.tracking_code || '';
    const consignmentId = consignment?.consignment_id || sfData?.consignment_id || '';

    // Update local order and Supabase with tracking information
    orders = loadOrders();
    const orderIndex = orders.findIndex(o => String(o.id) === String(order_id) || String(o.order_number) === String(order_id));
    if (orderIndex > -1) {
      orders[orderIndex].tracking_number = trackingCode;
      orders[orderIndex].courier_name = 'Steadfast Courier';
      orders[orderIndex].steadfast_consignment_id = consignmentId;
      orders[orderIndex].steadfast_tracking_code = trackingCode;
      orders[orderIndex].steadfast_status = 'in_review';
      orders[orderIndex].status = 'shipped';
      saveOrders(orders);

      // Dual-sync to Supabase
      try {
        const orderNum = orders[orderIndex].order_number;
        fetch(`${SUPABASE_URL}/rest/v1/orders?order_id=eq.${orderNum}`, {
          method: 'PATCH',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            tracking_number: trackingCode,
            courier_name: 'Steadfast Courier',
            status: 'shipped',
            updated_at: new Date().toISOString()
          })
        }).catch(e => console.warn('[Supabase Courier Sync Warning]:', e.message));
      } catch {}
    }

    return res.json({
      success: true,
      message: 'পণ্যটি সফলভাবে স্টেডফাস্ট কুরিয়ারে বুক করা হয়েছে!',
      consignment,
      tracking_code: trackingCode,
      consignment_id: consignmentId
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal error creating Steadfast order'
    });
  }
});

app.get('/api/courier/steadfast/status/:tracking_code', async (req, res) => {
  try {
    const trackingCode = req.params.tracking_code;
    const apiKey = (req.query.api_key as string) || settings.steadfast_api_key || INITIAL_SETTINGS.steadfast_api_key || 'mjhiiwurrcir7uqf1kaxi5t8quc4ql4t';
    const secretKey = (req.query.secret_key as string) || settings.steadfast_secret_key || INITIAL_SETTINGS.steadfast_secret_key || '3vtq7ghmlmjk1y7ormoqot6l';

    if (!apiKey || !secretKey) {
      return res.status(400).json({ success: false, message: 'Steadfast keys not configured' });
    }

    const sfRes = await fetch(`https://portal.steadfast.com.bd/api/v1/status_by_trackingcode/${encodeURIComponent(trackingCode)}`, {
      method: 'GET',
      headers: {
        'Api-Key': apiKey,
        'Secret-Key': secretKey
      }
    });

    const data = await sfRes.json().catch(() => null);
    res.json({ success: sfRes.ok, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST Bulk Sync Client-side Local Orders to Database
app.post('/api/orders/sync', (req, res) => {
  orders = loadOrders();
  const clientOrders = req.body.clientOrders || req.body.orders || [];

  if (Array.isArray(clientOrders) && clientOrders.length > 0) {
    let addedCount = 0;
    const existingMap = new Map();
    orders.forEach(o => {
      if (o && o.order_number) existingMap.set(String(o.order_number), o);
    });

    for (const cOrder of clientOrders) {
      if (cOrder && cOrder.order_number && !existingMap.has(String(cOrder.order_number))) {
        orders.push(cOrder);
        existingMap.set(String(cOrder.order_number), cOrder);
        addedCount++;
      }
    }

    if (addedCount > 0) {
      orders.sort((a, b) => {
        const numA = parseInt(String(a.order_number || '').replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(String(b.order_number || '').replace(/\D/g, ''), 10) || 0;
        return numB - numA;
      });
      saveOrders(orders);
    }
  }

  res.json({ success: true, count: orders.length, orders });
});

// GET Pull and sync orders from Google Sheet Webhook
app.get('/api/orders/pull-from-sheet', async (req, res) => {
  try {
    const webhook = (req.query.webhook_url as string) || settings.google_sheet_webhook_url || INITIAL_SETTINGS.google_sheet_webhook_url;
    if (!webhook) {
      return res.status(400).json({ success: false, message: 'Google Sheet Webhook URL পাওয়া যায়নি' });
    }

    const response = await fetch(webhook, { redirect: 'follow' });
    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Google Apps Script এ doGet পাওয়া যায়নি বা শিটটি এখনও doGet রেসপন্স প্রদান করছে না।'
      });
    }

    if (data && Array.isArray(data.orders)) {
      orders = loadOrders();
      const map = new Map();
      orders.forEach(o => { if (o && o.order_number) map.set(String(o.order_number), o); });
      let added = 0;
      data.orders.forEach((o: any) => {
        if (o && o.order_number && !map.has(String(o.order_number))) {
          orders.push(o);
          map.set(String(o.order_number), o);
          added++;
        }
      });

      if (added > 0) {
        orders.sort((a, b) => {
          const numA = parseInt(String(a.order_number || '').replace(/\D/g, ''), 10) || 0;
          const numB = parseInt(String(b.order_number || '').replace(/\D/g, ''), 10) || 0;
          return numB - numA;
        });
        saveOrders(orders);
      }

      return res.json({ success: true, count: orders.length, imported: added, orders });
    }

    return res.status(400).json({ success: false, message: 'Google Sheet থেকে কোনো অর্ডার ডাটা পাওয়া যায়নি।' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Push all products & categories catalog to Google Sheet
app.post('/api/inventory/push-to-sheet', async (req, res) => {
  try {
    const webhook = (req.body && req.body.webhook_url) || settings.google_sheet_webhook_url || INITIAL_SETTINGS.google_sheet_webhook_url;
    if (!webhook) {
      return res.status(400).json({ success: false, message: 'Google Sheet Webhook URL পাওয়া যায়নি।' });
    }

    products = loadProducts();
    categories = loadCategories();

    const payload = {
      action: 'sync_catalog',
      timestamp: new Date().toISOString(),
      products: products,
      categories: categories
    };

    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });

    const text = await response.text();
    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    return res.json({
      success: true,
      message: 'গুগল শিটে সম্পূর্ণ ক্যাটালগ সফলভাবে এক্সপোর্ট হয়েছে!',
      products_count: products.length,
      categories_count: categories.length,
      sheet_response: data
    });
  } catch (err: any) {
    console.error('Error pushing catalog to sheet:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET / POST Pull and sync products & inventory from Google Sheet Webhook
app.all('/api/inventory/pull-from-sheet', async (req, res) => {
  try {
    const webhook = (req.query.webhook_url as string) || (req.body && req.body.webhook_url) || settings.google_sheet_webhook_url || INITIAL_SETTINGS.google_sheet_webhook_url;
    if (!webhook) {
      return res.status(400).json({ success: false, message: 'Google Sheet Webhook URL পাওয়া যায়নি।' });
    }

    const separator = webhook.includes('?') ? '&' : '?';
    const fetchUrl = `${webhook}${separator}action=get_products&t=${Date.now()}`;
    const response = await fetch(fetchUrl, { redirect: 'follow' });
    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Google Apps Script থেকে সঠিক JSON রেসপন্স পাওয়া যায়নি। অনুগ্রহ করে Apps Script কোডটি আপডেট করে Web App রি-ডিপ্লয় করুন।'
      });
    }

    let updatedProductsCount = 0;
    if (data && Array.isArray(data.products) && data.products.length > 0) {
      products = loadProducts();
      data.products.forEach((sp: any) => {
        const prodId = Number(sp.id);
        const existingIdx = products.findIndex(p => p.id === prodId || (sp.name && p.name.trim().toLowerCase() === sp.name.trim().toLowerCase()));
        if (existingIdx !== -1) {
          if (sp.stock !== undefined && sp.stock !== null) products[existingIdx].stock = Number(sp.stock);
          if (sp.price) products[existingIdx].price = Number(sp.price);
          if (sp.old_price) products[existingIdx].old_price = Number(sp.old_price);
          if (sp.name) products[existingIdx].name = sp.name;
          if (sp.size_dimensions) products[existingIdx].size_dimensions = sp.size_dimensions;
          if (sp.image_url) products[existingIdx].image_url = sp.image_url;
          if (sp.badge) products[existingIdx].badge = sp.badge;
          updatedProductsCount++;
        } else if (sp.name) {
          const newId = prodId || (Math.max(0, ...products.map(p => p.id)) + 1);
          products.push({
            id: newId,
            name: sp.name,
            slug: sp.slug || sp.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            category_id: Number(sp.category_id) || 1,
            category_name: sp.category_name || 'Islamic Metal Wall Art',
            price: Number(sp.price) || 0,
            old_price: sp.old_price ? Number(sp.old_price) : undefined,
            stock: Number(sp.stock || 0),
            size_dimensions: sp.size_dimensions || '80cm × 40cm × 2mm',
            material: sp.material || 'Surgical Stainless Steel',
            weight_grams: Number(sp.weight_grams || 1500),
            badge: sp.badge || 'NEW',
            image_url: sp.image_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80',
            description: sp.description || sp.bangla_short_desc || '',
            bangla_short_desc: sp.bangla_short_desc || sp.description || '',
            qualities: [
              '১০০% খাঁটি সার্জিক্যাল স্টেইনলেস স্টিল - মরিচা পড়া বা রঙ চটে যাওয়ার কোনো সম্ভাবনা নেই।',
              'প্রিসিশন ফাইবার লেজার কাটিং - প্রতিটি হরফ ও ডিজাইন অত্যন্ত নিখুঁত ও মসৃণ।',
              '৩ডি ফ্লোটিং শ্যাডো লুক - দেয়াল থেকে ১ ইঞ্চি সামনে ভেসে থাকে যা দৃষ্টিনন্দন ছায়া তৈরি করে।'
            ],
            featured: true,
            rating: 5.0,
            review_count: 1,
            placements: [],
            sizes: [],
            created_at: new Date().toISOString().split('T')[0]
          });
          updatedProductsCount++;
        }
      });

      saveProducts(products);
    }

    if (data && Array.isArray(data.categories) && data.categories.length > 0) {
      categories = loadCategories();
      data.categories.forEach((sc: any) => {
        const catId = Number(sc.id);
        const existingCatIdx = categories.findIndex(c => c.id === catId || (sc.name && c.name.trim().toLowerCase() === sc.name.trim().toLowerCase()));
        if (existingCatIdx !== -1) {
          if (sc.name) categories[existingCatIdx].name = sc.name;
          if (sc.icon) categories[existingCatIdx].icon = sc.icon;
        } else if (sc.name) {
          categories.push({
            id: catId || (Math.max(0, ...categories.map(c => c.id)) + 1),
            name: sc.name,
            slug: sc.slug || sc.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            icon: sc.icon || '✨',
            sort_order: Number(sc.sort_order) || categories.length + 1
          });
        }
      });
      saveCategories(categories);
    }

    return res.json({
      success: true,
      message: `গুগল শিট থেকে ${updatedProductsCount} টি প্রোডাক্টের ইনভেন্টরি সফলভাবে সিঙ্ক হয়েছে!`,
      products_count: products.length,
      categories_count: categories.length,
      products,
      categories
    });
  } catch (err: any) {
    console.error('Error pulling inventory from sheet:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET Orders
app.get('/api/orders', async (req, res) => {
  orders = loadOrders();
  const supabaseOrders = await fetchSupabaseOrders();

  const map = new Map();
  orders.forEach(o => { if (o && o.order_number) map.set(String(o.order_number), o); });
  supabaseOrders.forEach(so => {
    if (so && so.order_number) {
      if (map.has(String(so.order_number))) {
        map.set(String(so.order_number), { ...map.get(String(so.order_number)), ...so });
      } else {
        map.set(String(so.order_number), so);
      }
    }
  });

  const merged = Array.from(map.values()).sort((a: any, b: any) => {
    const numA = parseInt(String(a.order_number || '').replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(String(b.order_number || '').replace(/\D/g, ''), 10) || 0;
    return numB - numA;
  });

  orders = merged;
  saveOrders(orders);
  res.json({ success: true, count: orders.length, orders });
});

// GET Orders backup as JSON download
app.get('/api/orders/backup', (req, res) => {
  orders = loadOrders();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="unex_orders_backup_${Date.now()}.json"`);
  res.send(JSON.stringify(orders, null, 2));
});

// POST Restore / Import Orders backup
app.post('/api/orders/restore', (req, res) => {
  const importedOrders = req.body.orders || req.body;
  if (!Array.isArray(importedOrders)) {
    return res.status(400).json({ success: false, message: 'Invalid orders array format' });
  }

  orders = loadOrders();
  const map = new Map();
  orders.forEach(o => { if (o && o.order_number) map.set(String(o.order_number), o); });
  let importedCount = 0;
  for (const io of importedOrders) {
    if (io && io.order_number) {
      if (!map.has(String(io.order_number))) {
        orders.push(io);
        map.set(String(io.order_number), io);
        importedCount++;
      }
    }
  }

  orders.sort((a, b) => {
    const numA = parseInt(String(a.order_number || '').replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(String(b.order_number || '').replace(/\D/g, ''), 10) || 0;
    return numB - numA;
  });

  saveOrders(orders);
  res.json({ success: true, count: orders.length, importedCount, orders });
});

// UPDATE Order Status or Details (supports PUT /api/orders/:id, PATCH /api/orders/:id, PATCH /api/orders/:id/status)
const updateOrderHandler = (req: any, res: any) => {
  orders = loadOrders();
  const id = req.params.id;
  const {
    status,
    payment_status,
    courier_name,
    tracking_number,
    total_amount,
    subtotal_amount,
    discount_amount,
    delivery_charge,
    order_notes,
    items,
    steadfast_consignment_id,
    steadfast_tracking_code,
    steadfast_status
  } = req.body;

  const orderIndex = orders.findIndex(o => String(o.id) === String(id) || String(o.order_number) === String(id));
  if (orderIndex === -1) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  if (status !== undefined) orders[orderIndex].status = status;
  if (payment_status !== undefined) orders[orderIndex].payment_status = payment_status;
  if (courier_name !== undefined) orders[orderIndex].courier_name = courier_name;
  if (tracking_number !== undefined) orders[orderIndex].tracking_number = tracking_number;
  if (total_amount !== undefined) orders[orderIndex].total_amount = Number(total_amount);
  if (subtotal_amount !== undefined) orders[orderIndex].subtotal_amount = Number(subtotal_amount);
  if (discount_amount !== undefined) orders[orderIndex].discount_amount = Number(discount_amount);
  if (delivery_charge !== undefined) orders[orderIndex].delivery_charge = Number(delivery_charge);
  if (order_notes !== undefined) orders[orderIndex].order_notes = order_notes;
  if (Array.isArray(items)) orders[orderIndex].items = items;
  if (steadfast_consignment_id !== undefined) orders[orderIndex].steadfast_consignment_id = steadfast_consignment_id;
  if (steadfast_tracking_code !== undefined) orders[orderIndex].steadfast_tracking_code = steadfast_tracking_code;
  if (steadfast_status !== undefined) orders[orderIndex].steadfast_status = steadfast_status;

  saveOrders(orders);

  // Dual-sync update to Supabase orders table in background
  try {
    const targetOrderNum = orders[orderIndex].order_number;
    const filter = `or=(order_id.eq.${targetOrderNum},id.eq.${orders[orderIndex].id || 0})`;
    const sbPayload: any = {
      updated_at: new Date().toISOString()
    };
    if (status !== undefined) sbPayload.status = status;
    if (payment_status !== undefined) sbPayload.payment_status = payment_status;
    if (total_amount !== undefined) sbPayload.total_price = Number(total_amount);
    if (subtotal_amount !== undefined) sbPayload.subtotal = Number(subtotal_amount);
    if (discount_amount !== undefined) sbPayload.discount = Number(discount_amount);
    if (delivery_charge !== undefined) sbPayload.delivery_charge = Number(delivery_charge);
    if (order_notes !== undefined) sbPayload.notes = order_notes;
    if (tracking_number !== undefined) sbPayload.tracking_number = tracking_number;
    if (courier_name !== undefined) sbPayload.courier_name = courier_name;

    fetch(`${SUPABASE_URL}/rest/v1/orders?${filter}`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(sbPayload)
    }).catch(e => console.warn('[Supabase Order Update Warning]:', e.message));
  } catch (e: any) {
    console.warn('[Supabase Order Update Exception]:', e.message);
  }

  res.json({ success: true, message: 'Order updated successfully', order: orders[orderIndex] });
};

app.patch('/api/orders/:id/status', updateOrderHandler);
app.patch('/api/orders/:id', updateOrderHandler);
app.put('/api/orders/:id', updateOrderHandler);

// DELETE Order
app.delete('/api/orders/:id', (req, res) => {
  const id = req.params.id;
  orders = loadOrders();
  const target = orders.find(o => String(o.id) === String(id) || String(o.order_number) === String(id));
  orders = orders.filter(o => String(o.id) !== String(id) && String(o.order_number) !== String(id));
  saveOrders(orders);

  // Dual-sync delete from Supabase
  try {
    const orderNum = target ? target.order_number : id;
    fetch(`${SUPABASE_URL}/rest/v1/orders?order_id=eq.${orderNum}`, {
      method: 'DELETE',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    }).catch(e => console.warn('[Supabase Order Delete Note]:', e.message));
  } catch {}

  res.json({ success: true, message: 'Order deleted successfully' });
});

// POST 1-Click Initial Sync: Seed local products & categories to Supabase
app.post('/api/admin/supabase-seed', async (req, res) => {
  try {
    products = loadProducts();
    categories = loadCategories();
    let catCount = 0;
    let prodCount = 0;
    const errors: string[] = [];

    // Seed categories
    for (const c of categories) {
      try {
        const catRes = await fetch(`${SUPABASE_URL}/rest/v1/categories`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal'
          },
          body: JSON.stringify({
            name: c.name,
            slug: c.slug,
            icon: c.icon || '🕌',
            image_url: c.image_url || '',
            sort_order: Number(c.sort_order || 0),
            created_at: new Date().toISOString()
          })
        });
        if (catRes.ok) catCount++;
        else errors.push(`Category "${c.name}": ${await catRes.text()}`);
      } catch (err: any) {
        errors.push(`Category "${c.name}": ${err.message}`);
      }
    }

    // Seed products
    for (const p of products) {
      try {
        const prodRes = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal'
          },
          body: JSON.stringify({
            category_id: p.category_id,
            category_name: p.category_name,
            name: p.name,
            slug: p.slug,
            price: p.price,
            old_price: p.old_price || null,
            weight_grams: p.weight_grams,
            size_dimensions: p.size_dimensions,
            material: p.material,
            stock: p.stock,
            badge: p.badge || null,
            featured: p.featured,
            image_url: p.image_url,
            description: p.description,
            bangla_short_desc: p.bangla_short_desc,
            qualities: p.qualities,
            sizes: p.sizes,
            created_at: new Date().toISOString()
          })
        });
        if (prodRes.ok) prodCount++;
        else errors.push(`Product "${p.name}": ${await prodRes.text()}`);
      } catch (err: any) {
        errors.push(`Product "${p.name}": ${err.message}`);
      }
    }

    res.json({
      success: errors.length === 0,
      categories_synced: catCount,
      products_synced: prodCount,
      errors
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// EXPORT ENDPOINT FOR MYSQL / WORDPRESS INTEGRATION
app.get('/api/export/sql', (req, res) => {
  const sqlContent = `
-- UNEX AURA - Database Schema & Sample Data
-- Laser-Cut Stainless Steel Wall Decor E-Commerce

CREATE DATABASE IF NOT EXISTS unexaura CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE unexaura;

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  icon VARCHAR(50) DEFAULT '✨',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  old_price DECIMAL(10,2) DEFAULT NULL,
  image_url TEXT NOT NULL,
  badge ENUM('NEW','HOT','SALE','') DEFAULT '',
  stock INT DEFAULT 10,
  featured TINYINT(1) DEFAULT 0,
  weight_grams INT NOT NULL DEFAULT 1000,
  size_dimensions VARCHAR(100) DEFAULT '80cm x 40cm x 2mm',
  material VARCHAR(100) DEFAULT 'Surgical Stainless Steel',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Product Placements ("See It On Your Wall")
CREATE TABLE IF NOT EXISTS product_placements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  image_url TEXT NOT NULL,
  room_type ENUM('Living Room','Bedroom','Hallway','Office','Formations') NOT NULL,
  caption TEXT,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Delivery Rates Table
CREATE TABLE IF NOT EXISTS delivery_rates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  zone ENUM('dhaka','outside_dhaka') NOT NULL UNIQUE,
  base_charge DECIMAL(10,2) NOT NULL,
  per_100g_charge DECIMAL(10,2) NOT NULL
);

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert Default Settings & Rates
INSERT INTO settings (setting_key, setting_value) VALUES
  ('active_currency', 'BDT'),
  ('stripe_publishable_key', 'pk_test_REPLACE_WITH_YOUR_KEY'),
  ('stripe_secret_key', 'sk_test_REPLACE_WITH_YOUR_KEY'),
  ('free_shipping_threshold_dhaka', '3000')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

INSERT INTO delivery_rates (zone, base_charge, per_100g_charge) VALUES
  ('dhaka', 60.00, 5.00),
  ('outside_dhaka', 120.00, 8.00)
ON DUPLICATE KEY UPDATE base_charge = VALUES(base_charge), per_100g_charge = VALUES(per_100g_charge);
`;

  res.setHeader('Content-Type', 'text/plain');
  res.send(sqlContent);
});

// START SERVER / VITE MIDDLEWARE
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const htmlFile = path.join(distPath, 'index.html');
      if (fs.existsSync(htmlFile)) {
        res.sendFile(htmlFile);
      } else {
        res.status(404).send('Application built index.html not found at ' + htmlFile);
      }
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`UNEX AURA Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
