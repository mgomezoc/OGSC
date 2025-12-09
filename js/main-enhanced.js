// main-enhanced.js
// Sistema de navegación y animaciones avanzadas

(function () {
  'use strict';

  // ============================================
  // CONFIGURACIÓN Y UTILIDADES
  // ============================================

  const config = {
    animationOffset: 100,
    parallaxSpeed: 0.5,
    counterDuration: 2000,
    scrollThreshold: 100,
  };

  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // ============================================
  // SISTEMA DE NAVEGACIÓN
  // ============================================

  const NavigationSystem = {
    header: document.querySelector('.site-header'),
    toggle: document.getElementById('navToggle'),
    mobile: document.getElementById('navMobile'),
    lastScroll: 0,

    init() {
      if (!this.header || !this.toggle || !this.mobile) return;

      this.setupToggle();
      this.setupMobileLinks();
      this.setupDropdowns();
      this.setupScroll();
      this.setupKeyboardNav();
      this.setupSmoothScroll();
    },

    setupToggle() {
      this.toggle.addEventListener('click', () => {
        const isOpen = this.header.classList.contains('nav-open');

        if (!isOpen) {
          this.openMenu();
        } else {
          this.closeMenu();
        }
      });

      // Cerrar con ESC
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && this.header.classList.contains('nav-open')) {
          this.closeMenu();
        }
      });
    },

    openMenu() {
      this.header.classList.add('nav-open');
      this.toggle.setAttribute('aria-expanded', 'true');
      this.toggle.setAttribute('aria-label', 'Cerrar navegación');
      document.body.style.overflow = 'hidden';

      // Animar elementos del menú
      const links = this.mobile.querySelectorAll('.nav-mobile-link, .nav-mobile-group');
      links.forEach((link, index) => {
        link.style.opacity = '0';
        link.style.transform = 'translateX(-20px)';
        setTimeout(() => {
          link.style.transition = 'all 0.3s ease-out';
          link.style.opacity = '1';
          link.style.transform = 'translateX(0)';
        }, index * 50);
      });
    },

    closeMenu() {
      this.header.classList.remove('nav-open');
      this.toggle.setAttribute('aria-expanded', 'false');
      this.toggle.setAttribute('aria-label', 'Abrir navegación');
      document.body.style.overflow = '';
    },

    setupMobileLinks() {
      this.mobile.addEventListener('click', e => {
        if (e.target.matches('a:not(.nav-mobile-group-trigger)')) {
          this.closeMenu();
        }
      });

      // Submenús móviles
      const groupTriggers = document.querySelectorAll('.nav-mobile-group-trigger');
      groupTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
          const content = trigger.nextElementSibling;
          const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

          // Cerrar otros
          groupTriggers.forEach(other => {
            if (other !== trigger) {
              other.setAttribute('aria-expanded', 'false');
              other.nextElementSibling?.classList.remove('active');
            }
          });

          // Toggle actual
          trigger.setAttribute('aria-expanded', !isExpanded);
          content?.classList.toggle('active');
        });
      });
    },

    setupDropdowns() {
      const dropdowns = document.querySelectorAll('.nav-dropdown');

      dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.nav-dropdown-trigger');
        const menu = dropdown.querySelector('.nav-dropdown-menu');

        if (!trigger || !menu) return;

        // Click toggle
        trigger.addEventListener('click', e => {
          e.preventDefault();
          const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

          dropdowns.forEach(other => {
            if (other !== dropdown) {
              other.querySelector('.nav-dropdown-trigger')?.setAttribute('aria-expanded', 'false');
            }
          });

          trigger.setAttribute('aria-expanded', !isExpanded);
        });

        // Cerrar al hacer clic fuera
        document.addEventListener('click', e => {
          if (!dropdown.contains(e.target)) {
            trigger.setAttribute('aria-expanded', 'false');
          }
        });

        // Navegación con teclado
        this.setupDropdownKeyboard(trigger, menu);
      });
    },

    setupDropdownKeyboard(trigger, menu) {
      trigger.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          trigger.click();
        }
        if (e.key === 'Escape') {
          trigger.setAttribute('aria-expanded', 'false');
          trigger.focus();
        }
      });

      const links = menu.querySelectorAll('a');
      links.forEach((link, index) => {
        link.addEventListener('keydown', e => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            (links[index + 1] || links[0]).focus();
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            (links[index - 1] || links[links.length - 1]).focus();
          }
          if (e.key === 'Escape') {
            trigger.setAttribute('aria-expanded', 'false');
            trigger.focus();
          }
        });
      });
    },

    setupScroll() {
      const onScroll = () => {
        const currentScroll = window.pageYOffset;

        // Efecto scrolled
        if (currentScroll > 20) {
          this.header.classList.add('scrolled');
        } else {
          this.header.classList.remove('scrolled');
        }

        // Auto-hide header (opcional)
        // if (currentScroll > this.lastScroll && currentScroll > config.scrollThreshold) {
        //   this.header.style.transform = 'translateY(-100%)';
        // } else {
        //   this.header.style.transform = 'translateY(0)';
        // }

        this.lastScroll = currentScroll;
      };

      window.addEventListener('scroll', debounce(onScroll, 10));
    },

    setupKeyboardNav() {
      // Focus visible solo con teclado
      document.addEventListener('keydown', e => {
        if (e.key === 'Tab') {
          document.body.classList.add('keyboard-nav');
        }
      });

      document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-nav');
      });
    },

    setupSmoothScroll() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
          const href = this.getAttribute('href');
          if (href === '#') return;

          const target = document.querySelector(href);
          if (!target) return;

          e.preventDefault();

          if (NavigationSystem.header?.classList.contains('nav-open')) {
            NavigationSystem.closeMenu();
          }

          const headerHeight = NavigationSystem.header?.offsetHeight || 0;
          const targetPosition =
            target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth',
          });

          history.pushState(null, null, href);
        });
      });
    },
  };

  // ============================================
  // SISTEMA DE ANIMACIONES ON SCROLL
  // ============================================

  const AnimationSystem = {
    observer: null,

    init() {
      this.setupObserver();
      this.animateElements();
      this.setupParallax();
      this.setupCounters();
    },

    setupObserver() {
      const options = {
        root: null,
        rootMargin: `-${config.animationOffset}px`,
        threshold: 0.1,
      };

      this.observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');

            // Agregar delay a elementos hijos
            const children = entry.target.querySelectorAll('[data-delay]');
            children.forEach(child => {
              const delay = child.getAttribute('data-delay');
              child.style.animationDelay = `${delay}ms`;
            });
          }
        });
      }, options);
    },

    animateElements() {
      // Animar secciones
      document.querySelectorAll('section').forEach(section => {
        section.classList.add('animate-on-scroll', 'fade-in-up');
        this.observer.observe(section);
      });

      // Animar cards
      document.querySelectorAll('.card').forEach((card, index) => {
        card.classList.add('animate-on-scroll', 'scale-in');
        card.style.animationDelay = `${index * 100}ms`;
        this.observer.observe(card);
      });

      // Animar imágenes
      document.querySelectorAll('.section-media').forEach(media => {
        media.classList.add('animate-on-scroll', 'fade-in-left');
        this.observer.observe(media);
      });

      // Animar badges
      document.querySelectorAll('.badge, .chip').forEach((badge, index) => {
        badge.classList.add('animate-on-scroll', 'fade-in-up');
        badge.style.animationDelay = `${index * 50}ms`;
        this.observer.observe(badge);
      });
    },

    setupParallax() {
      const parallaxElements = document.querySelectorAll('.hero, .section-media');

      const onScroll = () => {
        const scrolled = window.pageYOffset;

        parallaxElements.forEach(element => {
          const rect = element.getBoundingClientRect();
          const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

          if (isVisible) {
            const speed = config.parallaxSpeed;
            const yPos = -(rect.top * speed);
            element.style.transform = `translateY(${yPos}px)`;
          }
        });
      };

      window.addEventListener('scroll', debounce(onScroll, 10));
    },

    setupCounters() {
      const counters = document.querySelectorAll('[data-count]');

      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = config.counterDuration;
        let start = 0;
        const increment = target / (duration / 16);

        const updateCounter = () => {
          start += increment;
          if (start < target) {
            counter.textContent = Math.ceil(start).toLocaleString();
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target.toLocaleString();
          }
        };

        this.observer.observe(counter);
        counter.addEventListener('animationstart', () => {
          if (counter.classList.contains('animated')) {
            updateCounter();
          }
        });
      });
    },
  };

  // ============================================
  // SISTEMA DE LAZY LOADING
  // ============================================

  const LazyLoadSystem = {
    init() {
      if ('IntersectionObserver' in window) {
        this.setupImageObserver();
      } else {
        this.loadAllImages();
      }
    },

    setupImageObserver() {
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

      document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        imageObserver.observe(img);
      });
    },

    loadAllImages() {
      document.querySelectorAll('img[data-src]').forEach(img => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        img.classList.add('loaded');
      });
    },
  };

  // ============================================
  // SISTEMA DE PARTÍCULAS (OPCIONAL)
  // ============================================

  const ParticleSystem = {
    canvas: null,
    ctx: null,
    particles: [],
    particleCount: 50,

    init() {
      this.createCanvas();
      this.createParticles();
      this.animate();
    },

    createCanvas() {
      this.canvas = document.createElement('canvas');
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = '0';
      this.canvas.style.opacity = '0.3';
      document.body.prepend(this.canvas);

      this.ctx = this.canvas.getContext('2d');
      this.resize();

      window.addEventListener('resize', () => this.resize());
    },

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },

    createParticles() {
      for (let i = 0; i < this.particleCount; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1,
        });
      }
    },

    animate() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(34, 197, 94, 0.5)';
        this.ctx.fill();
      });

      requestAnimationFrame(() => this.animate());
    },
  };

  // ============================================
  // EFECTOS ADICIONALES
  // ============================================

  const EffectsSystem = {
    init() {
      this.setupHoverEffects();
      this.setupCursorEffects();
      this.setupScrollIndicator();
    },

    setupHoverEffects() {
      // Efecto de tilt en cards
      document.querySelectorAll('.card, .hero-card:not(.no-tilt)').forEach(card => {
        card.addEventListener('mousemove', e => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const rotateX = (y - centerY) / 20;
          const rotateY = (centerX - x) / 20;

          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });

        card.addEventListener('mouseleave', () => {
          card.style.transform = '';
        });
      });
    },

    setupCursorEffects() {
      // Cursor personalizado (opcional)
      const cursor = document.createElement('div');
      cursor.className = 'custom-cursor';
      cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        border: 2px solid var(--accent);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transition: all 0.1s ease;
        display: none;
      `;
      document.body.appendChild(cursor);

      document.addEventListener('mousemove', e => {
        cursor.style.display = 'block';
        cursor.style.left = e.clientX - 10 + 'px';
        cursor.style.top = e.clientY - 10 + 'px';
      });

      // Expandir en elementos interactivos
      document.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('mouseenter', () => {
          cursor.style.transform = 'scale(1.5)';
          cursor.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
        });
        el.addEventListener('mouseleave', () => {
          cursor.style.transform = 'scale(1)';
          cursor.style.backgroundColor = 'transparent';
        });
      });
    },

    setupScrollIndicator() {
      const indicator = document.createElement('div');
      indicator.className = 'scroll-indicator';
      indicator.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, var(--accent), var(--accent-alt));
        z-index: 10000;
        transition: width 0.1s ease;
      `;
      document.body.appendChild(indicator);

      window.addEventListener('scroll', () => {
        const winScroll = document.documentElement.scrollTop;
        const height =
          document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        indicator.style.width = scrolled + '%';
      });
    },
  };

  // ============================================
  // INICIALIZACIÓN
  // ============================================

  const init = () => {
    console.log('🚀 Inicializando sistemas...');

    NavigationSystem.init();
    AnimationSystem.init();
    LazyLoadSystem.init();
    EffectsSystem.init();

    // ParticleSystem.init(); // Descomentar si deseas partículas

    // Prevenir FOUC
    document.body.classList.add('loaded');

    console.log('✅ Sistemas inicializados correctamente');
    console.log(`📱 Modo: ${window.innerWidth <= 1024 ? 'Móvil' : 'Desktop'}`);
  };

  // Iniciar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
