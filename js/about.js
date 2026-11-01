/* About page.
   1. The line: a single rule in the yellow of her name on the covers draws itself down the left of her story, from
      the Usborne book to the facts list where the Rumble Museum link sits. It is driven by the page's own scroll: a
      1em stub beside her first line at the top of the page, fully drawn by the time the Rumble line is 40% of the way
      down the viewport (endY, never less than 45% of a viewport of travel). scaleY from scrollY only: it undraws on
      the way back up, nothing plays on by itself. Fully drawn without JS and under reduced motion.
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
    let endY = 1, stub = 0, last = -1;
    const fn = () => {
      if (S.still) { line.style.transform = ''; last = -1; return; }
      const p = S.clamp(scrollY / endY);
      const s = stub + (1 - stub) * p;
      if (s === last) return;
      last = s;
      line.style.transform = `scaleY(${s.toFixed(4)})`;
    };
    fn.measure = () => {
      const pr = path.getBoundingClientRect();
      const end = stop ? stop.getBoundingClientRect().bottom : pr.bottom;
      const len = Math.max(1, end - pr.top);
      line.style.height = len.toFixed(1) + 'px';
      line.style.bottom = 'auto';
      endY = Math.max(innerHeight * .45, end + scrollY - innerHeight * .40, 1);
      const em = parseFloat(getComputedStyle(path.querySelector('p') || path).fontSize) || 16;
      stub = Math.min(1, em / len);
      last = -1;
    };
    S.onFrame(fn);
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', fn);
  }

  /* ---- the shelf ---- */
  const row = document.querySelector('.shelfrow');
  if (row) S.shelve(row, row.querySelectorAll('li'));
})();
