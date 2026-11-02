/* Flower Gatherers page only: the find. The cover (Lydia Hall) sits on the page as three planes: the plaster
   wall with the title, the orange fresco lily, and the drawn hand with its bracelet. As the reader scrolls,
   the pigment surfaces in the plaster, then the hand is drawn in from the wrist and closes on the stem.
   Everything is a function of scroll position through window.site.pin: it moves only under the reader's hand,
   runs the same every pass and reverses when they scroll back up. */
(() => {
  const S = window.site;
  const find = document.querySelector('.find'), hand = document.querySelector('.hand'), lily = document.querySelector('.lily');
  const say = ['a', 'b', 'c'].map(k => document.querySelector('.say.' + k));
  if (!find || !hand || !lily) return;
  const { clamp, ease, easeIn } = S;
  // the hand is drawn from the wrist (top right) to the thumb (bottom left): a straight edge sweeps along that line
  const D = [-0.556, 0.831], N = [0.831, 0.556]; // direction and its normal, in the hand's own box
  let w = 1, h = 1, L = 1, sx = 0, sy = 0;
  const measure = () => {
    w = hand.offsetWidth; h = hand.offsetHeight;
    sx = w * 1.06; sy = -h * 0.06;                      // where the sweep starts (just past the wrist)
    L = Math.abs(D[0] * w) + Math.abs(D[1] * h) + w * .12; // enough to cross the whole box
  };
  addEventListener('resize', measure); measure();

  function draw(p) {
    // 1. the wall alone  2. the pigment surfaces  3. the hand is drawn in  4. the words settle, then it holds
    lily.style.opacity = ease(clamp((p - .10) / .30)).toFixed(3);
    const t = ease(clamp((p - .42) / .32));
    const px = sx + D[0] * L * t, py = sy + D[1] * L * t, R = Math.max(w, h) * 4;
    hand.style.clipPath = t >= 1 ? 'none' : `polygon(${(px + N[0] * R).toFixed(1)}px ${(py + N[1] * R).toFixed(1)}px, ${(px - N[0] * R).toFixed(1)}px ${(py - N[1] * R).toFixed(1)}px, ${(px - N[0] * R - D[0] * R).toFixed(1)}px ${(py - N[1] * R - D[1] * R).toFixed(1)}px, ${(px + N[0] * R - D[0] * R).toFixed(1)}px ${(py + N[1] * R - D[1] * R).toFixed(1)}px)`;
    const reach = (1 - easeIn(t)) * w * .06;              // the hand comes in from the wrist side as it is drawn
    hand.style.transform = `translate3d(${reach.toFixed(1)}px,${(-reach * .7).toFixed(1)}px,0)`;
    hand.style.visibility = t <= 0 ? 'hidden' : 'visible';
    // the three sentences hand over: the leaving one is all but gone (rising 14px) before the arriving one surfaces
    // (rising 14px into place), so two sentences are never seen stacked on each other; the title above holds through
    // the brief beat between them. Whole pixels, and no transform at all once a sentence is at rest, so the type
    // rasterises the same whichever way the reader arrived.
    const ai = ease(clamp((p - .06) / .12));
    const ao = ease(clamp((p - .38) / .05)), bi = ease(clamp((p - .42) / .06));
    const bo = ease(clamp((p - .70) / .05)), ci = ease(clamp((p - .74) / .06));
    [[ai, ao], [bi, bo], [ci, 0]].forEach(([inn, out], i) => {
      const el = say[i], o = inn * (1 - out), y = Math.round((1 - inn) * 14 - out * 14);
      el.style.opacity = o.toFixed(3);
      el.style.transform = y ? `translate3d(0,${y}px,0)` : 'none';
      if (i < 2) el.style.visibility = o < .01 ? 'hidden' : 'visible';   // the last words are never hidden (keyboard)
      el.style.pointerEvents = o < .5 ? 'none' : '';
    });
  }
  S.pin(find, draw);
  // .say.c holds the hero's links. It is never hidden from the keyboard: a Tab into it while the find is still
  // running takes the page to the end of the find (the scroll itself, so the frame drawn is the finished one).
  const toEnd = () => {
    if (S.still) return;
    const end = Math.round(find.getBoundingClientRect().top + scrollY + find.offsetHeight - innerHeight);
    if (scrollY < end - 1) window.scrollTo({ top: end, behavior: 'instant' });
  };
  say[2].addEventListener('focusin', toEnd);

  /* ---- the book, on paper: the fresco lily settles ----
     Lydia Hall's orange lily (the same cut plane as in the hero) closes the section in a row of its own under both
     columns. It is the site's single-image plane: 32px below its place as it enters, at rest as it leaves (S.drift),
     no fade. The two text columns stay still. Reduced motion and no JS: at rest (.fx). */
  const fresco = document.querySelector('#about-the-book .fresco');
  if (fresco) S.drift(fresco, 32);

  /* ---- reviews: the rule is drawn ----
     The fresco-orange rule beside each quote is drawn down from its top as the quote rises from 95% to 60% of the
     viewport (--p, read by css/flower-gatherers.css). Only the rule: the quoted words stay put. Under reduced motion
     site.track gives p = 1; without JavaScript the CSS leaves the rule whole. */
  document.querySelectorAll('#reviews .quote').forEach(q => S.prop(q, .95, .6));
})();
