// styles/menu/menu-combined.js

let mobileMenuActive = false;

function cleanupMobileMenu() {
  if (mobileMenuActive) {
    document.querySelectorAll('.mobile-menu-overlay').forEach(el => el.remove());
    const btn = document.querySelector('.menu-toggle');
    if (btn) btn.classList.remove('open');
    document.body.style.overflow = '';
    mobileMenuActive = false;
  }
}

function createMobileMenu(linksHtml) {
  cleanupMobileMenu();

  const mobileBtn = document.querySelector('.menu-toggle');
  if (!mobileBtn) return;

  const overlay = document.createElement('div');
  overlay.className = 'mobile-menu-overlay';
  overlay.innerHTML = `<ul class="mobile-nav">${linksHtml}</ul>`;
  document.body.appendChild(overlay);

  const toggle = () => {
    overlay.classList.toggle('active');
    mobileBtn.classList.toggle('open');
    document.body.style.overflow = overlay.classList.contains('active') ? 'hidden' : '';
  };

  mobileBtn.onclick = toggle;

  overlay.querySelectorAll('a').forEach(a => {
    a.onclick = () => {
      cleanupMobileMenu();
    };
  });

  mobileMenuActive = true;
}

const isHomePage = window.location.pathname.endsWith('/index.html') || 
                   window.location.pathname === '/saut/' || 
                   window.location.pathname === '/saut';

let linksHtml = isHomePage ? `
  <li><a href="index.html">ГЛАВНАЯ</a></li>
  <li><a href="pages/warp-info/warp-info.html">ЦЕНЫ ВАРПА</a></li>
  <li><a href="pages/guids/guids.html">ГАЙДЫ</a></li>
  <li><a href="pages/guids/new-wipe.html">О ВАЙПЕ</a></li>
  <li><a href="pages/creators/creators.html">СОЗДАТЕЛИ</a></li>
` : `
  <li><a href="../../index.html">ГЛАВНАЯ</a></li>
  <li><a href="../warp-info/warp-info.html">ЦЕНЫ ВАРПА</a></li>
  <li><a href="../guids/guids.html">ГАЙДЫ</a></li>
  <li><a href="../guids/new-wipe.html">О ВАЙПЕ</a></li>
  <li><a href="../creators/creators.html">СОЗДАТЕЛИ</a></li>
`;

function initMenu() {
  if (window.innerWidth <= 1199) {
    createMobileMenu(linksHtml);
  } else {
    cleanupMobileMenu();
  }
}

// Основной запуск
function run() {
  // Удаляем всё при любом показе страницы (включая "Назад")
  cleanupMobileMenu();
  // Сбрасываем состояние
  mobileMenuActive = false;
  // Инициализируем заново
  initMenu();
}

// Запуск при полной загрузке
document.addEventListener('DOMContentLoaded', run);

// Запуск при каждом показе страницы (включая history.back)
window.addEventListener('pageshow', run);

// Обработка изменения размера
window.addEventListener('resize', () => {
  clearTimeout(window.resizeTimer);
  window.resizeTimer = setTimeout(initMenu, 150);
});
