
// Jawali Telecom Interactive UI Script
document.addEventListener('DOMContentLoaded', function() {
  // 1. Sidebar Menu Drawer & Overlay Toggle
  var menuBtns = document.querySelectorAll('.mobile-menu-btn, .pc-menu-btn');
  var drawer = document.querySelector('.left-sidebar-drawer');
  var overlay = document.querySelector('.left-sidebar-overlay');
  var closeBtn = document.querySelector('.sidebar-close-btn');

  function openSidebar() {
    if (drawer) drawer.classList.add('active');
    if (overlay) overlay.style.display = 'block';
  }

  function closeSidebar() {
    if (drawer) drawer.classList.remove('active');
    if (overlay) overlay.style.display = 'none';
  }

  menuBtns.forEach(function(btn) {
    btn.addEventListener('click', openSidebar);
  });

  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
  if (overlay) overlay.addEventListener('click', closeSidebar);

  // 2. Dark Mode Toggle
  var themeBtns = document.querySelectorAll('.theme-toggle-btn');
  themeBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var isDark = document.documentElement.classList.toggle('dark');
      try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch (e) {}
    });
  });

  // Restore saved theme
  try {
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}

  // 3. Search Bar Interaction
  var searchBoxes = document.querySelectorAll('.search-box');
  searchBoxes.forEach(function(box) {
    var inp = box.querySelector('input');
    var btn = box.querySelector('button');
    function doSearch() {
      if (inp && inp.value.trim()) {
        window.location.href = 'products.html?search=' + encodeURIComponent(inp.value.trim());
      } else {
        window.location.href = 'products.html';
      }
    }
    if (inp) {
      inp.removeAttribute('readonly');
      inp.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') doSearch();
      });
    }
    if (btn) btn.addEventListener('click', doSearch);
  });

  // 4. Product Cards Click Navigation
  document.querySelectorAll('.product-card').forEach(function(card) {
    card.addEventListener('click', function(e) {
      if (e.target.closest('.btn-add-cart') || e.target.closest('.btn-buy-now') || e.target.closest('button')) {
        return; // don't navigate on action button clicks
      }
      window.location.href = 'product-details.html';
    });
  });

  // 5. Buy Now Buttons -> go to checkout.html
  document.querySelectorAll('.btn-buy-now').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      window.location.href = 'checkout.html';
    });
  });

  // 6. Add to Cart Toast Notification
  document.querySelectorAll('.btn-add-cart').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var toast = document.createElement('div');
      toast.textContent = '✓ প্রোডাক্টটি কার্টে যোগ করা হয়েছে!';
      toast.style.position = 'fixed';
      toast.style.bottom = '80px';
      toast.style.right = '20px';
      toast.style.background = '#FF6600';
      toast.style.color = '#FFFFFF';
      toast.style.padding = '12px 20px';
      toast.style.borderRadius = '8px';
      toast.style.fontWeight = '700';
      toast.style.fontSize = '14px';
      toast.style.zIndex = '9999';
      toast.style.boxShadow = '0 4px 15px rgba(255, 102, 0, 0.4)';
      document.body.appendChild(toast);
      setTimeout(function() { toast.remove(); }, 2500);
    });
  });
});
