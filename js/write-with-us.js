/* Write with us: the one moving thing below her invitation. The When / To book list is ruled onto the paper as the reader
   brings it up: its three hairlines are drawn from the left, one after another (css/write-with-us.css turns --rp into a
   scaleX on each line). A pure function of scroll position through window.site, read off the list itself (which never
   moves), so it is exact both ways; nothing plays on by itself. Whole lines without JS and under reduced motion.
   Her invitation (.hand) and the photo of the workshop board never move. */
(() => {
  const S = window.site, list = document.querySelector('.table .rules');
  if (!S || !list) return;
  const lis = [...list.children];
  if (!lis.length) return;
  const n = lis.length + 1, stagger = .3, span = 1 - stagger * (n - 1); // one line per item plus the foot of the list
  S.track(list, 1, .55, p => {
    lis.forEach((li, i) => {
      if (S.still) { li.style.removeProperty('--rp'); li.style.removeProperty('--rq'); return; }
      li.style.setProperty('--rp', S.clamp((p - i * stagger) / span).toFixed(4));
      if (i === lis.length - 1) li.style.setProperty('--rq', S.clamp((p - (i + 1) * stagger) / span).toFixed(4));
    });
  });
})();
