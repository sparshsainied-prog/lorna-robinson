/* Telling Tales in Nature only: the climb. A window onto Lydia Hall's cover, shaped like the cover, opens close in on
   the darkest place the cover paints, the twisted trunks in the shade under the orchard where small dark figures stand
   among the roots (Underworld Tales), and draws back a little as the reader scrolls; the scroll then carries the
   view across and up the painting, in her order: the birch trunks with the
   girl half hidden at their foot (Forest Tales), the tree heavy with red fruit (Orchard Tales), the open green slope
   under the lilac hills (Meadow Tales). Each name is lit while its own place is in the window. At the end the window
   widens until the whole cover stands in it, all four names lit and the cover's shadow landing with it: four books in
   one. Every stop and every leg between them stays above the title lettering, so it is never cropped and is first
   seen whole at the peak.
   Keyed to scroll through window.site.pin: a pure function of p, same every pass, reverses exactly on the way back
   up, no holds, transforms and opacity only. */
(() => {
  const S = window.site, dig = document.querySelector('.dig');
  if (!S || !dig) return;
  const stage = dig.querySelector('.stage'), grid = dig.querySelector('.in');
  const well = dig.querySelector('.well'), img = well.querySelector('img');
  const tales = [...dig.querySelectorAll('.tales li')]; // her order: Underworld, Forest, Orchard, Meadow
  const { clamp, ease } = S;
  const Z = 1.75;     // the close view: the window shows 1/Z of the cover (the Underworld stop goes closer)
  const LAND = .80;   // from here the window widens until the whole cover is in it
  const DIM = .5;     // names not yet lit stay readable (about 3:1 on the ground), so the list reads as a list
  // at each stop, in p: where the window's centre sits on the cover (fractions of its width and height) and how
  // close it is. The window's foot stays above .652 of the cover's height at every stop and on every leg between,
  // just clear of "Telling Tales", whose tops are at .661.
  const STOPS = [
    [0,    .90, .47,  2.8], // close on the dark trunks and the small figures among their roots (Underworld)
    [.20,  .86, .45,  2.5], //   drawing back from them
    [.35,  .25, .365, Z],   // the birch trunks with the girl hidden at their foot (Forest)
    [.58,  .72, .30,  Z],   // the tree heavy with red fruit, its crown against the sky (Orchard)
    [LAND, .48, .365, Z],   // the open green slope under the lilac hills (Meadow)
  ];
  const CUTS = [.27, .47, .69]; // where the lit name hands over to the next, between the stops above
  const CROSS = .06;            // how much of p each handover takes
  let W = 1, H = 1;
  img.classList.add('fx');
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
    well.style.width = Math.max(120, Math.min(room, avail * 1000 / 1499)).toFixed(1) + 'px';
    const r = well.getBoundingClientRect(); W = r.width; H = r.height; // unrounded, so the right and foot clamps leave no sliver of ground
  };
  let at = -1; // the last p drawn, so a re-measure can redraw the same frame
  const remeasure = () => { measure(); if (at >= 0) draw(at); };

  const view = p => { // the close view at scroll p: translate in window pixels, and scale
    let k = 0;
    while (k < STOPS.length - 2 && p > STOPS[k + 1][0]) k++;
    const [p0, x0, y0, z0] = STOPS[k], [p1, x1, y1, z1] = STOPS[k + 1];
    const t = ease(clamp((p - p0) / (p1 - p0)));
    const cx = x0 + (x1 - x0) * t, cy = y0 + (y1 - y0) * t, z = z0 + (z1 - z0) * t;
    // the view always stays inside the painting
    return [Math.min(0, Math.max(W - z * W, W / 2 - cx * z * W)), Math.min(0, Math.max(H - z * H, H / 2 - cy * z * H)), z];
  };

  const draw = p => {
    at = p;
    if (S.still) { W = H = 1; well.style.width = ''; img.style.transform = ''; well.style.removeProperty('--land'); tales.forEach(li => { li.style.opacity = ''; }); return; }
    if (W <= 1) measure();
    const [tx, ty, z] = view(Math.min(p, LAND));
    const u = ease(clamp((p - LAND) / (1 - LAND)));   // the widening
    const s = z + (1 - z) * u;
    img.style.transform = `translate3d(${(tx * (1 - u)).toFixed(1)}px,${(ty * (1 - u)).toFixed(1)}px,0) scale(${s.toFixed(4)})`;
    well.style.setProperty('--land', u.toFixed(3));
    // each name is lit while its place is in the window, handing over at CUTS; all four as the whole cover lands
    const on = CUTS.map(c => ease(clamp((p - c + CROSS / 2) / CROSS)));
    const lit = tales.map((_, i) => (i === 0 ? 1 : on[i - 1]) - (i < CUTS.length ? on[i] : 0));
    tales.forEach((li, i) => { li.style.opacity = (DIM + (1 - DIM) * Math.max(lit[i], u)).toFixed(3); });
  };

  S.pin(dig, draw);
  addEventListener('resize', measure); // site.js redraws on the next frame
  addEventListener('load', remeasure);
  if (document.fonts) document.fonts.ready.then(remeasure);
})();
