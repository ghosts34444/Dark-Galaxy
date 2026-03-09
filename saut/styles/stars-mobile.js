document.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth <= 1199 && document.querySelector('.menu-toggle')) {
    function createMobileStar() {
      const star = document.createElement('div');
      star.className = 'star';
      star.textContent = '✧';
      star.style.left = Math.random() * 100 + 'vw';
      star.style.top = '-10px';
      star.style.opacity = '0.7';
      star.style.fontSize = (0.8 + Math.random() * 0.6) + 'em';
      document.getElementById('stars-container').appendChild(star);

      const duration = 6 + Math.random() * 8;
      star.style.transform = `translateY(${window.innerHeight * 1.2}px) rotate(${Math.random() * 720}deg)`;
      star.style.transition = `transform ${duration}s linear, opacity ${duration/2}s ease`;
      
      setTimeout(() => star.remove(), duration * 1000);
    }

    setInterval(createMobileStar, 800);
  }
});
