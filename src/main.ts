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

  function resetInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 10000);
  }

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
document.querySelectorAll<HTMLElement>('.staff-card, .category, .featured-film, .truth-post').forEach((el) => {
  el.style.opacity = '0';
  observer.observe(el);
});

// Add crawling budget disclaimer after the nominees section
const nomineesSection = document.querySelector('.nominees-section');
if (nomineesSection) {
  const crawl = document.createElement('div');
  crawl.className = 'crawl';
  crawl.innerHTML = `<span class="crawl-inner">DISCLAIMER: The Low Ratings Academy Awards has a total operating budget of $11.99 (domain registration). All trophies are spray-painted participation ribbons. Catering has been replaced with a vending machine (exact change only). Security is handled by a stern note taped to the door. Red carpet sourced from a clearance sale at Home Depot. All grievances are real and sourced directly from Truth Social. No animals were harmed but several egos were bruised. &nbsp;&nbsp;&nbsp;&#127942;&nbsp;&nbsp;&nbsp;</span>`;
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
