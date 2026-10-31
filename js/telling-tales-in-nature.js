/* Telling Tales in Nature only: the climb. A window onto Lydia Hall's cover, shaped like the cover, holds a close view
   that the reader's scroll carries up through the painting: from the lettering among the leaves at its foot (Underworld
   Tales), up the birch trunks past the hidden girl (Forest Tales), across to the tree heavy with red fruit (Orchard
   Tales), to the open hill and the dusk sky (Meadow Tales). The view and the list share one progress p, so each name is
   lit while its part of the painting is in the window. At the end the window widens until the whole cover stands in
   it, all four names lit: four books in one. Keyed to scroll through window.site.pin: same every pass, reverses on
   the way back up, no holds, transforms and opacity only. */
(() => {
  const S = window.site, dig = document.querySelector('.dig');
  if (!S || !dig) return;
  const well = dig.querySelector('.well'), img = well.querySelector('img');
  const tales = [...dig.querySelectorAll('.tales li')]; // her order: Underworld, Forest, Orchard, Meadow
  const { clamp, ease } = S;
  const Z = 1.75;     // the close view: the window shows 1/Z of the cover's height
  const LAND = .80;   // from here the window widens until the whole cover is in it
  const DIM = .22;    // names not yet reached stay on the page, dimmed, so the list reads as a list
  // where the window's centre sits on the cover (fractions of its width and height) at each stop, in p
  const STOPS = [
    [0,   .50, 1],    // the foot: the lettering and the leaves, the roots of it all (Underworld)
    [.30, .32, .60],  // the birch trunks and the girl half hidden at their foot (Forest)
    [.56, .70, .30],  // the tree heavy with red fruit (Orchard)
    [LAND, .45, 0],   // the open hill and the dusk sky (Meadow)
  ];
  let W = 1, H = 1;
  img.classList.add('fx');
  tales.forEach(li => li.classList.add('fx'));
  const measure = () => { W = well.clientWidth; H = well.clientHeight; };

  const view = p => { // the close view's translate at scroll p, in window pixels
    let k = 0;
    while (k < STOPS.length - 2 && p > STOPS[k + 1][0]) k++;
    const [p0, x0, y0] = STOPS[k], [p1, x1, y1] = STOPS[k + 1];
    const t = ease(clamp((p - p0) / (p1 - p0)));
    const cx = x0 + (x1 - x0) * t, cy = y0 + (y1 - y0) * t;
    return [Math.min(0, Math.max(W - Z * W, W / 2 - cx * Z * W)), Math.min(0, Math.max(H - Z * H, H / 2 - cy * Z * H)), k, t];
  };

  const draw = p => {
    if (S.still) { img.style.transform = ''; tales.forEach(li => { li.style.opacity = ''; }); return; }
    if (W <= 1) measure();
    const [tx, ty, k, t] = view(Math.min(p, LAND));
    const u = ease(clamp((p - LAND) / (1 - LAND)));   // the widening
    const s = Z + (1 - Z) * u;
    img.style.transform = `translate3d(${(tx * (1 - u)).toFixed(1)}px,${(ty * (1 - u)).toFixed(1)}px,0) scale(${s.toFixed(4)})`;
    // the lit name follows the view: a crossfade in the middle of each leg, then all four as the whole cover lands
    const x = ease(clamp((t - .35) / .3));
    const lit = tales.map((_, i) => i === k ? 1 - x : i === k + 1 ? x : 0);
    tales.forEach((li, i) => { li.style.opacity = (DIM + (1 - DIM) * Math.max(lit[i], u)).toFixed(3); });
  };

  S.pin(dig, draw);
  addEventListener('resize', () => { measure(); });
})();
