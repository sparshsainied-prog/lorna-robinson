/* Telling Tales in Nature only: the four books. A window shaped like the covers holds the front covers of the four
   mini books, painted by Lydia Hall, in her order: Underworld Tales, Forest Tales, Orchard Tales, Meadow Tales. The
   page opens on Underworld whole in the window. As the reader scrolls, the next book rises from under the window's
   foot over the one before, which sinks back a little and darkens beneath it, and the next name lights as the new
   cover arrives; each cover then rests whole in the window, its title readable, before the next comes up. After
   Meadow, the four are dealt out side by side in the same window, two by two, Meadow first, all four names lit and
   the window's frame giving way: four books in one, which is the compendium sold below.
   Keyed to scroll through window.site.pin: a pure function of p, same every pass, reverses exactly on the way back
   up, no holds, transforms and opacity only. */
(() => {
  const S = window.site, dig = document.querySelector('.dig');
  if (!S || !dig) return;
  const stage = dig.querySelector('.stage'), grid = dig.querySelector('.in');
  const well = dig.querySelector('.well');
  const books = [...well.querySelectorAll('.book')];            // her order: Underworld, Forest, Orchard, Meadow
  const shades = books.map(b => b.querySelector('.shade'));
  const tales = [...dig.querySelectorAll('.tales li')];
  const { clamp, ease } = S;
  // where, in p, each book rises into the window over the one before (Underworld is there from the start); between
  // the legs each cover rests whole in the window
  const LEGS = [null, [.04, .23], [.30, .49], [.56, .75]]; // long legs, short rests: about 1.8px of travel per px of scroll at the steepest
  const DEAL = [.80, .97];  // the four dealt out two by two, Meadow first
  const STAG = .14;         // how much of the deal each book waits after the one dealt before it
  const SINK = .06;         // a covered book sinks back to 1 - SINK of its size, about the middle of its foot
  const DARK = .62;         // and goes this dark under its shade
  const DIM = .5;           // names not lit stay readable (about 3:1 on the ground), so the list reads as a list
  const LIGHT = .05;        // how much of p a name takes to light, centred on the middle of its book's rise
  let W = 1, H = 1;
  books.forEach(b => b.classList.add('fx'));
  tales.forEach(li => li.classList.add('fx'));

  // size the window from the height actually left on the stage, so its foot never falls off a short or wide screen
  const measure = () => {
    well.style.width = '';
    if (S.still) { W = H = 1; return; }
    const cs = getComputedStyle(stage), padB = parseFloat(cs.paddingBottom);
    const gs = getComputedStyle(grid), twoCol = gs.display === 'grid';
    const avail = twoCol // two columns: the stage's whole height; one column: what is left under the title and tales
      ? stage.clientHeight - parseFloat(cs.paddingTop) - padB
      : stage.clientHeight - (well.getBoundingClientRect().top - stage.getBoundingClientRect().top) - padB;
    const room = twoCol // the window's column, or the stage's width less a margin for the Contents tab
      ? (grid.clientWidth - (parseFloat(gs.columnGap) || 0)) * 7 / 11
      : stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 26;
    well.style.width = Math.max(120, Math.min(room, avail * 2 / 3)).toFixed(1) + 'px';
    const r = well.getBoundingClientRect(); W = r.width; H = r.height;
  };
  let at = -1; // the last p drawn, so a re-measure can redraw the same frame
  const remeasure = () => { measure(); if (at >= 0) draw(at); };

  const span = (p, [a, b]) => ease(clamp((p - a) / (b - a)));
  const lerp = (a, b, t) => a + (b - a) * t;

  const draw = p => {
    at = p;
    if (S.still) {
      W = H = 1; well.style.width = ''; well.style.removeProperty('--frame');
      books.forEach((b, i) => { b.style.transform = ''; shades[i].style.opacity = ''; });
      tales.forEach(li => { li.style.opacity = ''; });
      return;
    }
    if (W <= 1) measure();
    const up = books.map((_, i) => i ? span(p, LEGS[i]) : 1);          // how far each book has risen into the window
    const under = books.map((_, i) => i < 3 ? up[i + 1] : 0);          // how far it is covered by the next
    const u = clamp((p - DEAL[0]) / (DEAL[1] - DEAL[0]));              // the deal
    // the two by two: half the window less a gap for each, centred, so the four fill the window's width
    const g = Math.max(6, W * .03), q = (W - g) / (2 * W), top = (H - 2 * q * H - g) / 2;
    books.forEach((b, i) => {
      const c = under[i];
      let s = 1 - SINK * c, x = W * SINK * c / 2, y = (1 - up[i]) * (H + 30) + H * SINK * c /* +30: a waiting book, and its shadow, leave no sliver under the foot */, d = DARK * c;
      const k = ease(clamp((u - (3 - i) * STAG) / (1 - 3 * STAG))); // Meadow (on top) is dealt first
      if (k > 0) {
        const tx = (i % 2) * (q * W + g), ty = top + (i >> 1) * (q * H + g);
        x = lerp(x, tx, k); y = lerp(y, ty, k); s = lerp(s, q, k); d = d * (1 - k);
      }
      b.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${s.toFixed(4)})`;
      shades[i].style.opacity = d.toFixed(3);
      b._k = k;
    });
    well.style.setProperty('--frame', (1 - ease(u)).toFixed(3));
    // each name lights as its book arrives, the one before dims; each is lit again as its book is dealt
    const on = books.map((_, i) => i ? ease(clamp((p - (LEGS[i][0] + LEGS[i][1]) / 2 + LIGHT / 2) / LIGHT)) : 1);
    tales.forEach((li, i) => {
      const lit = Math.max(on[i] - (i < 3 ? on[i + 1] : 0), books[i]._k);
      li.style.opacity = (DIM + (1 - DIM) * lit).toFixed(3);
    });
  };

  S.pin(dig, draw);
  addEventListener('resize', measure); // site.js redraws on the next frame
  addEventListener('load', remeasure);
  if (document.fonts) document.fonts.ready.then(remeasure);
})();
