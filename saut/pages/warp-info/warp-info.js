// === ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ===
let departments = {};
let lastOpenedDeptKey = null;
let tableWasVisible = false;

// === ЗАГРУЗКА БАЗЫ ДАННЫХ ИЗ JSON ===
async function loadDepartments() {
    try {
        const response = await fetch('departments.json');
        if (!response.ok) throw new Error('Не удалось загрузить JSON');
        departments = await response.json();
        console.log('✅ База загружена:', Object.keys(departments).length, 'отделов');
        initApp();
    } catch (error) {
        console.error('❌ Ошибка загрузки данных:', error);
    }
}

// === ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ===
function initApp() {
    // === Генерация модального окна ===
    const modsList = document.getElementById('mods-list');
    if (modsList && Object.keys(departments).length > 0) {
        Object.entries(departments).forEach(([key, dept]) => {
            const div = document.createElement('div');
            div.className = 'mod-option';
            div.dataset.key = key;
            div.textContent = dept.name;
            div.addEventListener('click', (e) => {
                e.preventDefault();
                closeModal('mods-modal');
                clearSearch();
                showTable(key);
            });
            modsList.appendChild(div);
        });
        console.log('✅ Модальное окно сгенерировано');
    }

    // === Открытие модалки ===
    document.getElementById('open-mods-modal')?.addEventListener('click', () => {
        showModal('mods-modal');
    });

    // === Закрытие модалки по клику вне ===
    document.getElementById('mods-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'mods-modal') closeModal('mods-modal');
    });

    // === Закрытие таблицы ===
    document.getElementById('close-table')?.addEventListener('click', () => {
        hideTable();
        tableWasVisible = false;
    });

    // === ПОИСК ===
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');
    
    if (searchInput && searchClear) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim();
            searchClear.style.display = query ? 'block' : 'none';

            if (document.getElementById('mods-modal')?.style.display === 'flex') {
                closeModal('mods-modal');
            }

            if (query.length >= 1) {
                performSearch(query);
                hideTable();
            } else {
                const searchResults = document.getElementById('search-results');
                if (searchResults) searchResults.style.display = 'none';
                if (tableWasVisible && lastOpenedDeptKey) {
                    showTable(lastOpenedDeptKey);
                }
            }
        });

        searchClear.addEventListener('click', () => {
            clearSearch();
        });
    }
}

// === ОЧИСТКА ПОИСКА ===
function clearSearch() {
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');
    const results = document.getElementById('search-results');
    
    if (searchInput) searchInput.value = '';
    if (searchClear) searchClear.style.display = 'none';
    if (results) results.style.display = 'none';
    
    if (tableWasVisible && lastOpenedDeptKey) {
        showTable(lastOpenedDeptKey);
    }
}

// === МОДАЛЬНОЕ ОКНО ===
function showModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.style.pointerEvents = 'auto';
        }, 10);
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
            modal.style.pointerEvents = 'none';
        }, 300);
    }
}

// === ПОКАЗ ТАБЛИЦЫ ===
function showTable(key) {
    const dept = departments[key];
    if (!dept) return;

    lastOpenedDeptKey = key;
    tableWasVisible = true;

    const title = document.getElementById('table-title');
    if (title) title.textContent = dept.name;
    
    const tbody = document.getElementById('table-body');
    if (tbody) {
        tbody.innerHTML = '';
        
        dept.items.forEach((item, index) => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.price}</td>
            `;
            // ← CSS-анимация через style (проще чем JS)
            row.style.animation = `fadeInRow 0.3s ease ${index * 0.05}s forwards`;
            row.style.opacity = '0';
        });
    }

    const table = document.getElementById('mod-table');
    if (table) {
        table.style.display = 'block';
        table.classList.add('visible');
    }
    
    // ← КНОПКА ЗАКРЫТИЯ
    const closeBtn = document.getElementById('close-table');
    if (closeBtn) {
        closeBtn.style.display = 'block';
    }
}

// === СКРЫТИЕ ТАБЛИЦЫ ===
function hideTable() {
    const table = document.getElementById('mod-table');
    if (table) {
        table.classList.remove('visible');
        setTimeout(() => table.style.display = 'none', 300);
    }
    
    const closeBtn = document.getElementById('close-table');
    if (closeBtn) closeBtn.style.display = 'none';
}

// === ПОИСК ===
function performSearch(query) {
    const resultsDiv = document.getElementById('search-results');
    if (!resultsDiv) return;
    
    let html = '';
    
    for (const [key, dept] of Object.entries(departments)) {
        const matches = dept.items.filter(item =>
            item.name.toLowerCase().includes(query.toLowerCase())
        );
        
        if (matches.length) {
            html += `<h3>${dept.name}</h3><table class="search-results-table"><tr><th>Предмет</th><th>Цена</th></tr>`;
            matches.forEach((item, index) => {
                html += `<tr style="animation: fadeInRow 0.3s ease ${index * 0.05}s forwards; opacity: 0;">
                    <td>${item.name}</td>
                    <td>${item.price}</td>
                </tr>`;
            });
            html += `</table><br>`;
        }
    }
    
    resultsDiv.innerHTML = html || '<h3>Ничего не найдено</h3>';
    resultsDiv.style.display = 'block';
}

// === ЗАПУСК ===
loadDepartments();