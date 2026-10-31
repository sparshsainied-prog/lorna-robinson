/* Oread page only: the tunnel hero. Lydia Hall's cover is cut into three rings around the tunnel's vanishing point,
   plus the cover's hard border as a band of its own (build/make-oread-rings.py). As the reader scrolls, the rings
   scale about the mouth, the outer one fastest, so the ribs rush past; the border band fades in the first few pixels
   so the rectangle dissolves rather than sliding apart; the printed title and name ride on the outer ring; the dark of
   the mouth grows until it covers the page and the first two paragraphs arrive in it. Everything is a pure function
   of scroll position through window.site.pin: it moves only under the reader's hand, runs the same every pass and
   reverses when they scroll back up. */
(() => {
  const S = window.site;
  const W = 1500, H = 2400, VP = [205, 1400];
  // ring crops in cover pixels [x, y, w, h] (also inline on each img) and how far each scales by the end of the run
  const RINGS = { rb: [0, 0, 1500, 2400, 5.2], r1: [9, 9, 1482, 2382, 5.2], r2: [9, 321, 1276, 2070, 3.1], r3: [0, 780, 825, 1240, 2.3] };
  const $ = s => document.querySelector(s);
  const hero = $('.hero'), stage = $('.stage'), book = $('.book'), dark = $('.dark'), veil = $('.veil');
  const print = $('.print'), words = $('.words'), arrive = $('.arrive');
  let band = null;
  const rings = [...document.querySelectorAll('.ring')].map(el => {
    const [x, y, w, h, max] = RINGS[el.dataset.k];
    el.style.transformOrigin = `${(VP[0] - x) / w * 100}% ${(VP[1] - y) / h * 100}%`;
    el.classList.add('fx');
    if (el.dataset.k === 'rb') band = el;
    return { el, max };
  });
  print.style.transformOrigin = `${VP[0] / W * 100}% ${VP[1] / H * 100}%`;
  [print, words, arrive].forEach(el => el.classList.add('fx'));
  const { clamp, ease } = S;

  let endS = 8;
  const measure = () => {
    // the dark sits on the mouth; by the end it must cover the farthest corner of the viewport
    const b = book.getBoundingClientRect(), s = stage.getBoundingClientRect();
    const x = b.left - s.left + VP[0] / W * b.width, y = b.top - s.top + VP[1] / H * b.height;
    dark.style.left = x.toFixed(1) + 'px'; dark.style.top = y.toFixed(1) + 'px';
    const far = Math.hypot(Math.max(x, s.width - x), Math.max(y, s.height - y));
    endS = far / 100;
  };
  addEventListener('resize', measure); measure();

  const show = (el, o) => { el.style.opacity = o.toFixed(3); el.style.visibility = o < .01 ? 'hidden' : 'visible'; };
  function draw(p) {
    if (S.still) { // reduced motion: css/site.css and css/oread.css show the finished state; leave nothing inline
      rings.forEach(r => { r.el.style.transform = ''; r.el.style.opacity = ''; r.el.style.visibility = ''; });
      [print, words, arrive].forEach(el => { el.style.opacity = ''; el.style.visibility = ''; el.style.transform = ''; });
      return;
    }
    // 1. the rings scale about the mouth, exponentially so the tunnel passes at a steady pace; the title rides on r1
    const z = clamp((p - .02) / .76);
    for (const r of rings) r.el.style.transform = `scale(${Math.pow(r.max, z).toFixed(4)})`;
    print.style.transform = `scale(${Math.pow(RINGS.r1[4], z).toFixed(4)})`;
    // the cover's hard border goes in the first few pixels of the run, so the rectangle dissolves rather than slides
    show(band, 1 - clamp(z / .035));
    // 2. the dark of the mouth fades in and grows over everything, and the last light goes
    const o = ease(clamp((p - .3) / .2)), g = clamp((p - .3) / .55);
    dark.style.opacity = o.toFixed(3);
    dark.style.transform = `scale(${(.7 * Math.pow(endS / .7, g)).toFixed(3)})`;
    veil.style.opacity = ease(clamp((p - .5) / .28)).toFixed(3);
    // 3. the opening line goes before the ribs reach it; the cover's printed title and her name ride out with the
    //    ring, covering the drawing beneath them, and go only once the veil has them
    show(words, 1 - ease(clamp((p - .06) / .12)));
    show(print, 1 - ease(clamp((p - .58) / .14)));
    // 4. the first two paragraphs arrive at the tunnel's end (opacity only: they stay readable to assistive tech)
    const a = ease(clamp((p - .62) / .18));
    arrive.style.opacity = a.toFixed(3);
    arrive.style.transform = `translate3d(0,${((1 - a) * 28).toFixed(1)}px,0)`;
  }
  S.pin(hero, draw);

  // the Hamadryad cover below rises a little as the reader brings it up
  document.querySelectorAll('.collide .cover').forEach(el => S.drift(el, 48));
})();
