// === Картинка-заглушка ===
const PLACEHOLDER_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+CiAgPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMxZTFmMzIiLz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI3MCIgcj0iNDAiIGZpbGw9IiM0YTQ5N2MiLz4KICA8cmVjdCB4PSI2MCIgeT0iMTQwIiB3aWR0aD0iODAiIGhlaWdodD0iMzAiIHJ4PSIxNSIgZmlsbD0iIzRhNDk3YyIvPgogIDx0ZXh0IHg9IjEwMCIgeT0iMTg1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM4YTg5Y2YiIHRleHQtYW5jaG9yPSJtaWRkbGUiPjwvdGV4dD4KPC9zdmc+';

// === Описания участников ===
const DESCRIPTIONS = {
    "ghosts34444": "Я устал, я сделал все что смог....",
    "Mrkgrshtraklar": "Девушка с сюрпризом — в глазах искра, в руках фейерверк.... САМЫЙ ГЛАВНЫЙ ПУПСИК СЕРВЕРА!!!!",
    "DoKFoReVe": "Документация",
    "Lormunty": "Пописал против ветра",
    "Algrinus": "Мл.админ, но ст.модер"
};

// === Перевод ролей ===
function translateRole(roleKey) {
    const map = {
        "junior_moderator": "Младший Модератор",
        "senior_moderator": "Старший Модератор",
        "moderator": "Модератор",
        "junior_admin": "Младший Администратор",
        "admin": "Администратор",
        "senior_admin": "Старший Администратор",
        "chief_admin": "Главный Администратор",
        "curator": "Куратор",
        "helper": "Хелпер",
        "senior_helper": "Старший Хелпер"
    };
    return map[roleKey] || "Участник";
}

// === Цвета ролей ===
const ROLE_GRADIENTS = {
    "Хелпер": "linear-gradient(to bottom, #e3fde9, #a0a0a0)",
    "Старший Хелпер": "linear-gradient(to bottom, #d6ecdc, #70dbc1)",
    "Младший Модератор": "linear-gradient(to bottom, #dcfed1, #6be6ad)",
    "Модератор": "linear-gradient(to bottom, #fafeb0, #9ee87b)",
    "Старший Модератор": "linear-gradient(to bottom, #fcfbb4, #8ad627)",
    "Младший Администратор": "linear-gradient(to bottom, #dcfedb, #44dc81)",
    "Администратор": "linear-gradient(to bottom, #dbfdd7, #1cafc3)",
    "Старший Администратор": "linear-gradient(to bottom, #d9f8fe, #2798cd)",
    "Главный Администратор": "linear-gradient(to bottom, #73f4fe, #0286e1)",
    "Куратор": "linear-gradient(to bottom, #cafcf6, #8c66ff)"
};

function getRoleGradient(role) {
    return ROLE_GRADIENTS[role] || 'linear-gradient(135deg, #7f8c8d, #95a5a6)';
}

// === Глобальные данные ===
let creatorsData = [];
let currentCreatorIndex = 0;

// === Создание стрелок по бокам страницы ===
function createSideArrows() {
    // Стрелка влево (слева на странице)
    const leftArrow = document.createElement('div');
    leftArrow.id = 'sideArrowLeft';
    leftArrow.className = 'side-arrow left-arrow';
    leftArrow.innerHTML = '←';
    leftArrow.onclick = () => changeCreator(-1);
    
    // Стрелка вправо (справа на странице)
    const rightArrow = document.createElement('div');
    rightArrow.id = 'sideArrowRight';
    rightArrow.className = 'side-arrow right-arrow';
    rightArrow.innerHTML = '→';
    rightArrow.onclick = () => changeCreator(1);
    
    // Добавляем в тело документа
    document.body.appendChild(leftArrow);
    document.body.appendChild(rightArrow);
}

// === Загрузка данных ===
async function loadTeam() {
    const loading = document.getElementById('loading');
    const TARGET_LOGINS = ["ghosts34444", "Mrkgrshtraklar", "DoKFoReVe", "Lormunty", "Algrinus", "Weight_", "mixfix"];

    try {
        // Используем десктопный User-Agent для обхода блокировки
        const res = await fetch('https://loliland.net/apiv2/team', {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                'Accept': 'application/json',
                'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7'
            }
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        
        const data = await res.json();
        if (!data.team) throw new Error('Нет данных о командах');

        // Собираем всех участников
        const allMembers = new Map();
        for (const [serverKey, members] of Object.entries(data.team)) {
            if (!Array.isArray(members)) continue;
            for (const m of members) {
                if (m.user?.login) {
                    allMembers.set(m.user.login.toLowerCase(), m);
                }
            }
        }

        // Формируем данные целевых создателей
        creatorsData = TARGET_LOGINS.map(login => {
            const found = allMembers.get(login.toLowerCase());
            if (!found) return null;
            
            const user = found.user;
            const role = translateRole(found.role);
            const desc = DESCRIPTIONS[login] || "Участник команды.";
            
            let avatar = 'alisa-mikhailovna-kujou-alya-sometimes-hides-her-feelings-in-russian.gif';
            
            // Формируем правильный URL без пробелов
            if (user.avatarOrSkin?.id && user.avatarOrSkin.extension) {
                avatar = `https://loliland.ru/apiv2/user/avatar/medium/${user.avatarOrSkin.id}.${user.avatarOrSkin.extension}`;
            }
            
            return {
                login: login,
                role: role,
                roleGradient: getRoleGradient(role),
                description: desc,
                avatar: avatar
            };
        }).filter(Boolean);

        if (creatorsData.length === 0) {
            throw new Error('Не найдены целевые участники');
        }

        // Создаём интерфейс
        createSideArrows(); // ← Создаём стрелки по бокам
        createCreatorsSwitcher();
        renderCreator(currentCreatorIndex);
        
        loading.style.display = 'none';

    } catch (err) {
        console.error('Ошибка загрузки команды:', err);
        loading.innerHTML = `<div class="error">⚠️ ${err.message || 'Не удалось загрузить данные'}</div>`;
        loading.className = 'error';
    }
}

// === Создание переключателя ===
function createCreatorsSwitcher() {
    const switcher = document.createElement('div');
    switcher.className = 'creators-switcher';
    
    // Список кнопок (без стрелок!)
    const list = document.createElement('div');
    list.className = 'creators-list';
    list.id = 'creatorsList';
    
    creatorsData.forEach((creator, index) => {
        const btn = document.createElement('button');
        btn.className = `creator-btn ${index === 0 ? 'active' : ''}`;
        btn.textContent = creator.login;
        btn.dataset.index = index;
        btn.onclick = () => changeCreatorTo(index);
        list.appendChild(btn);
    });
    
    switcher.appendChild(list);
    
    // Вставляем после заголовка
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle && pageTitle.parentNode) {
        pageTitle.parentNode.insertBefore(switcher, pageTitle.nextSibling);
    }
}

// === Переключение на конкретного создателя ===
function changeCreatorTo(index) {
    if (index < 0 || index >= creatorsData.length) return;
    
    currentCreatorIndex = index;
    renderCreator(index);
    
    // Обновляем активную кнопку
    document.querySelectorAll('.creator-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });
}

// === ЦИКЛИЧЕСКОЕ переключение (бесконечная прокрутка) ===
function changeCreator(delta) {
    // Вычисляем новый индекс с зацикливанием
    let newIndex = currentCreatorIndex + delta;
    
    // Если вышли за пределы — начинаем с другого конца
    if (newIndex < 0) {
        newIndex = creatorsData.length - 1; // Последний элемент
    } else if (newIndex >= creatorsData.length) {
        newIndex = 0; // Первый элемент
    }
    
    changeCreatorTo(newIndex);
}

// === Обработка колесика мыши ===
function setupWheelNavigation() {
    let lastWheelTime = 0;
    const wheelCooldown = 300; // Задержка между прокрутками (мс)
    
    // Слушаем событие на всем документе
    document.addEventListener('wheel', (e) => {
        const now = Date.now();
        
        // Игнорируем слишком частые события
        if (now - lastWheelTime < wheelCooldown) return;
        
        // Используем ВЕРТИКАЛЬНУЮ прокрутку (работает на всех мышках)
        if (Math.abs(e.deltaY) > 10) { // Порог для фильтрации мелких движений
            e.preventDefault();
            
            if (e.deltaY > 0) {
                // Вниз → следующий создатель
                changeCreator(1);
            } else {
                // Вверх → предыдущий создатель
                changeCreator(-1);
            }
            
            lastWheelTime = now;
        }
    }, { passive: false });
}

// === Рендер карточки создателя ===
function renderCreator(index) {
    const creator = creatorsData[index];
    if (!creator) return;
    
    // Создаём контейнер, если его нет
    let container = document.getElementById('creatorContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'creatorContainer';
        container.className = 'creator-fullscreen';
        
        const grid = document.getElementById('team-grid');
        if (grid && grid.parentNode) {
            grid.parentNode.insertBefore(container, grid);
        } else {
            document.querySelector('main')?.appendChild(container);
        }
    }
    
    // Рендерим содержимое с сохранением исходного URL в data-original-src
    container.innerHTML = `
        <div class="creator-avatar-col">
            <img src="${creator.avatar}" 
                 class="creator-avatar-bg" 
                 data-original-src="${creator.avatar}"
                 loading="lazy">
                 crossorigin="anonymous">
            <div class="creator-avatar-overlay"></div>
            <img src="${creator.avatar}" 
                 class="creator-avatar-img" 
                 data-original-src="${creator.avatar}"
                 loading="lazy">
                 crossorigin="anonymous">
        </div>
        <div class="creator-info-col">
            <h2 class="creator-name-large">${creator.login}</h2>
            <div class="creator-role-large" style="background: ${creator.roleGradient};">${creator.role}</div>
            <div class="creator-description-large">${creator.description}</div>
        </div>
    `;
    
    // Обработка ошибок загрузки
    container.querySelectorAll('img').forEach(img => {
        img.onerror = () => {
            img.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
            img.style.opacity = '0.7';
        };
    });
}

// === Запуск ===
document.addEventListener('DOMContentLoaded', () => {
    loadTeam();
    setupWheelNavigation(); // ← Включаем навигацию колесиком
});