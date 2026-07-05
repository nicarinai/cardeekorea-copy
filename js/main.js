import { COLORWAYS, ORBIT_SEQUENCE } from './product-data.js?v=15';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function initPageChrome() {
  const header = document.querySelector('[data-header]');
  const progress = document.querySelector('[data-page-progress]');
  const navLinks = [...document.querySelectorAll('[data-nav-link]')];
  const trackedSections = [...document.querySelectorAll('[data-section]')];
  let ticking = false;

  const update = () => {
    const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${scrollRange > 0 ? window.scrollY / scrollRange : 0})`;
    header.classList.toggle('is-scrolled', window.scrollY > 12);

    let activeId = '';
    trackedSections.forEach((section) => {
      if (section.getBoundingClientRect().top < window.innerHeight * 0.46) activeId = section.id;
    });
    navLinks.forEach((link) => {
      const isActive = link.hash === `#${activeId}`;
      link.classList.toggle('active', isActive);
      if (isActive) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    ticking = false;
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  update();
}

function initReveals() {
  const elements = [...document.querySelectorAll('.reveal')];
  if (reducedMotion || !('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  elements.forEach((element) => observer.observe(element));
}

function initOrbitSequence() {
  const section = document.querySelector('.orbit');
  const canvas = document.querySelector('[data-orbit-canvas]');
  const loader = document.querySelector('[data-orbit-loader]');
  const progressBar = document.querySelector('[data-orbit-progress]');
  const progressNumber = document.querySelector('[data-orbit-number]');
  const chapters = [...document.querySelectorAll('[data-orbit-chapter]')];
  if (!section || !canvas || !loader || !progressBar || !progressNumber || !chapters.length) return;

  const context = canvas.getContext('2d', { alpha: false });
  const frames = new Array(ORBIT_SEQUENCE.frameCount);
  let loadedFrames = 0;
  let requestedFrame = 0;
  let renderedFrame = -1;
  let scrollTicking = false;
  // Keep the final product angle visible briefly before the sticky scene releases.
  // This prevents the last chapter from being skipped by one fast wheel gesture.
  const exitHold = 0.18;

  const draw = (index) => {
    const image = frames[index];
    if (!image?.complete || !image.naturalWidth || renderedFrame === index) return;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    renderedFrame = index;
    section.dataset.orbitRenderedFrame = String(index);
  };

  const nearestLoadedFrame = (index) => {
    if (frames[index]?.complete && frames[index].naturalWidth) return index;
    for (let distance = 1; distance < frames.length; distance += 1) {
      const lower = index - distance;
      const upper = index + distance;
      if (lower >= 0 && frames[lower]?.complete && frames[lower].naturalWidth) return lower;
      if (upper < frames.length && frames[upper]?.complete && frames[upper].naturalWidth) return upper;
    }
    return 0;
  };

  const loadFrame = (index) => {
    if (index < 0 || index >= frames.length || frames[index]) return;
    const image = new Image();
    frames[index] = image;
    image.decoding = 'async';
    image.onload = () => {
      loadedFrames += 1;
      loader.style.setProperty('--load-progress', loadedFrames / frames.length);
      if (loadedFrames >= Math.ceil(frames.length * 0.7)) loader.classList.add('ready');
      if (index === requestedFrame || renderedFrame < 0) draw(index);
    };
    image.src = ORBIT_SEQUENCE.path(index);
  };

  const setChapter = (progress) => {
    let active = 0;
    if (progress >= ORBIT_SEQUENCE.chapterStops[2]) active = 2;
    else if (progress >= ORBIT_SEQUENCE.chapterStops[1]) active = 1;
    chapters.forEach((chapter, index) => chapter.classList.toggle('active', index === active));
    progressNumber.textContent = String(active + 1).padStart(2, '0');
  };

  const update = () => {
    const rect = section.getBoundingClientRect();
    const scrollable = Math.max(1, section.offsetHeight - window.innerHeight);
    const rawProgress = clamp(-rect.top / scrollable);
    const progress = clamp(rawProgress / (1 - exitHold));
    requestedFrame = Math.round(progress * (frames.length - 1));
    loadFrame(requestedFrame);
    loadFrame(requestedFrame + 1);
    loadFrame(requestedFrame - 1);
    draw(nearestLoadedFrame(requestedFrame));
    progressBar.style.transform = `scaleX(${progress})`;
    section.style.setProperty('--orbit-progress', progress);
    section.dataset.orbitFrame = String(requestedFrame);
    section.dataset.orbitProgress = progress.toFixed(3);
    setChapter(progress);
    scrollTicking = false;
  };

  const requestUpdate = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(update);
  };

  // Load the opening motion densely, then representative frames across the full arc.
  // The user gets an immediate first response while the rest streams in batches.
  const priority = [0, 1, 2, 3, 4, 5, 6, 7, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 111];
  priority.forEach(loadFrame);

  const loadRemaining = () => {
    let index = 0;
    const batch = () => {
      let count = 0;
      while (index < frames.length && count < 24) {
        loadFrame(index);
        index += 1;
        count += 1;
      }
      if (index < frames.length) window.setTimeout(batch, 16);
    };
    batch();
  };

  window.setTimeout(loadRemaining, 0);

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  update();
}

function initFeatureTabs() {
  const tabs = [...document.querySelectorAll('[data-feature-tab]')];
  const panels = [...document.querySelectorAll('[data-feature-panel]')];
  if (!tabs.length || tabs.length !== panels.length) return;

  const select = (selectedTab) => {
    const key = selectedTab.dataset.featureTab;
    tabs.forEach((tab) => {
      const active = tab === selectedTab;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel) => {
      const active = panel.dataset.featurePanel === key;
      panel.hidden = !active;
      panel.classList.toggle('active', active);
    });
  };

  tabs.forEach((tab, index) => {
    tab.tabIndex = tab.classList.contains('active') ? 0 : -1;
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (event) => {
      let nextIndex = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      select(tabs[nextIndex]);
      tabs[nextIndex].focus();
    });
  });
}

function initPremiseFilm() {
  const film = document.querySelector('[data-premise-film]');
  if (!film) return;

  // Restarting the class starts one information sequence as the section enters view:
  // two usable angles -> attached side profile -> 2.00mm emphasis.
  const play = () => {
    film.classList.add('is-primed');
    film.classList.remove('is-playing');
    void film.offsetWidth;
    film.classList.add('is-playing');
  };

  film.classList.add('is-primed');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      play();
      observer.unobserve(film);
    }, { threshold: 0.32 });
    observer.observe(film);
  } else {
    play();
  }

  film.addEventListener('click', play);
  film.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    play();
  });
}

function initColors() {
  const tabs = [...document.querySelectorAll('[data-color]')];
  const carousel = document.querySelector('[data-color-carousel]');
  const track = document.querySelector('[data-color-track]');
  const stage = document.querySelector('[data-color-stage]');
  let image = document.querySelector('[data-color-image]');
  const word = document.querySelector('[data-color-word]');
  if (!tabs.length || !carousel || !track || !stage || !image || !word) return;

  Object.values(COLORWAYS).forEach((color) => {
    const preload = new Image();
    preload.src = window.innerWidth <= 960 ? color.responsiveImage : color.image;
  });

  let transitionTimer;
  let transitionId = 0;
  const centerPreview = (selectedTab, instant = false) => {
    const carouselRect = carousel.getBoundingClientRect();
    const tabRect = selectedTab.getBoundingClientRect();
    const matrix = new DOMMatrixReadOnly(getComputedStyle(track).transform);
    const targetX = matrix.m41 + (carouselRect.left + carouselRect.width / 2 - tabRect.left - tabRect.width / 2);
    if (instant) track.style.transition = 'none';
    track.style.transform = `translate3d(${targetX}px, -50%, 0)`;
    if (instant) {
      void track.offsetWidth;
      track.style.transition = '';
    }
  };

  const select = async (tab) => {
    const color = COLORWAYS[tab.dataset.color];
    if (!color) return;
    if (stage.classList.contains('changing')) return;
    if (tab.classList.contains('active')) return;

    transitionId += 1;
    const currentTransition = transitionId;

    const activeIndex = tabs.indexOf(tab);
    carousel.dataset.activeIndex = String(activeIndex);
    tabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    centerPreview(tab);

    stage.classList.add('changing');
    window.clearTimeout(transitionTimer);
    const selectedSource = window.innerWidth <= 960 ? color.responsiveImage : color.image;
    const incoming = image.cloneNode(false);
    incoming.removeAttribute('data-color-image');
    incoming.className = 'colors__image';
    incoming.src = selectedSource;
    incoming.srcset = `${color.responsiveImage} 960w, ${color.image} 1920w`;
    incoming.alt = `${color.name} cardee Xeno`;
    image.insertAdjacentElement('afterend', incoming);

    try {
      await incoming.decode();
    } catch {
      // Cached images may still render when decode() is interrupted.
    }
    if (currentTransition !== transitionId) {
      incoming.remove();
      return;
    }

    const outgoing = image;
    const reveal = () => {
      incoming.classList.add('is-current');
      outgoing.classList.remove('is-current');
      outgoing.classList.add('is-leaving');
      word.textContent = color.word;
      stage.style.setProperty('--color-bg', color.background);
    };

    window.requestAnimationFrame(() => window.requestAnimationFrame(reveal));

    transitionTimer = window.setTimeout(() => {
      if (currentTransition !== transitionId) return;
      outgoing.remove();
      incoming.setAttribute('data-color-image', '');
      image = incoming;
      stage.classList.remove('changing');
    }, 820);
  };

  tabs.forEach((tab, index) => {
    tab.tabIndex = tab.classList.contains('active') ? 0 : -1;
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (event) => {
      let nextIndex = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      select(tabs[nextIndex]);
      tabs[nextIndex].focus();
    });
  });

  const initialTab = tabs.find((tab) => tab.classList.contains('active')) || tabs[0];
  centerPreview(initialTab, true);
  window.addEventListener('resize', () => {
    const selectedTab = tabs.find((tab) => tab.classList.contains('active')) || tabs[0];
    window.requestAnimationFrame(() => centerPreview(selectedTab, true));
  }, { passive: true });
}

function initExperienceTabs() {
  const root = document.querySelector('[data-experience]');
  if (!root) return;

  const tabs = [...root.querySelectorAll('[data-experience-tab]')];
  const panels = [...root.querySelectorAll('[data-experience-panel]')];
  if (!tabs.length || tabs.length !== panels.length) return;

  const select = (selectedTab) => {
    const key = selectedTab.dataset.experienceTab;
    tabs.forEach((tab) => {
      const active = tab === selectedTab;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel) => {
      const active = panel.dataset.experiencePanel === key;
      panel.classList.toggle('active', active);
      panel.setAttribute('aria-hidden', String(!active));
    });
  };

  tabs.forEach((tab, index) => {
    tab.tabIndex = tab.classList.contains('active') ? 0 : -1;
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (event) => {
      let nextIndex = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      select(tabs[nextIndex]);
      tabs[nextIndex].focus();
    });
  });

}

initPageChrome();
initReveals();
initOrbitSequence();
initFeatureTabs();
initPremiseFilm();
initExperienceTabs();
initColors();
