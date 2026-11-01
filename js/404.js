/* lornarobinson.uk 404: "This tunnel goes nowhere", the drawing under the buttons (illustrations/DIRECTION.md, 5).
   The trail's corridor seen from inside. As the reader brings it up, the four ribs are set down one after another,
   near to far, so the corridor is built in front of them; once the floor of the drawing is in view the walk (the
   hairline) sets off into it, weaving a little as feet do; while it is still on its way the blank orange wall comes
   slowly down in the far arch, where the Iris Classics Centre door would be, and the walk reaches its foot, steps
   along it and stops.
   The schedule is set in the page's own scroll from where the drawing sits, because a 404 scrolls very little and
   the drawing starts below the fold on a phone: the ribs while the arches are showing, the walk only once its first
   step (the very bottom of the drawing) can be seen, done before the page runs out of scroll. Everything is a pure
   function of scrollY and the layout: the same frame at the same scroll position both ways, nothing on time, no
   holds. A screen that shows the whole drawing before any scroll (a desktop 404 barely scrolls) shows it finished.
   Reduced motion and no JS: finished.
   Loaded by the inline loader at the foot of 404.html, after js/site.js and js/drawings.js. */
(() => {
  if (!window.drawings) return;
  const D = window.drawings;
  D.each('tunnel-nowhere', fig => {
    const S = window.site, html = document.documentElement;
    const walk = D.hairline(fig.querySelector('.walk'));
    const wall = fig.querySelector('.wall');
    const ribs = [...fig.querySelectorAll('.rib')].sort((a, b) => b.dataset.foot - a.dataset.foot); // near first
    // each rib rises into place from a little below, the near ones further (it is closer to the eye)
    const lift = [11, 7.5, 5.5, 4];
    const set = D.pieces(ribs.map((el, i) => ({ el, x: 0, y: lift[i], r: 0 })), { stagger: .2, opacity: .6 });

    // where the walk's tip reaches the foot of the wall (drawing units, y up); the last stretch is a step along it
    const atWall = walk.reach((x, y) => y <= 150);
    const lin = (t, k) => k * t + (1 - k) * D.smooth(t);   // an ease with soft ends and a gentle middle

    const frame = p => {
      set.set(p.ribs);
      // walked at a walker's even pace, softened only at the start and the stop
      const w = lin(p.walk, .45);
      walk.set(w);
      // the wall comes down from early in the walk and is shut as the walker reaches its foot: a long, even fall
      D.wipe(wall, lin(D.span(w, .2, atWall), .5), 'top');
    };
    const DONE = { ribs: 1, walk: 1 };

    // the schedule in scroll px, read from the layout (the figure itself never moves)
    const plan = () => {
      const vh = innerHeight, r = fig.getBoundingClientRect(), top = r.top + scrollY, h = r.height;
      if (!h || top + h <= vh * .96) return null;                 // whole on the first screen: finished
      const maxY = Math.max(0, html.scrollHeight - vh);
      const end = Math.min(maxY * .92, top + h - vh + .45 * vh, top - .3 * vh);  // done with room to spare
      const w0 = Math.max(0, Math.min(top + h - vh, end - 120));  // first step in view (or earlier if cramped)
      const r1 = w0 + .12 * (end - w0);                           // the last rib settles as the walk gets going
      const r0 = Math.max(0, Math.min(top - .86 * vh, r1 - 80));  // the arches are showing
      if (end - w0 < 40) return null;                             // too little scroll to walk it: finished
      return { r0, r1, w0, end };
    };

    let P = null;
    const draw = () => {
      if (S.still || !P) return frame(DONE);
      const y = scrollY;
      frame({ ribs: D.span(y, P.r0, P.r1), walk: D.span(y, P.w0, P.end) });
    };
    const read = () => { P = plan(); draw(); };
    // site.track gives the frames (and the reduced-motion switch); the value itself is re-read as scrollY
    S.track(html, 0, -8, draw);
    read();
    addEventListener('resize', read, { passive: true });
    addEventListener('load', read);
    if (document.fonts) document.fonts.ready.then(read);
    if ('ResizeObserver' in window) new ResizeObserver(read).observe(document.body);
  });
})();
