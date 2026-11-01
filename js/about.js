/* About page.
   1. The line: a single rule in the yellow of her name on the covers draws itself down the left of her story as the
      reader travels it. Its tip rides at about two thirds of the viewport, so it always ends where the eye is, from
      the Usborne book to the facts list where the Rumble Museum link sits. scaleY from scroll position only: it
      undraws on the way back up, nothing plays on by itself. Fully drawn without JS and under reduced motion.
   2. The shelf: the four Classics covers are set down onto their shelf one after another, left to right, as the shelf
      comes up (window.site.shelve, the same behaviour as the home shelf), lifted again the same way going back. */
(() => {
  const S = window.site;
  if (!S) return;

  /* ---- the line ---- */
  const path = document.querySelector('.story .path'), line = path && path.querySelector('.line');
  if (line) {
    line.classList.add('fx');
    const facts = path.querySelectorAll('.rules li');
    const stop = facts[1] || facts[facts.length - 1];     // the Rumble Museum line
    let len = 1;
    const fn = () => {
      if (S.still) { line.style.transform = ''; return; }
      const top = path.getBoundingClientRect().top;
      const p = S.clamp((innerHeight * .66 - top) / len);
      line.style.transform = `scaleY(${p.toFixed(4)})`;
    };
    fn.measure = () => {
      const pr = path.getBoundingClientRect();
      len = Math.max(1, stop ? stop.getBoundingClientRect().bottom - pr.top : pr.height);
      line.style.height = len.toFixed(1) + 'px';
      line.style.bottom = 'auto';
    };
    S.onFrame(fn);
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', fn);
  }

  /* ---- the shelf ---- */
  const row = document.querySelector('.shelfrow');
  if (row) S.shelve(row, row.querySelectorAll('li'));
})();
