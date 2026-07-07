const navLinks = Array.from(document.querySelectorAll('nav a[href^="#"]'));
const sections = navLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);

const setCurrent = () => {
  const y = window.scrollY + Math.min(window.innerHeight * 0.38, 360);
  const current = sections.reduce((active, section) => section.offsetTop <= y ? section : active, sections[0]);
  navLinks.forEach((link) => {
    link.toggleAttribute('aria-current', link.getAttribute('href') === `#${current.id}`);
    if (link.hasAttribute('aria-current')) link.setAttribute('aria-current', 'page');
  });
};

window.addEventListener('scroll', setCurrent, { passive: true });
window.addEventListener('resize', setCurrent);
setCurrent();
