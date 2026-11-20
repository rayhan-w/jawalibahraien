'use client';

import React, { useState, useEffect } from 'react';

export default function FloatingSupport() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState({
    store_phone: '01339893391',
    whatsapp_number: '+8801339893391',
    messenger_url: 'https://m.me/jawalitelecom'
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setSettings(prev => ({
            store_phone: json.data.store_phone || prev.store_phone,
            whatsapp_number: json.data.whatsapp_number || prev.whatsapp_number,
            messenger_url: json.data.messenger_url || prev.messenger_url
          }));
        }
      })
      .catch(() => {});
  }, []);

  const cleanWhatsapp = (settings.whatsapp_number || '').replace(/[^0-9]/g, '');

  return (
    <div className="floating-support-container">
      {open && (
        <div className="floating-support-menu">
          <a
            href={`https://wa.me/${cleanWhatsapp || '8801339893391'}?text=${encodeURIComponent('Hello Jawali Telecom, I would like to get information regarding a product.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="floating-item whatsapp"
            title="Chat on WhatsApp"
            aria-label="Chat on WhatsApp"
          >
            <i className="fa-brands fa-whatsapp"></i>
            <span className="tooltip-text">WhatsApp Chat</span>
          </a>

          <a
            href={`tel:${settings.store_phone || '01339893391'}`}
            className="floating-item call"
            title="Direct Phone Call"
            aria-label="Direct Phone Call"
          >
            <i className="fa-solid fa-phone"></i>
            <span className="tooltip-text">Direct Call</span>
          </a>

          <a
            href={settings.messenger_url || 'https://m.me/jawalitelecom'}
            target="_blank"
            rel="noopener noreferrer"
            className="floating-item messenger"
            title="Facebook Messenger"
            aria-label="Facebook Messenger"
          >
            <i className="fa-brands fa-facebook-messenger"></i>
            <span className="tooltip-text">Messenger</span>
          </a>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className={`floating-main-btn ${open ? 'active' : ''}`}
        aria-label="Customer Support"
        title="Customer Support"
      >
        {open ? (
          <i className="fa-solid fa-xmark"></i>
        ) : (
          <>
            <i className="fa-solid fa-comment-dots"></i>
            <span className="pulse-ring"></span>
          </>
        )}
      </button>

      <style jsx>{`
        .floating-support-container {
          position: fixed;
          bottom: 75px;
          left: 16px;
          right: auto;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        @media (min-width: 769px) {
          .floating-support-container {
            bottom: 30px;
            right: 25px;
            left: auto;
            z-index: 1000;
          }
        }
        .floating-support-menu {
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: center;
          animation: slideUp 0.25s ease-out;
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .floating-item {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 22px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
        }
        .floating-item:hover {
          transform: scale(1.1);
        }
        .floating-item .tooltip-text {
          position: absolute;
          left: 58px;
          right: auto;
          background: #1e293b;
          color: #fff;
          padding: 5px 10px;
          border-radius: 6px;
          font-size: 12px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s;
          font-family: inherit;
        }
        @media (min-width: 769px) {
          .floating-item .tooltip-text {
            right: 58px;
            left: auto;
          }
        }
        .floating-item:hover .tooltip-text {
          opacity: 1;
        }
        .floating-item.whatsapp {
          background: #25d366;
        }
        .floating-item.call {
          background: #ff6600;
        }
        .floating-item.messenger {
          background: #0084ff;
        }
        .floating-main-btn {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #ff6600;
          color: #fff;
          border: none;
          cursor: pointer;
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(255, 102, 0, 0.4);
          position: relative;
          transition: transform 0.2s, background 0.2s;
        }
        .floating-main-btn:hover {
          transform: scale(1.05);
          background: #e65c00;
        }
        .floating-main-btn.active {
          background: #334155;
        }
        .pulse-ring {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid #ff6600;
          animation: pulseAnim 2s infinite;
          pointer-events: none;
        }
        @keyframes pulseAnim {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
