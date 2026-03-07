// scripts/guides-loader.js
document.addEventListener('DOMContentLoaded', async () => {

  const [guidesRes, guisRes] = await Promise.all([
    fetch('guids-data.json'),  // ← Исправлен путь!
    fetch('png-map.json')       // ← Исправлен путь!
  ]);

  const guidesData = await guidesRes.json();
  const guisData = await guisRes.json();

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
    'thaumcraft': 'linear-gradient(135deg, #4a235a, #8e44ad)',
    'botania': 'linear-gradient(135deg, #1e5f3e, #3d8b5e)'
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
    // ← ДОБАВЬ ОЧИСТКУ ПОИСКА В НАЧАЛЕ ФУНКЦИИ
    if (searchInput) searchInput.value = '';
    if (searchClear) searchClear.style.display = 'none';
    if (resultsContainer) resultsContainer.style.display = 'none';

    if (mainInstruction) mainInstruction.style.display = 'none';

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
      // ← ВАЖНО: используем guide.id для HTML элемента!
      guidesHtml += `
                <div class="guide-section" data-category="${categoryId}" id="${guide.id}">
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

  // === ЭКСПОРТ ДАННЫХ ДЛЯ ПОИСКА ===
  window.GUIDES_DATA = {};
  window.ALL_GUIDES = [];

  guidesData.categories.forEach(cat => {
    window.GUIDES_DATA[cat.id] = {
      title: cat.title,
      image: cat.image,
      guides: []
    };

    cat.guides.forEach(guide => {
      // Уникальный ID (уже есть в guide.id)
      const uniqueId = guide.id;

      window.GUIDES_DATA[cat.id].guides.push({
        ...guide,
        uniqueId: uniqueId
      });

      window.ALL_GUIDES.push({
        ...guide,
        uniqueId: uniqueId,
        category: cat.id,
        categoryName: cat.title,
        searchAliases: [
          guide.title.toLowerCase(),
          cat.title.toLowerCase(),
          `${cat.title} ${guide.title}`.toLowerCase(),
          guide.sectionId || ''
        ]
      });
    });
  });

  console.log('✅ GUIDES_DATA:', Object.keys(window.GUIDES_DATA).length, 'категорий');
  console.log('✅ ALL_GUIDES:', window.ALL_GUIDES.length, 'гайдов');

  // === ГЛОБАЛЬНАЯ ФУНКЦИЯ ПЕРЕХОДА ===
  window.jumpToSection = function (sectionId) {
    console.log('📍 Переход к:', sectionId);

    // Очищаем поиск
    if (searchInput) searchInput.value = '';
    if (searchClear) searchClear.style.display = 'none';
    if (resultsContainer) resultsContainer.style.display = 'none';

    // Ищем секцию по ID
    const element = document.getElementById(sectionId);
    if (element) {
      if (container) container.style.display = 'block';
      if (mainInstruction) mainInstruction.style.display = 'none';

      const middle = element.getBoundingClientRect().top + window.pageYOffset - (window.innerHeight / 2);
      window.scrollTo({ top: middle, behavior: 'smooth' });

      // Подсветка секции
      element.style.transition = 'background 0.5s ease';
      element.style.background = 'rgba(138, 109, 255, 0.2)';
      setTimeout(() => {
        element.style.background = 'transparent';
      }, 1500);

      console.log('✅ Найдено:', sectionId);
    } else {
      console.warn('❌ Не найдено:', sectionId);

      // Пытаемся найти гайд и открыть категорию
      const guide = window.ALL_GUIDES.find(g => g.uniqueId === sectionId);
      if (guide) {
        console.log('📂 Открываем категорию:', guide.category);
        showCategoryGuides(guide.category);
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) {
            const middle = el.getBoundingClientRect().top + window.pageYOffset - (window.innerHeight / 2);
            window.scrollTo({ top: middle, behavior: 'smooth' });
          }
        }, 400);
      }
    }
  };

  // === ПОИСК (ИСПОЛЬЗУЕТ window.ALL_GUIDES!) ===
  function performSearch(term) {
    if (!term.trim()) {
      if (resultsContainer) resultsContainer.style.display = 'none';
      if (container && container.children.length > 0) {
        container.style.display = 'block';
        mainInstruction.style.display = 'none';
      } else {
        showMainPage();
      }
      return;
    }

    const query = term.toLowerCase();
    let results = [];

    // ← Ищем в window.ALL_GUIDES (не в searchIndex!)
    for (const guide of window.ALL_GUIDES) {
      const titleMatch = guide.title.toLowerCase().includes(query);
      const aliasMatch = (guide.searchAliases || []).some(alias =>
        alias.toLowerCase().includes(query)
      );

      if (titleMatch || aliasMatch) {
        // Находим изображение
        let image = guide.image || '';
        if (!image && guide.guiId) {
          const gui = guis.get(guide.guiId);
          if (gui && gui.image) image = gui.image;
        }

        results.push({
          uniqueId: guide.uniqueId,  // ← Уникальный ID!
          title: guide.title,
          category: guide.category,
          categoryName: guide.categoryName,
          image: image
        });
      }
    }

    // Отображаем результаты
    if (results.length > 0) {
      let html = '<div class="search-results-grid">';
      results.slice(0, 12).forEach(res => {
        const highlighted = res.title.replace(
          new RegExp(`(${query})`, 'gi'),
          '<mark>$1</mark>'
        );
        const imgPath = res.image || '../../assets/images/placeholder.png';

        html += `
                <div class="search-result" data-unique-id="${res.uniqueId}" data-category="${res.category}">
                    <div class="search-result-image">
                        <img src="${imgPath}" alt="${res.title}" loading="lazy">
                    </div>
                    <h4>
                        ${highlighted}
                        <small>(${res.categoryName})</small>
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

      // ← КЛИК ПО КАРТОЧКЕ
      resultsContainer.querySelectorAll('.search-result').forEach(card => {
        card.addEventListener('click', () => {
          const uniqueId = card.dataset.uniqueId;
          const category = card.dataset.category;

          console.log('🖱️ Клик по карточке:', uniqueId, category);

          // Проверяем, открыта ли уже нужная категория
          const currentCategory = container.querySelector('.guide-section')?.dataset.category;

          if (currentCategory === category) {
            // Категория уже открыта — просто скроллим
            window.jumpToSection(uniqueId);
          } else {
            // Нужно открыть другую категорию
            showCategoryGuides(category);
            setTimeout(() => {
              window.jumpToSection(uniqueId);
            }, 400);
          }
        });
      });

      setTimeout(() => {
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      if (resultsContainer) {
        resultsContainer.innerHTML = '<div style="text-align:center;color:#c0c0e0;padding:40px;">🔍 Ничего не найдено</div>';
        resultsContainer.style.display = 'block';
        if (container) container.style.display = 'none';
        if (mainInstruction) mainInstruction.style.display = 'none';
      }
    }
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

  // === СОБЫТИЯ МОДАЛЬНОГО ОКНА ===
  if (openBtn && modal) {
    openBtn.onclick = () => modal.style.display = 'block';
  }

    if (openBtn) {
        // Сохраняем top из CSS или устанавливаем своё
        const currentTop = getComputedStyle(openBtn).top;
        console.log('🔘 Кнопка гайдов: top =', currentTop);
        
        // Если нужно переопределить:
        // openBtn.style.top = '120px';
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

      // ← ДОБАВЬ ОЧИСТКУ ПОИСКА
      if (searchInput) searchInput.value = '';
      if (searchClear) searchClear.style.display = 'none';
      if (resultsContainer) resultsContainer.style.display = 'none';

      showCategoryGuides(categoryId);
      if (modal) modal.style.display = 'none';
    }
  });

  // === ПОИСК ===
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const value = e.target.value.trim();
      searchClear.style.display = value ? 'block' : 'none';
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

      if (resultsContainer) resultsContainer.style.display = 'none';
      if (container && container.children.length > 0) {
        container.style.display = 'block';
      } else {
        showMainPage();
      }
    });
  }

  // Глобальные функции
  window.showCategoryGuides = showCategoryGuides;
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