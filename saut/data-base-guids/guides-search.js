// === scripts/guides-search.js ===
// НОВЫЙ ПОИСК ДЛЯ ГАЙДОВ (с переходом между категориями)

(function() {
    'use strict';
    
    // Ждём загрузки данных
    function init() {
        const searchInput = document.getElementById('guide-search');
        const searchClear = document.getElementById('search-clear');
        const resultsContainer = document.getElementById('search-results-container');
        const contentWrapper = document.getElementById('main-instruction');
        const guidesContainer = document.getElementById('guides-container');
        
        if (!searchInput || !resultsContainer) {
            console.warn('⚠️ Элементы поиска не найдены');
            return;
        }
        
        // Отключаем авто-фокус
        searchInput.addEventListener('focus', (e) => e.preventDefault());
        searchInput.blur();
        
        // === ОЧИСТКА ПОИСКА ===
        searchClear?.addEventListener('click', () => {
            searchInput.value = '';
            searchClear.style.display = 'none';
            resultsContainer.style.display = 'none';
            
            if (guidesContainer && guidesContainer.children.length > 0) {
                guidesContainer.style.display = 'block';
                contentWrapper.style.display = 'none';
            } else {
                contentWrapper.style.display = 'block';
                guidesContainer.style.display = 'none';
            }
        });
        
        // === ПОИСК ===
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            searchClear.style.display = query ? 'block' : 'none';
            
            if (query.length >= 1) {
                searchInput.blur();
                performSearch(query, resultsContainer, guidesContainer, contentWrapper);
            } else {
                resultsContainer.style.display = 'none';
                
                if (guidesContainer && guidesContainer.children.length > 0) {
                    guidesContainer.style.display = 'block';
                    contentWrapper.style.display = 'none';
                } else {
                    contentWrapper.style.display = 'block';
                    guidesContainer.style.display = 'none';
                }
            }
        });
        
        console.log('✅ Поиск инициализирован');
    }
    
    // === ФУНКЦИЯ ПОИСКА ===
    function performSearch(query, resultsContainer, guidesContainer, contentWrapper) {
        if (!window.GUIDES_DATA || !window.ALL_GUIDES) {
            console.warn('⚠️ GUIDES_DATA не загружена');
            return;
        }
        
        const lowerQuery = query.toLowerCase();
        let results = [];
        
        // Ищем во ВСЕХ категориях
        for (const guide of window.ALL_GUIDES) {
            const titleMatch = guide.title.toLowerCase().includes(lowerQuery);
            const aliasMatch = (guide.searchAliases || []).some(alias => 
                alias.toLowerCase().includes(lowerQuery)
            );
            
            if (titleMatch || aliasMatch) {
                results.push({
                    uniqueId: guide.id,
                    sectionId: guide.sectionId,
                    title: guide.title,
                    category: guide.category,
                    categoryName: guide.categoryName,
                    image: guide.image || '',
                    content: guide.content
                });
            }
        }
        
        // Отображаем результаты
        if (results.length > 0) {
            displayResults(results, query, resultsContainer, guidesContainer, contentWrapper);
        } else {
            resultsContainer.innerHTML = `
                <div class="search-result" style="text-align:center;color:#c0c0e0;padding:40px;">
                    <p>🔍 Ничего не найдено по запросу "${query}"</p>
                </div>
            `;
            resultsContainer.style.display = 'block';
            guidesContainer.style.display = 'none';
            contentWrapper.style.display = 'none';
        }
    }
    
    // === ОТОБРАЖЕНИЕ РЕЗУЛЬТАТОВ ===
    function displayResults(results, query, resultsContainer, guidesContainer, contentWrapper) {
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
        resultsContainer.innerHTML = html;
        resultsContainer.style.display = 'block';
        guidesContainer.style.display = 'none';
        contentWrapper.style.display = 'none';
        
        // === КЛИК ПО КАРТОЧКЕ ===
        resultsContainer.querySelectorAll('.search-result').forEach(card => {
            card.addEventListener('click', () => {
                const uniqueId = card.dataset.uniqueId;
                const category = card.dataset.category;
                navigateToGuide(uniqueId, category, resultsContainer, guidesContainer, contentWrapper);
            });
        });
        
        // Скролл к результатам
        setTimeout(() => {
            resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
    
    // === ПЕРЕХОД К ГАЙДУ ===
    function navigateToGuide(uniqueId, category, resultsContainer, guidesContainer, contentWrapper) {
        console.log('📍 Переход к гайду:', uniqueId, 'категория:', category);
        
        // Очищаем поиск
        const searchInput = document.getElementById('guide-search');
        const searchClear = document.getElementById('search-clear');
        
        if (searchInput) searchInput.value = '';
        if (searchClear) searchClear.style.display = 'none';
        if (resultsContainer) resultsContainer.style.display = 'none';
        
        // Проверяем, открыта ли уже нужная категория
        const currentCategory = guidesContainer.querySelector('.guide-section')?.dataset.category;
        
        if (currentCategory === category) {
            // Категория уже открыта — просто скроллим
            scrollToSection(uniqueId, guidesContainer);
        } else {
            // Нужно открыть другую категорию
            if (typeof window.showCategoryGuides === 'function') {
                window.showCategoryGuides(category);
                
                // Ждём рендера и скроллим
                setTimeout(() => {
                    scrollToSection(uniqueId, guidesContainer);
                }, 400);
            } else {
                console.error('❌ Функция showCategoryGuides не найдена!');
            }
        }
    }
    
    // === ПРОКРУТКА К СЕКЦИИ ===
    function scrollToSection(uniqueId, guidesContainer) {
        const element = document.getElementById(uniqueId);
        
        if (element) {
            guidesContainer.style.display = 'block';
            
            const middle = element.getBoundingClientRect().top + window.pageYOffset - (window.innerHeight / 2);
            window.scrollTo({
                top: middle,
                behavior: 'smooth'
            });
            
            // Подсветка секции
            element.style.transition = 'background 0.5s ease';
            element.style.background = 'rgba(138, 109, 255, 0.2)';
            setTimeout(() => {
                element.style.background = 'transparent';
            }, 1500);
            
            console.log('✅ Секция найдена:', uniqueId);
        } else {
            console.warn('❌ Секция не найдена:', uniqueId);
        }
    }
    
    // === ЗАПУСК ===
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();