/* Home page only: the hero. Lorna Robinson's own Hamadryad cover (Lydia Hall's tree rings) is the world: one ring
   is counted outward from the heart of the big tree (the two hundred years between the Hamadryad Charter and
   Oread), the cover cracks from the heart, the pieces fall away with the title, and the reader drops into the
   Oread tunnel underneath in three depth planes (the far mouth, the mid ribs, the near ribs), each rising at its
   own rate as the ground lifts off them, until the Oread title and her line settle where the cover puts them.
   Everything is tied to the scroll position through window.site.pin: it moves only under the reader's hand,
   runs the same every pass, and reverses when they scroll back up. Planes are cut by build/make-home-planes.py. */
(() => {
  const S = window.site, { clamp, ease, easeIn } = S;
  // boxes in art pixels (1500 x 2400): the heart of the big tree, the tunnel's vanishing point, the pieces
  const AW = 1500, C = [324, 1366], VP = [205, 1400];
  const BOX = {"w0": [19, 9, 1116, 1358], "w1": [323, 676, 812, 876], "w2": [324, 1366, 811, 789], "w3": [139, 1366, 934, 789], "w4": [6, 1366, 319, 789], "w5": [6, 1276, 319, 196], "w6": [6, 33, 319, 1334]};
  const BIS = [-1.2271, -0.2977, 0.4326, 1.2355, 2.3572, 3.2013, 3.9929]; // each piece's own direction out from the heart
  const ORDER = [2, 0, 3, 1, 6, 4, 5]; // which piece lets go first
  const TB = {"t1": [5, 6, 1489, 2394], "t2": [5, 331, 1270, 2069], "t3": [5, 811, 790, 1179]};
  const $ = s => document.querySelector(s);
  const hero = $('.hero'), stage = $('.stage'), book = $('.book'), pit = $('.pit'), years = $('.years'), ring = $('.years g');
  const wide = matchMedia('(min-width: 900px)');
  const htitle = $('.htitle'), otitle = $('.otitle'), sayA = $('.say.a'), sayB = $('.say.b'), yrs = $('.yrs');
  const place = (el, b, o) => {
    Object.assign(el.style, { left: b[0] / AW * 100 + '%', top: b[1] / 2400 * 100 + '%', width: b[2] / AW * 100 + '%', height: b[3] / 2400 * 100 + '%' });
    el.style.transformOrigin = `${(o[0] - b[0]) / b[2] * 100}% ${(o[1] - b[1]) / b[3] * 100}%`;
  };
  const W = [...document.querySelectorAll('.pl')].map(el => {
    const j = +el.dataset.k.slice(1); place(el, BOX[el.dataset.k], C);
    return { el, dx: Math.cos(BIS[j]), dy: Math.sin(BIS[j]), o: ORDER.indexOf(j), spin: (j % 2 ? -1 : 1) * (5 + j) };
  });
  const T = {};
  document.querySelectorAll('.tp').forEach(el => { place(el, TB[el.dataset.k], VP); el.classList.add('fx'); T[el.dataset.k] = el; });
  [otitle, sayB].forEach(el => el.classList.add('fx'));

  let k = .5, bh = 800, vh = innerHeight;
  const measure = () => {
    const b = book.getBoundingClientRect(); k = b.width / AW; bh = b.height; vh = innerHeight;
    // the Oread title rides with the near ribs, so it scales about the same vanishing point
    const t0 = otitle.style.transform; otitle.style.transform = 'none';
    const t = otitle.getBoundingClientRect(); otitle.style.transform = t0;
    otitle.style.transformOrigin = `${(b.left + VP[0] * k - t.left).toFixed(1)}px ${(b.top + VP[1] * k - t.top).toFixed(1)}px`;
  };
  addEventListener('resize', measure); addEventListener('load', measure); measure();

  const show = (el, o) => { el.style.opacity = o.toFixed(3); el.style.visibility = o < .01 ? 'hidden' : 'visible'; };
  // the two sets of words stay in the page for keyboards and screen readers: opacity only, no visibility
  const say = (el, o) => { el.style.opacity = o.toFixed(3); el.classList.toggle('off', o < .5); };
  function draw(p) {
    if (S.still) { // reduced motion: css/home.css shows the finished state; leave nothing inline on what it shows
      Object.values(T).forEach(el => { el.style.transform = ''; });
      [otitle, sayB].forEach(el => { el.style.transform = ''; el.style.opacity = ''; el.style.visibility = ''; el.classList.remove('off'); });
      sayA.removeAttribute('aria-hidden');
      return;
    }
    // 1. the years: one ring counted outward from the heart to the bark while the rings lean in; her words say how many
    const yr = ease(clamp(p / .12));
    ring.style.transform = `scale(${(.02 + .98 * yr).toFixed(4)})`;
    show(years, (1 - ease(clamp((p - .16) / .1))));
    yrs.style.opacity = ease(clamp((p - .04) / .06)).toFixed(3);
    const lean = (1 + .07 * yr).toFixed(4);
    // 2. the heart cracks (the pieces part by a hair), 3. they fall away one after another, spinning a little
    const crack = ease(clamp((p - .12) / .12));
    for (const w of W) {
      const t = clamp((p - (.2 + w.o * .03)) / .3);
      const d = (crack * (12 + w.o * 2) + easeIn(t) * 1400) * k;
      w.el.style.transform = `translate3d(${(w.dx * d).toFixed(1)}px,${(w.dy * d).toFixed(1)}px,0) rotate(${(easeIn(t) * w.spin).toFixed(2)}deg) scale(${lean})`;
      show(w.el, 1 - clamp((t - .55) / .45)); // they thin out in the last of their flight, so they never cross the words solid
    }
    // the title plane lifts away and takes the Hamadryad line with it
    const lift = easeIn(clamp((p - .23) / .3));
    htitle.style.transform = `translate3d(${Math.round(lift * 40 * k)}px,${Math.round(-14 * yr - lift * vh * 1.3)}px,0) rotate(${(lift * 4).toFixed(2)}deg)`;
    htitle.style.visibility = lift >= 1 ? 'hidden' : 'visible';
    const a = 1 - ease(clamp((p - .27) / .15));
    say(sayA, a); sayA.style.transform = `translate3d(0,${Math.round(-easeIn(1 - a) * 28)}px,0)`; // fades before it moves, so it never rides into her name
    if (a < .01) sayA.setAttribute('aria-hidden', 'true'); else sayA.removeAttribute('aria-hidden');
    // 4. the descent: the tunnel comes up out of the dark, the near ribs fastest, the far mouth least. The Oread
    //    line arrives from below as the last pieces are still leaving, so the copy never goes to nothing.
    const dz = ease(clamp((p - .32) / .52));
    const rise = (el, y, s0) => { el.style.transform = `translate3d(0,${((1 - dz) * y * bh).toFixed(1)}px,0) scale(${(s0 + (1 - s0) * dz).toFixed(4)})`; };
    rise(T.t1, .22, .55); rise(T.t2, .14, .7); rise(T.t3, .07, .85); rise(otitle, .22, .55);
    const ground = ease(clamp((p - (wide.matches ? .3 : .28)) / .26)); // phones lift it a touch sooner so the screen never goes black
    pit.style.opacity = (1 - ground).toFixed(3);
    show(otitle, ground); // the Oread title is under the ground until the ground lifts
    // 5. the Oread line and its buttons settle up out of the tunnel with the title
    const b = ease(clamp((p - .42) / .26));
    say(sayB, b); sayB.style.transform = `translate3d(0,${Math.round((1 - b) * 36)}px,0)`;
  }
  S.pin(hero, draw);
  // a keyboard reader tabbing to Get Oread or the launch lands on the finished state, not on a line that is not there yet
  sayB.addEventListener('focusin', () => {
    if (S.still) return;
    const end = hero.getBoundingClientRect().top + scrollY + hero.offsetHeight - innerHeight;
    if (scrollY < end - 1) scrollTo({ top: end, behavior: 'auto' });
  });

  // the two novels below pick the hero's art up at their edges, rising a little as the reader brings them up
  document.querySelectorAll('.novel .edge img').forEach(el => S.drift(el, 56));

  // the next dates: read from events/ (the one page Lorna edits) and show the first two that have not passed.
  // The static block in index.html is the copy shown without JavaScript, or if this fetch fails.
  const list = document.querySelector('#events [data-events]'), empty = document.querySelector('#events [data-when-empty]');
  if (list && window.fetch && window.DOMParser) {
    const base = new URL('events/', location.href);
    fetch(base.href, { cache: 'no-cache' }).then(r => r.ok ? r.text() : Promise.reject(r.status)).then(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const next = [...doc.querySelectorAll('[data-events] > li[data-date]')].filter(li => {
        const d = li.dataset.date.split('-').map(Number);
        return d.length === 3 && !d.some(isNaN) && new Date(d[0], d[1] - 1, d[2]) >= today;
      }).slice(0, 2);
      list.replaceChildren(...next.map(li => {
        const c = document.importNode(li, true);
        c.querySelectorAll('.poster').forEach(x => x.remove());
        c.querySelectorAll('a[href]').forEach(a => { a.setAttribute('href', new URL(a.getAttribute('href'), base).href); });
        return c;
      }));
      if (empty) empty.hidden = next.length > 0;
    }).catch(() => {});
  }
})();
