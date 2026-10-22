import { createClient } from '@supabase/supabase-js';

// Supabase project credentials provided by user
export const SUPABASE_PROJECT_ID = 'vweyqbvhvuwiprtnygbj';
export const SUPABASE_URL =
  (import.meta.env?.VITE_SUPABASE_URL as string) ||
  `https://${SUPABASE_PROJECT_ID}.supabase.co`;

// Publishable (anon) API key safe for client-side usage
export const SUPABASE_ANON_KEY =
  (import.meta.env?.VITE_SUPABASE_ANON_KEY as string) ||
  'sb_publishable_bUXfOrljoYtQB_3w7F3ARg_3oJwUb6T';

// Create and export the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  authHealthStatus: number;
  authVersion?: string;
  projectId: string;
  tablesFound?: string[];
  tablesMissing?: string[];
  timestamp: string;
}

/**
 * Tests connectivity to the user's Supabase backend
 */
export async function testSupabaseConnection(): Promise<ConnectionTestResult> {
  const timestamp = new Date().toISOString();
  try {
    // 1. Check Auth / GoTrue Health endpoint
    const healthRes = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
      },
    });

    let authVersion = '';
    if (healthRes.ok) {
      try {
        const data = await healthRes.json();
        authVersion = data.version || 'v2.x';
      } catch {}
    }

    // 2. Check if main tables exist in schema cache
    const checkTables = ['orders', 'products', 'categories', 'profiles'];
    const tablesFound: string[] = [];
    const tablesMissing: string[] = [];

    await Promise.all(
      checkTables.map(async (table) => {
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&limit=1`, {
            method: 'GET',
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            },
          });
          if (res.status === 200) {
            tablesFound.push(table);
          } else if (res.status === 404) {
            tablesMissing.push(table);
          } else if (res.status === 401 || res.status === 403) {
            // Table exists but RLS requires policy
            tablesFound.push(table);
          }
        } catch {
          tablesMissing.push(table);
        }
      })
    );

    if (healthRes.ok) {
      return {
        success: true,
        message: 'Supabase প্রজেক্টের সঙ্গে সফলভাবে সংযোগ স্থাপিত হয়েছে।',
        authHealthStatus: healthRes.status,
        authVersion,
        projectId: SUPABASE_PROJECT_ID,
        tablesFound,
        tablesMissing,
        timestamp,
      };
    } else {
      return {
        success: false,
        message: `সার্ভার রেসপন্স কোড: ${healthRes.status}`,
        authHealthStatus: healthRes.status,
        projectId: SUPABASE_PROJECT_ID,
        tablesFound,
        tablesMissing,
        timestamp,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Supabase সার্ভারে সংযোগ করা সম্ভব হয়নি।',
      authHealthStatus: 0,
      projectId: SUPABASE_PROJECT_ID,
      timestamp,
    };
  }
}

/**
 * Saves a placed order into Supabase orders table
 */
export async function saveOrderToSupabase(order: any): Promise<{
  success: boolean;
  error?: string;
  data?: any;
}> {
  if (!order) return { success: false, error: 'No order data provided' };

  try {
    const supabasePayload = {
      order_id: String(order.order_number || order.id || `UA-${Date.now()}`),
      customer_name: String(order.user_name || order.customer_name || 'Customer'),
      customer_phone: String(order.user_phone || order.customer_phone || ''),
      customer_address: String(order.shipping_address || order.customer_address || ''),
      district: String(order.city || order.district || 'Dhaka'),
      delivery_zone: String(order.delivery_zone || 'dhaka'),
      items: Array.isArray(order.items) ? order.items : [],
      subtotal: Number(order.subtotal_amount || order.subtotal || 0),
      delivery_charge: Number(order.delivery_charge !== undefined ? order.delivery_charge : 70),
      discount: Number(order.discount_amount || order.discount || 0),
      total_price: Number(order.total_amount || order.total_price || 0),
      payment_method: String(order.payment_method || 'cod'),
      status: String(order.status || 'pending'),
      notes: String(order.order_notes || order.notes || ''),
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([supabasePayload])
      .select();

    if (error) {
      console.warn('[Supabase Insert Order Note]:', error.message);
      return { success: false, error: error.message };
    }

    console.log('[Supabase Order Successfully Saved]:', data);
    return { success: true, data };
  } catch (err: any) {
    console.warn('[Supabase saveOrder Exception]:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Fetches recent orders stored in Supabase with mapping to application Order type
 */
export async function fetchOrdersFromSupabase(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase fetchOrders Note]:', error.message);
      return [];
    }

    if (!Array.isArray(data)) return [];

    // Map Supabase rows to client Order structure
    return data.map((row) => ({
      id: row.id,
      order_number: row.order_id || `UA-${row.id}`,
      user_name: row.customer_name || 'Customer',
      user_phone: row.customer_phone || '',
      shipping_address: row.customer_address || '',
      city: row.district || 'Dhaka',
      delivery_zone: (row.delivery_zone || 'dhaka') as any,
      subtotal_amount: Number(row.subtotal || 0),
      delivery_charge: Number(row.delivery_charge || 0),
      discount_amount: Number(row.discount || 0),
      total_amount: Number(row.total_price || 0),
      payment_method: (row.payment_method || 'cod') as any,
      payment_status: row.payment_method === 'stripe' ? 'paid' : 'unpaid',
      status: (row.status || 'pending') as any,
      order_notes: row.notes || '',
      items: Array.isArray(row.items) ? row.items : [],
      created_at: row.created_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('[Supabase fetchOrders Exception]:', err);
    return [];
  }
}

/**
 * Updates order status in Supabase orders table
 */
export async function updateOrderStatusInSupabase(
  orderNumberOrId: string | number,
  status: string,
  paymentStatus?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const isNumeric = typeof orderNumberOrId === 'number' || /^\d+$/.test(String(orderNumberOrId));
    let query = supabase.from('orders').update({
      status,
      updated_at: new Date().toISOString(),
    });

    if (isNumeric) {
      query = query.or(`id.eq.${orderNumberOrId},order_id.eq.${orderNumberOrId},order_id.eq.UA-${orderNumberOrId}`);
    } else {
      query = query.eq('order_id', String(orderNumberOrId));
    }

    const { error } = await query;
    if (error) {
      console.warn('[Supabase updateOrderStatus Error]:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.warn('[Supabase updateOrderStatus Exception]:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Deletes an order from Supabase
 */
export async function deleteOrderFromSupabase(
  orderNumberOrId: string | number
): Promise<{ success: boolean; error?: string }> {
  try {
    const isNumeric = typeof orderNumberOrId === 'number' || /^\d+$/.test(String(orderNumberOrId));
    let query = supabase.from('orders').delete();

    if (isNumeric) {
      query = query.or(`id.eq.${orderNumberOrId},order_id.eq.${orderNumberOrId}`);
    } else {
      query = query.eq('order_id', String(orderNumberOrId));
    }

    const { error } = await query;
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ============================================================================
// PRODUCTS OPERATIONS
// ============================================================================

/**
 * Fetches all products from Supabase
 */
export async function fetchProductsFromSupabase(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn('[Supabase fetchProducts Note]:', error.message);
      return [];
    }

    if (!Array.isArray(data) || data.length === 0) return [];

    return data.map((row) => ({
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
      review_count: Number(row.review_count || 0),
    }));
  } catch (err) {
    console.warn('[Supabase fetchProducts Exception]:', err);
    return [];
  }
}

/**
 * Saves or updates a product in Supabase
 */
export async function saveProductToSupabase(product: any): Promise<{
  success: boolean;
  error?: string;
  data?: any;
}> {
  try {
    const payload: any = {
      category_id: Number(product.category_id || 1),
      category_name: product.category_name || 'Wall Decor',
      name: product.name,
      slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      price: Number(product.price || 0),
      old_price: product.old_price ? Number(product.old_price) : null,
      weight_grams: Number(product.weight_grams || 1200),
      stock: Number(product.stock !== undefined ? product.stock : 15),
      badge: product.badge || null,
      featured: Boolean(product.featured),
      image_url: product.image_url,
      material: product.material || 'Surgical Stainless Steel',
      thickness: product.thickness || '0.6 mm',
      size_dimensions: product.size_dimensions || '75cm × 40cm',
      description: product.description || '',
      bangla_short_desc: product.bangla_short_desc || '',
      qualities: Array.isArray(product.qualities) ? product.qualities : [],
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      room_images: product.room_images || {},
      updated_at: new Date().toISOString(),
    };

    if (product.id && Number(product.id) > 0) {
      payload.id = Number(product.id);
    }

    const { data, error } = await supabase
      .from('products')
      .upsert([payload], { onConflict: 'slug' })
      .select();

    if (error) {
      console.warn('[Supabase saveProduct Error]:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: any) {
    console.warn('[Supabase saveProduct Exception]:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Deletes a product from Supabase
 */
export async function deleteProductFromSupabase(
  productId: number | string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', Number(productId));

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Updates stock quantity for a single product in Supabase
 */
export async function updateProductStockInSupabase(
  productId: number | string,
  newStock: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('products')
      .update({
        stock: Math.max(0, Number(newStock)),
        updated_at: new Date().toISOString(),
      })
      .eq('id', Number(productId));

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ============================================================================
// CATEGORIES OPERATIONS
// ============================================================================

/**
 * Fetches all categories from Supabase
 */
export async function fetchCategoriesFromSupabase(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.warn('[Supabase fetchCategories Note]:', error.message);
      return [];
    }

    if (!Array.isArray(data) || data.length === 0) return [];

    return data.map((row) => ({
      id: Number(row.id),
      name: row.name,
      slug: row.slug,
      icon: row.icon || '🕌',
      image_url: row.image_url || '',
      sort_order: Number(row.sort_order || 0),
    }));
  } catch (err) {
    console.warn('[Supabase fetchCategories Exception]:', err);
    return [];
  }
}

/**
 * Saves or updates a category in Supabase
 */
export async function saveCategoryToSupabase(category: any): Promise<{
  success: boolean;
  error?: string;
  data?: any;
}> {
  try {
    const payload: any = {
      name: category.name,
      slug: category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      icon: category.icon || '🕌',
      image_url: category.image_url || '',
      sort_order: Number(category.sort_order || 0),
    };

    if (category.id && Number(category.id) > 0) {
      payload.id = Number(category.id);
    }

    const { data, error } = await supabase
      .from('categories')
      .upsert([payload], { onConflict: 'slug' })
      .select();

    if (error) {
      console.warn('[Supabase saveCategory Error]:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: any) {
    console.warn('[Supabase saveCategory Exception]:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Deletes a category from Supabase
 */
export async function deleteCategoryFromSupabase(
  categoryId: number | string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', Number(categoryId));

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 1-Click batch sync of initial/local products and categories to Supabase
 */
export async function syncAllLocalDataToSupabase(
  products: any[],
  categories: any[]
): Promise<{
  success: boolean;
  categoriesSynced: number;
  productsSynced: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let categoriesSynced = 0;
  let productsSynced = 0;

  // 1. Sync Categories first (due to foreign key reference)
  for (const cat of categories) {
    const res = await saveCategoryToSupabase(cat);
    if (res.success) {
      categoriesSynced++;
    } else if (res.error) {
      errors.push(`Category "${cat.name}": ${res.error}`);
    }
  }

  // 2. Sync Products
  for (const prod of products) {
    const res = await saveProductToSupabase(prod);
    if (res.success) {
      productsSynced++;
    } else if (res.error) {
      errors.push(`Product "${prod.name}": ${res.error}`);
    }
  }

  return {
    success: errors.length === 0,
    categoriesSynced,
    productsSynced,
    errors,
  };
}

