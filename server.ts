import express from 'express';
import path from 'path';
import fs from 'fs';
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
    delivery_charge: 0, // free shipping threshold met (>3000 BDT)
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

// Helper to load orders from disk
function loadOrders(): any[] {
  try {
    if (fs.existsSync(ORDERS_FILE_PATH)) {
      const content = fs.readFileSync(ORDERS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load orders from orders_db.json:', e);
  }
  return [...INITIAL_ORDERS];
}

// Helper to save orders to disk
function saveOrders(ordersList: any[]) {
  try {
    fs.writeFileSync(ORDERS_FILE_PATH, JSON.stringify(ordersList, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save orders to orders_db.json:', e);
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

// In-memory data store initialized with defaults & file persistence
let products = [...INITIAL_PRODUCTS];
let categories = [...INITIAL_CATEGORIES];
let settings = { ...INITIAL_SETTINGS };
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

// API ROUTES

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', store: 'UNEX AURA', time: new Date().toISOString() });
});

// GET products
app.get('/api/products', (req, res) => {
  const { cat, search, sort, badge, min_price, max_price } = req.query;
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
  res.json({ success: true, message: 'Product created successfully', product: newProduct });
});

// DELETE Product
app.delete('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  products = products.filter(p => p.id !== id);
  res.json({ success: true, message: 'Product deleted' });
});

// GET Categories
app.get('/api/categories', (req, res) => {
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
  res.json({ success: true, message: 'New category created successfully', category: newCat });
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
  res.json({ success: true, message: 'Settings saved successfully', settings });
});

// POST Create Order
app.post('/api/orders', (req, res) => {
  const { user_name, user_email, user_phone, shipping_address, city, delivery_zone, payment_method, order_notes, items } = req.body;

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

  // Automatically decrease product stock for each ordered item
  orderItems.forEach((item: any) => {
    const prodIndex = products.findIndex(p => p.id === Number(item.product_id));
    if (prodIndex !== -1) {
      const currentStock = Number(products[prodIndex].stock || 0);
      products[prodIndex].stock = Math.max(0, currentStock - Number(item.quantity || 1));
    }
  });

  res.json({
    success: true,
    message: 'Order placed successfully!',
    order: newOrder
  });
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

// GET Orders
app.get('/api/orders', (req, res) => {
  orders = loadOrders();
  res.json({ success: true, count: orders.length, orders });
});

// UPDATE Order Status or Details (supports PUT /api/orders/:id, PATCH /api/orders/:id, PATCH /api/orders/:id/status)
const updateOrderHandler = (req: any, res: any) => {
  orders = loadOrders();
  const id = Number(req.params.id) || req.params.id;
  const { status, payment_status, courier_name, tracking_number } = req.body;

  const orderIndex = orders.findIndex(o => String(o.id) === String(id) || String(o.order_number) === String(id));
  if (orderIndex === -1) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  if (status) orders[orderIndex].status = status;
  if (payment_status) orders[orderIndex].payment_status = payment_status;
  if (courier_name) orders[orderIndex].courier_name = courier_name;
  if (tracking_number) orders[orderIndex].tracking_number = tracking_number;

  saveOrders(orders);

  res.json({ success: true, message: 'Order updated successfully', order: orders[orderIndex] });
};

app.patch('/api/orders/:id/status', updateOrderHandler);
app.patch('/api/orders/:id', updateOrderHandler);
app.put('/api/orders/:id', updateOrderHandler);

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
