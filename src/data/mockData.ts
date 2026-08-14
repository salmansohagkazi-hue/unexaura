import { Category, Product, CurrencyConfig, StoreSettings, Review, Coupon } from '../types';

const catIslamicWallDecorCombo = '/images/cat_islamic_combo_v2.jpg';
const catIslamicSurah = '/images/cat_islamic_surah_v2.jpg';
const catIslamicDua = '/images/cat_islamic_dua_1785842836270.jpg';
const catNaturalDesignCombo = '/images/cat_natural_design_combo_1785842861287.jpg';
const catNaturalDesign = '/images/cat_natural_design_1785842881586.jpg';

export const CURRENCIES: CurrencyConfig[] = [
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', rate: 1.0 },
];

export const INITIAL_SETTINGS: StoreSettings = {
  active_currency: 'BDT',
  stripe_publishable_key: 'pk_test_UNEXAURA_DEMO_KEY_51234567890',
  stripe_secret_key: 'sk_test_UNEXAURA_DEMO_SECRET_9876543210',
  free_shipping_threshold_dhaka: 3000,
  base_charge_dhaka: 80,
  per_100g_dhaka: 10,
  base_charge_outside: 130,
  per_100g_outside: 15,
  promo_video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  hero_banner_image: catIslamicWallDecorCombo,
  best_deal_product_id: 1,
  admin_password: 'admin123',
  google_sheet_id: '1YyeLB14VCribl9J2qHnD5Ac8Za0tk0c_rG4CGJWzoxA',
  google_sheet_url: 'https://docs.google.com/spreadsheets/d/1YyeLB14VCribl9J2qHnD5Ac8Za0tk0c_rG4CGJWzoxA/edit?usp=drivesdk',
  google_sheet_autosync_enabled: true
};

export const INITIAL_COUPONS: Coupon[] = [
  { id: 1, code: 'OFFER10', discount_percentage: 10, is_active: true },
  { id: 2, code: 'SPECIAL15', discount_percentage: 15, is_active: true }
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: 'Islamic Wall Decor Combo', slug: 'islamic-wall-decor-combo', icon: '🕌', image_url: catIslamicWallDecorCombo, sort_order: 1, item_count: 3 },
  { id: 2, name: 'Islamic Surah', slug: 'islamic-surah', icon: '📖', image_url: catIslamicSurah, sort_order: 2, item_count: 4 },
  { id: 3, name: 'Islamic Dua', slug: 'islamic-dua', icon: '🤲', image_url: catIslamicDua, sort_order: 3, item_count: 3 },
  { id: 4, name: 'Natural Design Combo', slug: 'natural-design-combo', icon: '🌿', image_url: catNaturalDesignCombo, sort_order: 4, item_count: 3 },
  { id: 5, name: 'Natural Design', slug: 'natural-design', icon: '🍃', image_url: catNaturalDesign, sort_order: 5, item_count: 3 },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    category_id: 2,
    category_name: 'Islamic Surah',
    name: 'Ayatul Kursi Regal 3D Stainless Steel Wall Art',
    slug: 'ayatul-kursi-regal-3d-stainless-steel',
    description: 'Precision laser-cut surgical-grade stainless steel featuring intricate Thuluth calligraphy of Ayatul Kursi. Electro-coated in luxurious metallic satin finish with rust-proof durability. Mounts floating 1 inch off the wall for captivating 3D shadow depth.',
    bangla_short_desc: 'আয়াতুল কুরসি সুসংগত ক্যালিগ্রাফিতে খোদাইকৃত খাঁটি সার্জিক্যাল স্টেইনলেস স্টিল ওয়াল আর্ট। ঘরকে দেবে রাজকীয় ও আধ্যাত্মিক আবহ।',
    qualities: [
      '১০০% খাঁটি সার্জিক্যাল স্টেইনলেস স্টিল - মরিচা পড়া বা রঙ চটে যাওয়ার কোনো সম্ভাবনা নেই।',
      'প্রিসিশন ফাইবার লেজার কাটিং - প্রতিটি হরফ ও ডিজাইন অত্যন্ত নিখুঁত ও মসৃণ।',
      '৩ডি ফ্লোটিং শ্যাডো লুক - দেয়াল থেকে ১ ইঞ্চি সামনে ভেসে থাকে যা দৃষ্টিনন্দন ছায়া তৈরি করে।',
      'লাক্সারি স্যাটিন মেটালিক ফিনিশিং - ড্রয়িং রুম, লিভিং রুম বা বেডরুমের জন্য দারুণ মানানসই।',
      'সহজ ইনস্টলেশন - সাথে থাকছে ফ্রি ৩ডি স্পেসার এবং ওয়াল হ্যাঙ্গিং কিট।'
    ],
    price: 5500,
    old_price: 6800,
    image_url: catIslamicSurah,
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    badge: 'HOT',
    stock: 18,
    featured: true,
    weight_grams: 1400,
    size_dimensions: '75cm × 40cm × 2mm',
    sizes: [
      { id: 'medium', name: 'Medium (2.5 Feet / 75x40cm)', size_dimensions: '75cm × 40cm × 2mm', price: 5500, old_price: 6800, weight_grams: 1400 },
      { id: 'large', name: 'Large (4 Feet / 120x60cm)', size_dimensions: '120cm × 60cm × 2mm', price: 7500, old_price: 9200, weight_grams: 2200 }
    ],
    material: 'Surgical Stainless Steel (2mm Thickness)',
    rating: 4.9,
    review_count: 48,
    placements: [
      { id: 101, product_id: 1, image_url: catIslamicSurah, room_type: 'Living Room', caption: 'Mounted above modern leather sofa in living room with warm mood spotlighting', sort_order: 1 },
      { id: 102, product_id: 1, image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80', room_type: 'Bedroom', caption: 'Centered over upholstered master bedroom headboard', sort_order: 2 },
      { id: 103, product_id: 1, image_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80', room_type: 'Hallway', caption: 'Entrance hallway focal wall accent', sort_order: 3 },
      { id: 104, product_id: 1, image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80', room_type: 'Office', caption: 'Executive office desk backdrop setup', sort_order: 4 },
    ]
  },
  {
    id: 2,
    category_id: 1,
    category_name: 'Islamic Wall Decor Combo',
    name: 'Surah Al-Ikhlas, Al-Falaq & An-Nas 3-Piece Set',
    slug: 'surah-3-piece-4-qul-combo',
    description: 'Harmonious trio of the iconic protective Surahs. Laser-crafted in solid brushed stainless steel with anti-scratch coating. Comes with pre-drilled floating wall spacers for seamless mounting in horizontal row, staggered cluster, or vertical stack.',
    bangla_short_desc: 'সূরা ইখলাস, সূরা ফালাক ও সূরা নাস - পবিত্র তিন সুরার ৩-পিস প্রিমিয়াম মেটাল ওয়াল আর্ট সেট।',
    qualities: [
      'প্রিমিয়াম সার্জিক্যাল মেটাল - আজীবন স্থায়িত্বের লাইফটাইম কালার গ্যারান্টি।',
      '৩-পিস ফ্লেক্সিবল লেআউট - পাশাপাশি, উপরে-নিচে বা ডায়াগনাল সাজানোর সুবিধা।',
      'এন্টি-স্ক্র্যাচ মেটালিক ড্রাই পাউডার কোটিং।',
      'প্রোটেক্টিভ সুরা সেট - ঘরের প্রবেশদ্বার বা ড্রয়িং রুমের প্রধান আকর্ষণে পারফেক্ট।',
      'প্যাকেটে থাকছে ফ্রি স্ক্রু ও ৩ডি ডিসটেন্স ওয়াল মাউন্টিং কিট।'
    ],
    price: 6900,
    old_price: 8500,
    image_url: catIslamicWallDecorCombo,
    badge: 'NEW',
    stock: 12,
    featured: true,
    weight_grams: 1800,
    size_dimensions: '35cm × 35cm each panel (3 panels)',
    sizes: [
      { id: 'medium', name: 'Medium (35x35cm 3-Pcs)', size_dimensions: '35cm × 35cm each', price: 6900, old_price: 8500, weight_grams: 1800 },
      { id: 'large', name: 'Large (45x45cm 3-Pcs)', size_dimensions: '45cm × 45cm each', price: 8900, old_price: 10500, weight_grams: 2800 }
    ],
    material: 'Surgical Stainless Steel, Matte Satin Finish',
    rating: 5.0,
    review_count: 32,
    placements: [
      { id: 201, product_id: 2, image_url: catIslamicWallDecorCombo, room_type: 'Living Room', caption: 'Arranged in 3-panel horizontal row over living room credenza', sort_order: 1 },
      { id: 202, product_id: 2, image_url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80', room_type: 'Formations', caption: 'Formation Options: Straight Row (135cm total), Staggered Cascade, or Triangular Cluster', sort_order: 2 },
      { id: 203, product_id: 2, image_url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80', room_type: 'Hallway', caption: 'Staggered cascade alignment in gallery hallway', sort_order: 3 },
    ]
  },
  {
    id: 3,
    category_id: 2,
    category_name: 'Islamic Surah',
    name: 'Surah Ar-Rahman "Fabi-ayyi ala-i Rabbikuma" Circular Crest',
    slug: 'surah-ar-rahman-circular-crest',
    description: 'Circular metallic masterpiece depicting the celebrated verse from Surah Ar-Rahman. Precision laser-etched with intricate floral arabesque motifs surrounding the center script.',
    bangla_short_desc: 'সূরা আর-রহমানের বিখ্যাত আয়াত "ফাবি আইয়্যি আলা-ই রব্বিকুমা তুকাজ্জিবান" গোলাকার অনন্য মেটাল ফ্রেম আর্ট।',
    qualities: [
      'সার্জিক্যাল প্রিমিয়াম স্টিল কাটিং - জং বা মরিচারোধী ওয়াটারপ্রুফ মেটাল।',
      'সার্কুলার গ্লাস গোল্ড মেটালিক থিম - ঘরের আভিজাত্য বাড়াতে অনন্য।',
      'হাই-প্রিন্ট ফাইবার লেজার কোটিং - দীর্ঘস্থায়ী উজ্জ্বল রঙ।',
      'সহজ ও নিরাপদ ওয়াল মাউন্টিং সিস্টেম।'
    ],
    price: 5200,
    old_price: 6200,
    image_url: catIslamicSurah,
    badge: 'SALE',
    stock: 25,
    featured: true,
    weight_grams: 1300,
    size_dimensions: '55cm Diameter × 2mm',
    sizes: [
      { id: 'medium', name: 'Medium (55cm Diameter)', size_dimensions: '55cm Diameter × 2mm', price: 5200, old_price: 6200, weight_grams: 1300 },
      { id: 'large', name: 'Large (75cm Diameter)', size_dimensions: '75cm Diameter × 2mm', price: 6800, old_price: 7800, weight_grams: 1900 }
    ],
    material: 'Laser-Cut Surgical Stainless Steel',
    rating: 4.8,
    review_count: 29,
    placements: [
      { id: 301, product_id: 3, image_url: catIslamicSurah, room_type: 'Living Room', caption: 'Centered over dining table area', sort_order: 1 },
      { id: 302, product_id: 3, image_url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80', room_type: 'Bedroom', caption: 'Accent piece on bedroom feature wall', sort_order: 2 },
    ]
  },
  {
    id: 4,
    category_id: 3,
    category_name: 'Islamic Dua',
    name: 'Ya Allah Bless Our Home Entrance Dua Modern Metal Plaque',
    slug: 'barakah-entrance-dua-bismillah',
    description: 'A welcoming blessing for your entryway. Features "Ya Allah Bless Our Home" in flowing modern cursive script with rust-resistant electroplate coating.',
    bangla_short_desc: 'বাসা বা অফিসের প্রবেশদ্বারের জন্য ইয়া আল্লাহ ব্লেস আওয়ার হোম ক্যালিগ্রাফি মেটাল প্লেট।',
    qualities: [
      'প্রবেশদ্বারে বারাকাহ ও বরকতের প্রতীক।',
      'প্রিমিয়াম মেটালিক চারকোল ব্ল্যাক / গোল্ড কালার ফিনিশ।',
      'মরিচারোধক স্টেইনলেস স্টিল স্ট্রাকচার।',
      'যেকোনো ওয়ালে ১ মিনিটেই মাউন্টযোগ্য।'
    ],
    price: 3400,
    old_price: 4000,
    image_url: catIslamicDua,
    badge: '',
    stock: 30,
    featured: false,
    weight_grams: 800,
    size_dimensions: '60cm × 25cm × 2mm',
    sizes: [
      { id: 'medium', name: 'Medium (60cm × 25cm)', size_dimensions: '60cm × 25cm × 2mm', price: 3400, old_price: 4000, weight_grams: 800 },
      { id: 'large', name: 'Large (90cm × 35cm)', size_dimensions: '90cm × 35cm × 2mm', price: 4500, old_price: 5200, weight_grams: 1200 }
    ],
    material: 'Surgical Stainless Steel, Charcoal Black Tint',
    rating: 4.7,
    review_count: 19,
    placements: [
      { id: 401, product_id: 4, image_url: catIslamicDua, room_type: 'Hallway', caption: 'Entrance foyer above shoe console', sort_order: 1 },
    ]
  },
  {
    id: 5,
    category_id: 4,
    category_name: 'Natural Design Combo',
    name: 'Botanical Floral Trio 3-Panel Laser-Cut Set',
    slug: 'botanical-tree-of-life-3-panel',
    description: 'Exquisite 3-panel laser-cut silhouette depicting a Rose, Daisy, and Calla Lily. Blends organic natural floral beauty with modern industrial luxury. Made of heavy-duty stainless steel.',
    bangla_short_desc: 'প্রকৃতির গোলাপ, ডেইজি ও লিলি ফুলের থিমের ৩-পিস আধুনিক মেটাল ওয়াল আর্ট কম্বো।',
    qualities: [
      'অনিক্স চারকোল ব্লাক মেটালিক ফিনিশ।',
      '৩টি প্যানেলের মাধ্যমে আধুনিক লিভিং রুমের পূর্ণাঙ্গ ওয়াল ডেকর।',
      'প্রিমিয়াম লেজার কাটিং স্টেইনলেস মেটাল।',
      'ওয়াটারপ্রুফ ও সহজে পরিষ্কারযোগ্য।'
    ],
    price: 7400,
    old_price: 9000,
    image_url: catNaturalDesignCombo,
    badge: 'HOT',
    stock: 8,
    featured: true,
    weight_grams: 2100,
    size_dimensions: '100cm × 50cm total',
    sizes: [
      { id: 'medium', name: 'Medium (100x50cm 3-Pcs)', size_dimensions: '100cm × 50cm total', price: 7400, old_price: 9000, weight_grams: 2100 },
      { id: 'large', name: 'Large (140x70cm 3-Pcs)', size_dimensions: '140cm × 70cm total', price: 9500, old_price: 11500, weight_grams: 3100 }
    ],
    material: 'Surgical Stainless Steel, Onyx Charcoal Finish',
    rating: 4.9,
    review_count: 41,
    placements: [
      { id: 501, product_id: 5, image_url: catNaturalDesignCombo, room_type: 'Living Room', caption: 'Full wall spanning above living room sectionals', sort_order: 1 },
      { id: 502, product_id: 5, image_url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80', room_type: 'Formations', caption: 'Tight 2cm spacing formation vs wide 5cm spacing layout', sort_order: 2 },
    ]
  },
  {
    id: 6,
    category_id: 5,
    category_name: 'Natural Design',
    name: 'Romantic Couple Under Tree Lantern 2-Piece Wall Art',
    slug: 'ginkgo-biloba-golden-leaf-trio',
    description: 'Sculptural 2-piece metal wall art displaying a silhouette of a romantic couple holding hands beneath a lush tree with hanging lanterns.',
    bangla_short_desc: 'রোমান্টিক কাপল উইথ ট্রি এন্ড হার্ট লণ্ঠন ২-পিস মেটাল ওয়াল একসেন্ট - সুন্দর রুম সজ্জার জন্য।',
    qualities: [
      'হ্যান্ড-ফিনিশড চারকোল সিলুয়েট টেক্সচার।',
      'প্রিমিয়াম সার্জিক্যাল মেটাল বডি।',
      'বেডরুম বা ওয়েটিং রুমের দেয়ালে অসাধারণ মানায়।'
    ],
    price: 4400,
    old_price: 5200,
    image_url: catNaturalDesign,
    badge: 'NEW',
    stock: 20,
    featured: true,
    weight_grams: 1100,
    size_dimensions: '60cm × 40cm × 2mm',
    sizes: [
      { id: 'medium', name: 'Medium (60cm × 40cm)', size_dimensions: '60cm × 40cm × 2mm', price: 4400, old_price: 5200, weight_grams: 1100 },
      { id: 'large', name: 'Large (80cm × 50cm)', size_dimensions: '80cm × 50cm × 2mm', price: 5800, old_price: 6800, weight_grams: 1600 }
    ],
    material: 'Stainless Steel, Matte Black Finish',
    rating: 4.8,
    review_count: 22,
    placements: [
      { id: 601, product_id: 6, image_url: catNaturalDesign, room_type: 'Bedroom', caption: 'Above bed nightstand accent wall', sort_order: 1 },
    ]
  }
];

export const INITIAL_TESTIMONIALS: Review[] = [
  {
    id: 1,
    user_name: 'Tanvir Hossain',
    rating: 5,
    comment: 'SubhanAllah, the Ayatul Kursi art is breathtaking in person! The "See It On Your Wall" preview photos gave me full confidence before ordering. The metal quality is heavy, 3D floating effect is perfection.',
    date: '2026-07-28',
    location: 'Gulshan, Dhaka',
    avatar: 'TH'
  },
  {
    id: 2,
    user_name: 'Nusrat Jahan',
    rating: 5,
    comment: 'Ordered the 3-piece 4 Qul combo for our new apartment in Uttara. It came impeccably packed with zero scratches. The weight-based delivery charge was very fair and fast delivery!',
    date: '2026-07-20',
    location: 'Uttara, Dhaka',
    avatar: 'NJ'
  },
  {
    id: 3,
    user_name: 'Mahmudur Rahman',
    rating: 5,
    comment: 'Superb craftsmanship! Stainless steel with precise laser cuts. Highly recommend UNEX AURA if you want premium Islamic home decor.',
    date: '2026-07-15',
    location: 'Chittagong',
    avatar: 'MR'
  }
];
