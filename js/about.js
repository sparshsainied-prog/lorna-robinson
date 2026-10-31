/* About page: the four Classics covers are set down onto their shelf as the reader scrolls the shelf into view.
   Each cover's position is a pure function of scroll (0 held just above the shelf, 1 standing on it), staggered left to
   right along the row, so the row is shelved one book after another and lifted again the same way on the way back up.
   Nothing plays on its own. Under reduced motion or without JS the covers stand on the shelf from the start. */
(() => {
  const S = window.site, row = document.querySelector('.shelfrow');
  if (!S || !row) return;
  const books = [...row.querySelectorAll('li')];
  if (!books.length) return;
  row.classList.add('fx');
  const fn = (y, vh) => {
    if (S.still) { books.forEach(b => b.style.removeProperty('--set')); return; }
    const r = row.getBoundingClientRect();
    // the row is set down as its shelf edge enters at the bottom of the viewport and has settled by the time it is 72% of the way up
    const from = vh, to = vh * .72, span = from - to;
    const base = (from - r.bottom) / span;
    books.forEach((b, i) => {
      const p = S.clamp((base - i * .14) / (1 - .14 * (books.length - 1)));
      b.style.setProperty('--set', p.toFixed(4));
    });
  };
  S.onFrame(fn);
})();
