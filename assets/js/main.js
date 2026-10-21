
/* Progressive enhancement: content and video links also work without JavaScript. */
(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scrollBehavior = () => reducedMotion.matches ? 'instant' : 'smooth';

  // Mobile navigation remains visible if JavaScript is unavailable.
  const menu = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#primary-links');
  const mobile = window.matchMedia('(max-width: 800px)');
  if (menu && navigation) {
    menu.hidden = false;
    const setMenu = (open) => {
      menu.setAttribute('aria-expanded', String(open));
      navigation.hidden = mobile.matches && !open;
    };
    setMenu(false);
    mobile.addEventListener('change', () => setMenu(false));
    menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
    navigation.addEventListener('click', (event) => {
      if (event.target.closest('a') && mobile.matches) {
        setMenu(false);
        menu.focus({ preventScroll: true });
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && mobile.matches && menu.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menu.focus();
      }
    });
  }

  // Only the requested video loads. Leaving a slide/filter/study stops playback.
  function stopVideos(container) {
    container.querySelectorAll('.embed-placeholder[data-loaded]').forEach((placeholder) => {
      placeholder.querySelector('iframe')?.remove();
      delete placeholder.dataset.loaded;
      placeholder.querySelectorAll('[data-video-hidden]').forEach((child) => {
        child.hidden = false;
        delete child.dataset.videoHidden;
      });
    });
  }
  document.querySelectorAll('.embed-placeholder').forEach((placeholder) => {
    const link = placeholder.querySelector('.play-demo');
    link?.addEventListener('click', (event) => {
      // Modified clicks retain the original external-link behavior.
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (placeholder.dataset.loaded) return;
      const iframe = document.createElement('iframe');
      iframe.src = placeholder.dataset.embedSrc;
      iframe.title = placeholder.dataset.embedTitle;
      iframe.allowFullscreen = true;
      iframe.allow = 'fullscreen; encrypted-media; picture-in-picture';
      Array.from(placeholder.children).forEach((child) => {
        child.hidden = true;
        child.dataset.videoHidden = '';
      });
      placeholder.dataset.loaded = 'true';
      placeholder.appendChild(iframe);
      iframe.focus();
    });
  });
  document.querySelectorAll('.study').forEach((study) => {
    study.addEventListener('toggle', () => { if (!study.open) stopVideos(study); });
  });

  // Deep links: #simulation, #gameplay-tools, #graphics; #projects shows everything.
  const projectSection = document.querySelector('#projects');
  const filters = Array.from(document.querySelectorAll('[data-filter]'));
  const projects = Array.from(document.querySelectorAll('[data-category]'));
  const count = document.querySelector('.project-count');
  const categories = new Set(['simulation', 'gameplay-tools', 'graphics']);
  document.querySelector('.project-filters')?.removeAttribute('hidden');
  function setFilter(category) {
    let visible = 0;
    projects.forEach((project) => {
      const show = category === 'all' || project.dataset.category === category;
      project.hidden = !show;
      if (show) visible++;
      else stopVideos(project);
    });
    filters.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
    if (count) count.textContent = `${visible} selected project${visible === 1 ? '' : 's'}`;
  }
  function syncHash(initial = false) {
    const hash = location.hash.slice(1);
    if (categories.has(hash)) {
      setFilter(hash);
      requestAnimationFrame(() => projectSection?.scrollIntoView({ behavior: initial ? 'instant' : scrollBehavior() }));
    } else if (hash === 'projects' || !hash) {
      setFilter('all');
    }
  }
  filters.forEach((button) => button.addEventListener('click', () => {
    const category = button.dataset.filter;
    setFilter(category);
    const hash = category === 'all' ? 'projects' : category;
    if (location.hash !== `#${hash}`) history.pushState(null, '', `#${hash}`);
  }));
  window.addEventListener('hashchange', () => syncHash());
  window.addEventListener('popstate', () => syncHash());
  // An already-selected hash does not fire hashchange; still honor its link.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      if (link.hash === location.hash) syncHash();
    });
  });
  syncHash(true);

  // Scroll-snap galleries: buttons, touch, arrow keys, and responsive resizing.
  document.querySelectorAll('.exp-carousel').forEach((carousel) => {
    const track = carousel.querySelector('.exp-carousel-track');
    const slides = Array.from(carousel.querySelectorAll('.exp-slide'));
    const previous = carousel.querySelector('.carousel-btn-prev');
    const next = carousel.querySelector('.carousel-btn-next');
    const dotsContainer = carousel.querySelector('.carousel-dots');
    if (!track || slides.length < 2) {
      previous?.remove(); next?.remove(); dotsContainer?.remove();
      return;
    }
    let current = 0;
    let frame = 0;
    const dots = slides.map((slide, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Show media ${index + 1} of ${slides.length}`);
      dot.addEventListener('click', () => go(index));
      dotsContainer?.appendChild(dot);
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-label', `Media ${index + 1} of ${slides.length}`);
      return dot;
    });
    function update() {
      if (!track.clientWidth) return;
      current = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / track.clientWidth)));
      slides.forEach((slide, index) => {
        slide.inert = index !== current;
        if (index !== current) stopVideos(slide);
      });
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === current);
        dot.setAttribute('aria-pressed', String(index === current));
      });
    }
    function go(index) {
      const destination = (index + slides.length) % slides.length;
      if (destination !== current) stopVideos(slides[current]);
      track.scrollTo({ left: destination * track.clientWidth, behavior: scrollBehavior() });
    }
    previous?.addEventListener('click', () => go(current - 1));
    next?.addEventListener('click', () => go(current + 1));
    track.addEventListener('keydown', (event) => {
      if (event.target !== track || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      go(current + (event.key === 'ArrowLeft' ? -1 : 1));
    });
    track.addEventListener('scroll', () => {
      if (frame) return;
      frame = requestAnimationFrame(() => { update(); frame = 0; });
    }, { passive: true });
    if ('ResizeObserver' in window) {
      new ResizeObserver(() => {
        track.scrollTo({ left: current * track.clientWidth, behavior: 'instant' });
        update();
      }).observe(track);
    }
    update();
  });

  // Native dialog supplies focus trapping, Escape handling, and modal semantics.
  const lightbox = document.querySelector('#imageLightbox');
  const lightboxImage = lightbox?.querySelector('.lightbox-image');
  let opener = null;
  let originalOverflow = '';
  if (lightbox && lightboxImage && typeof lightbox.showModal === 'function') {
    document.querySelectorAll('.exp-slide img, .project-media img').forEach((image) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'image-zoom';
      button.setAttribute('aria-label', `Enlarge ${image.alt || 'portfolio image'}`);
      image.replaceWith(button);
      button.appendChild(image);
      button.addEventListener('click', () => {
        opener = button;
        lightboxImage.src = image.currentSrc || image.src;
        lightboxImage.alt = image.alt;
        originalOverflow = document.body.style.overflow;
        lightbox.showModal();
        document.body.style.overflow = 'hidden';
      });
    });
    lightbox.querySelector('.lightbox-close')?.addEventListener('click', () => lightbox.close());
    lightbox.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.close(); });
    lightbox.addEventListener('close', () => {
      document.body.style.overflow = originalOverflow;
      lightboxImage.removeAttribute('src');
      opener?.focus({ preventScroll: true });
    });
  }
})();
