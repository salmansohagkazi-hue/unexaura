export interface ProductSize {
  id: string; // 'standard' | 'large'
  name: string; // e.g. "মিডিয়াম (Standard: 24" x 16")"
  size_dimensions: string; // e.g. "60cm x 40cm"
  price: number; // e.g. 2950
  old_price?: number; // e.g. 3950
  weight_grams: number; // e.g. 900
}

export interface Product {
  id: number;
  category_id: number;
  category_name?: string;
  name: string;
  slug: string;
  description: string;
  price: number; // stored in BDT (base / default size)
  old_price?: number;
  image_url: string;
  video_url?: string; // product video URL
  badge?: 'NEW' | 'HOT' | 'SALE' | '';
  stock: number;
  featured: boolean;
  weight_grams: number;
  size_dimensions: string; // e.g., "120cm x 60cm x 2mm"
  sizes?: ProductSize[]; // 2 size options for each product
  material: string; // e.g., "Surgical Stainless Steel, 2mm"
  bangla_short_desc?: string;
  qualities?: string[];
  created_at?: string;
  placements?: Placement[];
  rating?: number;
  review_count?: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  image_url?: string;
  sort_order: number;
  item_count?: number;
  created_at?: string;
}

export interface Placement {
  id: number;
  product_id: number;
  image_url: string;
  room_type: 'Living Room' | 'Bedroom' | 'Hallway' | 'Office' | 'Formations';
  caption: string;
  sort_order: number;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  avatar: string;
  role: 'member' | 'admin' | 'super_admin';
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: ProductSize;
}

export interface OrderItem {
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
  image_url: string;
  weight_grams: number;
  selected_size_name?: string;
}

export interface Coupon {
  id: number;
  code: string; // e.g. "UNEX10"
  discount_percentage: number; // e.g. 10 for 10%
  is_active: boolean;
  created_at?: string;
}

export interface TrackingStage {
  stage: string;
  timestamp: string;
  location: string;
  details: string;
  completed: boolean;
  current?: boolean;
}

export interface Order {
  id: number;
  order_number: string;
  user_id?: number | null;
  user_name: string;
  user_email: string;
  user_phone: string;
  shipping_address: string;
  city: string;
  delivery_zone: 'dhaka' | 'outside_dhaka';
  total_weight_grams: number;
  delivery_charge: number;
  subtotal_amount: number;
  total_amount: number;
  discount_amount?: number;
  coupon_code?: string;
  payment_method: 'cod' | 'bkash' | 'nagad' | 'stripe';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  stripe_session_id?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  items: OrderItem[];
  order_notes?: string;
  tracking_number?: string;
  courier_name?: string;
  courier_phone?: string;
  estimated_delivery?: string;
  tracking_history?: TrackingStage[];
}

export interface CurrencyConfig {
  code: 'BDT' | 'USD' | 'GBP' | 'EUR' | 'SAR' | 'AED' | 'MYR' | 'INR';
  symbol: string;
  name: string;
  rate: number; // conversion factor relative to BDT (1 BDT = rate in target currency)
}

export interface StoreSettings {
  active_currency: CurrencyConfig['code'];
  stripe_publishable_key: string;
  stripe_secret_key: string;
  free_shipping_threshold_dhaka: number;
  base_charge_dhaka: number;
  per_100g_dhaka: number;
  base_charge_outside: number;
  per_100g_outside: number;
  promo_video_url?: string;
  hero_banner_image?: string;
  admin_password?: string;
}

export interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  date: string;
  location: string;
  avatar: string;
}
