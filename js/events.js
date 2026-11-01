/* Events only: her trail poster rises 36px as the launch entry passes. The whole figure travels (image and its
   caption together, so the caption is never run over), and the progress is read off the entry's li, which never moves,
   so the travel is the same pixel for pixel on the way down and back up. The figure carries class fx: at rest under
   reduced motion and without JavaScript. The big dates come into register through the shared behaviour in js/site.js
   (data-register on each .day). Both key on class and attribute, so an event block Lorna copies and pastes keeps them.
   The home page reads this list with the posters dropped. */
(() => {
  const S = window.site;
  if (!S) return;
  document.querySelectorAll('.trail .dates > li').forEach(li => {
    const fig = li.querySelector('.poster');
    if (!fig) return;
    fig.classList.add('fx');
    S.track(li, 1.1, -.2, p => { fig.style.transform = S.still ? '' : `translate3d(0,${(36 * (1 - S.ease(p))).toFixed(1)}px,0)`; });
  });
})();
