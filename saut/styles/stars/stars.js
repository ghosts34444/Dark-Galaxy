// styles/stars/stars.js
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('stars-container');
    if (!container) return;

    // === НАСТРОЙКИ ===
    const STAR_COUNT = 50;
    const TOP_OFFSET = 100;  // Запретная зона сверху (меню + поиск)
    const SYMBOLS = ['✦', '✧', '★', '•'];

    // === CSS АНИМАЦИЯ ===
    const style = document.createElement('style');
    style.textContent = `
        @keyframes star-fall {
            0% {
                transform: translateY(-30px) translateX(0) rotate(0deg);
                opacity: 0;
                filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8));
            }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% {
                transform: translateY(${window.innerHeight + 50}px) translateX(${Math.random() * 100 - 50}px) rotate(${Math.random() * 720}deg);
                opacity: 0;
                filter: none;
            }
        }

        @keyframes star-twinkle {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
        }

        .star {
            position: fixed;
            color: white;
            font-weight: bold;
            pointer-events: none;
            z-index: -1;  /* ← ЗВЁЗДЫ ВСЕГДА ПОЗАДИ! */
            animation: star-fall linear forwards, star-twinkle ease-in-out infinite;
        }

        /* Контент ВСЕГДА поверх звёзд */
        .navbar,
        .search-input-wrapper,
        .main-instruction,
        .guides-container,
        .mod-table,
        .search-results,
        .rules,
        .modal-content {
            position: relative;
            z-index: 1;  /* ← КОНТЕНТ ПОВЕРХ ЗВЁЗД */
        }
    `;
    document.head.appendChild(style);

    // === СОЗДАНИЕ ЗВЕЗДЫ ===
    function createStar(index) {
        const star = document.createElement('div');
        star.className = 'star';

        // Случайный символ
        star.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

        // Позиция X (случайная по ширине)
        star.style.left = Math.random() * 100 + 'vw';

        // Позиция Y (всегда сверху, но с задержкой появления)
        star.style.top = '-30px';

        // Размер (разные звёзды)
        const size = 0.4 + Math.random() * 0.8;
        star.style.fontSize = size + 'em';

        // Длительность падения (10-25 сек)
        const fallDuration = 10 + Math.random() * 15;
        star.style.animationDuration = `${fallDuration}s, ${2 + Math.random() * 3}s`;

        // Задержка перед появлением
        const delay = Math.random() * 10;
        star.style.animationDelay = `${delay}s, ${Math.random() * 2}s`;

        // Прозрачность (мерцание)
        star.style.opacity = 0.5 + Math.random() * 0.5;

        container.appendChild(star);

        // Пересоздаём звезду после падения
        setTimeout(() => {
            star.remove();
            createStar(index);
        }, (fallDuration + delay) * 1000);
    }

    // === ЗАПУСК ===
    for (let i = 0; i < STAR_COUNT; i++) {
        setTimeout(() => createStar(i), i * 200);
    }
});