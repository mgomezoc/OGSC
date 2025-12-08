// main.js
// Navegación móvil y dropdowns mejorados

(function () {
  'use strict';

  const header = document.querySelector('.site-header');
  const toggle = document.getElementById('navToggle');
  const mobile = document.getElementById('navMobile');

  // ============================================
  // Toggle del menú móvil principal
  // ============================================
  if (header && toggle && mobile) {
    toggle.addEventListener('click', () => {
      const isOpen = header.classList.contains('nav-open');

      if (!isOpen) {
        // Abrir menú
        header.classList.add('nav-open');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Cerrar navegación');

        // Prevenir scroll del body cuando el menú está abierto
        document.body.style.overflow = 'hidden';
      } else {
        // Cerrar menú
        closeMenu();
      }
    });

    // Cerrar menú cuando se hace clic en un enlace
    mobile.addEventListener('click', e => {
      if (e.target.matches('a') && !e.target.matches('.nav-mobile-group-trigger')) {
        closeMenu();
      }
    });

    // Cerrar menú con tecla ESC
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && header.classList.contains('nav-open')) {
        closeMenu();
      }
    });
  }

  function closeMenu() {
    header.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir navegación');
    document.body.style.overflow = '';
  }

  // ============================================
  // Submenús móviles (acordeón)
  // ============================================
  const mobileGroupTriggers = document.querySelectorAll('.nav-mobile-group-trigger');

  mobileGroupTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const content = trigger.nextElementSibling;
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

      // Cerrar otros grupos abiertos (opcional, comentar para permitir múltiples abiertos)
      mobileGroupTriggers.forEach(otherTrigger => {
        if (otherTrigger !== trigger) {
          otherTrigger.setAttribute('aria-expanded', 'false');
          const otherContent = otherTrigger.nextElementSibling;
          if (otherContent) {
            otherContent.classList.remove('active');
          }
        }
      });

      // Toggle del grupo actual
      if (!isExpanded) {
        trigger.setAttribute('aria-expanded', 'true');
        content.classList.add('active');
      } else {
        trigger.setAttribute('aria-expanded', 'false');
        content.classList.remove('active');
      }
    });
  });

  // ============================================
  // Dropdowns desktop (hover y teclado)
  // ============================================
  const desktopDropdowns = document.querySelectorAll('.nav-dropdown');

  desktopDropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.nav-dropdown-trigger');
    const menu = dropdown.querySelector('.nav-dropdown-menu');

    if (!trigger || !menu) return;

    // Click en desktop para toggle
    trigger.addEventListener('click', e => {
      e.preventDefault();
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

      // Cerrar otros dropdowns
      desktopDropdowns.forEach(otherDropdown => {
        if (otherDropdown !== dropdown) {
          const otherTrigger = otherDropdown.querySelector('.nav-dropdown-trigger');
          otherTrigger.setAttribute('aria-expanded', 'false');
        }
      });

      trigger.setAttribute('aria-expanded', !isExpanded);
    });

    // Cerrar dropdown cuando se hace clic fuera
    document.addEventListener('click', e => {
      if (!dropdown.contains(e.target)) {
        trigger.setAttribute('aria-expanded', 'false');
      }
    });

    // Soporte para teclado (Enter y Space)
    trigger.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger.click();
      }

      // Escape para cerrar
      if (e.key === 'Escape') {
        trigger.setAttribute('aria-expanded', 'false');
        trigger.focus();
      }
    });

    // Navegación con flechas dentro del menú
    const menuLinks = menu.querySelectorAll('a');
    menuLinks.forEach((link, index) => {
      link.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const nextLink = menuLinks[index + 1] || menuLinks[0];
          nextLink.focus();
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prevLink = menuLinks[index - 1] || menuLinks[menuLinks.length - 1];
          prevLink.focus();
        }
        if (e.key === 'Escape') {
          trigger.setAttribute('aria-expanded', 'false');
          trigger.focus();
        }
      });
    });
  });

  // ============================================
  // Scroll suave mejorado para anclas
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');

      // Ignorar # solo
      if (href === '#') return;

      const target = document.querySelector(href);

      if (target) {
        e.preventDefault();

        // Cerrar menú móvil si está abierto
        if (header && header.classList.contains('nav-open')) {
          closeMenu();
        }

        // Calcular offset del header sticky
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPosition =
          target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });

        // Actualizar URL sin scroll
        history.pushState(null, null, href);
      }
    });
  });

  // ============================================
  // Indicador de scroll en el header
  // ============================================
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Agregar sombra al header cuando se hace scroll
    if (currentScroll > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Opcional: ocultar header al hacer scroll hacia abajo
    // Descomentar si deseas este comportamiento
    /*
    if (currentScroll > lastScroll && currentScroll > 100) {
      header.style.transform = 'translateY(-100%)';
    } else {
      header.style.transform = 'translateY(0)';
    }
    */

    lastScroll = currentScroll;
  });

  // ============================================
  // Lazy loading de imágenes mejorado
  // ============================================
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;

            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }

            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset;
              img.removeAttribute('data-srcset');
            }

            img.classList.add('loaded');
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01,
      },
    );

    // Observar todas las imágenes con loading="lazy"
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  // ============================================
  // Prevenir FOUC (Flash of Unstyled Content)
  // ============================================
  window.addEventListener('load', () => {
    document.body.classList.add('loaded');
  });

  // ============================================
  // Logs de desarrollo (remover en producción)
  // ============================================
  console.log('✅ Navegación inicializada correctamente');
  console.log(`📱 Modo: ${window.innerWidth <= 1024 ? 'Móvil' : 'Desktop'}`);
})();
