/* Hamadryad page only: the cover grows from its heart. Lydia Hall's cover is cut into ring bands
   (build/make-hamadryad-bands.py: band 0 is the heart, the printed title and her printed name, then one band per group of rings,
   outward). Each band's opacity is a pure function of the scroll position through window.site.pin: the rings
   come in one after another under the reader's hand, the same every pass, and go back when they scroll up. */
(() => {
  const S = window.site;
  const CW = 900, CH = 1440;
  const BOX = {"0": [65, 60, 793, 1335], "1": [148, 769, 99, 99], "2": [115, 736, 165, 165], "3": [62, 683, 271, 271], "4": [14, 635, 367, 367], "5": [0, 577, 439, 483], "6": [0, 525, 491, 587], "7": [0, 453, 563, 731], "8": [0, 387, 629, 863], "9": [0, 330, 686, 977], "10": [0, 273, 742, 1091], "11": [0, 194, 742, 1246], "12": [0, 97, 900, 1343], "13": [0, 0, 900, 1440], "14": [0, 0, 900, 1440], "15": [681, 0, 219, 178]};
  const bands = [...document.querySelectorAll('.band')].map(el => {
    const [x, y, w, h] = BOX[el.dataset.i];
    Object.assign(el.style, { left: x / CW * 100 + '%', top: y / CH * 100 + '%', width: w / CW * 100 + '%', height: h / CH * 100 + '%' });
    el.classList.add('fx');
    return el;
  });
  const hero = document.querySelector('.hero'), line = document.querySelector('.words .line');
  line.classList.add('fx');
  const { clamp, ease } = S;
  const FIRST = 3, N = bands.length - 1;   // bands 0..2 are the heart as the page opens; 3..N grow in
  const START = .06, END = .78, WIN = .09; // the growth runs from START to END; each ring arrives over WIN of the run
  const step = (END - WIN - START) / (N - FIRST);

  function draw(p) {
    for (let i = 0; i < FIRST; i++) bands[i].style.opacity = '1';
    for (let i = FIRST; i <= N; i++) {
      const o = ease(clamp((p - (START + (i - FIRST) * step)) / WIN));
      bands[i].style.opacity = o.toFixed(3);
    }
    const l = ease(clamp((p - .42) / .18));   // the credit line rises in as the second heart arrives, well before the end
    line.style.opacity = l.toFixed(3);
    line.style.transform = `translate3d(0,${((1 - l) * 18).toFixed(1)}px,0)`;
    line.style.visibility = l < .01 ? 'hidden' : 'visible';
  }
  S.pin(hero, draw);

  // the quote on the heart red: the band of rings the red was sampled from grows a little (scale .82 to 1 about its
  // centre) as the section passes up the screen, a quiet echo of the hero's growth; still at 1 under reduced motion
  const heart = document.querySelector('.heart'), rings = heart && heart.querySelector('.rings');
  if (rings) S.track(heart, 1, 0, p => { rings.style.transform = S.still ? '' : `scale(${(.82 + .18 * ease(p)).toFixed(4)})`; });

  // The Oread cover under Then Oread stands still: the rings have just grown, and the same rise lives on the Oread page itself.
})();
