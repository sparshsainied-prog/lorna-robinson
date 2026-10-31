/* Flower Gatherers page only: the find. The cover (Lydia Hall) sits on the page as three planes: the plaster
   wall with the title, the orange fresco lily, and the drawn hand with its bracelet. As the reader scrolls,
   the pigment surfaces in the plaster, then the hand is drawn in from the wrist and closes on the stem.
   Everything is a function of scroll position through window.site.pin: it moves only under the reader's hand,
   runs the same every pass and reverses when they scroll back up. */
(() => {
  const S = window.site;
  const find = document.querySelector('.find'), hand = document.querySelector('.hand'), lily = document.querySelector('.lily');
  const say = ['a', 'b', 'c'].map(k => document.querySelector('.say.' + k));
  if (!find || !hand || !lily) return;
  const { clamp, ease, easeIn } = S;
  // the hand is drawn from the wrist (top right) to the thumb (bottom left): a straight edge sweeps along that line
  const D = [-0.556, 0.831], N = [0.831, 0.556]; // direction and its normal, in the hand's own box
  let w = 1, h = 1, L = 1, sx = 0, sy = 0;
  const measure = () => {
    w = hand.offsetWidth; h = hand.offsetHeight;
    sx = w * 1.06; sy = -h * 0.06;                      // where the sweep starts (just past the wrist)
    L = Math.abs(D[0] * w) + Math.abs(D[1] * h) + w * .12; // enough to cross the whole box
  };
  addEventListener('resize', measure); measure();

  function draw(p) {
    // 1. the wall alone  2. the pigment surfaces  3. the hand is drawn in  4. the words settle, then it holds
    lily.style.opacity = ease(clamp((p - .10) / .30)).toFixed(3);
    const t = ease(clamp((p - .42) / .32));
    const px = sx + D[0] * L * t, py = sy + D[1] * L * t, R = Math.max(w, h) * 4;
    hand.style.clipPath = t >= 1 ? 'none' : `polygon(${(px + N[0] * R).toFixed(1)}px ${(py + N[1] * R).toFixed(1)}px, ${(px - N[0] * R).toFixed(1)}px ${(py - N[1] * R).toFixed(1)}px, ${(px - N[0] * R - D[0] * R).toFixed(1)}px ${(py - N[1] * R - D[1] * R).toFixed(1)}px, ${(px + N[0] * R - D[0] * R).toFixed(1)}px ${(py + N[1] * R - D[1] * R).toFixed(1)}px)`;
    const reach = (1 - easeIn(t)) * w * .06;              // the hand comes in from the wrist side as it is drawn
    hand.style.transform = `translate3d(${reach.toFixed(1)}px,${(-reach * .7).toFixed(1)}px,0)`;
    hand.style.visibility = t <= 0 ? 'hidden' : 'visible';
    const a = ease(clamp((p - .14) / .12)) * (1 - ease(clamp((p - .40) / .08)));
    const b = ease(clamp((p - .46) / .12)) * (1 - ease(clamp((p - .72) / .08)));
    const c = ease(clamp((p - .80) / .12));
    [a, b, c].forEach((o, i) => {
      const el = say[i];
      el.style.opacity = o.toFixed(3);
      el.style.transform = `translate3d(0,${((1 - o) * 14).toFixed(1)}px,0)`;
      el.style.visibility = o < .01 ? 'hidden' : 'visible';
    });
  }
  S.pin(find, draw);
})();
