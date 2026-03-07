(function() {
    const supportsBackdrop = CSS.supports('backdrop-filter', 'blur(12px)');
    
    const isLowEnd = (() => {
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        const cores = navigator.hardwareConcurrency || 4;
        
        const memory = navigator.deviceMemory || 4;
        return (isMobile && (cores <= 2 || memory <= 2)) || cores <= 2;
    })();
    
    if (supportsBackdrop && !isLowEnd) {
        document.documentElement.classList.add('supports-backdrop', 'high-end');
    } else {
        document.documentElement.classList.add('no-backdrop', 'low-end');
    }
    
    if (isLowEnd) {
        document.addEventListener('DOMContentLoaded', () => {
            const starsContainer = document.getElementById('stars-container');
            if (starsContainer) {
                starsContainer.style.display = 'none';
            }
        });
    }
})();