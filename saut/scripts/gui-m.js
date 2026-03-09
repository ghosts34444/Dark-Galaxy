// scripts/gui-mobile.js
export function loadMobileGUI(container, guiData) {
  const wrapper = document.createElement('div');
  wrapper.className = 'mobile-gui-wrapper';
  container.appendChild(wrapper);

  const img = document.createElement('img');
  img.src = guiData.image;
  img.className = 'gui-image';
  img.style.maxWidth = '100%';

  const overlay = document.createElement('div');
  overlay.className = 'mobile-overlay';

  wrapper.appendChild(img);
  wrapper.appendChild(overlay);

  // Функция для отрисовки зон (вызывается при загрузке и при изменении размера)
  function renderZones() {
    // Очищаем старые зоны
    overlay.innerHTML = '';
    
    // Получаем размеры изображения
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    const displayedWidth = img.clientWidth;
    const displayedHeight = img.clientHeight;
    
    // Коэффициенты масштабирования
    const scaleX = displayedWidth / naturalWidth;
    const scaleY = displayedHeight / naturalHeight;
    
    // Устанавливаем размеры оверлея точно под изображение
    overlay.style.width = `${displayedWidth}px`;
    overlay.style.height = `${displayedHeight}px`;
    
    // Создаём карту для группировки зон по их координатам
    const zonesMap = new Map();
    
    // Рисуем зоны
    guiData.zones.forEach(zone => {
      if (zone.shape === 'rect' && Array.isArray(zone.coords) && zone.coords.length >= 4) {
        const [x1, y1, x2, y2] = zone.coords;
        
        // Масштабируем координаты
        const scaledX1 = Math.round(x1 * scaleX);
        const scaledY1 = Math.round(y1 * scaleY);
        const scaledX2 = Math.round(x2 * scaleX);
        const scaledY2 = Math.round(y2 * scaleY);
        
        const div = document.createElement('div');
        div.className = 'mobile-zone-highlight';
        div.style.left = `${scaledX1}px`;
        div.style.top = `${scaledY1}px`;
        div.style.width = `${scaledX2 - scaledX1}px`;
        div.style.height = `${scaledY2 - scaledY1}px`;

        const idLabel = document.createElement('div');
        idLabel.className = 'zone-id-label';
        idLabel.textContent = zone.id;
        div.appendChild(idLabel);

        overlay.appendChild(div);
        
        // Сохраняем информацию о зоне для карточек
        if (!zonesMap.has(zone.id)) {
          zonesMap.set(zone.id, zone.name);
        }
      }
    });
    
    return zonesMap; // Возвращаем уникальные зоны
  }

  // Ждём загрузки изображения
  img.onload = () => {
    // Рисуем зоны и получаем уникальные ID
    const uniqueZones = renderZones();
    
    // Генерируем карточки (только один раз!)
    const cardsDiv = document.createElement('div');
    cardsDiv.className = 'mobile-cards';
    
    uniqueZones.forEach((name, id) => {
      const card = document.createElement('div');
      card.className = 'map-mobile-item';
      card.textContent = `${id}. ${name}`;
      cardsDiv.appendChild(card);
    });
    
    wrapper.appendChild(cardsDiv);
  };

  // Обновляем зоны при изменении размера окна
  window.addEventListener('resize', renderZones);
}