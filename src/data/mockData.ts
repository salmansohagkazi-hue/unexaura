import { Category, Product, CurrencyConfig, StoreSettings, Review, Coupon } from '../types';
const tasbihBlackImg = '/images/tasbih_black_color.jpg';
const blackWallartGeneralImg = '/images/black_wallart_general.jpg';

const catIslamicWallDecorCombo = 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786791620/catimage_Islamicwallcombo.png';
const catIslamicSurah = 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786792038/catimage_islamicsura.jpg';
const catIslamicDua = 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786791620/catimage_Islamicduya.png';
const catNaturalDesignCombo = 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786791620/catimage_naturalcombo.png';
const catNaturalDesign = 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786791620/catimage_naturaldesign.png';

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
  best_deal_product_id: 7,
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
  { id: 1, name: 'Islamic Wall Decor Combo', slug: 'islamic-wall-decor-combo', icon: '🕌', image_url: catIslamicWallDecorCombo, sort_order: 1, item_count: 6 },
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
  },
  {
    id: 7,
    category_id: 1,
    category_name: 'Islamic Wall Decor Combo',
    name: 'তাসবিহ গোল্ডেন স্টেইনলেস স্টিল ওয়াল আর্ট (সুবহানাল্লাহ, আলহামদুলিল্লাহ, আল্লাহু আকবার)',
    slug: 'tasbih-golden-stainless-steel-combo',
    description: 'সুবহানাল্লাহ, আলহামদুলিল্লাহ ও আল্লাহু আকবার লেখা তাসবিহ থিমের প্রিমিয়াম গোল্ডেন স্টেইনলেস স্টিল ওয়াল আর্ট। ইসলামিক সৌন্দর্য ও আভিজাত্যের সমন্বয়ে তৈরি এই ওয়াল ডেকোরটি ড্রয়িং রুম, বেডরুম, নামাজের ঘর বা অফিসের দেয়ালে একটি সুন্দর ও মার্জিত লুক এনে দেবে।',
    bangla_short_desc: 'সুবহানাল্লাহ, আলহামদুলিল্লাহ ও আল্লাহু আকবার লেখা তাসবিহ থিমের প্রিমিয়াম গোল্ডেন স্টেইনলেস স্টিল ওয়াল আর্ট। ইসলামিক সৌন্দর্য ও আভিজাত্যের সমন্বয়ে তৈরি এই ওয়াল ডেকোরটি ড্রয়িং রুম, বেডরুম, নামাজের ঘর বা অফিসের দেয়ালে একটি সুন্দর ও মার্জিত লুক এনে দেবে।',
    qualities: [
      '১০০% খাঁটি সার্জিক্যাল স্টেইনলেস স্টিল (0.6/0.8 mm Thickness) - মরিচা পড়া বা রঙ চটে যাওয়ার কোনো ঝুঁকি নেই।',
      'তাসবিহ থিম (সুবহানাল্লাহ, আলহামদুলিল্লাহ, আল্লাহু আকবার) - ইসলামিক সৌন্দর্য ও আভিজাত্যের অনন্য সমন্বয়।',
      '৩ডি ফ্লোটিং শ্যাডো লুক - দেয়াল থেকে ভেসে থাকে যা দৃষ্টিনন্দন আবহ তৈরি করে।',
      'ড্রয়িং রুম, বেডরুম, নামাজের ঘর বা অফিসের দেয়ালে মার্জিত লুক এনে দেয়।',
      'প্যাকেটে থাকছে প্রটেক্টিভ পার্সেল প্যাকেজিং এবং সহজ ওয়াল মাউন্টিং সুবিধা।'
    ],
    price: 1099,
    old_price: 1499,
    image_url: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771553/tajbih_drawingrm.jpg.jpg',
    room_images: {
      drawing_room: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771553/tajbih_drawingrm.jpg.jpg',
      black_color: tasbihBlackImg,
      office_room: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771559/tajbih_office.jpg.jpg',
      prayer_or_reading_room: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771557/tajbih_namajrm.jpg.jpg',
      bedroom: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771554/tajbih_bedroom.jpg.jpg'
    },
    badge: 'HOT',
    stock: 10,
    featured: true,
    weight_grams: 600,
    size_dimensions: '16 inch × 9 inch',
    sizes: [
      {
        id: 'medium',
        name: 'মিডিয়াম (16 inch × 9 inch)',
        size_dimensions: '16 inch × 9 inch',
        price: 1099,
        old_price: 1499,
        weight_grams: 600
      },
      {
        id: 'large',
        name: 'লার্জ (23 inch × 11 inch)',
        size_dimensions: '23 inch × 11 inch',
        price: 2099,
        old_price: 2899,
        weight_grams: 1000
      }
    ],
    material: 'Surgical Stainless Steel (0.6/0.8 mm Thickness)',
    thickness: '0.6/0.8 mm',
    // Black Color Variant
    black_price: 899,
    black_old_price: 1199,
    black_thickness: '3 mm (Matte Black Finish)',
    black_material: 'Matte Black Precision Laser-Cut (3 mm Thickness)',
    black_bangla_desc: 'সুবহানাল্লাহ, আলহামদুলিল্লাহ ও আল্লাহু আকবার খোদাইকৃত ৩ মিমি পুরুত্বের স্পেশাল ম্যাট ব্ল্যাক এডিশন তাসবিহ ওয়াল আর্ট। ডাস্ট-রেজিস্ট্যান্ট ব্ল্যাক ফিনিশিং যা সাদা বা যেকোনো উজ্জ্বল দেয়ালে নিয়ে আসে আকর্ষণীয় ও আধুনিক কনট্রাস্ট লুক। দেয়ালে লাগানোর জন্য থাকছে স্ট্রং ডাবল সাইড টেপ।',
    black_description: 'তাসবিহ ৩-পিস স্পেশাল ম্যাট ব্ল্যাক এডিশন ওয়াল আর্ট। ৩ মিমি হাই-কোয়ালিটি উপাদানে প্রিসিশন লেজার কাটিং করা এবং স্মুথ ম্যাট ব্ল্যাক কোটিং দেওয়া। যেকোনো ড্রয়িং রুম, অফিস রুম বা বেডরুমের দেয়ালে চমৎকার ফ্লোটিং ৩ডি শ্যাডো তৈরি করে।',
    black_qualities: [
      '৩ মিমি (3 mm) প্রিমিয়াম থিকনেস - অত্যন্ত মজবুত, স্ট্রং ও দীর্ঘস্থায়ী।',
      'প্রিমিয়াম ম্যাট ব্ল্যাক কোটিং - নো-গ্লেয়ার স্মুথ ফিনিশ যা যেকোনো দেয়ালে চমৎকার ফুটে ওঠে।',
      'তাসবিহ থিম (সুবহানাল্লাহ, আলহামদুলিল্লাহ, আল্লাহু আকবার) - ইসলামিক সৌন্দর্য ও আভিজাত্যের অনন্য সমন্বয়।',
      'দেওয়ালে লাগানোর জন্য শক্তিশালী ডাবল সাইড টেপ রয়েছে - কোনো ড্রিলিং ছাড়াই সহজে ঝুলানো যায়।',
      '৩ডি ফ্লোটিং ভিজ্যুয়াল শ্যাডো - দেয়ালে দারুণ আধুনিক আবহ তৈরি করে।'
    ],
    black_sizes: [
      {
        id: 'medium_black',
        name: 'মিডিয়াম (16 inch × 9 inch) - Black',
        size_dimensions: '16 inch × 9 inch',
        price: 899,
        old_price: 1199,
        weight_grams: 600
      },
      {
        id: 'large_black',
        name: 'লার্জ (23 inch × 11 inch) - Black',
        size_dimensions: '23 inch × 11 inch',
        price: 1599,
        old_price: 2199,
        weight_grams: 1000
      }
    ],
    rating: 5.0,
    review_count: 32,
    placements: [
      {
        id: 701,
        product_id: 7,
        image_url: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771553/tajbih_drawingrm.jpg.jpg',
        room_type: 'Living Room',
        caption: 'ড্রয়িং রুমে তাসবিহ গোল্ডেন ওয়াল আর্টের ৩ডি লুক',
        sort_order: 1
      },
      {
        id: 702,
        product_id: 7,
        image_url: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771559/tajbih_office.jpg.jpg',
        room_type: 'Office',
        caption: 'অফিস রুমে মার্জিত ও আধ্যাত্মিক আবহ',
        sort_order: 2
      },
      {
        id: 703,
        product_id: 7,
        image_url: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771557/tajbih_namajrm.jpg.jpg',
        room_type: 'Hallway',
        caption: 'নামাজের ঘরের দেয়ালে প্রশান্তিময় পরিবেশ',
        sort_order: 3
      },
      {
        id: 704,
        product_id: 7,
        image_url: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771554/tajbih_bedroom.jpg.jpg',
        room_type: 'Bedroom',
        caption: 'বেডরুমের মাস্টার হেডার ওয়ালে গোল্ডেন ফিনিশ',
        sort_order: 4
      }
    ]
  },
  {
    id: 8,
    category_id: 1,
    category_name: 'Islamic Wall Decor Combo',
    name: 'কালিমা শরীফ গোল্ডেন স্টেইনলেস স্টিল ওয়াল আর্ট | কাবা ও ইসলামিক আর্চ ডিজাইন',
    slug: 'kalima-sharif-golden-kaba-islamic-arch-wall-art',
    description: 'আভিজাত্যপূর্ণ গোল্ডেন ফিনিশে তৈরি কালিমা শরীফের প্রিমিয়াম ওয়াল আর্ট। কেন্দ্রীয় অংশে সুন্দর আরবি ক্যালিগ্রাফির সঙ্গে দুই পাশে কাবা ও ইসলামিক আর্চের নান্দনিক ডিজাইন রয়েছে। ঘরের দেয়ালে এটি একটি মার্জিত ও ইসলামিক পরিবেশ তৈরি করে। ড্রয়িং রুম, বেডরুম, নামাজের ঘর, অফিস বা রিডিং রুমের দেয়াল সাজানোর জন্য এটি দারুণ একটি পছন্দ।',
    bangla_short_desc: 'আভিজাত্যপূর্ণ গোল্ডেন ফিনিশে তৈরি কালিমা শরীফের প্রিমিয়াম ওয়াল আর্ট। কেন্দ্রীয় অংশে সুন্দর আরবি ক্যালিগ্রাফির সঙ্গে দুই পাশে কাবা ও ইসলামিক আর্চের নান্দনিক ডিজাইন রয়েছে। ঘরের দেয়ালে এটি একটি মার্জিত ও ইসলামিক পরিবেশ তৈরি করে। ড্রয়িং রুম, বেডরুম, নামাজের ঘর, অফিস বা রিডিং রুমের দেয়াল সাজানোর জন্য এটি দারুণ একটি পছন্দ।',
    qualities: [
      '১০০% খাঁটি সার্জিক্যাল স্টেইনলেস স্টিল (0.6 mm Thickness) - মরিচা পড়া বা রঙ চটে যাওয়ার কোনো ঝুঁকি নেই।',
      'কালিমা শরীফ, কাবা ও ইসলামিক আর্চের নান্দনিক ডিজাইন - ঘরকে দেবে বরকতময় ও রাজকীয় পরিবেশ।',
      '৩ডি ফ্লোটিং শ্যাডো লুক - দেয়াল থেকে ভেসে থাকে যা দৃষ্টিনন্দন সৌন্দর্য তৈরি করে।',
      'ড্রয়িং রুম, বেডরুম, নামাজের ঘর বা অফিসের দেয়াল সাজানোর জন্য দারুণ মানানসই।',
      'সহজ ও নিরাপদ ইনস্টলেশন - প্যাকেটের সাথে রয়েছে স্ট্রং ডাবল সাইড টেপ।'
    ],
    price: 1099,
    old_price: 1499,
    image_url: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771562/kalima_kaba_office.jpg.jpg',
    room_images: {
      drawing_room: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771562/kalima_kaba_office.jpg.jpg',
      black_color: blackWallartGeneralImg,
      office_room: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771561/kalima_kaba_drawingrm.jpg.jpg',
      prayer_or_reading_room: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771564/kalima_kaba_namaj.jpg.jpg',
      bedroom: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771560/kalima_kaba_bed.jpg.jpg'
    },
    badge: 'HOT',
    stock: 10,
    featured: true,
    weight_grams: 600,
    size_dimensions: '36 inch × 12 inch',
    sizes: [
      {
        id: 'medium',
        name: 'মিডিয়াম (36 inch × 12 inch)',
        size_dimensions: '36 inch × 12 inch',
        price: 1099,
        old_price: 1499,
        weight_grams: 600
      },
      {
        id: 'large',
        name: 'লার্জ (60 inch × 22 inch)',
        size_dimensions: '60 inch × 22 inch',
        price: 3499,
        old_price: 3999,
        weight_grams: 1500
      }
    ],
    material: 'Surgical Stainless Steel (0.6 mm Thickness)',
    thickness: '0.6 mm',
    // Black Color Variant
    black_price: 899,
    black_old_price: 1199,
    black_thickness: '3 mm (Matte Black Finish)',
    black_material: 'Matte Black Precision Laser-Cut (3 mm Thickness)',
    black_bangla_desc: 'কালিমা শরীফ, কাবা ও ইসলামিক আর্চ খোদাইকৃত ৩ মিমি পুরুত্বের স্পেশাল ম্যাট ব্ল্যাক এডিশন ওয়াল আর্ট। ডাস্ট-রেজিস্ট্যান্ট ব্ল্যাক ফিনিশিং যা সাদা বা যেকোনো উজ্জ্বল দেয়ালে নিয়ে আসে আকর্ষণীয় ও আধুনিক কনট্রাস্ট লুক। দেয়ালে লাগানোর জন্য থাকছে স্ট্রং ডাবল সাইড টেপ।',
    black_description: 'কালিমা শরীফ ও কাবা শরিফ আর্চ থিমের স্পেশাল ম্যাট ব্ল্যাক এডিশন ওয়াল আর্ট। ৩ মিমি হাই-কোয়ালিটি উপাদানে প্রিসিশন লেজার কাটিং করা এবং স্মুথ ম্যাট ব্ল্যাক কোটিং দেওয়া। যেকোনো ড্রয়িং রুম, অফিস রুম বা বেডরুমের দেয়ালে চমৎকার ফ্লোটিং ৩ডি শ্যাডো তৈরি করে।',
    black_qualities: [
      '৩ মিমি (3 mm) প্রিমিয়াম থিকনেস - অত্যন্ত মজবুত, স্ট্রং ও দীর্ঘস্থায়ী।',
      'প্রিমিয়াম ম্যাট ব্ল্যাক কোটিং - নো-গ্লেয়ার স্মুথ ফিনিশ যা যেকোনো দেয়ালে চমৎকার ফুটে ওঠে।',
      'কালিমা শরীফ ও কাবা আর্চ থিম - ইসলামিক সৌন্দর্য ও আভিজাত্যের অনন্য সমন্বয়।',
      'দেওয়ালে লাগানোর জন্য শক্তিশালী ডাবল সাইড টেপ রয়েছে - কোনো ড্রিলিং ছাড়াই সহজে ঝুলানো যায়।',
      '৩ডি ফ্লোটিং ভিজ্যুয়াল শ্যাডো - দেয়ালে দারুণ আধুনিক আবহ তৈরি করে।'
    ],
    black_sizes: [
      {
        id: 'medium_black',
        name: 'মিডিয়াম (36 inch × 12 inch) - Black',
        size_dimensions: '36 inch × 12 inch',
        price: 899,
        old_price: 1199,
        weight_grams: 600
      },
      {
        id: 'large_black',
        name: 'লার্জ (60 inch × 22 inch) - Black',
        size_dimensions: '60 inch × 22 inch',
        price: 2499,
        old_price: 2999,
        weight_grams: 1500
      }
    ],
    rating: 5.0,
    review_count: 24,
    placements: [
      {
        id: 801,
        product_id: 8,
        image_url: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771561/kalima_kaba_drawingrm.jpg.jpg',
        room_type: 'Living Room',
        caption: 'ড্রয়িং রুমে কালিমা শরীফ ও কাবা ডিজাইনের গোল্ডেন ওয়াল আর্ট',
        sort_order: 1
      },
      {
        id: 802,
        product_id: 8,
        image_url: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771562/kalima_kaba_office.jpg.jpg',
        room_type: 'Office',
        caption: 'অফিস রুমে আভিজাত্যপূর্ণ ও ইসলামিক আবহ',
        sort_order: 2
      },
      {
        id: 803,
        product_id: 8,
        image_url: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771564/kalima_kaba_namaj.jpg.jpg',
        room_type: 'Hallway',
        caption: 'নামাজের ঘরের দেয়াল সজ্জায় অনিন্দ্য সুন্দর রূপ',
        sort_order: 3
      },
      {
        id: 804,
        product_id: 8,
        image_url: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771560/kalima_kaba_bed.jpg.jpg',
        room_type: 'Bedroom',
        caption: 'বেডরুমে মার্জিত গোল্ডেন শাইন',
        sort_order: 4
      }
    ]
  },
  {
    id: 9,
    category_id: 1,
    category_name: 'Islamic Wall Decor Combo',
    name: 'কালিমা তাইয়্যেবা গোল্ডেন ইসলামিক ওয়াল আর্ট | প্রিমিয়াম আরবি ক্যালিগ্রাফি',
    slug: 'kalima-tayyiba-golden-islamic-wall-art',
    description: 'প্রিমিয়াম গোল্ডেন ফিনিশে তৈরি কালিমা তাইয়্যেবা ইসলামিক ওয়াল আর্ট। মাঝখানে সুন্দর আরবি ক্যালিগ্রাফির সঙ্গে দুই পাশে নান্দনিক ইসলামিক ডিজাইনের অলংকরণ রয়েছে, যা পুরো ওয়াল আর্টটিকে আরও আকর্ষণীয় ও আভিজাত্যপূর্ণ করে তুলেছে। ড্রয়িং রুম, বেডরুম, নামাজের ঘর, অফিস কিংবা রিডিং স্পেসের দেয়ালে এটি একটি সুন্দর ও শান্তিপূর্ণ ইসলামিক পরিবেশ তৈরি করবে। যারা ঘরের সৌন্দর্যের পাশাপাশি ইসলামিক আবহ রাখতে চান, তাদের জন্য এটি একটি চমৎকার ওয়াল ডেকোর।',
    bangla_short_desc: 'প্রিমিয়াম গোল্ডেন ফিনিশে তৈরি কালিমা তাইয়্যেবা ইসলামিক ওয়াল আর্ট। মাঝখানে সুন্দর আরবি ক্যালিগ্রাফির সঙ্গে দুই পাশে নান্দনিক ইসলামিক ডিজাইনের অলংকরণ রয়েছে, যা পুরো ওয়াল আর্টটিকে আরও আকর্ষণীয় ও আভিজাত্যপূর্ণ করে তুলেছে। ড্রয়িং রুম, বেডরুম, নামাজের ঘর, অফিস কিংবা রিডিং স্পেসের দেয়ালে এটি একটি সুন্দর ও শান্তিপূর্ণ ইসলামিক পরিবেশ তৈরি করবে। যারা ঘরের সৌন্দর্যের পাশাপাশি ইসলামিক আবহ রাখতে চান, তাদের জন্য এটি একটি চমৎকার ওয়াল ডেকোর।',
    qualities: [
      '১০০% খাঁটি সার্জিক্যাল স্টেইনলেস স্টিল (0.6mm Thickness) - মরিচা মুক্ত ও অত্যন্ত দীর্ঘস্থায়ী।',
      'কালিমা তাইয়্যেবা আরবি ক্যালিগ্রাফি ও ইসলামিক অলংকরণ - ঘরকে দেবে বরকতময় ও রাজকীয় পরিবেশ।',
      '৩ডি ফ্লোটিং শ্যাডো লুক - দেয়াল থেকে হালকা ভেসে থাকে যা দৃষ্টিনন্দন সৌন্দর্য তৈরি করে।',
      'ড্রয়িং রুম, বেডরুম, নামাজের ঘর বা অফিসের দেয়াল সাজানোর জন্য দারুণ পছন্দ।',
      'সহজ ও নিরাপদ ইনস্টলেশন - প্যাকেটের সাথে রয়েছে শক্তিশালী ডাবল সাইডেড টেপ।'
    ],
    price: 999,
    old_price: 1399,
    image_url: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771549/kalima_AM_drawingrm.jpg.jpg',
    room_images: {
      drawing_room: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771549/kalima_AM_drawingrm.jpg.jpg',
      office_room: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771552/kalima_AM_office.jpg.jpg',
      prayer_or_reading_room: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771550/kalima_AM_namaj.jpg.jpg',
      bedroom: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771548/kalima_AM_bed.jpg.jpg'
    },
    badge: 'NEW',
    stock: 5,
    featured: true,
    weight_grams: 500,
    size_dimensions: '38 inch × 7 inch',
    sizes: [
      {
        id: 'medium',
        name: 'মিডিয়াম (38 inch × 7 inch)',
        size_dimensions: '38 inch × 7 inch',
        price: 999,
        old_price: 1399,
        weight_grams: 500
      },
      {
        id: 'large',
        name: 'লার্জ (60 inch × 12 inch)',
        size_dimensions: '60 inch × 12 inch',
        price: 1799,
        old_price: 2199,
        weight_grams: 800
      }
    ],
    material: 'Surgical Stainless Steel (0.6mm Thickness)',
    thickness: '0.6 mm',
    rating: 5.0,
    review_count: 18,
    placements: [
      {
        id: 901,
        product_id: 9,
        image_url: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771549/kalima_AM_drawingrm.jpg.jpg',
        room_type: 'Living Room',
        caption: 'ড্রয়িং রুমে কালিমা তাইয়্যেবা গোল্ডেন ওয়াল আর্ট',
        sort_order: 1
      },
      {
        id: 902,
        product_id: 9,
        image_url: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771552/kalima_AM_office.jpg.jpg',
        room_type: 'Office',
        caption: 'অফিস রুমে মার্জিত আরবি ক্যালিগ্রাফি',
        sort_order: 2
      },
      {
        id: 903,
        product_id: 9,
        image_url: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771550/kalima_AM_namaj.jpg.jpg',
        room_type: 'Hallway',
        caption: 'নামাজের ঘরে প্রশান্তিময় পরিবেশ',
        sort_order: 3
      },
      {
        id: 904,
        product_id: 9,
        image_url: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771548/kalima_AM_bed.jpg.jpg',
        room_type: 'Bedroom',
        caption: 'বেডরুমের দেয়ালে রাজকীয় গোল্ডেন শোভা',
        sort_order: 4
      }
    ]
  },
  {
    id: 10,
    category_id: 1,
    category_name: 'Islamic Wall Decor Combo',
    name: 'আয়াতুল কুরসি গোল্ডেন স্টেইনলেস স্টিল ইসলামিক ওয়াল আর্ট',
    slug: 'ayatul-kursi-golden-stainless-steel-islamic-wall-art',
    description: 'পবিত্র আয়াতুল কুরসির সুন্দর আরবি ক্যালিগ্রাফিতে তৈরি প্রিমিয়াম গোল্ডেন ইসলামিক ওয়াল আর্ট। আধুনিক ও নান্দনিক ডিজাইনের সঙ্গে গোল্ডেন ফিনিশ এই ওয়াল আর্টটিকে আরও আকর্ষণীয় ও আভিজাত্যপূর্ণ করে তুলেছে। ঘরের দেয়ালে এটি শুধু সৌন্দর্যই যোগ করবে না, বরং একটি শান্তিপূর্ণ ও ইসলামিক আবহ তৈরি করবে। ড্রয়িং রুম, বেডরুম, নামাজের ঘর, অফিস, ডাইনিং স্পেস বা রিডিং রুমের জন্য এটি উপযুক্ত। নিজের ঘর সাজানোর পাশাপাশি পরিবার, বন্ধু বা প্রিয়জনকে ইসলামিক উপহার হিসেবেও এটি একটি অর্থবহ পছন্দ।',
    bangla_short_desc: 'পবিত্র আয়াতুল কুরসির সুন্দর আরবি ক্যালিগ্রাফিতে তৈরি প্রিমিয়াম গোল্ডেন ইসলামিক ওয়াল আর্ট। আধুনিক ও নান্দনিক ডিজাইনের সঙ্গে গোল্ডেন ফিনিশ এই ওয়াল আর্টটিকে আরও আকর্ষণীয় ও আভিজাত্যপূর্ণ করে তুলেছে। ঘরের দেয়ালে এটি শুধু সৌন্দর্যই যোগ করবে না, বরং একটি শান্তিপূর্ণ ও ইসলামিক আবহ তৈরি করবে। ড্রয়িং রুম, বেডরুম, নামাজের ঘর, অফিস, ডাইনিং স্পেস বা রিডিং রুমের জন্য এটি উপযুক্ত। নিজের ঘর সাজানোর পাশাপাশি পরিবার, বন্ধু বা প্রিয়জনকে ইসলামিক উপহার হিসেবেও এটি একটি অর্থবহ পছন্দ।',
    qualities: [
      '১০০% খাঁটি সার্জিক্যাল স্টেইনলেস স্টিল (0.6mm Thickness) - মরিচা মুক্ত ও অত্যন্ত দীর্ঘস্থায়ী।',
      'পবিত্র আয়াতুল কুরসি আরবি ক্যালিগ্রাফি - ঘরকে দেবে বরকতময়, শান্তিপূর্ণ ও রাজকীয় পরিবেশ।',
      '৩ডি ফ্লোটিং শ্যাডো লুক - দেয়াল থেকে হালকা ভেসে থাকে যা দৃষ্টিনন্দন সৌন্দর্য তৈরি করে।',
      'ড্রয়িং রুম, বেডরুম, নামাজের ঘর বা অফিসের দেয়াল সাজানোর জন্য দারুণ পছন্দ।',
      'সহজ ও নিরাপদ ইনস্টলেশন - প্যাকেটের সাথে রয়েছে শক্তিশালী ডাবল সাইডেড টেপ।'
    ],
    price: 999,
    old_price: 1399,
    image_url: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771499/ayatulkursi_Drawing.jpg.jpg',
    room_images: {
      drawing_room: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771499/ayatulkursi_Drawing.jpg.jpg',
      office_room: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771496/ayatulkursi_office.jpg.jpg',
      prayer_or_reading_room: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771497/ayatulkursi_namaj.jpg.jpg',
      bedroom: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771494/ayatulkursi_bed.jpg.jpg'
    },
    badge: 'NEW',
    stock: 5,
    featured: true,
    weight_grams: 500,
    size_dimensions: '38 inch × 7 inch',
    sizes: [
      {
        id: 'medium',
        name: 'মিডিয়াম (38 inch × 7 inch)',
        size_dimensions: '38 inch × 7 inch',
        price: 999,
        old_price: 1399,
        weight_grams: 500
      },
      {
        id: 'large',
        name: 'লার্জ (60 inch × 12 inch)',
        size_dimensions: '60 inch × 12 inch',
        price: 1799,
        old_price: 2199,
        weight_grams: 800
      }
    ],
    material: 'Surgical Stainless Steel (0.6mm Thickness)',
    thickness: '0.6 mm',
    rating: 5.0,
    review_count: 22,
    placements: [
      {
        id: 1001,
        product_id: 10,
        image_url: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771499/ayatulkursi_Drawing.jpg.jpg',
        room_type: 'Living Room',
        caption: 'ড্রয়িং রুমে আয়াতুল কুরসি গোল্ডেন ওয়াল আর্ট',
        sort_order: 1
      },
      {
        id: 1002,
        product_id: 10,
        image_url: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771496/ayatulkursi_office.jpg.jpg',
        room_type: 'Office',
        caption: 'অফিস রুমে আভিজাত্যপূর্ণ ইসলামিক আর্ট',
        sort_order: 2
      },
      {
        id: 1003,
        product_id: 10,
        image_url: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771497/ayatulkursi_namaj.jpg.jpg',
        room_type: 'Hallway',
        caption: 'নামাজের ঘরে পবিত্র আয়াতুল কুরসি ওয়াল আর্ট',
        sort_order: 3
      },
      {
        id: 1004,
        product_id: 10,
        image_url: 'https://res.cloudinary.com/glq1jvyu/image/upload/v1786771494/ayatulkursi_bed.jpg.jpg',
        room_type: 'Bedroom',
        caption: 'বেডরুমের দেয়ালে প্রিমিয়াম গোল্ডেন লুক',
        sort_order: 4
      }
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
