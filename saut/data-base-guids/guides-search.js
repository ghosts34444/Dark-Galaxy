// scripts/guides-search.js
document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.GUIDES_DATA === 'undefined') {
    console.error('GUIDES_DATA не загружена');
    return;
  }

  const searchInput = document.getElementById('guide-search');
  const searchClear = document.getElementById('search-clear');
  const resultsContainer = document.getElementById('search-results-container');
  const contentWrapper = document.getElementById('content-wrapper');

  if (!searchInput || !resultsContainer || !contentWrapper) return;

  // === ЗАПОМИНАНИЕ СЕКЦИИ ПО ЦЕНТРУ ===
  let closestSectionToCenter = null;

  function updateClosestSection() {
    const sections = document.querySelectorAll('.guide-section[id]');
    let minDistance = Infinity;
    let closest = null;

    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      const centerOfSection = rect.top + rect.height / 2;
      const distanceToScreenCenter = Math.abs(centerOfSection - window.innerHeight / 2);
      
      if (distanceToScreenCenter < minDistance) {
        minDistance = distanceToScreenCenter;
        closest = section.id;
      }
    }
    
    if (closest) {
      closestSectionToCenter = closest;
    }
  }

  // Обновляем при прокрутке и загрузке
  window.addEventListener('scroll', updateClosestSection);
  updateClosestSection(); // при загрузке

  // Отключаем авто-фокус
  searchInput.blur();
  searchInput.addEventListener('focus', (e) => e.preventDefault());

  // Очистка поиска
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.style.display = 'none';
    resultsContainer.style.display = 'none';
    contentWrapper.style.display = 'block';
    
    // Возврат к ближайшей секции
    if (closestSectionToCenter) {
      const element = document.getElementById(closestSectionToCenter);
      if (element) {
        const middle = element.getBoundingClientRect().top + window.pageYOffset - (window.innerHeight / 2);
        window.scrollTo({
          top: middle,
          behavior: 'smooth'
        });
        return;
      }
    }
    
    // Если нет секции — вверх
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Поиск (ТОЛЬКО по названиям секций)
  searchInput.addEventListener('input', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const query = searchInput.value.trim();
    searchClear.style.display = query ? 'block' : 'none';

    if (query.length >= 1) {
      // Убираем фокус с поля
      searchInput.blur();
      
      // Прокручиваем вверх
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 10);
      
      contentWrapper.style.display = 'none';
      let results = [];
      const lowerQuery = query.toLowerCase();

      for (const [modKey, mod] of Object.entries(window.GUIDES_DATA)) {
        for (const [secKey, section] of Object.entries(mod.sections || {})) {
          if (section.title.toLowerCase().includes(lowerQuery)) {
            results.push({
              modTitle: mod.title,
              title: section.title,
              link: `${mod.page}#${secKey}`,
              image: section.image || ''
            });
          }
        }
      }

      if (results.length > 0) {
        let html = '<div class="search-results-grid">';
        results.slice(0, 6).forEach(res => {
          const highlighted = res.title.replace(
            new RegExp(`(${query})`, 'gi'),
            '<mark>$1</mark>'
          );
          const imgPath = res.image || '../../assets/images/placeholder.png';
          html += `
            <div class="search-result">
              <div class="search-result-image">
                <img src="${imgPath}" alt="${res.title}" loading="lazy">
              </div>
              <h4>
                <a href="${res.link}" onclick="scrollToSection('${res.link}'); return false;">
                  ${highlighted}
                </a>
                <small>(${res.modTitle})</small>
              </h4>
            </div>
          `;
        });
        html += '</div>';
        resultsContainer.innerHTML = html;
        resultsContainer.style.display = 'block';
        
        // Убеждаемся, что результаты видны
        setTimeout(() => {
          resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      } else {
        resultsContainer.innerHTML = '<div class="search-result" style="text-align:center;color:#c0c0e0;">Ничего не найдено</div>';
        resultsContainer.style.display = 'block';
      }
    } else {
      resultsContainer.style.display = 'none';
      contentWrapper.style.display = 'block';
    }
  });
});

// Прокрутка к секции
function scrollToSection(link) {
  const searchInput = document.getElementById('guide-search');
  const searchClear = document.getElementById('search-clear');
  const resultsContainer = document.getElementById('search-results-container');
  const contentWrapper = document.getElementById('content-wrapper');
  
  if (searchInput) {
    searchInput.value = '';
    searchClear.style.display = 'none';
    resultsContainer.style.display = 'none';
    contentWrapper.style.display = 'block';
  }

  const hashIndex = link.indexOf('#');
  if (hashIndex === -1) {
    window.location.href = link;
    return;
  }

  const pagePath = link.substring(0, hashIndex);
  const hash = link.substring(hashIndex + 1);

  const currentPath = window.location.pathname;
  let isCurrentPage = false;
  
  if (pagePath === '') {
    isCurrentPage = true;
  } else if (pagePath === currentPath) {
    isCurrentPage = true;
  } else if (pagePath.startsWith('.')) {
    try {
      const url = new URL(pagePath, window.location.href);
      isCurrentPage = url.pathname === currentPath;
    } catch (e) {
      isCurrentPage = false;
    }
  }

  if (isCurrentPage) {
    const element = document.getElementById(hash);
    if (element) {
      const middle = element.getBoundingClientRect().top + window.pageYOffset - (window.innerHeight / 2);
      window.scrollTo({
        top: middle,
        behavior: 'smooth'
      });
      return;
    }
  }

  window.location.href = link;
}