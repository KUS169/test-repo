// exp4.js — Lightbox gallery (fixed): uses data-full attributes for correct large images
(() => {
  const thumbs = Array.from(document.querySelectorAll('.thumb'));
  const lb = document.getElementById('lightbox');
  const lbImage = document.getElementById('lbImage');
  const caption = document.getElementById('caption');
  const prevBtn = document.getElementById('prevLb');
  const nextBtn = document.getElementById('nextLb');
  const closeBtn = document.getElementById('closeLb');
  const playBtn = document.getElementById('playBtn');
  const prevCtrl = document.getElementById('prevBtn');
  const nextCtrl = document.getElementById('nextBtn');

  let current = 0;
  let autoplayId = null;

  function openLightbox(index) {
    current = index;
    const src = fullSizeUrl(index);
    lbImage.src = src;
    lbImage.alt = thumbs[index].alt || `Image ${index+1}`;
    caption.textContent = lbImage.alt;
    lb.classList.remove('hidden');
    lb.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lb.classList.add('hidden');
    lb.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    stopAutoplay();
  }

  function prevImage() {
    current = (current - 1 + thumbs.length) % thumbs.length;
    lbImage.src = fullSizeUrl(current);
    caption.textContent = thumbs[current].alt;
  }

  function nextImage() {
    current = (current + 1) % thumbs.length;
    lbImage.src = fullSizeUrl(current);
    caption.textContent = thumbs[current].alt;
  }

  // RELIABLE: prefer data-full on the thumbnail. Fallback to src if missing.
  function fullSizeUrl(i) {
    const thumb = thumbs[i];
    if (!thumb) return '';
    if (thumb.dataset && thumb.dataset.full) return thumb.dataset.full;
    return thumb.src; // fallback: the browser will scale it
  }

  // click thumbs
  thumbs.forEach((t, i) => {
    t.addEventListener('click', () => openLightbox(i));
  });

  // controls
  prevBtn.addEventListener('click', prevImage);
  nextBtn.addEventListener('click', nextImage);
  closeBtn.addEventListener('click', closeLightbox);
  prevCtrl.addEventListener('click', () => { openLightbox((current - 1 + thumbs.length) % thumbs.length); });
  nextCtrl.addEventListener('click', () => { openLightbox((current + 1) % thumbs.length); });

  // keyboard nav
  document.addEventListener('keydown', (e) => {
    if (lb.classList.contains('hidden')) return;
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'Escape') closeLightbox();
  });

  // autoplay
  function startAutoplay() {
    if (autoplayId) return;
    playBtn.textContent = 'Stop Slideshow';
    autoplayId = setInterval(nextImage, 2500);
  }
  function stopAutoplay() {
    if (!autoplayId) return;
    clearInterval(autoplayId);
    autoplayId = null;
    playBtn.textContent = 'Start Slideshow';
  }
  playBtn.addEventListener('click', () => {
    if (autoplayId) stopAutoplay(); else { if (lb.classList.contains('hidden')) openLightbox(0); startAutoplay(); }
  });

  // click outside image closes
  lb.addEventListener('click', (e) => {
    if (e.target === lb) closeLightbox();
  });

  // simple focus helper (not a full focus trap)
  document.addEventListener('focus', (e) => {
    if (!lb.classList.contains('hidden') && !lb.contains(e.target)) {
      e.stopPropagation();
      lb.focus();
    }
  }, true);

  // small debug log
  console.log('exp4.js loaded — thumbs:', thumbs.length);
})();
