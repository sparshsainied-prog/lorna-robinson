/* Write with us: four quiet pieces, every one a pure function of scroll position through window.site, exact both
   ways, nothing playing on by itself. Her invitation (.hand) and all body text never move.
   1 The title prints into register on the first scroll. "Come and write with us" is on screen at load, so the shared
     register (which reads the heading's place in the viewport) would leave it already printed; data-register="top"
     reads the page's own scroll instead: misregistered at the very top, in register by 35% of a viewport down.
   2 The When / To book list is ruled onto the paper as it comes up: its hairlines are drawn from the left, one after
     another (css/write-with-us.css turns --rp / --rq into a scaleX on each line).
   3 The signature: her Artemis and Apollo board opens at its seam. The photo starts as a narrow strip about the line
     where the black (moon) half meets the white (sun) half, and the two halves part outward as the photo rises from
     95% to 50% of the viewport (--open 0 to 1, a clip-path inset in the CSS). The photo only; the caption never clips.
     On a desktop the photo is on the first screen, so its opening waits for the wing (4) to finish (see stage below).
   4 The drawn moment beside (desktop) or under (phone, tablet) her invitation: the worded feathers open as a fan and
     their words are written in, before the list is ruled and before the board opens.
   Reduced motion and no JavaScript: whole title, whole lines, whole photo, the open wing with its words. */
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

  /* Ranges in page scroll (px), read once per layout: none of these elements moves, so their place never feeds back.
     The wing (4) runs first and ends before the ruled list starts; the board (3) opens no earlier than the wing ends.
     On phones and tablets that changes nothing for the list or the board (they sit lower); on a desktop, where the
     board is on the first screen, the board's opening waits for the wing, so the signature has the screen to itself. */
  const fig = window.drawings && document.querySelector('[data-draw="worded-feathers"]');
  const board = document.querySelector('.board img');
  const pageTop = el => el.getBoundingClientRect().top + scrollY;
  const stage = () => {
    const vh = innerHeight, max = Math.max(0, document.documentElement.scrollHeight - vh);
    const st = { wing: null, boardFrom: board ? pageTop(board) - .95 * vh : 0, vh };
    if (fig) {
      const top = pageTop(fig);
      let b = top - .15 * vh, a = top - .85 * vh;               // fig top from 85% to 15% of the viewport
      if (list) b = Math.min(b, Math.max(pageTop(list) - .88 * vh, .25 * vh)); // done before the list is ruled
      if (a < 0) a = Math.min(.2 * vh, Math.max(0, b - .4 * vh)); // on the first screen: as much room as the page gives
      if (b - a < .25 * vh) b = a + .25 * vh;
      if (b > max) { b = max; a = Math.min(a, Math.max(0, b - .25 * vh)); }
      st.wing = { a, b };
      st.boardFrom = Math.max(st.boardFrom, b);
    }
    return st;
  };
  let st = stage();
  const restage = () => { st = stage(); };

  /* 3 the board opens at its seam: --open 0 to 1 over .45 of a viewport of scroll, from the photo's top at 95% of the
     viewport (as site.track(board, .95, .5)), or from the end of the wing if that is later */
  if (board) {
    let last = -1;
    const fn = y => {
      const p = S.still ? 1 : S.clamp((y - st.boardFrom) / (.45 * st.vh));
      if (p === last) return;
      last = p; board.style.setProperty('--open', S.ease(p).toFixed(4));
    };
    fn.measure = () => { restage(); last = -1; };
    S.onFrame(fn);
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => { last = -1; fn(scrollY); });
    if (document.fonts) document.fonts.ready.then(() => { fn.measure(); fn(scrollY); });
  }

  /* 4 Drawn moment: worded feathers (illustrations/DIRECTION.md 3), the five phrases from her St Alban's board as one
     paper wing. The wing opens like a fan, then the words are written in, top feather to bottom, in the order her
     board lists them (freedom, swooping, sun rising, crickets singing, air rushing through my feathers).
     - Start pose: the fan closed, the five feathers lying 3 degrees apart at the top feather's angle, so a stack of
       coloured edges shows (nothing hidden, nothing faded).
     - The fan: each feather swings down about the point where the quills meet to its place in the wing. The bottom
       (orange) feather leads and the ones under it follow a little behind, so the wing unfolds from beneath.
     - The words: each is written along its quill from the foot (a clip-path wipe in the feather's own coordinates),
       from the moment the wing is half open.
     Range (stage above): the figure's top from 85% to 15% of the viewport; on the first screen (every size here) it
     starts as early as needed for at least .4 of a viewport of scroll (never later than 20% of a viewport down), and
     is always done before the ruled list starts. Each word gets a third or more of the range (about 90 to 140px of
     scroll), so it is written, not snapped in. Reduced motion and no JavaScript: the open wing with every word (site.css resets .fx, drawings.css .wipe). */
  if (fig) drawings.each('worded-feathers', f0 => {
    if (f0 !== fig) return;
    const D = window.drawings;
    const fth = [...fig.querySelectorAll('.fth')].map(el => {
      const i = +el.dataset.i;                       // 0 the bottom (orange) feather ... 4 the top (freedom)
      el.classList.add('fx');
      const word = el.querySelector('.word');
      word.classList.add('wipe');
      return { el, word, i, turn: 7 * (4 - i), lag: .025 * i, last: '' };
    });
    /* each word's own stretch of p, written at an even hand (a writing pace, soft only at its ends): freedom first
       on the top feather, which never turns, while the wing opens under it; each word below starts once its
       feather has all but settled, overlapping the one above, the long last phrase given the most scroll */
    const WORDS = { 4: [.1, .42], 3: [.31, .68], 2: [.4, .77], 1: [.49, .88], 0: [.57, 1] };
    const pace = t => .5 * t + .5 * D.smooth(t);
    const draw = p => fth.forEach(f => {
      // the fan: the bottom feather leading over p 0 to .44, each one above it .025 behind (all settled by .54)
      const e = D.smooth(D.span(p, f.lag, f.lag + .44));
      const r = f.turn * (1 - e);
      const tf = r > .005 ? `rotate(${(-r).toFixed(3)}deg)` : '';
      if (tf !== f.last) { f.el.style.transform = tf; f.last = tf; }
      const [s, t] = WORDS[f.i];
      D.wipe(f.word, pace(D.span(p, s, t)), 'left');
    });
    let last = -1;
    const fn = y => {
      const w = st.wing, p = S.still || !w || w.b <= w.a ? 1 : S.clamp((y - w.a) / (w.b - w.a));
      if (p === last) return;
      last = p; draw(p);
    };
    fn.measure = () => { restage(); last = -1; };
    S.onFrame(fn);
    if (document.fonts) document.fonts.ready.then(() => { fn.measure(); fn(scrollY); });
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => { last = -1; fn(scrollY); });
  });
})();
