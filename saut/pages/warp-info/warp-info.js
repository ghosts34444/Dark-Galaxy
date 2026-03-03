let departments = {};
let lastOpenedDeptKey = null;
let tableWasVisible = false;

async function loadDepartments() {
    try {
        const response = await fetch('departments.json');
        if (!response.ok) throw new Error('Не удалось загрузить JSON');
        departments = await response.json();
        initApp();
    } catch (error) {}
}

function initApp() {
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
    }
    document.getElementById('open-mods-modal')?.addEventListener('click', () => {
        showModal('mods-modal');
    });
    document.getElementById('mods-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'mods-modal') closeModal('mods-modal');
    });
    document.getElementById('close-table')?.addEventListener('click', () => {
        hideTable();
        tableWasVisible = false;
    });
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
            row.style.animation = `fadeInRow 0.3s ease ${index * 0.05}s forwards`;
            row.style.opacity = '0';
        });
    }

    const table = document.getElementById('mod-table');
    if (table) {
        table.style.display = 'block';
        table.classList.remove('closing');
        table.classList.add('visible');
    }
    
    const closeBtn = document.getElementById('close-table');
    if (closeBtn) closeBtn.style.display = 'block';
}
function hideTable() {
    const table = document.getElementById('mod-table');
    if (table) {
        table.classList.add('closing');
        table.classList.remove('visible');
        
        setTimeout(() => {
            table.style.display = 'none';
            table.classList.remove('closing');
        }, 300);
    }
    
    const closeBtn = document.getElementById('close-table');
    if (closeBtn) closeBtn.style.display = 'none';
    
    tableWasVisible = false;
}
function performSearch(query) {
    const resultsDiv = document.getElementById('search-results');
    if (!resultsDiv) return;
    
    let html = '';
    
    for (const [key, dept] of Object.entries(departments)) {
        const matches = dept.items.filter(item =>
            item.name.toLowerCase().includes(query.toLowerCase())
        );
        
        if (matches.length) {
            html += `<h3>${dept.name}</h3><table class="search-results-table">`;
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
    
    resultsDiv.classList.remove('closing');
    resultsDiv.classList.add('visible');
}


loadDepartments();
