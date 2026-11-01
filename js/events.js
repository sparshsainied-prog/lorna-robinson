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

/* Table S33 (the 22 Nov entry; art direction illustrations/DIRECTION.md, moment 2). The table never moves. The two
   books and the S33 card are held a little above it and set down one after another, the way a stall is laid out:
   Hamadryad first, then Oread beside it, then the card at the front. Each one is lowered tipped a few degrees, so
   one bottom corner meets the table first (it turns about that corner: css/events.css), and then it rocks down flat
   onto its foot: the drop finishes at 70% of the piece's own stretch and the tip runs on to the end of it. It slows to
   rest and never bounces. Full ink throughout (a fade turned the name-yellow card olive on the dark ground). The svg's
   viewBox starts 28 units down (the rested drawing keeps only a thin band on top); held up, the pieces rise at most
   into the figure's own top margin, never over the words above (the svg is overflow: visible).
   Driven by drawings.track on the figure: it begins once the whole figure is on screen (its top 66% of the way down
   the viewport), after the poster above has finished opening, and the card is down when the figure's top reaches
   26%, well before it leaves. A pure function of scroll (same every pass, exact both ways, nothing on a timer).
   Reduced motion and no JavaScript: all three simply stand on the table (css/drawings.css; p = 1 clears what is
   written here). */
(() => {
  if (!window.drawings) return;
  const D = window.drawings;
  drawings.each('table-s33', fig => {
    const $ = k => fig.querySelector(`[data-piece="${k}"]`);
    // start poses in drawing units and degrees: lifted, a little to one side, tipped down toward the corner it lands on
    const items = [
      { el: $('hamadryad'), x: -10, y: -36, r: -6 },
      { el: $('oread'),     x: 12,  y: -54, r: 5.5 },
      { el: $('card'),      x: -16, y: -58, r: -7 }
    ].filter(it => it.el);
    items.forEach(it => { it.el.classList.add('piece', 'fx'); it.last = ''; });
    const n = items.length, gap = .25, fx = v => +v.toFixed(2);
    const draw = p => items.forEach((it, i) => {
      const t = D.stagger(p, i, n, gap);
      const drop = D.smoother(D.span(t, 0, .7));      // lowered: down by 70% of its stretch
      const rock = D.smooth(D.span(t, .25, 1));       // tipped: flat only at the end, after the corner has landed
      const u = 1 - drop, w = 1 - rock;
      const tf = t >= 1 ? '' : `translate(${fx(it.x * u)}px,${fx(it.y * u)}px) rotate(${fx(it.r * w)}deg)`;
      if (tf === it.last) return;
      it.last = tf;
      it.el.style.transform = tf;
    });
    D.track(fig, .66, .26, draw);
  });
})();
