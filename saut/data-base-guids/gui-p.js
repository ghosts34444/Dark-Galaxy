// scripts/gui-pc.js
export function loadPCGUI(container, guiData) {
  const wrapper = document.createElement('div');
  wrapper.className = 'pc-gui-wrapper';
  container.appendChild(wrapper);

  const img = document.createElement('img');
  img.src = guiData.image;
  img.className = 'gui-image';
  img.style.maxWidth = '100%';

  // Уникальное имя на основе контейнера
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const mapName = `map-${uniqueId}`;
  
  const map = document.createElement('map');
  map.name = mapName;
  map.id = mapName;

  wrapper.appendChild(img);
  wrapper.appendChild(map);

  img.onload = () => {
    img.useMap = `#${mapName}`;
    
    guiData.zones.forEach(zone => {
      const area = document.createElement('area');
      area.shape = zone.shape;
      area.coords = zone.coords.join(',');
      area.dataset.name = zone.name;

      area.addEventListener('mousemove', (e) => {
        let tooltip = wrapper.querySelector('.map-tooltip');
        if (!tooltip) {
          tooltip = document.createElement('div');
          tooltip.className = 'map-tooltip';
          wrapper.appendChild(tooltip);
        }
        tooltip.textContent = zone.name;
        tooltip.style.display = 'block';
        
        // Позиционируем относительно контейнера
        const rect = wrapper.getBoundingClientRect();
        const x = e.clientX - rect.left + 10;
        const y = e.clientY - rect.top - 30;
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
      });

      area.addEventListener('mouseleave', () => {
        const tooltip = wrapper.querySelector('.map-tooltip');
        if (tooltip) tooltip.style.display = 'none';
      });

      map.appendChild(area);
    });
  };
}