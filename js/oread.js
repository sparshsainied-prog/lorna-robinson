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
  [print, words, arrive, book].forEach(el => el.classList.add('fx'));
  const { clamp, ease } = S;

  let endS = 8, narrow = innerWidth < 900, mx0 = 0, my0 = 0, cx = 0, cy = 0, bw = 1, m = 0, fl = 0;
  const title = $('.title'), author = $('.author');
  const measure = () => {
    narrow = innerWidth < 900;
    // the mouth's place on the stage at scale 1 (read with the book's own offset written last frame taken out)
    const t = book.style.transform; book.style.transform = '';
    const b = book.getBoundingClientRect(), s = stage.getBoundingClientRect();
    book.style.transform = t;
    mx0 = b.left - s.left + VP[0] / W * b.width; my0 = b.top - s.top + VP[1] / H * b.height;
    dark.style.left = mx0.toFixed(1) + 'px'; dark.style.top = my0.toFixed(1) + 'px';
    cx = s.width / 2; cy = s.height / 2; bw = b.width; m = VP[0] / W * bw;
    // the art fades out over its outer 240 of 1500 px (make-oread-rings.py): this much of each side reads as black
    fl = .1 * bw;
    // the dark must cover the farthest corner of the viewport from where the mouth ends up
    const ex = mouthX(RINGS.r1[4]);
    const far = Math.hypot(Math.max(ex, s.width - ex), Math.max(cy, s.height - cy));
    endS = far / 100;
    if (!narrow) [title, author].forEach(el => { el.style.opacity = ''; el.style.visibility = ''; });
  };
  // where the mouth should be across the frame when r1 is at scale s. The mouth sits near the cover's left edge, so
  // centring it would bare the page to its left; instead the scaled cover is centred in the frame while it is
  // narrower than the frame (black either side, evenly, never a strip down one side), and once it is wider its
  // left edge is held just past the frame's edge, so the ribs fill all four sides from there on
  const mouthX = s => Math.max(cx - (bw / 2 - m) * s, (m - fl) * s - 8);
  addEventListener('resize', measure); measure();

  const show = (el, o) => { el.style.opacity = o.toFixed(3); el.style.visibility = o < .01 ? 'hidden' : 'visible'; };
  // only the book (which only translates) is promoted, and only while the dive runs. The rings and the print are
  // painted at their true scale every frame rather than kept as layers: a promoted layer keeps the raster scale it was
  // made at, which differed going down and coming back up (the same scrollY gave different pixels on the ring edges)
  let moving = null;
  const layers = [book];
  const setMoving = m => { if (m === moving) return; moving = m; layers.forEach(el => { el.style.willChange = m ? 'transform' : ''; }); };
  function draw(p) {
    if (S.still) { // reduced motion: css/site.css and css/oread.css show the finished state; leave nothing inline
      setMoving(false);
      rings.forEach(r => { r.el.style.transform = ''; r.el.style.opacity = ''; r.el.style.visibility = ''; });
      [print, words, arrive, book, title, author].forEach(el => { el.style.opacity = ''; el.style.visibility = ''; el.style.transform = ''; });
      dark.style.transform = '';
      return;
    }
    setMoving(p > 0 && p < 1);
    // 1. the rings scale about the mouth, exponentially so the tunnel passes at a steady pace; the title rides on r1.
    //    The whole book slides as it goes, so the growing cover stays centred in the frame (see mouthX)
    const z = clamp((p - .02) / .76), c = ease(clamp(z / .37)), s1 = Math.pow(RINGS.r1[4], z);
    const ox = (mouthX(s1) - mx0) * c, oy = (cy - my0) * c;
    book.style.transform = ox || oy ? `translate3d(${ox.toFixed(1)}px,${oy.toFixed(1)}px,0)` : '';
    for (const r of rings) r.el.style.transform = `scale(${Math.pow(r.max, z).toFixed(4)})`;
    print.style.transform = `scale(${s1.toFixed(4)})`;
    // the cover's hard border goes in the first few pixels of the run, so the rectangle dissolves rather than slides
    show(band, 1 - clamp(z / .035));
    // 2. the dark of the mouth fades in and grows over everything, and the last light goes
    const o = ease(clamp((p - .3) / .2)), g = clamp((p - .3) / .55);
    dark.style.opacity = o.toFixed(3);
    dark.style.transform = `translate3d(${ox.toFixed(1)}px,${oy.toFixed(1)}px,0) scale(${(.7 * Math.pow(endS / .7, g)).toFixed(3)})`;
    veil.style.opacity = ease(clamp((p - .5) / .4)).toFixed(3);
    // 3. the opening line goes as soon as the dive begins, before the ribs reach it. The cover's printed title and
    //    her name ride out with the ring, covering the drawing beneath them. On a wide screen the
    //    title holds until it is at the frame's right edge (p .5 to .68), so the filled-in column under it is never
    //    seen large in mid-frame, only as a sliver at the edge as the veil comes in. On a phone the book spans the screen, so the name goes before it can cross
    //    the opening line or be cut by the right edge, and the title before it passes under the Contents tab: the
    //    rings carry the dive alone there
    show(words, 1 - ease(clamp((p - .01) / .07)));
    show(print, 1 - ease(clamp((p - .5) / .18)));
    if (narrow) {
      show(author, 1 - ease(clamp((p - .03) / .08)));
      show(title, 1 - ease(clamp((p - .05) / .08)));
    }
    // 4. the first two paragraphs arrive at the tunnel's end and finish rising as the pin lets go (opacity only:
    //    they stay readable to assistive tech)
    const a = ease(clamp((p - .66) / .34));
    arrive.style.opacity = a.toFixed(3);
    arrive.style.transform = `translate3d(0,${((1 - a) * 28).toFixed(1)}px,0)`;
  }
  S.pin(hero, draw);

  // the Oread cover below rises 48px as the reader brings it up (28px on a phone, where it is set into the text). Measured from its untransformed link (site.drift reads
  // the moving element's own rect, which makes the rest position path-dependent by a pixel or two), so it is exact both ways.
  document.querySelectorAll('.collide .cover').forEach(el => {
    el.classList.add('fx');
    S.track(el.parentElement, 1.1, -.2, p => { el.style.transform = S.still ? '' : `translate3d(0,${((innerWidth < 600 ? 28 : 48) * (1 - p)).toFixed(1)}px,0)`; });
  });
})();
