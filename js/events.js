/* Events only, the page's one moment: her trail poster opens from the tunnel. A circle centred on the mouth of the
   Oread cover's tunnel (43% across, 32% down the poster, measured off the 612x792 file) widens from 11% to 100%,
   so the first frame is a round view into the drawn tunnel alone (no concrete from the poster's photo at its edge);
   by which point the whole poster and its shadow show and the clip is dropped; over the same stretch the whole figure
   (image and caption together, so the caption is never run over) rises 36px.
   The stretch is set in page scroll, measured from where the poster sits in the page: it starts when the poster's top
   enters at the viewport foot (or at scroll 0 if the poster is already on screen when the page opens, as it is on
   tablet and desktop) and ends when its top reaches 45% of the viewport, but never less than a quarter of a viewport
   of scrolling after it starts. So every frame is a pure function of scrollY: the same pixel down and back up, nothing on a timer.
   The poster's place is measured with the figure's own offset taken off, so the travel never feeds back.
   Under reduced motion and without JavaScript the poster is whole and at rest (css/events.css drops the clip, and
   css/site.css freezes the figure's class fx). The big dates come into register through the shared behaviour in
   js/site.js (data-register on each .day). All of it keys on class and attribute, so an event block Lorna copies
   and pastes keeps it. The home page reads this list with the posters dropped. */
(() => {
  const S = window.site;
  if (!S) return;
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.trail .dates > li').forEach(li => {
    const fig = li.querySelector('.poster');
    if (!fig) return;
    const mouth = fig.querySelector('.mouth');
    fig.classList.add('fx');
    let s0 = 0, s1 = 1, cy = 0, last = -1;
    const draw = y => {
      const p = S.still ? 1 : S.clamp((y - s0) / (s1 - s0));
      if (p === last) return;
      last = p;
      if (S.still) { cy = 0; fig.style.transform = ''; if (mouth) mouth.style.clipPath = ''; return; }
      const e = S.ease(p);
      cy = +(36 * (1 - e)).toFixed(1);
      fig.style.transform = `translate3d(0,${cy}px,0)`;
      if (mouth) mouth.style.clipPath = p >= 1 ? 'none' : `circle(${(11 + 89 * e).toFixed(2)}% at 43% 32%)`;
    };
    draw.measure = () => {
      const vh = innerHeight;
      const top = fig.getBoundingClientRect().top + scrollY - cy;
      s0 = Math.max(0, top - vh);
      s1 = Math.max(s0 + .25 * vh, top - .45 * vh);
      last = -1;
    };
    S.onFrame(draw);
    mq.addEventListener('change', () => { draw.measure(); draw(scrollY); });
  });
})();
