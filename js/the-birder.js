/* The Birder page only. Four pieces, all pure functions of the scroll position (window.site):
   1. the hero (the signature): the blackbird cut from Lydia Hall's cover lifts off its branch and lands on the
      second moon at the end of the title,
   2. the walk: the same bird moves from one named place to the next as the reader goes down the list,
   3. the linocuts: each print is pulled from the block as the shelf comes up,
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

  /* ---- 3. the linocuts: each print pulled from the block ----
     site.shelve gives each print --set 0..1 as the shelf's foot comes up from the bottom edge (all set by the time it
     is 72% of the way up), one after another left to right; css/the-birder.css turns --set into the paper uncovering
     top to bottom off a two degree tilt. Still once set; the reader's own sideways scroll is untouched. A small
     stagger, so the first two prints on a phone and the first four on a desktop come up nearly together. */
  const strip = document.querySelector('#prints .strip');
  if (strip) S.shelve(strip, strip.querySelectorAll(':scope > li'), .04);

  /* ---- 4. the invitation: the same blackbird settles on the end of "Read The Birder" ----
     A quiet echo of the hero. It comes 28px in from beyond the end of the heading, beak first (the cut-out faces
     left), and 18px down, while the heading rises from the bottom edge to 70%. Heading, buttons and text are still. */
  const alight = document.querySelector('#buy .alight');
  if (alight) S.move(alight, 28, -18, 1, .7);
})();
