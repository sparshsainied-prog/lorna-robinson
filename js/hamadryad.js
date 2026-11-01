/* Hamadryad page only: the cover grows from its heart. Lydia Hall's cover is cut into ring bands along its own
   grooves (build/make-hamadryad-bands.py: band 0 is the heart, the printed title and her printed name, then one band
   per group of rings, outward). Each band's box is in css/hamadryad.css; this file drives opacity only, as a pure
   function of the scroll position through window.site.pin: the rings come in one after another under the reader's
   hand, the same every pass, and go back when they scroll up. As the last rings land, the untouched cover
   (.band.full) is laid over the stack, so the cover held at the end is the print itself, with no seam anywhere. */
(() => {
  const S = window.site;
  const { clamp } = S;
  const smooth = t => t * t * (3 - 2 * t);   // smoothstep: at WIN .09 no band changes more than ~.2 opacity per 20px of scroll
  const bands = [...document.querySelectorAll('.band:not(.full)')];
  const full = document.querySelector('.band.full');
  bands.forEach(el => el.classList.add('fx'));
  full.classList.add('fx');
  const hero = document.querySelector('.hero'), line = document.querySelector('.words .line');
  line.classList.add('fx');
  const FIRST = 3, N = bands.length - 1;   // bands 0..2 are the heart as the page opens; 3..N grow in
  const START = .06, END = .78, WIN = .09; // the growth runs from START to END; each ring arrives over WIN of the run
  const step = (END - WIN - START) / (N - FIRST);

  function draw(p) {
    for (let i = 0; i < FIRST; i++) bands[i].style.opacity = '1';
    for (let i = FIRST; i <= N; i++) {
      const o = smooth(clamp((p - (START + (i - FIRST) * step)) / WIN));
      bands[i].style.opacity = o.toFixed(3);
    }
    full.style.opacity = smooth(clamp((p - .74) / .04)).toFixed(3);   // the print itself, as the last rings land
    const l = smooth(clamp((p - .42) / .18));   // the credit line rises in as the second heart arrives, well before the end
    line.style.opacity = l.toFixed(3);
    line.style.transform = `translate3d(0,${((1 - l) * 18).toFixed(1)}px,0)`;
    line.style.visibility = l < .01 ? 'hidden' : 'visible';
  }
  S.pin(hero, draw);   // site.pin re-measures the run on resize; the layout itself (phone, tablet, desktop) is all CSS

  // the quote on the heart red: the heart itself (rings 0 to 5, cut round on their groove) grows from .82 to 1 about
  // its centre across the whole read, from the section entering to its top 40% of a screen past the top; still at 1
  // under reduced motion
  const heart = document.querySelector('.heart'), rings = heart && heart.querySelector('.rings');
  if (rings) S.track(heart, 1, -.4, p => { rings.style.transform = S.still ? '' : `scale(${(.82 + .18 * smooth(p)).toFixed(4)})`; });

  // the Oread cover beside Then Oread drifts up into place, the cross-page rule for a single cover beside text
  // (28px on a phone, 48px wider); re-chosen when a resize crosses 600px. .fx holds it at rest under reduced motion
  // and without JavaScript.
  const oc = document.querySelector('.sequel .cover');
  if (oc) {
    oc.classList.add('fx');
    const px = () => innerWidth < 600 ? -28 : -48;
    let cur = px(), off = S.drift(oc, cur);
    addEventListener('resize', () => { const n = px(); if (n !== cur) { off(); cur = n; off = S.drift(oc, cur); } });
  }
})();
