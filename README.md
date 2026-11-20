# Jawali Telecom Bahrain (جوالي تليكوم البحرين)
### Official Next.js & React Full-Stack E-Commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19+-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Bilingual](https://img.shields.io/badge/Language-English%20%7C%20العربية%20(RTL)-FF6600?style=for-the-badge)](https://jawalibahrain.com)
[![Payment](https://img.shields.io/badge/Payment-BenefitPay%20%7C%20Cards%20%7C%20COD%20%7C%20Wallets-059669?style=for-the-badge)](https://jawalibahrain.com)
[![License](https://img.shields.io/badge/License-Proprietary-blue?style=for-the-badge)](LICENSE)

---

## 🌟 Overview / نظرة عامة
**Jawali Telecom Bahrain** is an ultra-fast, modern, conversion-optimized e-commerce platform built with Next.js, React, and MySQL. It features full bilingual support (**English** & **العربية** with native RTL layout), dynamic payment gateway management, automated courier shipping, 1-page frictionless checkout, and a comprehensive admin operational control hub.

---

## 🚀 Key Modules & In-Depth Feature Architecture

### 1. Storefront & Homepage Architecture
* **Dynamic Hero Slider & Promo Banners:**
  - Admin-controlled banners with customizable headings, subtitles, discount badges, and direct links.
  - Ultra-fast image caching and responsive mobile/desktop optimization.
* **Category Grid & Visual Browsing:**
  - Visual category cards with responsive FontAwesome icons.
  - 1-click filtering showing all items in that category with smooth transitions.
* **Top Selling Section:**
  - Real-time highlights of best-selling and trending products.
  - Admin toggle to customize titles, display order, or enable/disable.
* **Flash Sale Engine:**
  - Live rolling countdown timer (`Days : Hours : Mins : Secs`).
  - Special promotional discount badges (`-15%`, `⚡ Flash Sale`).
* **Featured & All Products Tab Navigation:**
  - Instant category switching on the homepage without page reload.

---

### 2. Smart Search & Catalog Engine
* **Smart Partial & Multi-Keyword Search:**
  - Matches partial names, model codes, and brands (e.g., `45w`, `iphone`, `oraimo`, `magsafe`, `buds`).
  - Case-insensitive, space-tolerant, and bilingual matching (English & Arabic).
* **Multi-Level Grouping:**
  - Primary categories (Smartphones, Audio, Power Banks, Chargers, Covers, Car Accessories) with nested subcategories.
* **Filters & Sorting:**
  - Price sorting (Low to High / High to Low).
  - Filter tabs for New Arrivals, Offers & Discounts, and Bestsellers.

---

### 3. Product Page & Conversion Funnel
* **Live Product Views Counter:**
  - Transparent real-time counter (e.g. `142 views`) establishing authentic social proof.
* **Dual Action Buttons:**
  - **"Add to Cart"**: Adds item and allows continued shopping.
  - **"Buy Now"**: Instant 1-click route directly to checkout.
* **Direct Communication Buttons:**
  - **Order via WhatsApp**: Auto-fills the product name, price, and inquiry into WhatsApp (`+973 3398 9339`).
  - **Call to Order**: 1-tap direct dial to the showroom.
* **Moderated Customer Reviews & Q&A:**
  - Reviews remain pending in admin until audited and approved to eliminate spam.
* **Wishlist:**
  - Persistent client-side wishlist with heart icon indicator.

---

### 4. 1-Page Fast Checkout & Dynamic Payment Systems
* **1-Page Frictionless Checkout (No Registration Required):**
  - Place an order in under 30 seconds using just Name, Phone, and Address.
* **Regional Dropdown Coverage:**
  - **Bahrain**: Capital Governorate, Muharraq, Northern, and Southern Governorates + Cities (Manama, Riffa, Muharraq, Hamad Town, Isa Town, etc.).
  - **Bangladesh Branch**: Complete 64 districts dropdown.
* **Automated Delivery Zone Calculation:**
  - Dynamic flat/zone shipping rate calculation added to the grand total.
* **Dynamic Payment System Addition & Management ("Add Payment Option"):**
  - **BenefitPay (بنفت بي)**: Bahrain's #1 national mobile payment with QR, phone, and Reference ID / TrxID verification.
  - **Credit & Debit Cards**: 3D secure Visa, Mastercard, and Benefit card payments.
  - **Cash on Delivery (COD)**: Universal doorstep payment.
  - **STC Pay**: Local Bahrain digital wallet.
  - **bKash & Nagad**: For Bangladesh branch orders.
  - **Admin Dynamic Gateway Manager**: Add new custom payment methods, update account details, IBAN, instructions in English and Arabic, and toggle active/inactive status at runtime.
* **Order Notes & Promo Codes:**
  - Customer special delivery notes passed directly to courier bookings and printed invoices.
  - Real-time coupon discount validation.

---

### 5. Admin Dashboard & Operational Hub
* **Order Management Pipeline:**
  - Real-time status pipeline: `Pending` ➔ `Confirmed` ➔ `In Courier` ➔ `Delivered` ➔ `Cancelled`.
* **Print-Ready Official Cash Memo / Invoice:**
  - 1-click printable receipt featuring Jawali Telecom logo, Bahrain & Ramganj showroom addresses, item breakdown, taxes, shipping, notes, and authorized signature box.
* **Courier Automation (Steadfast & Bahrain Express):**
  - 1-click booking generating Consignment ID (CID) and Tracking Numbers.
* **Category & Subcategory Reordering:**
  - Position control to prioritize top-performing categories.
* **Product Pin-to-Top & Stock-Out Manager:**
  - Pin top sellers to slot #1 and easily track out-of-stock items.
* **Coupons Generator:**
  - Create flat or percentage-based coupons with minimum spend requirements.
* **Settings Hub:**
  - Edit store contact, hotlines, addresses, delivery fees, and Meta verification tags without touching code.

---

### 6. Bilingual Support: English & Arabic (العربية) with RTL
* **Seamless Language Toggle:**
  - Switch between English and Arabic instantly via Header, Sidebar, and Mobile navigation.
* **Native RTL Direction:**
  - Dynamic `dir="rtl"` applied to `<html>` and body with typography powered by Google Cairo font.
  - Mirrored drawer navigation, buttons, search input, badges, and checkout form layouts.

---

### 7. Digital Marketing, Meta Pixel & CAPI
* **Dual-Layer Tracking:**
  - Client-side Meta Pixel (`window.fbq`) + Server-side Conversions API (CAPI).
* **E-Commerce Funnel Events:**
  - `ViewContent` (Product view)
  - `AddToCart` (Added to basket)
  - `InitiateCheckout` (Checkout opened)
  - `Purchase` (Order completed with value, currency, and items)
* **SEO & Meta Verification:**
  - Pre-configured `facebook-domain-verification` meta tag.
  - Dynamic `sitemap.xml` and `robots.txt`.

---

### 8. Tech Stack & Server Architecture
* **Frontend:** Next.js 15+ (App Router), React 19, CSS3 with dark/light themes.
* **Backend:** Next.js Server Components, API Route Handlers, Express/Node.js compatibility.
* **Database:** MySQL2 connection pool with automatic resilient mock fallback.
* **Authentication:** JWT token-based auth with cryptographic bcrypt hashing for administrators.

---

## 📂 Folder Structure

```
jawalibahraien/
├── 1_Exact_Live_Website_HTML_CSS/  # Standalone Pure HTML, CSS & JS version
│   ├── index.html                  # Homepage (Live Replica)
│   ├── products.html               # Product Catalog
│   ├── product-details.html        # Product Page with WhatsApp & Call
│   ├── checkout.html               # 1-Page Express Checkout
│   ├── track-order.html            # Live Order Tracking
│   └── assets/                     # Styles, scripts, and logos
│
├── 2_NextJS_React_Full_Source_UI/  # Full-Stack Next.js Application
│   ├── app/
│   │   ├── api/                    # REST API Endpoints
│   │   │   ├── admin/              # Payments, Orders, Reviews, Courier, Stats
│   │   │   ├── products/           # Product CRUD & View Counter
│   │   │   ├── categories/         # Category & Subcategory APIs
│   │   │   ├── coupons/            # Discount Engine
│   │   │   ├── orders/             # Order Creation & Invoices
│   │   │   ├── payment-methods/    # Active Payment Gateways
│   │   │   └── track-order/        # Tracking System
│   │   ├── admin/                  # Admin Dashboard Pages
│   │   │   ├── payments/           # Dynamic Payment Gateway Add & Audit
│   │   │   ├── orders/             # Order Pipeline & Cash Memo
│   │   │   ├── products/           # Catalog & Pin-to-Top
│   │   │   └── settings/           # System Settings
│   │   ├── checkout/               # 1-Page Bilingual Checkout
│   │   ├── product/[id]/           # Product Details Page
│   │   ├── track-order/            # Order Tracking Page
│   │   ├── globals.css             # Styles & RTL Arabic Typography
│   │   └── layout.js               # Root Bilingual Layout & Fonts
│   ├── components/                 # Reusable UI Components
│   │   ├── Header.jsx              # Bilingual Header with Lang Switcher
│   │   ├── SidebarDrawer.jsx       # Sliding Menu
│   │   ├── ProductCard.jsx         # Product Card with AR/EN labels
│   │   ├── ProductDetailActions.jsx# WhatsApp & Call to Order
│   │   └── FloatingSupport.jsx     # Floating WhatsApp & Call Buttons
│   ├── context/                    # React Context (Cart, Wishlist, Language)
│   ├── lib/                        # Database pool, Districts, Translations, CAPI
│   └── public/                     # Brand logos, icons, and media
│
└── README.md                       # Comprehensive Documentation
```

---

## 🛠️ Getting Started (Local Development)

### 1. Install Dependencies
```bash
cd 2_NextJS_React_Full_Source_UI
npm install
```

### 2. Configure Environment Variables (Optional)
Create a `.env.local` file in `2_NextJS_React_Full_Source_UI`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=jawalitelecom
NEXT_PUBLIC_SITE_URL=https://jawalibahrain.com
```
*(Note: If MySQL is not configured, the platform automatically runs on high-speed resilient mock storage so development and demonstration never break!)*

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Admin Access
Navigate to [http://localhost:3000/admin/login](http://localhost:3000/admin/login):
- **Username:** `admin` or `jawali`
- **Password:** `jawali2026` or `admin123`

---

## 🏢 Branch Contact Details
* **Bahrain Main Showroom:**
  - Address: Shop 14, Commercial District, Manama, Kingdom of Bahrain
  - Phone / WhatsApp: `+973 3398 9339`
* **Bangladesh Branch:**
  - Address: Bypass Road, In Front of Ramganj Tower, Ramganj, Lakshmipur, Bangladesh
  - Phone / WhatsApp: `01339893391`

---

## 📄 License
Copyright © 2026 **Jawali Telecom**. All rights reserved.
Developed by **Nayem Khondokar 2026**.
