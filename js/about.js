/* About page.
   1. The line: a single rule in the yellow of her name on the covers draws itself down the left of her story, from
      the Usborne book to the facts list where the Rumble Museum link sits. It is driven by the page's own scroll: a
      1em stub beside her first line at the top of the page, fully drawn by the time the Rumble line is 40% of the way
      down the viewport (endY, never less than 45% of a viewport of travel). scaleY from scrollY only: it undraws on
      the way back up, nothing plays on by itself. Fully drawn without JS and under reduced motion.
   2. The shelf: the four Classics covers are set down onto their shelf one after another, left to right, as the shelf
      comes up (window.site.shelve, the same behaviour as the home shelf), lifted again the same way going back. */
(() => {
  const S = window.site;
  if (!S) return;

  /* ---- the line ---- */
  const path = document.querySelector('.story .path'), line = path && path.querySelector('.line');
  if (line) {
    line.classList.add('fx');
    const facts = path.querySelectorAll('.rules li');
    const stop = facts[1] || facts[facts.length - 1];     // the Rumble Museum line
    let endY = 1, stub = 0, last = -1;
    const fn = () => {
      if (S.still) { line.style.transform = ''; last = -1; return; }
      const p = S.clamp(scrollY / endY);
      const s = stub + (1 - stub) * p;
      if (s === last) return;
      last = s;
      line.style.transform = `scaleY(${s.toFixed(4)})`;
    };
    fn.measure = () => {
      const pr = path.getBoundingClientRect();
      const end = stop ? stop.getBoundingClientRect().bottom : pr.bottom;
      const len = Math.max(1, end - pr.top);
      line.style.height = len.toFixed(1) + 'px';
      line.style.bottom = 'auto';
      endY = Math.max(innerHeight * .45, end + scrollY - innerHeight * .40, 1);
      const em = parseFloat(getComputedStyle(path.querySelector('p') || path).fontSize) || 16;
      stub = Math.min(1, em / len);
      last = -1;
    };
    S.onFrame(fn);
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', fn);
  }

  /* ---- the shelf ---- */
  const row = document.querySelector('.shelfrow');
  if (row) S.shelve(row, row.querySelectorAll('li'));

  /* ---- the board ---- */
  const D = window.drawings;
  if (D) D.each('apollo-artemis-board', fig => {
    const moon = fig.querySelector('.moon'), sun = fig.querySelector('.sun');
    if (!moon || !sun) return;
    [moon, sun].forEach(el => el.classList.add('piece', 'fx'));
    // start pose of each, in drawing units: low on its own half with its foot cut off by the board's foot (the sun
    // half risen, the moon's upper horn showing), a little out from the seam and turned
    const MOON = { x: -18, y: 142, r: -22 }, SUN = { x: 16, y: 150, r: 34 };
    const keys = new Map();
    const place = (el, t, a) => {
      const u = D.smooth(D.clamp(t)), s = 1 - u, w = 1 - u * u;
      // up at an even pace while it turns; the sideways drift comes late, so the arc rises steeply and then bends
      // in toward the seam as it settles under its word
      const tf = s > 0 ? `translate(${(a.x * w).toFixed(2)}px,${(a.y * s).toFixed(2)}px) rotate(${(a.r * s).toFixed(2)}deg)` : '';
      if (keys.get(el) === tf) return;
      keys.set(el, tf);
      el.style.transform = tf;
    };
    const draw = p => {
      place(moon, D.span(p, 0, .74), MOON);
      place(sun, D.span(p, .26, 1), SUN);
    };
    let off = null, range = '';
    const arm = () => {
      const vh = innerHeight, r = fig.getBoundingClientRect(), h = r.height;
      if (!h) return;
      const foot = r.bottom + scrollY, maxY = Math.max(0, document.documentElement.scrollHeight - vh);
      const lowest = foot - maxY;                              // where the foot is when the page can go no further
      const end = Math.max(vh * .8, lowest + Math.min(48, vh * .05));
      // starts once the top 45% of the board is up (both words in view), so the rise has about twice the room it
      // would have from the foot at the fold; the moon comes up into view as the board does
      const from = Math.max((vh - h * .45) / vh, (end - h) / vh + .2), to = (end - h) / vh;
      const key = from.toFixed(4) + ':' + to.toFixed(4);
      if (key === range) return;
      range = key;
      if (off) off();
      off = D.track(fig, from, to, draw, { firstScreen: 'plain' });
    };
    const frame = () => {};
    frame.measure = arm;
    S.onFrame(frame);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(arm);
  });
})();
