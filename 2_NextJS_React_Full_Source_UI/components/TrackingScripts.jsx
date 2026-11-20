'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

export default function TrackingScripts({ initialPixelId = '' }) {
  const [config, setConfig] = useState(() => ({
    pixelId: initialPixelId ? String(initialPixelId).trim() : '',
    gtmId: '',
    ga4Id: '',
  }));
  const pathname = usePathname();
  const lastPath = useRef('');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setConfig((prev) => ({
            pixelId: json.data.fb_pixel_id?.trim() || prev.pixelId || '',
            gtmId: json.data.gtm_id?.trim() || '',
            ga4Id: json.data.ga4_id?.trim() || '',
          }));
        }
      })
      .catch((err) => console.debug('Failed to load tracking settings:', err));
  }, []);

  // Track PageView on route change for SPA navigation
  useEffect(() => {
    if (!pathname) return;
    if (lastPath.current === '') {
      // First mount is already tracked by inline init script
      lastPath.current = pathname;
      return;
    }
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({ event: 'page_view', page_path: pathname });
    }
  }, [pathname]);

  if (!config.gtmId && !config.ga4Id) return null;

  return (
    <>
      {/* Google Tag Manager */}
      {config.gtmId && (
        <>
          <Script
            id="gtm-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${config.gtmId}');
              `,
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${config.gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}

      {/* Google Analytics 4 (GA4) */}
      {config.ga4Id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${config.ga4Id}`}
            strategy="afterInteractive"
          />
          <Script
            id="ga4-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${config.ga4Id}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}
    </>
  );
}
