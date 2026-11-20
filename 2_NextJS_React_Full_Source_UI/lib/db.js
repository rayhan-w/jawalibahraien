// Database connection pool with automatic fallback for high availability
import mysql from 'mysql2/promise';

let pool = null;

// Only attempt real MySQL connection if host is configured
if (process.env.DB_HOST || process.env.MYSQL_HOST) {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
      user: process.env.DB_USER || process.env.MYSQL_USER || 'root',
      password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
      database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'jawalitelecom',
      waitForConnections: true,
      connectionLimit: 15,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });
  } catch (err) {
    console.warn('MySQL pool initialization fallback active:', err.message);
  }
}

// Fallback in-memory database mock so Next.js never crashes if MySQL is offline or during SSR
const mockDb = {
  settings: {
    store_name: 'Jawali Telecom Bahrain',
    store_name_ar: 'جوالي تليكوم البحرين',
    phone: '+973 3398 9339',
    whatsapp: '+973 3398 9339',
    email: 'info@jawalibahrain.com',
    address: 'Shop 14, Commercial District, Manama, Kingdom of Bahrain',
    address_ar: 'محل ١٤، الحي التجاري، المنامة، مملكة البحرين',
    branch_bd: 'Bypass Road, In Front of Ramganj Tower, Ramganj, Lakshmipur',
    delivery_inside: '1.500',
    delivery_outside: '2.500',
    currency: 'BHD',
    currency_ar: 'د.ب',
    facebook_domain_verification: 'gyszsdxnwydqp47omymsfwg0k06r5g',
  },
  categories: [
    { id: 1, name: 'Smartphones & Tablets', name_ar: 'الهواتف الذكية والأجهزة اللوحية', slug: 'phone', icon: 'fa-mobile-screen-button', sort_order: 1 },
    { id: 2, name: 'Earbuds & Audio', name_ar: 'سماعات الأذن والصوتيات', slug: 'earbuds-audio', icon: 'fa-headphones', sort_order: 2 },
    { id: 3, name: 'Smartwatches & Bands', name_ar: 'الساعات والأساور الذكية', slug: 'smartwatches-bands', icon: 'fa-clock', sort_order: 3 },
    { id: 4, name: 'Power Banks & MagSafe', name_ar: 'بنوك الطاقة وماج سيف', slug: 'power-banks-magsafe', icon: 'fa-battery-full', sort_order: 4 },
    { id: 5, name: 'Chargers & Cables', name_ar: 'الشواحن والكيابل', slug: 'chargers-cables', icon: 'fa-plug', sort_order: 5 },
    { id: 6, name: 'Sunglasses & Smart Glasses', name_ar: 'النظارات والنظارات الذكية', slug: 'sunglasses-smart-glasses', icon: 'fa-glasses', sort_order: 6 },
    { id: 7, name: 'Covers & Protection', name_ar: 'الكفرات وحماية الشاشة', slug: 'cover', icon: 'fa-shield-halved', sort_order: 7 },
    { id: 8, name: 'Car Accessories', name_ar: 'إكسسوارات السيارات', slug: 'car-accessories', icon: 'fa-car', sort_order: 8 },
    { id: 9, name: 'Camera & Photography', name_ar: 'الكاميرات ومعدات التصوير', slug: 'camera-photography', icon: 'fa-camera', sort_order: 9 },
    { id: 10, name: 'Computer & Gaming', name_ar: 'الكمبيوتر وألعاب الفيديو', slug: 'computer-gaming', icon: 'fa-computer', sort_order: 10 },
  ],
  products: [
    {
      id: 900023,
      title: 'Coolshark Cooling Game Controller for Mobile (JK02)',
      title_ar: 'مقبض ألعاب تبريد كول شارك للهواتف الذكية (JK02)',
      brand: 'Coolshark',
      price: 18.500,
      old_price: 22.000,
      stock: 35,
      badge: 'New',
      image: 'https://jawalitelecombd.com/api/products/900023/image',
      rating: 4.8,
      reviews_count: 77,
      category_id: 10,
      sub_category: 'gaming-accessories',
      is_featured: 1,
      is_bestseller: 1,
      is_new: 1,
      sort_order: 1,
      views: 142,
      description: 'Ultra-fast semiconductor cooling gaming controller compatible with iOS and Android devices.',
      description_ar: 'مقبض ألعاب تبريد فائق السرعة بتقنية أشباه الموصلات متوافق مع أجهزة آبل وأندرويد.',
    },
    {
      id: 870019,
      title: 'Porodo 20000mAh Solar Power Bank | Hand Crank & 4 Solar Panels 20W PD',
      title_ar: 'بنك طاقة شمسي بورودو 20000 مللي أمبير | شحن يدوي و 4 ألواح شمسية 20 واط',
      brand: 'Porodo',
      price: 39.900,
      old_price: 45.000,
      stock: 20,
      badge: '-12%',
      image: 'https://jawalitelecombd.com/api/products/870019/image',
      rating: 4.9,
      reviews_count: 63,
      category_id: 4,
      sub_category: 'solar-power-banks',
      is_featured: 1,
      is_bestseller: 1,
      is_new: 0,
      sort_order: 2,
      views: 318,
      description: 'Rugged outdoor solar power bank with built-in flashlight, hand crank dynamo, and 20W Power Delivery.',
      description_ar: 'شاحن متنقل متين للرحلات الخارجية مزود بإضاءة كشاف ومولد يدوي وألواح طاقة شمسية وشحن سريع 20 واط.',
    },
    {
      id: 960148,
      title: 'BRAVE MagSafe Car Phone Holder with Vacuum Suction (BHL-55)',
      title_ar: 'حامل هاتف للسيارة ماج سيف بريف بتقنية الشفط الفراغي (BHL-55)',
      brand: 'BRAVE',
      price: 7.900,
      old_price: 9.500,
      stock: 40,
      badge: '-16%',
      image: 'https://jawalitelecombd.com/api/products/960148/image',
      rating: 4.8,
      reviews_count: 120,
      category_id: 8,
      sub_category: 'magsafe-car-holders',
      is_featured: 1,
      is_bestseller: 1,
      is_new: 1,
      sort_order: 3,
      views: 205,
      description: 'Powerful electromagnetic vacuum suction car mount with ultra-strong N52 MagSafe magnets.',
      description_ar: 'قاعدة تثبيت للهاتف بالسيارة بتقنية التثبيت الفراغي ومغناطيس ماج سيف قوي N52.',
    },
    {
      id: 960128,
      title: 'Porodo Dual Output Transparent Quick Charger PD 20W + QC 18W UK',
      title_ar: 'شاحن بورودو سريع شفاف بمنفذين PD 20W + QC 18W ثلاثي',
      brand: 'Porodo',
      price: 7.500,
      old_price: 8.900,
      stock: 50,
      badge: '-15%',
      image: 'https://jawalitelecombd.com/api/products/960128/image',
      rating: 4.7,
      reviews_count: 89,
      category_id: 5,
      sub_category: 'wall-chargers',
      is_featured: 1,
      is_bestseller: 0,
      is_new: 1,
      sort_order: 4,
      views: 184,
      description: 'Futuristic transparent casing with dual output Power Delivery and Quick Charge technology.',
      description_ar: 'شاحن جداري بتصميم شفاف مستقبلي يدعم الشحن السريع وتقنية تنظيم الحرارة الذكية.',
    },
    {
      id: 960125,
      title: 'Tempguard 1200ml Thermal Travel Mug BT-03WH White',
      title_ar: 'كوب حافظ للحرارة تمب جارد 1200 مل للسفر والسيارة أبيض',
      brand: 'Tempguard',
      price: 15.000,
      old_price: 18.000,
      stock: 25,
      badge: '-17%',
      image: 'https://jawalitelecombd.com/api/products/960125/image',
      rating: 4.8,
      reviews_count: 45,
      category_id: 1,
      sub_category: 'travel-essentials',
      is_featured: 1,
      is_bestseller: 0,
      is_new: 0,
      sort_order: 5,
      views: 110,
      description: 'Double-walled vacuum insulated stainless steel tumbler keeps drinks cold 24h and hot 12h.',
      description_ar: 'كوب حراري ستانلس ستيل عازل مزدوج يحفظ المشروبات باردة لمدة 24 ساعة وساخنة 12 ساعة.',
    },
    {
      id: 960014,
      title: 'Porodo Power Boost 50000mAh Power Bank with Retractable Type-C Cable',
      title_ar: 'بنك طاقة بورودو باور بوست 50000 مللي أمبير مع سلك تايب سي مدمج قابل للسحب',
      brand: 'Porodo',
      price: 16.500,
      old_price: 19.900,
      stock: 30,
      badge: 'New',
      image: 'https://jawalitelecombd.com/api/products/960014/image',
      rating: 4.9,
      reviews_count: 140,
      category_id: 4,
      sub_category: 'regular-power-banks',
      is_featured: 1,
      is_bestseller: 1,
      is_new: 1,
      sort_order: 6,
      views: 420,
      description: 'Massive capacity battery station with digital LED display, multiple ports and retractable cable.',
      description_ar: 'محطة شحن هائلة بسعة 50000 مللي أمبير مع شاشة رقمية وسلك شحن مدمج قابل للسحب.',
    },
    {
      id: 990001,
      title: 'Apple iPhone 16 Pro Max 256GB - Desert Titanium',
      title_ar: 'آبل آيفون 16 برو ماكس 256 جيجابايت - تيتانيوم صحراوي',
      brand: 'Apple',
      price: 495.000,
      old_price: 520.000,
      stock: 15,
      badge: 'Flagship',
      image: 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/eeae4c8e-025e-49cc-8e56-5e0633fc0c58.jpg',
      rating: 5.0,
      reviews_count: 210,
      category_id: 1,
      sub_category: 'iphone',
      is_featured: 1,
      is_bestseller: 1,
      is_new: 1,
      sort_order: 7,
      views: 890,
      description: 'Grade A brand new official Apple iPhone 16 Pro Max with A18 Pro chip and 48MP Fusion camera system.',
      description_ar: 'هاتف آبل آيفون 16 برو ماكس الأصلي الجديد بالكامل مع معالج A18 Pro وكاميرا متطورة 48 ميجابكسل.',
    },
    {
      id: 990002,
      title: 'Samsung Galaxy S24 Ultra 5G 256GB - Titanium Gray',
      title_ar: 'سامسونج جالكسي S24 ألترا 5G سعة 256 جيجابايت - رمادي تيتانيوم',
      brand: 'Samsung',
      price: 440.000,
      old_price: 475.000,
      stock: 18,
      badge: 'Best AI',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g-sm-s928-0.jpg',
      rating: 4.9,
      reviews_count: 175,
      category_id: 1,
      sub_category: 'samsung',
      is_featured: 1,
      is_bestseller: 1,
      is_new: 1,
      sort_order: 8,
      views: 740,
      description: 'Galaxy AI is here. 200MP camera, built-in S Pen, and titanium frame protection.',
      description_ar: 'قوة الذكاء الاصطناعي مع سامسونج جالكسي S24 ألترا، كاميرا 200 ميجابكسل وقلم S-Pen مدمج.',
    }
  ],
  banners: [
    {
      id: 1,
      title: 'Smartphones & Premium Gadgets in Bahrain',
      title_ar: 'أحدث الهواتف الذكية والأجهزة التقنية في البحرين',
      subtitle: 'Official warranty, fastest delivery across Bahrain & GCC, and best price guarantee.',
      subtitle_ar: 'ضمان رسمي، أسرع توصيل لجميع مناطق البحرين والخليج، وأفضل سعر مضمون.',
      badge: 'Jawali Exclusive',
      badge_ar: 'حصريات جوالي',
      image: 'https://jawalitelecombd.com/api/banners/1/image',
      link: '/products',
      button_text: 'Shop Now',
      button_text_ar: 'تسوق الآن',
      is_active: 1,
      sort_order: 1,
    }
  ],
  paymentMethods: [
    {
      id: 'benefit_pay',
      name: 'BenefitPay (بنفت بي)',
      name_ar: 'بنفت بي (BenefitPay)',
      code: 'benefitpay',
      type: 'mobile_wallet',
      icon: 'fa-qrcode',
      logo: '/benefitpay.png',
      is_active: true,
      account_number: '+973 33989339',
      iban: 'BH00BMAG00000000000000',
      instructions: 'Open your BenefitPay app, send payment to the official mobile number or scan QR, and enter the reference number.',
      instructions_ar: 'افتح تطبيق بنفت بي وأرسل المبلغ إلى رقم جوالي تليكوم الرسمي أو امسح الباركود وأدخل رقم العملية.',
      fee_type: 'none',
      fee_amount: 0,
    },
    {
      id: 'cod',
      name: 'Cash on Delivery (الدفع عند الاستلام)',
      name_ar: 'الدفع نقداً عند الاستلام (COD)',
      code: 'cod',
      type: 'cod',
      icon: 'fa-hand-holding-dollar',
      logo: '/cod-logo.svg',
      is_active: true,
      account_number: '',
      iban: '',
      instructions: 'Pay in cash directly to the courier agent when your package is delivered to your doorstep.',
      instructions_ar: 'ادفع المبلغ نقداً لمندوب التوصيل عند استلام طلبك عند باب منزلك.',
      fee_type: 'none',
      fee_amount: 0,
    },
    {
      id: 'credit_card',
      name: 'Debit & Credit Cards (Visa / Mastercard)',
      name_ar: 'بطاقات مدى والائتمان (فيزا / ماستركارد)',
      code: 'card',
      type: 'gateway',
      icon: 'fa-credit-card',
      logo: '/online card.jpg',
      is_active: true,
      account_number: 'Online Secure 3D Payment',
      iban: '',
      instructions: 'Pay securely using your Visa, Mastercard, or local debit card with encrypted protection.',
      instructions_ar: 'ادفع بأمان تام عبر بطاقتك الائتمانية أو بطاقة الخصم المباشر بحماية وتشفير عالي.',
      fee_type: 'none',
      fee_amount: 0,
    },
    {
      id: 'stc_pay',
      name: 'STC Pay Bahrain',
      name_ar: 'إس تي سي باي البحرين',
      code: 'stcpay',
      type: 'mobile_wallet',
      icon: 'fa-wallet',
      logo: '/stcpay.png',
      is_active: true,
      account_number: '+973 33989339',
      iban: '',
      instructions: 'Transfer through STC Pay wallet directly to our merchant number.',
      instructions_ar: 'قم بالتحويل عبر محفظة STC Pay إلى رقم التاجر المعتمد.',
      fee_type: 'none',
      fee_amount: 0,
    },
    {
      id: 'bkash_nagad',
      name: 'bKash / Nagad (Bangladesh Branch Orders)',
      name_ar: 'بيكاش / نقد (لطلبات فرع بنغلاديش)',
      code: 'bdt_wallet',
      type: 'mobile_wallet',
      icon: 'fa-money-bill-transfer',
      logo: '/bkash-Logo.png',
      is_active: true,
      account_number: '01339893391 (Personal)',
      iban: '',
      instructions: 'Send money to our official bKash/Nagad personal number and enter your TrxID below.',
      instructions_ar: 'أرسل المبلغ إلى رقم بيكاش أو نقد الشخصي وأدخل رقم المعاملة أدناه.',
      fee_type: 'none',
      fee_amount: 0,
    }
  ]
};

// Resilient wrapper that safely executes queries or falls back to in-memory store
const db = {
  async query(sql, params = []) {
    if (pool) {
      try {
        return await pool.query(sql, params);
      } catch (err) {
        console.warn('MySQL query error, using resilient fallback:', err.message);
      }
    }
    // Return structured fallback based on SQL query content
    const lower = sql.toLowerCase();
    if (lower.includes('from products')) {
      return [mockDb.products, []];
    }
    if (lower.includes('from categories')) {
      return [mockDb.categories, []];
    }
    if (lower.includes('from banners')) {
      return [mockDb.banners, []];
    }
    if (lower.includes('from settings')) {
      return [
        Object.entries(mockDb.settings).map(([k, v]) => ({ setting_key: k, setting_value: v })),
        []
      ];
    }
    if (lower.includes('from payment_methods')) {
      return [mockDb.paymentMethods, []];
    }
    return [[], []];
  },
  getMockDb() {
    return mockDb;
  }
};

export default db;
