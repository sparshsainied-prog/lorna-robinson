/* lornarobinson.uk: drawn moments, the shared layer (illustrations/DIRECTION.md, build/SYSTEM.md "Drawn moments").
   Helpers only: no drawing's geometry or choreography lives here. Each page wires its own drawing with these, in
   its own js/<page>.js, keyed on [data-draw="<slug>"]. Load after js/site.js (order does not matter on the 404,
   which loads site.js itself: everything here waits for window.site).

   Every motion is a pure function of scroll through window.site.track: the same frame at the same scroll position
   whichever way the reader came, exactly reversible, nothing on time, no holds. Only transform, opacity,
   clip-path and stroke-dashoffset are written. Under reduced motion every track is called once with 1, which
   clears what was written (finished drawing); without JS nothing here runs and the CSS shows it finished.

   window.drawings
     .each(slug, fn)          fn(fig) for every [data-draw="slug"], once window.site exists
     .track(fig, from, to, fn, opts)
                              site.track with one fix for drawings that sit on the first screen: where the figure is
                              already past `from` with the page at the top, the plain range would leave it part done
                              before anyone scrolls, so it is driven from the page's own scroll instead: p 0 at the
                              top, 1 where the plain range would finish (at least .3 of a viewport down, and never
                              further than the page can scroll; a page that cannot scroll shows it finished).
                              opts.firstScreen: 'scroll' (default) or 'plain' (keep site.track's range as it is).
                              Re-chosen on resize, load, fonts and layout changes. Returns an unregister function.
     .hairline(path, opts)    a controller for a non-scaling-stroke hairline drawn on along its own direction:
                                .set(p)       0 nothing drawn (not even the round cap), 1 drawn (dashes cleared)
                                .reach(test)  the fraction of the line where test(x, y) (drawing units) first holds,
                                              e.g. reach(x => x >= 412) for the moment the tip passes a rib
                                .point(p)     {x, y} of the tip at p, in drawing units
                                .measure()    re-read the length and scale (done for you on resize of the svg)
                              opts.reverse: draw from the end of the path back to its start.
                              The dash length is the path's length times the drawing's scale on screen (a
                              non-scaling stroke dashes in screen pixels), re-read whenever the svg changes size.
     .pieces(list, opts)      a controller for cut pieces that travel in to rest: .set(p) puts every piece at p
                              (0 start pose, 1 at rest: transform cleared). list items are elements carrying
                              data-from="x y r" (drawing units and degrees) or {el, x, y, r}. Staggered in list
                              order. opts: stagger (.12), ease (smootherstep), opacity (start opacity, 1; DIRECTION
                              allows .6 at the lowest; fragments never fade from nothing), order (array of indices).
     .setDown(fig, list, opts)
                              pieces(list, opts) driven by drawings.track(fig, opts.from ?? .95, opts.to ?? .45).
                              Returns the controller (with .stop()).
     .wipe(el, t, side)       writes a clip-path wipe on el: 0 hidden, 1 shown (cleared). side 'left' (default:
                              uncovered from its left edge), 'right', 'top', 'bottom'. In the element's own
                              coordinates, so a word set along a turned quill is written along the quill.
     .span(p, a, b)           0..1 for p's travel from a to b
     .stagger(p, i, n, gap)   piece i of n: its own 0..1 when n pieces each start `gap` after the previous
     .smooth(t) .smoother(t) .out(t)   smoothstep, smootherstep, ease-out cubic
*/
(() => {
  const clamp = v => v < 0 ? 0 : v > 1 ? 1 : v;
  const smooth = t => t * t * (3 - 2 * t);
  const smoother = t => t * t * t * (t * (t * 6 - 15) + 10);
  const out = t => 1 - Math.pow(1 - t, 3);
  const span = (p, a, b) => clamp((p - a) / (b - a));
  const stagger = (p, i, n, gap) => clamp((p - i * gap) / (1 - gap * (n - 1)));
  const fix = (v, d = 2) => +v.toFixed(d);

  // run fn once window.site exists (site.js may arrive after this file on the 404)
  const queue = [];
  let ready = !!window.site;
  const whenSite = fn => { if (ready || (ready = !!window.site)) fn(window.site); else queue.push(fn); };
  if (!ready) {
    const flush = () => {
      if (ready || !window.site) return;
      ready = true; queue.splice(0).forEach(fn => fn(window.site));
    };
    document.addEventListener('DOMContentLoaded', flush);
    addEventListener('load', flush);
    // site.js inserted by a script (404) fires its own load event: catch it as it lands
    document.addEventListener('load', e => { if (e.target && e.target.tagName === 'SCRIPT') flush(); }, true);
  }

  /* layout watchers shared by every helper: one ResizeObserver, fonts.ready */
  const watched = new Map();
  let ro = null;
  const watch = (el, fn) => {
    if (!('ResizeObserver' in window)) { addEventListener('resize', fn, { passive: true }); return; }
    if (!ro) ro = new ResizeObserver(entries => entries.forEach(en => (watched.get(en.target) || []).forEach(f => f())));
    if (!watched.has(el)) { watched.set(el, []); ro.observe(el); }
    watched.get(el).push(fn);
  };
  const afterFonts = fn => { if (document.fonts && document.fonts.ready) document.fonts.ready.then(fn); };

  /* ---------- track: site.track, with the first-screen case handled ---------- */
  function track(fig, from, to, fn, opts = {}) {
    const S = window.site, html = document.documentElement;
    let off = null, mode = '', dead = false;
    const arm = () => {
      if (dead) return;
      const vh = innerHeight, top = fig.getBoundingClientRect().top + scrollY; // the figure itself never moves
      let key = 'plain', endY = 0;
      if (opts.firstScreen !== 'plain' && top < vh * from) {
        const maxY = Math.max(0, html.scrollHeight - vh);
        endY = Math.min(Math.max(top - to * vh, vh * .3), maxY);
        key = endY < 1 ? 'done' : 'first:' + Math.round(endY) + ':' + vh;
      }
      if (key === mode) return;
      if (off) off();
      mode = key;
      if (key === 'plain') off = S.track(fig, from, to, fn);
      // the page's own scroll: html's top is -scrollY, so progress(html, 0, -endY/vh) is scrollY / endY
      else if (key === 'done') { off = () => {}; fn(1, fig); }
      else off = S.track(html, 0, -endY / vh, p => fn(p, fig));
    };
    const onFrame = () => {};
    onFrame.measure = arm;
    S.onFrame(onFrame);           // measure: on resize and on load
    watch(document.body, arm);    // layout above the figure changing height (images, the events sort)
    afterFonts(arm);
    arm();
    return () => { dead = true; S.offFrame(onFrame); if (off) off(); };
  }

  /* ---------- hairline: a non-scaling stroke drawn on by dashoffset ---------- */
  const CAP = 1.5; // screen px kept clear beyond the dash ends, so a round cap (r .625px) never shows at p 0
  function hairline(path, opts = {}) {
    const svg = path.ownerSVGElement;
    let L = 0, len = 0, p = 1, last = '';
    let samples = null;
    const measure = () => {
      L = path.getTotalLength();
      const vb = svg.viewBox.baseVal, r = svg.getBoundingClientRect();
      const k = vb && vb.width ? Math.min(r.width / vb.width, r.height / vb.height) : 1;
      len = L * k + 1;   // +1: a measured length a hair short never leaves the end undrawn at p 1
      last = '';
      write();
    };
    const write = () => {
      if (!L || p >= 1) {
        if (last !== 'done') { path.style.strokeDasharray = ''; path.style.strokeDashoffset = ''; last = 'done'; }
        return;
      }
      const dash = `${fix(len)} ${fix(len + CAP * 2 + 2)}`;
      const shift = (len + CAP) * (1 - p) * (opts.reverse ? -1 : 1);
      const key = dash + '|' + fix(shift);
      if (key === last) return;
      last = key;
      path.style.strokeDasharray = dash;
      path.style.strokeDashoffset = fix(shift);
    };
    const ctl = {
      set(v) { v = clamp(v); if (v === p && last) return; p = v; write(); },
      measure,
      get length() { return L; },
      point(v) { const pt = path.getPointAtLength(L * clamp(opts.reverse ? 1 - v : v)); return { x: pt.x, y: pt.y }; },
      reach(test) {
        if (!samples) { samples = []; for (let i = 0; i <= 400; i++) { const pt = path.getPointAtLength(L * i / 400); samples.push([pt.x, pt.y]); } }
        const n = samples.length - 1;
        for (let j = 0; j <= n; j++) {
          const i = opts.reverse ? n - j : j;
          if (test(samples[i][0], samples[i][1])) return j / n;
        }
        return 1;
      }
    };
    L = path.getTotalLength();
    watch(svg, measure);
    afterFonts(measure);
    measure();
    return ctl;
  }

  /* ---------- pieces: cut shapes that travel in and come to rest ---------- */
  function pieces(list, opts = {}) {
    const items = [...list].map(it => {
      if (it instanceof Element) {
        const f = (it.dataset.from || '0 0 0').trim().split(/\s+/).map(Number);
        return { el: it, x: f[0] || 0, y: f[1] || 0, r: f[2] || 0 };
      }
      return { x: 0, y: 0, r: 0, ...it };
    }).filter(it => it.el);
    const order = opts.order || items.map((_, i) => i);
    const gap = opts.stagger ?? .12, ease = opts.ease || smoother, o0 = opts.opacity ?? 1, n = items.length;
    items.forEach(it => {
      it.el.classList.add('piece', 'fx');
      if (it.el.hasAttribute('transform')) console.warn('drawings: a moving piece has a transform attribute, which CSS transform replaces; wrap it in a <g>', it.el);
      it.last = '';
    });
    const ctl = {
      set(p) {
        order.forEach((idx, slot) => {
          const it = items[idx];
          if (!it) return;
          const e = ease(n > 1 ? stagger(p, slot, n, gap) : clamp(p)), u = 1 - e;
          const tf = u > 0 ? `translate(${fix(it.x * u)}px,${fix(it.y * u)}px) rotate(${fix(it.r * u)}deg)` : '';
          const op = o0 < 1 && u > 0 ? String(fix(o0 + (1 - o0) * e, 3)) : '';
          const key = tf + '|' + op;
          if (key === it.last) return;
          it.last = key;
          it.el.style.transform = tf;
          it.el.style.opacity = op;
        });
      },
      items
    };
    return ctl;
  }

  function setDown(fig, list, opts = {}) {
    const ctl = pieces(list, opts);
    ctl.stop = track(fig, opts.from ?? .95, opts.to ?? .45, p => ctl.set(p), opts);
    return ctl;
  }

  /* ---------- wipe: a word written in, by clip-path ---------- */
  function wipe(el, t, side = 'left') {
    t = clamp(t);
    const v = t >= 1 ? '' : (() => {
      const c = fix((1 - t) * 100, 3) + '%';
      return side === 'right' ? `inset(0 0 0 ${c})` : side === 'top' ? `inset(0 0 ${c} 0)` : side === 'bottom' ? `inset(${c} 0 0 0)` : `inset(0 ${c} 0 0)`;
    })();
    if (el.style.clipPath !== v) el.style.clipPath = v;
  }

  function each(slug, fn) {
    whenSite(() => {
      const run = () => document.querySelectorAll(`[data-draw="${slug}"]`).forEach(fig => {
        try { fn(fig); } catch (e) { console.error('drawings:', slug, e); }
      });
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
    });
  }

  window.drawings = { each, track, hairline, pieces, setDown, wipe, span, stagger, smooth, smoother, out, clamp };
})();
