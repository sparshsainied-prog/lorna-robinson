/* The Birder page only. Two pieces, both pure functions of the scroll position (window.site):
   1. the hero: the blackbird cut from Lydia Hall's cover lifts off its branch and perches beside the title,
   2. the walk: the same bird moves from one named place to the next as the reader goes down the list.
   Under reduced motion the cover is shown whole (css hides the cut-out) and the walk bird sits by the first name. */
(() => {
  const S = window.site;
  const { clamp, ease } = S;

  /* ---- 1. the hero ---- */
  const hero = document.querySelector('.hero'), bird = document.querySelector('.bird'), perch = document.querySelector('.perch');
  if (hero && bird && perch) {
    let dx = 0, dy = 0, sc = 1, lastP = 0;
    const draw = p => {
      lastP = p;
      if (S.still) { bird.style.transform = ''; perch.style.opacity = ''; return; }
      const t = ease(clamp((p - .02) / .93));           // lifts at once, lands as the run ends: no hold
      const arc = Math.sin(t * Math.PI);                // a rise in the middle of the flight
      const x = dx * t, y = dy * t - arc * 90;
      const s = 1 + (sc - 1) * t;
      const r = -16 * arc;                              // beak up while climbing, level when it lands
      bird.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(3)})`;
      perch.style.opacity = (.35 + .65 * t).toFixed(3);  // the cover's second moon comes up to meet it
    };
    const measure = () => {
      bird.style.transform = '';
      const b = bird.getBoundingClientRect(), q = perch.getBoundingClientRect();
      if (!b.width || !q.width) return;
      sc = q.width / b.width;
      // land the bird's centre on the perch, the pale moon at the end of the title
      dx = (q.left + q.width / 2) - (b.left + b.width / 2);
      dy = (q.top + q.height / 2) - (b.top + b.height / 2);
      draw(lastP);
    };
    S.pin(hero, draw);
    addEventListener('resize', measure);
    addEventListener('load', measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    bird.complete ? measure() : bird.addEventListener('load', measure);
  }

  /* ---- 2. the walk ---- */
  const walk = document.querySelector('.walk .in'), hop = document.querySelector('.hop');
  const places = walk ? [...walk.querySelectorAll('.places > li')] : [];
  if (walk && hop && places.length) {
    let stops = [], swing = 26;                         // y of each name's middle, relative to the walk block; sideways room
    const list = walk.querySelector('.places');
    const fn = (y, vh) => {
      if (!stops.length) return;
      const h = hop.offsetHeight || 60;
      let ty = stops[0], tx = 0, r = 0;
      if (!S.still) {
        // the bird goes down the whole list while the list passes through the viewport:
        // 0 when the list's top is nine tenths of the way down, 1 when its bottom has risen to the middle
        const rect = list.getBoundingClientRect();
        const p = clamp((vh * .9 - rect.top) / (vh * .9 - (vh * .5 - rect.height)));
        const k = p * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(k));
        const t = ease(k - i), arc = Math.sin(t * Math.PI);
        ty = stops[i] + (stops[i + 1] - stops[i]) * t; tx = -arc * swing; r = -14 * arc;
      }
      hop.style.transform = `translate3d(${tx.toFixed(1)}px,${(ty - h / 2).toFixed(1)}px,0) rotate(${r.toFixed(2)}deg)`;
    };
    fn.measure = () => {
      const wr = walk.getBoundingClientRect(), t0 = wr.top;
      swing = Math.max(0, Math.min(26, wr.left - 10));  // never past the left edge of the screen on a phone (the tilt widens it)
      stops = places.map(li => { const r = li.getBoundingClientRect(); return r.top - t0 + r.height / 2; });
    };
    S.onFrame(fn);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { fn.measure(); fn(scrollY, innerHeight); });
  }

  /* ---- 3. the linocuts: the shelf slides into place ----
     The eleven prints are a walk around Oxford on a sideways shelf. As the section comes up they sit 56px to the
     right and slide left together, the way the reader's own finger will push them, coming to rest flush with the
     column by the time the shelf itself is 45% of the way up the viewport (measured on the shelf, not the section,
     so the travel happens while the prints are in sight, under the heading). On a phone the first print already ends a few
     pixels short of the Contents tab, so there the shelf comes the other way, 18px in from the left edge (the
     width of the gutter, so nothing is clipped and nothing goes under the tab). Still while they are looked at,
     and the reader's own sideways scroll is untouched. Reduced motion: at rest. */
  const strip = document.querySelector('#prints .strip'), lis = strip ? [...strip.querySelectorAll(':scope > li')] : [];
  if (strip && lis.length) {
    lis.forEach(li => li.classList.add('fx'));
    S.track(strip, 1, .45, p => {
      if (S.still) { lis.forEach(li => li.style.transform = ''); return; }
      const x = (1 - ease(p)) * (innerWidth < 900 ? -18 : 56);
      const t = `translate3d(${x.toFixed(1)}px,0,0)`;
      lis.forEach(li => li.style.transform = t);
    });
  }
})();
