import './style.css';

// Hero carousel
const slides = document.querySelectorAll<HTMLElement>('.hero-slide');
const dotsContainer = document.querySelector('.hero-dots');
let currentSlide = 0;
let slideInterval: ReturnType<typeof setInterval>;

if (slides.length > 0 && dotsContainer) {
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = `hero-dot${i === 0 ? ' active' : ''}`;
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });

  function goToSlide(index: number) {
    slides[currentSlide].classList.remove('active');
    dotsContainer!.children[currentSlide].classList.remove('active');
    currentSlide = index;
    slides[currentSlide].classList.add('active');
    dotsContainer!.children[currentSlide].classList.add('active');
    resetInterval();
  }

  function nextSlide() {
    goToSlide((currentSlide + 1) % slides.length);
  }

  function prevSlide() {
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
  }

  function resetInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 10000);
  }

  // Touch swipe support
  const heroEl = document.querySelector('.hero') as HTMLElement;
  if (heroEl) {
    let touchStartX = 0;
    let touchStartY = 0;

    heroEl.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    heroEl.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      // Only trigger if horizontal swipe is dominant and > 50px
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) nextSlide();
        else prevSlide();
      }
    }, { passive: true });

    // Mouse drag support for desktop
    let mouseStartX = 0;
    let dragging = false;

    heroEl.addEventListener('mousedown', (e) => {
      mouseStartX = e.clientX;
      dragging = true;
    });

    heroEl.addEventListener('mouseup', (e) => {
      if (!dragging) return;
      dragging = false;
      const dx = e.clientX - mouseStartX;
      if (Math.abs(dx) > 50) {
        if (dx < 0) nextSlide();
        else prevSlide();
      }
    });

    heroEl.addEventListener('mouseleave', () => {
      dragging = false;
    });
  }

  // Arrow key support
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextSlide();
    else if (e.key === 'ArrowLeft') prevSlide();
  });

  resetInterval();
}

// Intersection Observer for scroll animations
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

// Observe all staff cards, categories, and sections
document.querySelectorAll<HTMLElement>('.staff-card, .category, .featured-film, .truth-post, .entertainment-card').forEach((el) => {
  el.style.opacity = '0';
  observer.observe(el);
});

// Add crawling budget disclaimer after the nominees section
const nomineesSection = document.querySelector('.nominees-section');
if (nomineesSection) {
  const crawl = document.createElement('div');
  crawl.className = 'crawl';
  crawl.innerHTML = `<span class="crawl-inner">DISCLAIMER: All grievances are real and sourced directly from Truth Social. The President of the United States shared a post claiming Joe Biden was "executed in 2020" and replaced by "clones doubles &amp; robotic engineered soulless mindless entities." He shared this with 10 million followers without comment. He is the President. &nbsp;&nbsp;&nbsp;&#127942;&nbsp;&nbsp;&nbsp;</span>`;
  nomineesSection.appendChild(crawl);
}

// Console easter egg
console.log(
  '%c THE LOW RATINGS ACADEMY AWARDS ',
  'background: #1a1a1a; color: #c7a33a; font-size: 20px; font-weight: bold; padding: 10px;'
);
console.log(
  '%c "Virtually Unwatchable" ',
  'color: #8b6914; font-style: italic; font-size: 14px;'
);
console.log(
  '%c Total production budget: $11.99 ',
  'color: #888; font-size: 11px;'
);
