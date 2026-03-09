// scripts/guids-l.js
document.addEventListener('DOMContentLoaded', async () => {

    const [guidesRes, guisRes] = await Promise.all([
        fetch('../saut/json/guids-data.json'),
        fetch('../saut/json/png-map.json')
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
        'botania': 'linear-gradient(135deg, #1e5f3e, #3d8b5e)',
        'default': 'linear-gradient(135deg, #1a1a2e, #16213e)'
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
            import('../scripts/gui-m.js').then(module => {
                module.loadMobileGUI(container, gui);
            });
        } else {
            import('../scripts/gui-p.js').then(module => {
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
        // Очистка поиска
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

        // ← Гайды с секциями
        let guidesHtml = '';
        category.guides.forEach(guide => {
            guidesHtml += `
                <div class="guide-section" data-category="${categoryId}" id="${guide.id}">
                    <div class="section-box">
                        ${guide.model ? `<model-viewer class="section-model" src="${guide.model}" camera-controls auto-rotate ar shadow-intensity="1" environment-image="neutral" loading="lazy"></model-viewer>` : ''}
                        <h3>${guide.title}</h3>
            `;

            // ← Проходим по ВСЕМ секциям гайда
            if (guide.sections && guide.sections.length > 0) {
                guide.sections.forEach(section => {
                    // Контент секции
                    if (section.content) {
                        guidesHtml += `<div class="guide-content">${section.content}</div>`;
                    }

                    // Картинка секции
                    if (section.image) {
                        guidesHtml += `<img src="../assets/guides/${section.image}" class="guide-image" alt="${guide.title}">`;
                    }

                    // GUI секции
                    if (section.guiId) {
                        guidesHtml += `<div class="gui-container" data-gui-id="${section.guiId}"></div>`;
                    }
                });
            }

            guidesHtml += `
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
                searchAliases: guide.searchAliases || [
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
    window.jumpToSection = function(sectionId) {
        if (searchInput) searchInput.value = '';
        if (searchClear) searchClear.style.display = 'none';
        if (resultsContainer) resultsContainer.style.display = 'none';

        const element = document.getElementById(sectionId);
        if (element) {
            if (container) container.style.display = 'block';
            if (mainInstruction) mainInstruction.style.display = 'none';

            const middle = element.getBoundingClientRect().top + window.pageYOffset - (window.innerHeight / 2);
            window.scrollTo({ top: middle, behavior: 'smooth' });

            element.style.transition = 'background 0.5s ease';
            element.style.background = 'rgba(138, 109, 255, 0.2)';
            setTimeout(() => {
                element.style.background = 'transparent';
            }, 1500);
        } else {
            const guide = window.ALL_GUIDES.find(g => g.uniqueId === sectionId);
            if (guide) {
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

    // === ПОИСК ===
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

        for (const guide of window.ALL_GUIDES) {
            const titleMatch = guide.title.toLowerCase().includes(query);
            const aliasMatch = (guide.searchAliases || []).some(alias =>
                alias.toLowerCase().includes(query)
            );

            if (titleMatch || aliasMatch) {
                let image = guide.image || '';
                if (!image && guide.sections && guide.sections.length > 0) {
                    const sectionWithImage = guide.sections.find(s => s.image);
                    if (sectionWithImage && sectionWithImage.image) {
                        image = `../assets/guides/${sectionWithImage.image}`;
                    }
                }

                results.push({
                    uniqueId: guide.uniqueId,
                    title: guide.title,
                    category: guide.category,
                    categoryName: guide.categoryName,
                    image: image
                });
            }
        }

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

            resultsContainer.querySelectorAll('.search-result').forEach(card => {
                card.addEventListener('click', () => {
                    const uniqueId = card.dataset.uniqueId;
                    const category = card.dataset.category;

                    const currentCategory = container.querySelector('.guide-section')?.dataset.category;

                    if (currentCategory === category) {
                        window.jumpToSection(uniqueId);
                    } else {
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