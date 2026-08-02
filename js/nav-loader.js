// Keep in sync with the 1100px media query in css/stylesheet.css.
const MOBILE_BREAKPOINT = 1100;

document.addEventListener('DOMContentLoaded', () => {
  const pathParts = window.location.pathname.split('/').filter((part) => part.length > 0);
  const depth = Math.max(0, pathParts.length - 1);
  const pathToRoot = depth === 0 ? './' : '../'.repeat(depth);

  fetch(`${pathToRoot}sidenav.html`)
    .then((response) => response.text())
    .then((data) => {
      document.getElementById('nav-placeholder').innerHTML = data;

      const currentPage = pathParts[pathParts.length - 1] || 'index.html';

      document.querySelectorAll('.navblock_text a').forEach((link) => {
        link.href = `${pathToRoot}${link.getAttribute('href').replace('./', '')}`;
        if (link.getAttribute('href').endsWith(currentPage)) {
          link.classList.add('nav-active');
        }
      });

      const hamburger = document.querySelector('.hamburger-menu');
      const sidenav = document.querySelector('.sidenav');

      function toggleMenu() {
        hamburger.classList.toggle('change');
        sidenav.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
      }

      hamburger.addEventListener('click', toggleMenu);

      document.querySelectorAll('.sidenav a').forEach((link) => {
        link.addEventListener('click', () => {
          if (window.innerWidth <= MOBILE_BREAKPOINT) {
            toggleMenu();
          }
        });
      });

      window.addEventListener('resize', () => {
        if (window.innerWidth > MOBILE_BREAKPOINT && sidenav.classList.contains('active')) {
          toggleMenu();
        }
      });
    })
    .catch((error) => console.error('Error loading navigation:', error));
});
