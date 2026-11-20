import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNavWrapper from '@/components/BottomNavWrapper';
import SidebarDrawer from '@/components/SidebarDrawer';
import WishlistDrawer from '@/components/WishlistDrawer';
import Toast from '@/components/Toast';
import TrackingScripts from '@/components/TrackingScripts';
import db from '@/lib/db';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jawalibahrain.com';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Jawali Telecom Bahrain | Official Smartphones, Gadgets & Tech Accessories',
    template: '%s | Jawali Telecom Bahrain',
  },
  description:
    'Buy 100% genuine smartphones, wireless earbuds, smartwatches, fast chargers, power banks, and accessories with official warranty and express delivery across Bahrain & GCC.',
  keywords: [
    'Jawali Telecom Bahrain',
    'جوالي تليكوم البحرين',
    'Smartphones Bahrain',
    'Buy iPhone Bahrain',
    'Samsung Bahrain',
    'BenefitPay Online Shopping',
    'Original Tech Gadgets Bahrain',
    'Earbuds Manama',
    'Fast Cash on Delivery Bahrain',
  ],
  authors: [{ name: 'Jawali Telecom' }],
  creator: 'Jawali Telecom',
  publisher: 'Jawali Telecom',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    other: {
      'facebook-domain-verification': ['gyszsdxnwydqp47omymsfwg0k06r5g'],
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Jawali Telecom Bahrain | Smartphones & Premium Gadgets',
    description:
      'Shop 100% genuine smartphones, audio gear, smartwatches, and tech accessories with fast express delivery in Bahrain.',
    url: SITE_URL,
    siteName: 'Jawali Telecom Bahrain',
    images: [
      {
        url: `${SITE_URL}/logo.PNG`,
        width: 800,
        height: 600,
        alt: 'Jawali Telecom Official Store',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: '/logo.PNG',
    shortcut: '/logo.PNG',
    apple: '/logo.PNG',
  },
};

async function getDomainVerification() {
  try {
    const [rows] = await db.query(
      "SELECT setting_value FROM settings WHERE setting_key = 'facebook_domain_verification'"
    );
    if (rows && rows.length > 0 && rows[0].setting_value?.trim()) {
      return rows[0].setting_value.trim();
    }
  } catch (e) {}
  return 'gyszsdxnwydqp47omymsfwg0k06r5g';
}

async function getPixelId() {
  try {
    const [rows] = await db.query(
      "SELECT setting_value FROM settings WHERE setting_key = 'facebook_pixel_id'"
    );
    if (rows && rows.length > 0 && rows[0].setting_value?.trim()) {
      return rows[0].setting_value.trim();
    }
  } catch (e) {}
  return '2885374808528526';
}

export default async function RootLayout({ children }) {
  const fbDomainVerification = await getDomainVerification();
  const fbPixelId = await getPixelId();
  const storeName = 'Jawali Telecom';

  return (
    <html lang="en">
      <head>
        <meta name="facebook-domain-verification" content={fbDomainVerification} />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.6.0/css/all.min.css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {fbPixelId && (
          <>
            <script
              id="fb-pixel-init"
              dangerouslySetInnerHTML={{
                __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '${fbPixelId}');fbq('track', 'PageView');`,
              }}
            />
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${fbPixelId}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
      </head>
      <body>
        <CartProvider>
          <TrackingScripts initialPixelId={fbPixelId} />
          <Header storeName={storeName} />
          <SidebarDrawer storeName={storeName} />
          <WishlistDrawer />
          <Toast />
          <main style={{ flex: '1 0 auto', width: '100%', position: 'relative' }}>{children}</main>
          <Footer storeName={storeName} />
          <BottomNavWrapper />
        </CartProvider>
      </body>
    </html>
  );
}
