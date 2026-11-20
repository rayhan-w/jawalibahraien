// Dual-layer Meta Pixel & Conversions API (CAPI) Tracking Utility

export function trackClientAndServer(eventName, eventData = {}, customUserData = {}) {
  try {
    // 1. Browser Client Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', eventName, eventData);
    }

    // 2. Server-side CAPI Trigger
    if (typeof window !== 'undefined') {
      fetch('/api/admin/tracking/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName,
          eventData,
          userData: {
            ...customUserData,
            userAgent: navigator.userAgent,
            url: window.location.href,
          },
        }),
      }).catch(() => {});
    }
  } catch (err) {
    console.debug('Tracking error silenced:', err);
  }
}
