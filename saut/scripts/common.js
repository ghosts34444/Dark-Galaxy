// styles/stars/stars.js
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('stars-container');
  if (!container) return;

  // Символы для разнообразия
  const symbols = ['•', '✦', '✧', '★'];
  let starCount = 0;
  const MAX_STARS = 30; // ← меньше = лучше производительность

  // Запретная зона сверху (меню + поиск)
  const TOP_OFFSET = 10;

  // CSS-анимация падения
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fall {
      0% {
        transform: translateY(0) rotate(0deg);
        opacity: 0.8;
        filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.9));
      }
      100% {
        transform: translateY(${window.innerHeight}px) rotate(${Math.random() * 720}deg);
        opacity: 0;
        filter: none;
      }
    }
  `;
  document.head.appendChild(style);

  function createStar() {
    if (starCount >= MAX_STARS) return;

    const star = document.createElement('div');
    star.className = 'star';

    // Случайный символ
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    star.textContent = symbol;

    // Позиция: только ниже запретной зоны
    const safeHeight = window.innerHeight - TOP_OFFSET;
    star.style.left = Math.random() * 100 + 'vw';
    star.style.top = (TOP_OFFSET + Math.random() * safeHeight) + 'px';

    // Стиль
    const size = 0.7 + Math.random() * 0.6;
    star.style.fontSize = size + 'em';
    star.style.color = 'white';
    star.style.fontWeight = 'bold';

    // Анимация падения
    const duration = 5 + Math.random() * 5; // 5-10 сек
    star.style.animation = `fall ${duration}s linear forwards`;

    // Удаляем после анимации
    setTimeout(() => {
      star.remove();
      starCount--;
    }, duration * 1000);

    container.appendChild(star);
    starCount++;
  }

  // Генерация звёзд
  setInterval(createStar, 1200); // реже = меньше нагрузки
});

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
  <li><a href="pages/warp-info/warp-info.html">ЦЕНЫ ВАРПА</a></li>
  <li><a href="index.html">ГЛАВНАЯ</a></li>
  <li><a href="pages/guids/guids.html">ГАЙДЫ</a></li>
` : `
  <li><a href="warp-info/warp-info.html">ЦЕНЫ ВАРПА</a></li>
  <li><a href="index.html">ГЛАВНАЯ</a></li>
  <li><a href="guids/guids.html">ГАЙДЫ</a></li>
`;

function initMenu() {
  if (window.innerWidth <= 768) {
    createMobileMenu(linksHtml);
  } else {
    cleanupMobileMenu();
  }
}

function run() {
  cleanupMobileMenu();
  mobileMenuActive = false;
  initMenu();
}
document.addEventListener('DOMContentLoaded', run);
window.addEventListener('pageshow', run);
window.addEventListener('resize', () => {
  clearTimeout(window.resizeTimer);
  window.resizeTimer = setTimeout(initMenu, 150);
});
