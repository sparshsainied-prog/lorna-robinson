/* Home page only: the hero. Lorna Robinson's own Hamadryad cover (Lydia Hall's tree rings) cracks open
   from the heart of the big tree, the pieces slide away one after another, and the Oread cover (the tunnel)
   comes up into the light underneath. Everything is tied to the scroll position through window.site.pin:
   it moves only under the reader's hand, runs the same every pass, and reverses when they scroll back up. */
(() => {
  const S = window.site;
  // the cover in cover pixels (1000 x 1600), cut into the planes w0 to w6 and the title
  const CW = 1000, CH = 1600, C = [216, 911];
  const BOX = {"w0": [9, 0, 991, 912], "w1": [215, 186, 785, 860], "w2": [216, 910, 784, 690], "w3": [56, 911, 714, 689], "w4": [0, 911, 217, 689], "w5": [0, 851, 217, 115], "w6": [0, 0, 217, 912], "title": [798, 79, 146, 1464]};
  const BIS = [-1.2426, -0.314, 0.4518, 1.2611, 2.3426, 3.1606, 3.9685];
  const ORDER = [2, 0, 3, 1, 6, 4, 5]; // which piece lets go first
  const els = {};
  document.querySelectorAll('.pl').forEach(el => {
    const [x, y, w, h] = BOX[el.dataset.k];
    Object.assign(el.style, { left: x / CW * 100 + '%', top: y / CH * 100 + '%', width: w / CW * 100 + '%', height: h / CH * 100 + '%' });
    el.style.transformOrigin = `${(C[0] - x) / w * 100}% ${(C[1] - y) / h * 100}%`;
    els[el.dataset.k] = el;
  });
  els.title.style.transformOrigin = '50% 50%';
  const W = BIS.map((b, j) => ({ el: els['w' + j], dx: Math.cos(b), dy: Math.sin(b), o: ORDER.indexOf(j), spin: (j % 2 ? -1 : 1) * (5 + j) }));

  const hero = document.querySelector('.hero'), book = document.querySelector('.book');
  const plate = document.querySelector('.plate'), pit = document.querySelector('.pit');
  const sayA = document.querySelector('.say.a'), sayB = document.querySelector('.say.b');
  const { clamp, ease, easeIn } = S;
  let k = 1;
  const measure = () => { k = book.getBoundingClientRect().width / CW; };
  addEventListener('resize', measure); measure();

  function draw(p) {
    // 1. the heart cracks (the pieces part by a hair), 2. they slide away one after another,
    // 3. the tunnel underneath comes up into the light, 4. the words change over, then everything holds
    const crack = ease(clamp((p - .04) / .14));
    for (const w of W) {
      const t = clamp((p - (.18 + w.o * .04)) / .32);
      const d = crack * (10 + w.o * 2) + easeIn(t) * 1250;
      const r = easeIn(t) * w.spin;
      w.el.style.transform = `translate3d(${(w.dx * d * k).toFixed(1)}px,${(w.dy * d * k).toFixed(1)}px,0) rotate(${r.toFixed(2)}deg)`;
    }
    const lift = easeIn(clamp((p - .2) / .38));
    els.title.style.transform = `translate3d(${(lift * 40 * k).toFixed(1)}px,${(-lift * 1750 * k).toFixed(1)}px,0) rotate(${(lift * 4).toFixed(2)}deg)`;
    pit.style.opacity = (1 - ease(clamp((p - .3) / .34))).toFixed(3);
    plate.style.transform = `scale(${(1.14 - .14 * ease(clamp((p - .15) / .6))).toFixed(4)})`;
    const a = 1 - ease(clamp((p - .34) / .1)), b = ease(clamp((p - .46) / .12));
    sayA.style.opacity = a.toFixed(3);
    sayA.style.transform = `translate3d(0,${(-(1 - a) * 14).toFixed(1)}px,0)`;
    sayB.style.opacity = b.toFixed(3);
    sayB.style.transform = `translate3d(0,${((1 - b) * 18).toFixed(1)}px,0)`;
    sayA.style.visibility = a < .01 ? 'hidden' : 'visible';
    sayB.style.visibility = b < .01 ? 'hidden' : 'visible';
  }
  S.pin(hero, draw);

  // the two big covers below rise a little as the reader brings them up, like the tunnel in the hero
  document.querySelectorAll('.novel .cover').forEach(el => S.drift(el, 48));

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
