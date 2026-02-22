// === ОПРЕДЕЛЕНИЕ МОЩНОСТИ УСТРОЙСТВА ===

(function() {
    // Проверяем поддержку backdrop-filter
    const supportsBackdrop = CSS.supports('backdrop-filter', 'blur(12px)');
    
    // Проверяем производительность устройства
    const isLowEnd = (() => {
        // Мобильные устройства часто слабее
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Проверяем количество ядер (если доступно)
        const cores = navigator.hardwareConcurrency || 4;
        
        // Проверяем память (если доступно)
        const memory = navigator.deviceMemory || 4;
        
        // Считаем устройство слабым, если:
        // - Это мобилка И (мало ядер ИЛИ мало памяти)
        // - ИЛИ очень мало ядер
        return (isMobile && (cores <= 2 || memory <= 2)) || cores <= 2;
    })();
    
    // Добавляем классы к <html>
    if (supportsBackdrop && !isLowEnd) {
        document.documentElement.classList.add('supports-backdrop', 'high-end');
    } else {
        document.documentElement.classList.add('no-backdrop', 'low-end');
    }
    
    // Скрываем звёзды на слабых устройствах
    if (isLowEnd) {
        document.addEventListener('DOMContentLoaded', () => {
            const starsContainer = document.getElementById('stars-container');
            if (starsContainer) {
                starsContainer.style.display = 'none';
            }
        });
    }
})();