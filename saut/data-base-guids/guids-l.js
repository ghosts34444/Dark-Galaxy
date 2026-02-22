// scripts/guides-loader.js
document.addEventListener('DOMContentLoaded', async () => {
  // Загружаем данные
  const [guidesRes, guisRes, searchIndexRes] = await Promise.all([
    fetch('../guids/guids-data.json'),
    fetch('../guids/png-map.json'),
    fetch('../guids/search-index.json')
  ]);
  
  const guidesData = await guidesRes.json();
  const guisData = await guisRes.json();
  const searchIndex = await searchIndexRes.json();
  
  window.guisData = guisData;
  
  // Плоский массив гайдов
  const allGuides = [];
  guidesData.categories.forEach(category => {
    category.guides.forEach(guide => {
      allGuides.push({
        ...guide,
        category: category.id,
        categoryName: category.title
      });
    });
  });
  
  const guis = new Map(guisData.guis.map(g => [g.id, g]));

  // Фоны по категориям
  const categoryBackgrounds = {
    'forestry': 'linear-gradient(135deg, #2d5a27, #8b7355)',
    'thaumcraft': 'linear-gradient(135deg, #4a235a, #8e44ad)'
  };

  // Проверка устройства
  function isMobile() {
    return window.innerWidth < 768;
  }

  // DOM элементы
  const container = document.getElementById('guides-container');
  const mainInstruction = document.getElementById('main-instruction');
  const modal = document.getElementById('guides-modal');
  const openBtn = document.getElementById('open-guides-btn');
  const closeBtn = document.querySelector('.close');
  const categoriesList = document.getElementById('modal-categories-list');
  const searchInput = document.getElementById('guide-search');
  const searchClear = document.getElementById('search-clear');
  const resultsContainer = document.getElementById('search-results-container');

  // Показываем главную страницу
  function showMainPage() {
    if (mainInstruction) mainInstruction.style.display = 'block';
    if (container) container.style.display = 'none';
    if (resultsContainer) resultsContainer.style.display = 'none';
    document.body.style.background = categoryBackgrounds.default;
  }

  // Загружаем один блок GUI
  async function loadGUI(container, gui) {
    if (isMobile()) {
      import('./gui-m.js').then(module => {
        module.loadMobileGUI(container, gui);
      });
    } else {
      import('./gui-p.js').then(module => {
        module.loadPCGUI(container, gui);
      });
    }
  }

  // Перезагружаем все GUI на странице
  async function reloadAllGUI() {
    const currentGuis = new Map(guisData.guis.map(g => [g.id, g]));
    
    document.querySelectorAll('.gui-container').forEach(container => {
      const guiId = container.dataset.guiId;
      const gui = currentGuis.get(guiId);
      
      if (gui) {
        container.innerHTML = '';
        loadGUI(container, gui);
      }
    });
  }

  // Показываем гайды категории
  function showCategoryGuides(categoryId) {
    if (mainInstruction) mainInstruction.style.display = 'none';
    if (resultsContainer) resultsContainer.style.display = 'none';
    
    const category = guidesData.categories.find(c => c.id === categoryId);
    if (!category || !container) return;
    
    // Фон
    document.body.style.background = categoryBackgrounds[categoryId] || categoryBackgrounds.default;
    
    // Заголовок категории
    let headerHtml = '';
    if (category.image) {
      headerHtml = `
        <div class="category-header">
          <img src="${category.image}" alt="${category.title}" class="category-image">
          <h2>${category.title}</h2>
          <img src="${category.image}" alt="${category.title}" class="category-image">
        </div>
      `;
    } else {
      headerHtml = `<h2 class="category-title">${category.title}</h2>`;
    }
    
    // Гайды
    let guidesHtml = '';
    category.guides.forEach(guide => {
      const gui = guide.guiId ? guis.get(guide.guiId) : null;
      guidesHtml += `
        <div class="guide-section" data-category="${categoryId}" id="${guide.sectionId}">
          <div class="section-box">
            ${guide.model ? `<model-viewer class="section-model" src="${guide.model}" camera-controls auto-rotate ar shadow-intensity="1" environment-image="neutral" loading="lazy"></model-viewer>` : ''}
            <h3>${guide.title}</h3>
            <div class="guide-content">${guide.content}</div>
            ${gui ? `<div class="gui-container" data-gui-id="${guide.guiId}"></div>` : ''}
          </div>
        </div>
      `;
    });
    
    container.innerHTML = headerHtml + guidesHtml;
    container.style.display = 'block';

    // Загружаем все GUI
    container.querySelectorAll('.gui-container').forEach(guiEl => {
      const guiId = guiEl.dataset.guiId;
      const gui = guis.get(guiId);
      if (gui) {
        loadGUI(guiEl, gui);
      }
    });
  }

  // Прокрутка к секции
  function jumpToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Скрываем результаты поиска
      if (resultsContainer) resultsContainer.style.display = 'none';
      if (container) container.style.display = 'block';
      
      // Очищаем поля поиска
      if (searchInput) searchInput.value = '';
      if (searchClear) searchClear.style.display = 'none';
    }
  }

  // Поиск (живой поиск при вводе)
  function performSearch(term) {
    if (!term.trim()) {
      // Если поле пустое - скрываем результаты
      if (resultsContainer) resultsContainer.style.display = 'none';
      if (container && container.style.display === 'none') {
        showMainPage();
      }
      return;
    }
    
    const query = term.toLowerCase();
    let results = [];

    for (const [sectionId, data] of Object.entries(searchIndex)) {
      const matches = [
        data.title?.toLowerCase(),
        ...(data.aliases || [])
      ].some(str => str?.includes(query));
      
      if (matches) {
        // Находим изображение из гайдов
        let image = data.image || '';
        if (!image) {
          const guide = allGuides.find(g => g.sectionId === sectionId);
          if (guide && guide.guiId) {
            const gui = guis.get(guide.guiId);
            if (gui && gui.image) image = gui.image;
          }
        }
        
        results.push({
          title: data.title,
          mod: data.mod,
          sectionId: sectionId,
          image: image
        });
      }
    }

    // Отображаем результаты
    if (results.length > 0) {
      let html = '<div class="search-results-grid">';
      results.slice(0, 6).forEach(res => {
        const highlighted = res.title.replace(
          new RegExp(`(${query})`, 'gi'),
          '<mark>$1</mark>'
        );
        const imgPath = res.image || '../../assets/images/placeholder.png';
        html += `
          <div class="search-result" onclick="jumpToSection('${res.sectionId}')">
            <div class="search-result-image">
              <img src="${imgPath}" alt="${res.title}" loading="lazy">
            </div>
            <h4>
              ${highlighted}
              <small>(${res.mod})</small>
            </h4>
          </div>
        `;
      });
      html += '</div>';
      
      if (resultsContainer) {
        resultsContainer.innerHTML = html;
        resultsContainer.style.display = 'block';
        if (container) container.style.display = 'none';
        if (mainInstruction) mainInstruction.style.display = 'none';
      }
    } else {
      if (resultsContainer) {
        resultsContainer.innerHTML = '<div style="text-align:center;color:#c0c0e0;padding:20px;">Ничего не найдено</div>';
        resultsContainer.style.display = 'block';
        if (container) container.style.display = 'none';
        if (mainInstruction) mainInstruction.style.display = 'none';
      }
    }
    
    // Прокручиваем к результатам
    setTimeout(() => {
      if (resultsContainer) resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  // Заполняем модальное окно категорий
  function populateModalCategories() {
    if (!categoriesList) return;
    
    let html = '';
    guidesData.categories.forEach(category => {
      html += `<div class="category-item" data-id="${category.id}">${category.title}</div>`;
    });
    categoriesList.innerHTML = html;
  }

  // Инициализация
  populateModalCategories();
  showMainPage();

  // === СОБЫТИЯ МОДАЛЬНОГО ОКНА КАТЕГОРИЙ ===
  if (openBtn && modal) {
    openBtn.onclick = () => modal.style.display = 'block';
  }

  if (closeBtn && modal) {
    closeBtn.onclick = () => modal.style.display = 'none';
  }

  if (modal) {
    window.onclick = (e) => {
      if (e.target === modal) modal.style.display = 'none';
    };
  }

  // Выбор категории
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('category-item')) {
      const categoryId = e.target.dataset.id;
      showCategoryGuides(categoryId);
      if (modal) modal.style.display = 'none';
    }
  });

  // === ПОИСК (живой поиск) ===
  if (searchInput) {
    // Показываем/скрываем кнопку очистки
    searchInput.addEventListener('input', (e) => {
      const value = e.target.value.trim();
      searchClear.style.display = value ? 'block' : 'none';
      
      // Выполняем поиск сразу при вводе
      performSearch(value);
    });
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      searchClear.style.display = 'none';
      
      // Возвращаемся к главной или гайдам
      if (resultsContainer) resultsContainer.style.display = 'none';
      if (container && container.style.display !== 'none') {
        container.style.display = 'block';
      } else {
        showMainPage();
      }
    });
  }

  // Глобальная функция для прокрутки
  window.jumpToSection = jumpToSection;

  // Обработчик поворота экрана
  let wasMobile = isMobile();
  window.addEventListener('resize', () => {
    const nowMobile = isMobile();
    if (nowMobile !== wasMobile) {
      wasMobile = nowMobile;
      reloadAllGUI();
    }
  });
});