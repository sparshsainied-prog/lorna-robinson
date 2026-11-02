/* books/: the run. The five books stand together spine out (each spine drawn in type, in a colour from its cover),
   a little larger than life; as the reader scrolls the first stretch of the page, the run comes down to size, the
   books draw apart along the row, and one after another, Oread first, each turns on its spine to face the reader.
   Everything is a pure function of scrollY (same frame at the same position, down or up); nothing moves on time.
   Under reduced motion or without JavaScript the covers stand in a row and the spines are never drawn (css). */
(() => {
  const S = window.site, sec = document.querySelector('.run-sec'), run = sec && sec.querySelector('.run');
  if (!S || !run) return;
  const books = [...run.querySelectorAll('.bk')];
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  const ease = S.ease, clamp = S.clamp;
  let geo = null, last = -1;

  const clear = () => {
    run.style.transform = ''; run.style.marginBottom = ''; sec.style.paddingBottom = '';
    books.forEach(b => { b.style.transform = ''; b.classList.remove('fx'); });
    run.classList.remove('fx'); geo = null; last = -1;
  };

  function measure() {
    clear();
    if (mq.matches) return;
    const vh = innerHeight;
    // layout (untransformed) geometry, in the run's own coordinates
    const L = books.map(b => b.offsetLeft), W = books.map(b => b.offsetWidth);
    const H = Math.max(...books.map(b => b.offsetHeight));
    const D = W.map(w => w * .26);                                   // spine depth: the .spn width in css
    const T = books.map(b => b.offsetTop), Hs = books.map(b => b.offsetHeight);
    const multi = Math.max(...T) - Math.min(...T) > H / 2;           // phones: three over two
    const C = multi ? run.offsetWidth / 2 : (L[0] + L[L.length - 1] + W[W.length - 1]) / 2;
    // packed, the spines stand in one line: across the middle of the two rows on a phone, where they are
    const dy = books.map((b, i) => multi ? (run.offsetHeight - Hs[i]) / 2 - T[i] : 0);
    const total = D.reduce((a, b) => a + b, 0);
    let acc = C - total / 2;
    const dx = books.map((b, i) => { acc += D[i]; return acc - L[i]; }); // spine i packed beside spine i-1
    books.forEach((b, i) => {
      // the spine's type: as large as the spine allows, smaller for a long title (Telling Tales in Nature)
      const spn = b.querySelector('.spn'), t = spn.firstElementChild, n = spn.lastElementChild;
      let f = W[i] * .135;
      spn.style.fontSize = f.toFixed(2) + 'px';
      const room = H * .86, need = t.offsetHeight + n.offsetHeight + 1.6 * f;
      if (need > room) { f *= room / need; spn.style.fontSize = f.toFixed(2) + 'px'; }
      b.classList.add('fx');
    });
    run.classList.add('fx');
    // a little larger than life at the start, so the spines read on a phone; the space they take is held below
    // the row (taken off the section's own foot padding, so the finished page keeps its rhythm)
    // on a phone the packed spines grow to fill the two rows' own height (no space held); elsewhere at most 1.35
    const s0 = multi ? Math.max(1, Math.min(1.9, run.offsetHeight * .92 / H, run.offsetWidth * .9 / total))
                     : Math.min(1.35, Math.max(1, Math.min(.4 * vh, 400) / H));
    const reserve = multi ? 0 : (s0 - 1) * H;
    run.style.transformOrigin = multi ? '50% 50%' : '50% 0';
    run.style.marginBottom = reserve.toFixed(1) + 'px';
    const pad = parseFloat(getComputedStyle(sec).paddingBottom);
    sec.style.paddingBottom = Math.max(16, pad - reserve).toFixed(1) + 'px';
    // the whole turn happens while the run travels from where it stands at load to 8% from the top
    const top = run.getBoundingClientRect().top + scrollY;
    const dist = Math.max(140, top - .08 * vh);
    geo = { dx, dy, s0, dist, H };
  }

  function draw(sy) {
    if (!geo) return;
    const p = clamp(sy / geo.dist);
    if (p === last) return;
    last = p;
    const s = geo.s0 + (1 - geo.s0) * ease(clamp(p / .42));         // down to size
    const e = ease(clamp((p - .06) / .44));                          // the books draw apart
    run.style.transform = s === 1 ? '' : `scale(${s.toFixed(4)})`;
    const persp = Math.round(geo.H * 3.2);
    books.forEach((b, i) => {
      const t = ease(clamp((p - .28 - i * .11) / .28));              // each turns, Oread first
      const x = (1 - e) * geo.dx[i], y = (1 - e) * geo.dy[i], a = 90 * (1 - t);
      b.style.transform = (x === 0 && y === 0 && a === 0) ? '' :
        `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) perspective(${persp}px) rotateY(${a.toFixed(3)}deg)`;
    });
  }
  draw.measure = measure;
  S.onFrame(draw);
  mq.addEventListener('change', () => { measure(); draw(scrollY); });
})();
