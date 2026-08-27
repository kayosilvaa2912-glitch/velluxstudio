document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  if (header) {
    const updateHeader = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  document.querySelectorAll('.faq-question').forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      const isOpen = item.classList.contains('is-open');

      document.querySelectorAll('.faq-item').forEach((faqItem) => {
        faqItem.classList.remove('is-open');
      });

      if (!isOpen) {
        item.classList.add('is-open');
      }
    });
  });

  const cards = document.querySelectorAll('.glass-card, .feature-card, .service-card, .case-card, .stack-card, .metric-card, .skill-card, .process-step');
  cards.forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      const rotateX = (y * 4).toFixed(2);
      const rotateY = (x * 6).toFixed(2);
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.18 });

  document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
});
