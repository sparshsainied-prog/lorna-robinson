/* The Birder page only. Four pieces, all pure functions of the scroll position (window.site):
   1. the hero (the signature): the blackbird cut from Lydia Hall's cover lifts off its branch and lands on the
      second moon at the end of the title,
   2. the walk: the same bird moves from one named place to the next as the reader goes down the list,
   3. the linocuts: each print is set down on the shelf as it comes up,
   4. the invitation: the bird again, small, settling on the end of "Read The Birder".
   Under reduced motion and without JavaScript everything is at rest: the cover whole (css hides the cut-out), the
   walk bird by the first name, the prints uncovered, the last bird on its heading. */
(() => {
  const S = window.site;
  const { clamp, ease } = S;

  /* ---- 1. the hero ----
     The bird lands at half the moon's width with its feet on the moon's lower part (as it sits on the cover's moon),
     not as a sticker over the disc. The moon itself starts small and clear and comes up to full over the first half
     of the flight, so it rises as the bird lifts. Where the title and the cover sit side by side (700px up) the flight
     is a climb and a drop across the gap; on a phone, where the title sits straight above the cover, it is a sideways
     loop out into the sky right of the moon and back, so the bird does not just hop up and drop. */
  const hero = document.querySelector('.hero'), bird = document.querySelector('.bird'), perch = document.querySelector('.perch');
  if (hero && bird && perch) {
    let dx = 0, dy = 0, sc = 1, out = 0, lastP = 0;
    const draw = p => {
      lastP = p;
      if (S.still) { bird.style.transform = ''; perch.style.opacity = ''; perch.style.transform = ''; return; }
      const t = ease(clamp((p - .02) / .93));           // lifts at once, lands as the run ends: no hold
      const arc = Math.sin(t * Math.PI);                // 0 at both ends, 1 in the middle of the flight
      const wide = innerWidth >= 700;                   // the two-column hero (css/the-birder.css, 700px up)
      const x = dx * t + (wide ? 0 : arc * out), y = dy * t - arc * (wide ? 90 : 30);
      const s = 1 + (sc - 1) * t;
      const r = -16 * arc;                              // beak up while in the air, level when it lands
      bird.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(3)})`;
      const m = clamp(t / .5);                          // the cover's second moon: up to full by mid-flight
      perch.style.opacity = m.toFixed(3);
      perch.style.transform = `scale(${(.6 + .4 * m).toFixed(3)})`;
    };
    const measure = () => {
      bird.style.transform = ''; perch.style.transform = 'none';
      const b = bird.getBoundingClientRect(), q = perch.getBoundingClientRect();
      if (b.width && q.width) {
        sc = .5 * q.width / b.width;
        // the bird's bottom centre (its feet and tail) to a point on the moon's lower part
        const tx = q.left + q.width * .55, ty = q.top + q.height * .78;
        dx = tx - (b.left + b.width / 2);
        dy = ty - sc * b.height / 2 - (b.top + b.height / 2);
        out = Math.max(0, Math.min(70, innerWidth - q.right - 50));   // sideways room right of the moon (phone)
      }
      draw(lastP);                                      // the first frame at scroll 0 is the same one a round trip ends on
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

  /* ---- 3. the linocuts: each print set down on the shelf ----
     Every print gets --set 0..1 from its own place on the page (so a grid's lower rows are set down when they come
     up, not when the first row does): 0 while its foot is below the bottom edge, 1 once the foot has risen 30% of
     the viewport. Prints that sit side by side on one row follow one another left to right (a small stagger by
     column). css/the-birder.css turns --set into a lift and a slight tilt; nothing is hidden at any point. Measured
     from the li, which never moves (only its img does), so the frame at any scroll position is the same both ways.
     Reduced motion: --set removed (1). The reader's own sideways scroll on a phone is untouched.
     Then the phone shelf's Previous and Next: one print along each press (native scrolling), greyed at either end. */
  const strip = document.querySelector('#prints .strip');
  if (strip) {
    const items = [...strip.children];
    let cols = items.map(() => 0);
    const set = (y, vh) => {
      if (S.still) { items.forEach(li => li.style.removeProperty('--set')); return; }
      items.forEach((li, i) => {
        const r = li.getBoundingClientRect();
        const base = (vh - r.bottom) / (vh * .3);
        li.style.setProperty('--set', clamp(base * 1.25 - cols[i] * .08).toFixed(4));
      });
    };
    set.measure = () => {
      // column within its visual row: 0 for the first print on a row, 1 for the next... (a shelf is one long row)
      let top = null, c = 0;
      cols = items.map(li => { const t = li.offsetTop; if (t !== top) { top = t; c = 0; } else c++; return Math.min(c, 3); });
    };
    set.measure();
    S.onFrame(set);

    const prev = document.querySelector('#prints .prev'), next = document.querySelector('#prints .next');
    if (prev && next) {
      const step = () => (items[1] ? items[1].offsetLeft - items[0].offsetLeft : strip.clientWidth);
      const go = d => strip.scrollBy({ left: d * step(), behavior: S.still ? 'auto' : 'smooth' });
      prev.addEventListener('click', () => go(-1));
      next.addEventListener('click', () => go(1));
      let queued = false;
      const ends = () => {
        queued = false;
        const max = strip.scrollWidth - strip.clientWidth;
        prev.disabled = strip.scrollLeft <= 2;
        next.disabled = strip.scrollLeft >= max - 2;
      };
      strip.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(ends); } }, { passive: true });
      addEventListener('resize', ends);
      ends();
    }
  }

  /* ---- 4. the invitation: the same blackbird settles on the end of "Read The Birder" ----
     A quiet echo of the hero. It comes 28px in from beyond the end of the heading, beak first (the cut-out faces
     left), and 18px down, while the heading rises from the bottom edge to 70%. Heading, buttons and text are still. */
  const alight = document.querySelector('#buy .alight');
  if (alight) S.move(alight, 28, -18, 1, .7);
})();
