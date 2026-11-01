/* Write with us: three quiet pieces, every one a pure function of scroll position through window.site, exact both
   ways, nothing playing on by itself. Her invitation (.hand) and all body text never move.
   1 The title prints into register on the first scroll. "Come and write with us" is on screen at load, so the shared
     register (which reads the heading's place in the viewport) would leave it already printed; data-register="top"
     reads the page's own scroll instead: misregistered at the very top, in register by 35% of a viewport down.
   2 The When / To book list is ruled onto the paper as it comes up: its hairlines are drawn from the left, one after
     another (css/write-with-us.css turns --rp / --rq into a scaleX on each line).
   3 The signature: her Artemis and Apollo board opens at its seam. The photo starts as a narrow strip about the line
     where the black (moon) half meets the white (sun) half, and the two halves part outward as the photo rises from
     95% to 50% of the viewport (--open 0 to 1, a clip-path inset in the CSS). The photo only; the caption never clips.
   Reduced motion and no JavaScript: whole title, whole lines, whole photo. */
(() => {
  const S = window.site;
  if (!S) return;

  /* 1 the title, into register over the first 35% of a viewport of scroll */
  const h = document.querySelector('.open h1[data-register="top"]');
  if (h) {
    h.dataset.print = h.textContent.trim();
    h.classList.add('reg');
    // registered after js/site.js's own frame listener, so in any frame this write is the last word on --reg
    const fn = (y, vh) => {
      const v = (S.still ? 1 : S.clamp(y / (vh * .35))).toFixed(4);
      if (h.style.getPropertyValue('--reg') !== v) h.style.setProperty('--reg', v);
    };
    S.onFrame(fn);
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => fn(scrollY, innerHeight));
  }

  /* 2 the ruled list: 0 while the list sits at the foot of the first frame (phone, tablet), drawn by mid-screen */
  const list = document.querySelector('.table .rules');
  const lis = list ? [...list.children] : [];
  if (lis.length) {
    const n = lis.length + 1, stagger = .3, span = 1 - stagger * (n - 1); // one line per item plus the foot of the list
    S.track(list, .88, .5, p => {
      lis.forEach((li, i) => {
        if (S.still) { li.style.removeProperty('--rp'); li.style.removeProperty('--rq'); return; }
        li.style.setProperty('--rp', S.clamp((p - i * stagger) / span).toFixed(4));
        if (i === lis.length - 1) li.style.setProperty('--rq', S.clamp((p - (i + 1) * stagger) / span).toFixed(4));
      });
    });
  }

  /* 3 the board opens at its seam */
  const board = document.querySelector('.board img');
  if (board) S.track(board, .95, .5, p => board.style.setProperty('--open', S.ease(p).toFixed(4)));
})();
