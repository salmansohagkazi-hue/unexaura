// Utility to generate official Elementor & CartFlows JSON templates
// Fully editable section-by-section with native Elementor widgets (Headings, Text, Buttons, Images, Accordions, Shortcodes)

function genId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export interface ElementorWidget {
  id: string;
  elType: 'widget';
  isInner: boolean;
  widgetType: string;
  settings: Record<string, any>;
  elements: any[];
}

export interface ElementorColumn {
  id: string;
  elType: 'column';
  isInner: boolean;
  settings: Record<string, any>;
  elements: ElementorWidget[];
}

export interface ElementorSection {
  id: string;
  elType: 'section' | 'container';
  isInner: boolean;
  settings: Record<string, any>;
  elements: ElementorColumn[];
}

export interface ElementorTemplate {
  version: string;
  title: string;
  type: 'section' | 'page';
  content: ElementorSection[];
}

// Widget builders
export const createHeading = (title: string, tag: string = 'h2', color: string = '#0F3D44', fontSize: number = 28, align: string = 'center'): ElementorWidget => ({
  id: genId(),
  elType: 'widget',
  isInner: false,
  widgetType: 'heading',
  settings: {
    title,
    header_size: tag,
    align,
    title_color: color,
    typography_typography: 'custom',
    typography_font_size: { unit: 'px', size: fontSize },
    typography_font_weight: '800'
  },
  elements: []
});

export const createTextEditor = (editorHtml: string, color: string = '#475569', align: string = 'left'): ElementorWidget => ({
  id: genId(),
  elType: 'widget',
  isInner: false,
  widgetType: 'text-editor',
  settings: {
    editor: `<p style="text-align: ${align}; color: ${color}; line-height: 1.6;">${editorHtml}</p>`,
    text_color: color,
    align
  },
  elements: []
});

export const createImage = (url: string, alt: string = 'UNEX AURA Wall Art'): ElementorWidget => ({
  id: genId(),
  elType: 'widget',
  isInner: false,
  widgetType: 'image',
  settings: {
    image: { url, id: '' },
    caption_source: 'none',
    align: 'center',
    image_size: 'full',
    border_radius: { unit: 'px', top: '16', right: '16', bottom: '16', left: '16', isLinked: true }
  },
  elements: []
});

export const createButton = (text: string, url: string = '#', bg: string = '#14B8A6', textColor: string = '#FFFFFF', align: string = 'center'): ElementorWidget => ({
  id: genId(),
  elType: 'widget',
  isInner: false,
  widgetType: 'button',
  settings: {
    text,
    link: { url, is_external: '', nofollow: '' },
    align,
    background_color: bg,
    button_text_color: textColor,
    text_color: textColor,
    border_radius: { unit: 'px', top: '12', right: '12', bottom: '12', left: '12', isLinked: true },
    button_padding: { unit: 'px', top: '14', right: '28', bottom: '14', left: '28', isLinked: false },
    typography_typography: 'custom',
    typography_font_weight: '700'
  },
  elements: []
});

export const createIconBox = (title: string, description: string, iconClass: string = 'fa fa-check-circle', color: string = '#14B8A6'): ElementorWidget => ({
  id: genId(),
  elType: 'widget',
  isInner: false,
  widgetType: 'icon-box',
  settings: {
    selected_icon: { value: iconClass, library: 'fa-solid' },
    title_text: title,
    description_text: description,
    icon_color: color,
    title_color: '#0F3D44',
    title_size: 'h4',
    position: 'top',
    align: 'center'
  },
  elements: []
});

export const createShortcode = (shortcode: string): ElementorWidget => ({
  id: genId(),
  elType: 'widget',
  isInner: false,
  widgetType: 'shortcode',
  settings: {
    shortcode
  },
  elements: []
});

export const createAccordion = (items: Array<{ title: string; content: string }>): ElementorWidget => ({
  id: genId(),
  elType: 'widget',
  isInner: false,
  widgetType: 'accordion',
  settings: {
    tabs: items.map(item => ({
      tab_title: item.title,
      tab_content: item.content
    })),
    title_color: '#0F3D44',
    active_first_tab: 'yes',
    border_width: { unit: 'px', top: '1', right: '1', bottom: '1', left: '1', isLinked: true },
    border_color: '#E2E8F0'
  },
  elements: []
});

export const createColumn = (width: number, widgets: ElementorWidget[]): ElementorColumn => ({
  id: genId(),
  elType: 'column',
  isInner: false,
  settings: {
    _column_size: width,
    _inline_size: width
  },
  elements: widgets
});

export const createSection = (columns: ElementorColumn[], bg: string = '#FFFFFF', paddingTopBottom: number = 60): ElementorSection => ({
  id: genId(),
  elType: 'section',
  isInner: false,
  settings: {
    layout: 'full_width',
    background_background: 'classic',
    background_color: bg,
    padding: { unit: 'px', top: String(paddingTopBottom), right: '20', bottom: String(paddingTopBottom), left: '20', isLinked: false }
  },
  elements: columns
});

// SECTION TEMPLATES BUILDERS
export function buildHeroSectionTemplate(): ElementorTemplate {
  const col1 = createColumn(50, [
    createHeading('UNEX AURA 3D LASER SHOWCASE', 'h5', '#14B8A6', 14, 'left'),
    createHeading('Turn Your Walls Into Timeless Masterpieces', 'h1', '#0F3D44', 38, 'left'),
    createTextEditor('Luxury surgical stainless steel 3D Islamic wall art & calligraphy crafted for modern living spaces across Bangladesh.', '#475569', 'left'),
    createButton('Explore Collection Now', '#products', '#14B8A6', '#FFFFFF', 'left')
  ]);

  const col2 = createColumn(50, [
    createImage('https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80', 'UNEX AURA 3D Wall Art Showcase')
  ]);

  const sec = createSection([col1, col2], '#F8FAFC', 70);

  return {
    version: '0.4',
    title: 'UNEX AURA - 1. Hero Section',
    type: 'section',
    content: [sec]
  };
}

export function buildCategoriesSectionTemplate(): ElementorTemplate {
  const headerCol = createColumn(100, [
    createHeading('Explore Design Categories', 'h2', '#0F3D44', 32, 'center'),
    createTextEditor('Curated laser-cut wall art tailored for every living space', '#64748B', 'center')
  ]);

  const headerSec = createSection([headerCol], '#FFFFFF', 40);

  const categories = [
    { title: 'Islamic Art & Calligraphy', img: '/images/cat_islamic_combo_v2.jpg' },
    { title: '3D Wall Clocks', img: '/images/cat_metal_clock.jpg' },
    { title: 'Minimalist Modern Art', img: '/images/cat_minimal_leaf.jpg' },
    { title: 'Custom Nameplates', img: '/images/cat_custom_nameplate.jpg' }
  ];

  const cols = categories.map(cat => createColumn(25, [
    createImage(cat.img, cat.title),
    createHeading(cat.title, 'h4', '#0F3D44', 18, 'center'),
    createButton('Browse Category', '#shop', '#F1F5F9', '#0F3D44', 'center')
  ]));

  const gridSec = createSection(cols, '#FFFFFF', 30);

  return {
    version: '0.4',
    title: 'UNEX AURA - 2. Category Grid Section',
    type: 'section',
    content: [headerSec, gridSec]
  };
}

export function buildDealOfTheDaySectionTemplate(): ElementorTemplate {
  const col1 = createColumn(50, [
    createImage('https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80', 'Special Offer Deal Art')
  ]);

  const col2 = createColumn(50, [
    createHeading('🔥 TODAY\'S SPECIAL DEAL', 'h5', '#EF4444', 14, 'left'),
    createHeading('Ayatul Kursi 3D Laser Stainless Steel Art', 'h2', '#FFFFFF', 30, 'left'),
    createTextEditor('প্রিমিয়াম সার্জিক্যাল মেটাল কাস্টিং সম্পূর্ণ ১০০% মরিচারোধক ও টেকসই। দেওয়াল ড্রিল ছাড়াই ডাবল সাইড টেপ দিয়ে সহজে স্থাপনযোগ্য।', '#CBD5E1', 'left'),
    createHeading('৳ 3,450 (Regular ৳ 4,500)', 'h3', '#2DD4BF', 24, 'left'),
    createButton('Order Now - Cash On Delivery', '/checkout/?add-to-cart=1', '#2DD4BF', '#0F172A', 'left')
  ]);

  const sec = createSection([col1, col2], '#0F172A', 60);

  return {
    version: '0.4',
    title: 'UNEX AURA - 3. Deal of the Day Section',
    type: 'section',
    content: [sec]
  };
}

export function buildFeatureBarSectionTemplate(): ElementorTemplate {
  const items = [
    { title: 'Free Delivery', desc: 'Dhaka City (>৳3,000)', icon: 'fa fa-truck' },
    { title: 'Rust-Proof', desc: 'Surgical Steel Body', icon: 'fa fa-shield' },
    { title: 'Custom Sizing', desc: 'Any Dimensions Available', icon: 'fa fa-arrows-alt' },
    { title: '24/7 Support', desc: 'Phone & WhatsApp', icon: 'fa fa-phone' }
  ];

  const cols = items.map(item => createColumn(25, [
    createIconBox(item.title, item.desc, item.icon, '#14B8A6')
  ]));

  const sec = createSection(cols, '#F1F5F9', 40);

  return {
    version: '0.4',
    title: 'UNEX AURA - 4. Guarantee & Features Strip',
    type: 'section',
    content: [sec]
  };
}

export function buildTestimonialsSectionTemplate(): ElementorTemplate {
  const headerCol = createColumn(100, [
    createHeading('Loved By Homeowners Across Bangladesh', 'h2', '#0F3D44', 32, 'center'),
    createTextEditor('Real feedback from verified UNEX AURA customers', '#64748B', 'center')
  ]);

  const testimonials = [
    { name: 'Dr. Mahmud Hasan', loc: 'Dhanmondi, Dhaka', quote: 'প্রোডাক্টের ফিনিশিং ও লাক্সারি ডিজাইন দেখে একদম মুগ্ধ। ড্রিল ছাড়া সহজেই দেওয়ালে লাগিয়ে ফেলেছি।' },
    { name: 'Nusrat Jahan', loc: 'Uttara, Dhaka', quote: 'Ayatul Kursi ক্যালিগ্রাফিটি বসার ঘরের সৌন্দর্য বহুলাংশে বাড়িয়ে দিয়েছে। প্যাকেজিংও খুব সেইফ ছিলো।' },
    { name: 'Engr. Tanvir Ahmed', loc: 'Panchlaish, Chittagong', quote: '১০০% অরিজিনাল সার্জিক্যাল মেটাল। ঢাকা থেকে চিটাগাং দ্রুততম সময়ে হোম ডেলিভারি পেয়েছি।' }
  ];

  const cols = testimonials.map(t => createColumn(33, [
    createTextEditor(`"${t.quote}"`, '#334155', 'center'),
    createHeading(t.name, 'h4', '#0F3D44', 16, 'center'),
    createTextEditor(t.loc, '#94A3B8', 'center')
  ]));

  const sec = createSection([headerCol], '#FFFFFF', 40);
  const gridSec = createSection(cols, '#FFFFFF', 30);

  return {
    version: '0.4',
    title: 'UNEX AURA - 5. Customer Reviews Section',
    type: 'section',
    content: [sec, gridSec]
  };
}

export function buildCartFlowsCheckoutSectionTemplate(): ElementorTemplate {
  const col1 = createColumn(100, [
    createHeading('Express Checkout / আপনার অর্ডারটি সম্পন্ন করুন', 'h2', '#0F3D44', 28, 'center'),
    createTextEditor('নিচে আপনার নাম, ঠিকানা ও মোবাইল নম্বর দিয়ে সরাসরি অর্ডার কনফার্ম করুন। আমাদের প্রতিনিধি ফোন করে কনফার্ম করবেন।', '#64748B', 'center'),
    createShortcode('[cartflows_checkout]'),
    createIconBox('১০০% ক্যাশ অন ডেলিভারি সুবিধা', 'পণ্য হাতে পেয়ে চেক করে টাকা পরিশোধ করুন', 'fa fa-check-circle', '#10B981')
  ]);

  const sec = createSection([col1], '#F8FAFC', 60);

  return {
    version: '0.4',
    title: 'UNEX AURA - 6. CartFlows Express Checkout Section',
    type: 'section',
    content: [sec]
  };
}

export function buildFAQSectionTemplate(): ElementorTemplate {
  const headerCol = createColumn(100, [
    createHeading('Frequently Asked Questions (FAQ)', 'h2', '#0F3D44', 32, 'center')
  ]);

  const faqAccordion = createAccordion([
    {
      title: 'ক্যালিগ্রাফিগুলো দেওয়ালে কীভাবে লাগাবো?',
      content: 'প্রতিটি UNEX AURA প্রোডাক্টের পেছনে হেভি-ডিউটি ডাবল সাইড ফোম টেপ লাগানো থাকে। দেওয়ালে কোনো পেরেক বা ড্রিল করার প্রয়োজন নেই, সরাসরি টেপের কভার তুলে লাগিয়ে দেওয়া যায়।'
    },
    {
      title: 'এগুলো কি সময়ের সাথে মরিচা ধরে নষ্ট হবে?',
      content: 'একদমই না! আমরা ব্যবহার করি ১০০% পোরোসিটি-ফ্রি সার্জিক্যাল গ্রেড স্টিল ও পাউডার-কোটেড ফিনিশ। এটি সম্পূর্ণ ওয়াটারপ্রুফ এবং লাইফটাইম মরিচারোধক।'
    },
    {
      title: 'ডেলিভারি চার্জ কত এবং কতদিনে পাবো?',
      content: 'ঢাকায় ৩০০০ টাকার উপরে অর্ডারে ডেলিভারি চার্জ সম্পূর্ণ ফ্রী! ঢাকার বাইরে কুরিয়ার চার্জ ১৫০ টাকা। অর্ডার করার ২-৪ কার্যদিবসের মধ্যে হোম ডেলিভারি দেওয়া হয়।'
    },
    {
      title: 'পণ্য হাতে পেয়ে দেখে টাকা দেওয়া যাবে?',
      content: 'জি অবশ্যই! ডেলিভারিম্যান সামনে থাকা অবস্থায় পার্সেল খুলে চেক করে দেখে টাকা পরিশোধ করতে পারবেন।'
    }
  ]);

  const faqCol = createColumn(100, [faqAccordion]);

  const secHeader = createSection([headerCol], '#FFFFFF', 40);
  const secContent = createSection([faqCol], '#FFFFFF', 30);

  return {
    version: '0.4',
    title: 'UNEX AURA - 7. FAQ Accordion Section',
    type: 'section',
    content: [secHeader, secContent]
  };
}

// FULL PAGE TEMPLATE COMBINING ALL SECTIONS
export function buildFullLandingPageTemplate(): ElementorTemplate {
  const hero = buildHeroSectionTemplate();
  const cats = buildCategoriesSectionTemplate();
  const deal = buildDealOfTheDaySectionTemplate();
  const features = buildFeatureBarSectionTemplate();
  const reviews = buildTestimonialsSectionTemplate();
  const checkout = buildCartFlowsCheckoutSectionTemplate();
  const faq = buildFAQSectionTemplate();

  return {
    version: '0.4',
    title: 'UNEX AURA - Full Landing Page Template (CartFlows Compatible)',
    type: 'page',
    content: [
      ...hero.content,
      ...cats.content,
      ...deal.content,
      ...features.content,
      ...reviews.content,
      ...checkout.content,
      ...faq.content
    ]
  };
}
