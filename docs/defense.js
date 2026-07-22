/* ---------- stage scaling ---------- */
function scaleStage() {
  var s = Math.min(innerWidth / 1280, innerHeight / 720);
  document.querySelector('.stage').style.setProperty('--s', s);
}
scaleStage();
addEventListener('resize', scaleStage);

/* ---------- TDG-style asterisk (reused for title + agenda mark) ---------- */
function drawAsterisk(canvas, size, alpha) {
  var ctx = canvas.getContext('2d');
  var cx = size / 2, cy = size / 2;
  var arms = 7, armLen = size * 0.406, armW = size * 0.081, armTipW = size * 0.069;
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = 'rgba(122, 100, 188, ' + alpha + ')';
  for (var i = 0; i < arms; i++) {
    var a = (i / arms) * Math.PI * 2 - Math.PI / 2;
    var cs = Math.cos(a), sn = Math.sin(a);
    var pc = Math.cos(a + Math.PI / 2), ps = Math.sin(a + Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(cx + pc * armW / 2, cy + ps * armW / 2);
    ctx.lineTo(cx + cs * armLen + pc * armTipW / 2, cy + sn * armLen + ps * armTipW / 2);
    ctx.arcTo(cx + cs * (armLen + armTipW * 0.5), cy + sn * (armLen + armTipW * 0.5),
              cx + cs * armLen - pc * armTipW / 2, cy + sn * armLen - ps * armTipW / 2, armTipW / 2);
    ctx.lineTo(cx + cs * armLen - pc * armTipW / 2, cy + sn * armLen - ps * armTipW / 2);
    ctx.lineTo(cx - pc * armW / 2, cy - ps * armW / 2);
    ctx.closePath();
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.078, 0, Math.PI * 2);
  ctx.fill();
}
document.querySelectorAll('.dim-mark').forEach(function (c) { drawAsterisk(c, 56, 0.9); });

/* ---------- shared floating gear ----------
   Per-slide target for the single background gear: center point (in the
   1280x720 stage) + scale. On each slide change the gear glides + scales to
   the matching target, so it "shrinks out / grows in" between slides.
   Big & central on the hero dividers, small & tucked in the corner on the
   content/list slides — that contrast gives the transitions their rhythm. */
var GEAR_TARGETS = {
  'slide-title':    { cx: 1055, cy: 360, s: 0.92 },
  'slide-agenda':   { cx: 1235, cy: 66,  s: 0.50 },
  'slide-hero01':   { cx: 1110, cy: 360, s: 1.00 },
  'slide-hostorg':  { cx: 1235, cy: 66,  s: 0.34 },
  'slide-problem':  { cx: 1235, cy: 66,  s: 0.34 },
  'slide-existing': { cx: 1235, cy: 66,  s: 0.34 },
  'slide-proposed': { cx: 1235, cy: 66,  s: 0.34 },
  'slide-hero02':   { cx: 1110, cy: 360, s: 1.00 },
  'slide-req':             { cx: 1235, cy: 66,  s: 0.34 },
  'slide-method-why':      { cx: 1235, cy: 66,  s: 0.34 },
  'slide-method-roadmap':  { cx: 1235, cy: 66,  s: 0.34 },
  'slide-arch':      { cx: 1235, cy: 66,  s: 0.34 },
  'slide-usecases':  { cx: 1235, cy: 66,  s: 0.34 },
  'slide-stack':     { cx: 1235, cy: 66,  s: 0.34 },
  'slide-hero03':    { cx: 1110, cy: 360, s: 1.00 },
  'slide-sprint1':   { cx: 1235, cy: 66,  s: 0.34 },
  'slide-sprint2':   { cx: 1235, cy: 66,  s: 0.34 },
  'slide-sprint3':   { cx: 1235, cy: 66,  s: 0.34 },
  'slide-sprint4':   { cx: 1235, cy: 66,  s: 0.34 },
  'slide-sprint5':   { cx: 1235, cy: 66,  s: 0.34 },
  'slide-sprint6':   { cx: 1235, cy: 66,  s: 0.34 }
};
var gearEl = document.querySelector('.deck-gear');
function applyGear(slideEl) {
  var t = null;
  for (var cls in GEAR_TARGETS) { if (slideEl.classList.contains(cls)) { t = GEAR_TARGETS[cls]; break; } }
  if (!t) return;
  // gear box is 700x700 with transform-origin at its center (350,350);
  // scaling happens around the center, then translate places that center.
  gearEl.style.transform = 'translate(' + (t.cx - 350) + 'px, ' + (t.cy - 350) + 'px) scale(' + t.s + ')';
}

/* ---------- config ---------- */
var SHOW_CONTROLS = false;   // set true to show the nav arrows + slide counter
if (!SHOW_CONTROLS) {
  var nav = document.querySelector('.nav'); if (nav) nav.style.display = 'none';
  var ctr = document.querySelector('.counter'); if (ctr) ctr.style.display = 'none';
}

var SHOW_QUICKNAV = true;   // set false to hide the floating "jump to section" button
var quicknavBtn = document.getElementById('quicknavBtn');
var quicknavPanel = document.getElementById('quicknavPanel');
if (!SHOW_QUICKNAV) {
  if (quicknavBtn) quicknavBtn.style.display = 'none';
  if (quicknavPanel) quicknavPanel.style.display = 'none';
} else if (quicknavBtn && quicknavPanel) {
  quicknavBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    quicknavPanel.classList.toggle('open');
  });
  quicknavPanel.querySelectorAll('.quicknav-item').forEach(function (el) {
    el.addEventListener('click', function () {
      si = parseInt(el.getAttribute('data-si'), 10);
      step = 0;
      render();
      quicknavPanel.classList.remove('open');
    });
  });
  document.addEventListener('click', function (e) {
    if (!quicknavPanel.contains(e.target) && e.target !== quicknavBtn) {
      quicknavPanel.classList.remove('open');
    }
  });
}

/* ---------- deck navigation ---------- */
var slides = [].slice.call(document.querySelectorAll('.slide'));
var si = 0, step = 0;
document.getElementById('tot').textContent = slides.length;

function stepsOf(i) { return parseInt(slides[i].dataset.steps || '1', 10); }

/* ---------- reusable count-up ----------
   Any [data-count-to] element tweens from data-count-from (default 0) to
   data-count-to once the slide reaches data-count-step. Re-arms when the
   step drops back below its trigger, so revisiting a slide replays it.
   Supports data-count-decimals for fractional metrics (e.g. MAE 3.83). */
function runCounts(scope, step) {
  scope.querySelectorAll('[data-count-to]').forEach(function (el) {
    var at = parseInt(el.getAttribute('data-count-step') || '0', 10);
    var dec = parseInt(el.getAttribute('data-count-decimals') || '0', 10);
    var to = parseFloat(el.getAttribute('data-count-to'));
    var from = parseFloat(el.getAttribute('data-count-from') || '0');
    if (step < at) { el.textContent = from.toFixed(dec); el._counted = false; return; }
    if (el._counted) return;
    el._counted = true;
    var dur = 900, t0 = performance.now();
    (function tick(now) {
      var p = Math.min(1, (now - t0) / dur);
      var v = from + (to - from) * (1 - Math.pow(1 - p, 3));
      el.textContent = v.toFixed(dec);
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  });
}

/* ---------- generic staged reveal ----------
   Any [data-reveal-step] element gets `.is-revealed` once the slide reaches
   that step, and loses it when the step drops back below — so items appear
   one-by-one on click/scroll and replay on revisit. Drives the problem cards,
   the comparison-table columns, and any future staggered content. */
function runReveals(scope, step) {
  scope.querySelectorAll('[data-reveal-step]').forEach(function (el) {
    var at = parseInt(el.getAttribute('data-reveal-step') || '1', 10);
    el.classList.toggle('is-revealed', step >= at);
  });
}

/* ---------- tab conveyor (reusable: 02.4 Use Cases, 03.3 Sprint 3, …) ----
   A slide that carries a `.uc-tabs` row (the tab pill markup/CSS is generic,
   despite the "uc-" prefix from where it was first built) gets this driver
   automatically — no per-slide registration needed. Step N activates the
   Nth tab and the [data-panel-step="N"] panel; each panel parks off-screen
   left once passed, so revisiting backwards re-enters from the correct side
   automatically (transform is a pure function of step). Tab order in the
   DOM *is* the mapping — no separate name/role table to keep in sync. */
function runTabConveyor(scope, step) {
  var tabs = scope.querySelectorAll('.uc-tab');
  tabs.forEach(function (t, i) { t.classList.toggle('uc-tab-active', step === i + 1); });
  scope.querySelectorAll('[data-panel-step]').forEach(function (el) {
    var p = parseInt(el.getAttribute('data-panel-step'), 10);
    el.classList.toggle('active', step === p);
    el.classList.toggle('passed', step > p);
  });
}

function render() {
  slides.forEach(function (s, i) {
    s.classList.toggle('active', i === si);
    s.classList.toggle('past', i < si);
  });
  var cur = slides[si];
  /* generic per-step hook: any slide can drive CSS reveals off the current
     step via [data-step="N"] selectors, without a slide-specific branch here */
  cur.setAttribute('data-step', step);
  if (cur.classList.contains('slide-agenda')) {
    var items = cur.querySelectorAll('.toc-item');
    items.forEach(function (it, idx) { it.classList.toggle('focus', idx === step); });
  }
  if (cur.classList.contains('sub-section-slide')) {
    // step 0 = intro icon/logo beat, step >=1 = push-transition to the real
    // content (>= not == so a subsection body can carry further inner steps)
    cur.classList.toggle('content-shown', step >= 1);
  }
  runCounts(cur, step);
  runReveals(cur, step);
  if (cur.querySelector('.uc-tabs')) runTabConveyor(cur, step);
  syncMetricViewers(cur);
  applyGear(cur);
  document.getElementById('cur').textContent = si + 1;
}

/* ---------- shared-element morph engine ----------
   Handles N element pairs (and text-split pairs) morphing together as one
   slide transition: measure sources, force-measure destinations in their
   true in-place position, hide destinations, switch slide, fly ghosts,
   then hand off to the real (now-visible) destination elements. */
function stageLocalFromRect(r) {
  var stage = document.querySelector('.stage');
  var sr = stage.getBoundingClientRect();
  var scale = sr.height / 720;
  return { left: (r.left - sr.left) / scale, top: (r.top - sr.top) / scale,
           width: r.width / scale, height: r.height / scale };
}
function stageLocalRect(el) { return stageLocalFromRect(el.getBoundingClientRect()); }

function snapshotStyle(cs) {
  return {
    fontSize: cs.fontSize, fontWeight: cs.fontWeight, color: cs.color,
    fontFamily: cs.fontFamily, letterSpacing: cs.letterSpacing,
    background: cs.backgroundImage !== 'none' ? cs.backgroundImage : cs.backgroundColor,
    borderRadius: cs.borderRadius, boxShadow: cs.boxShadow
  };
}

/* tight bounding box of an element's text (ignores alignment padding, e.g.
   a right-aligned numeral sitting at the far edge of a wide grid column) —
   falls back to the element box when it has no text (e.g. separator bars) */
function tightRect(el) {
  if (el.textContent.trim()) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var r = range.getBoundingClientRect();
    if (r.width && r.height) return r;
  }
  return el.getBoundingClientRect();
}

/* job from a plain [data-morph="key-src"] / [data-morph="key-dst"] pair */
function elementJob(key) {
  var src = document.querySelector('[data-morph="' + key + '-src"]');
  var dst = document.querySelector('[data-morph="' + key + '-dst"]');
  if (!src || !dst) return null;
  return {
    srcRect: stageLocalFromRect(tightRect(src)), srcStyle: snapshotStyle(getComputedStyle(src)),
    text: src.textContent.trim(), dstEl: dst
  };
}

/* job from a slice of a text node (used to split one source line across
   two destination lines) — start/end are character offsets into `node` */
function rangeJob(node, start, end, dstEl) {
  var range = document.createRange();
  range.setStart(node, start);
  range.setEnd(node, end);
  var r = range.getBoundingClientRect();
  var cs = getComputedStyle(node.parentElement);
  return {
    srcRect: stageLocalFromRect(r), srcStyle: snapshotStyle(cs),
    text: node.textContent.slice(start, end).trim(), dstEl: dstEl
  };
}

/* measures every dstEl in its true in-place position by forcing its slide
   active just long enough to read layout, then reverting — synchronous,
   so nothing paints in between. */
function measureAllDst(dstEls) {
  if (!dstEls.length) return [];
  var slide = dstEls[0].closest('.slide');
  var wasTransition = slide.style.transition;
  slide.style.transition = 'none';
  slide.classList.add('active');
  var out = dstEls.map(function (el) {
    return { rect: stageLocalRect(el), style: snapshotStyle(getComputedStyle(el)) };
  });
  slide.classList.remove('active');
  slide.style.transition = wasTransition;
  return out;
}

var morphing = false;       // true while a morph batch's ghosts are in flight
var skipActiveMorph = null; // finishes the in-flight morph instantly; set while morphing

function runMorphBatch(jobs, targetSlideIndex, opts) {
  opts = opts || {};
  var stagger = opts.stagger != null ? opts.stagger : 110;
  var duration = opts.duration != null ? opts.duration : 2000;
  jobs = jobs.filter(Boolean);
  var fromSlide = slides[si];
  var toSlide = slides[targetSlideIndex];
  if (!jobs.length) { si = targetSlideIndex; step = 0; render(); return; }
  morphing = true;

  var measured = measureAllDst(jobs.map(function (j) { return j.dstEl; }));
  jobs.forEach(function (j, i) {
    j.dstRect = measured[i].rect; j.dstStyle = measured[i].style;
    j.dstEl.style.visibility = 'hidden';
  });

  /* hard-cut the base slide-to-slide crossfade for this transition — the
     morph ghosts are the transition, a competing 0.55s crossfade underneath
     them just looks like the old slide bleeding through. The lock stays on
     for the whole morph (not just a couple of frames) so a second click
     during the morph can't re-enable the crossfade mid-flight and strand
     the outgoing slide at a half-faded opacity — see the `morphing` guard
     in advance()/back(), which additionally blocks re-entrant calls outright. */
  fromSlide.classList.add('no-transition');
  toSlide.classList.add('no-transition');
  si = targetSlideIndex; step = 0; render();

  var stage = document.querySelector('.stage');
  jobs.forEach(function (j, idx) {
    var ghost = document.createElement('div');
    ghost.className = 'morph-ghost';
    ghost.textContent = j.text;
    stage.appendChild(ghost);
    Object.assign(ghost.style, {
      left: j.srcRect.left + 'px', top: j.srcRect.top + 'px',
      width: j.srcRect.width + 'px', height: j.srcRect.height + 'px',
      fontSize: j.srcStyle.fontSize, color: j.srcStyle.color,
      /* font-family / weight / letter-spacing can't tween cleanly, so lock
         them to the destination's for the whole flight — the landing must be
         seamless (a takeoff mismatch at the tiny source size is imperceptible),
         and pinning the weight avoids the text visibly thickening in flight. */
      fontFamily: j.dstStyle.fontFamily, fontWeight: j.dstStyle.fontWeight, letterSpacing: j.dstStyle.letterSpacing,
      background: j.srcStyle.background === 'none' ? 'transparent' : j.srcStyle.background,
      borderRadius: j.srcStyle.borderRadius, boxShadow: j.srcStyle.boxShadow,
      display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap'
    });
    ghost.getBoundingClientRect(); // commit start state before transitioning
    ghost.style.transition = 'all ' + duration + 'ms cubic-bezier(.22,.9,.24,1)';
    ghost.style.transitionDelay = (idx * stagger) + 'ms';
    j._ghost = ghost;

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        Object.assign(ghost.style, {
          left: j.dstRect.left + 'px', top: j.dstRect.top + 'px',
          width: j.dstRect.width + 'px', height: j.dstRect.height + 'px',
          fontSize: j.dstStyle.fontSize, color: j.dstStyle.color,
          background: j.dstStyle.background === 'none' ? 'transparent' : j.dstStyle.background,
          borderRadius: j.dstStyle.borderRadius, boxShadow: j.dstStyle.boxShadow
        });
      });
    });
  });

  var total = duration + (jobs.length - 1) * stagger + 60;
  var done = false;
  function finishNow() {
    if (done) return;
    done = true;
    clearTimeout(timer);
    jobs.forEach(function (j) {
      j._ghost.remove();
      j.dstEl.classList.add('morph-arrived');
      j.dstEl.style.visibility = 'visible';
    });
    // also force-reveal any ancestor containers that have their own fade-in
    // animation, so they don't compound-dim the just-arrived children
    (opts.revealAncestors || []).forEach(function (el) { el.classList.add('morph-arrived'); });
    fromSlide.classList.remove('no-transition');
    toSlide.classList.remove('no-transition');
    if (opts.onComplete) opts.onComplete();
    morphing = false;
    skipActiveMorph = null;
  }
  skipActiveMorph = finishNow;
  var timer = setTimeout(finishNow, total);
}

/* ---------- section 01 transitions ---------- */
function buildHero01Jobs() {
  var jobs = [elementJob('sec-01')];
  var srcTitle = document.querySelector('[data-morph="sec-01-titlesrc"]');
  if (srcTitle && srcTitle.firstChild) {
    var node = srcTitle.firstChild;
    var full = node.textContent;
    var splitAt = full.indexOf('&') + 2; // right after "& "
    var dst1 = document.querySelector('[data-morph="sec-01-title1-dst"]');
    var dst2 = document.querySelector('[data-morph="sec-01-title2-dst"]');
    if (dst1) jobs.push(rangeJob(node, 0, splitAt, dst1));
    if (dst2) jobs.push(rangeJob(node, splitAt, full.length, dst2));
  }
  return jobs;
}
function buildStepperJobs(prefix, count) {
  var jobs = [];
  for (var i = 1; i <= count; i++) { jobs.push(elementJob(prefix + '-t' + i)); jobs.push(elementJob(prefix + '-l' + i)); }
  for (var s = 1; s < count; s++) jobs.push(elementJob(prefix + '-sep' + s));
  return jobs;
}

function advance() {
  /* a morph is mid-flight — a click/scroll/key now finishes it instantly
     (like PowerPoint's click-to-finish-animation) rather than being eaten;
     the click doesn't also advance further, so it can't re-trigger the race
     the `no-transition` lock exists to prevent — a second press finishes it. */
  if (morphing) { if (skipActiveMorph) skipActiveMorph(); return; }
  /* leaving the agenda's last step -> morph numeral + title into the hero,
     then reveal the hero's description + subsection list. The reveal fires
     on its own short timer (not the morph's onComplete) so it doesn't wait
     out the whole ~2s morph, and body-reveal is reset first so revisiting
     this slide replays the entrance instead of snapping in statically. */
  if (si === 1 && step === stepsOf(1) - 1 && slides[2] && slides[2].classList.contains('slide-hero01')) {
    var heroSlide = slides[2];
    heroSlide.classList.remove('body-reveal');
    runMorphBatch(buildHero01Jobs(), 2, {});
    setTimeout(function () { heroSlide.classList.add('body-reveal'); }, 450);
    return;
  }
  /* leaving the hero -> morph the subsection list into the stepper, then
     (soon after, not after the full morph) reveal the host-org intro beat;
     reset both reveal classes first so a revisit always replays. */
  if (si === 2 && step === stepsOf(2) - 1 && slides[3] && slides[3].classList.contains('slide-hostorg')) {
    var stepperEl = document.querySelector('.slide-hostorg .stepper');
    var hostorgSlide = slides[3];
    hostorgSlide.classList.remove('body-reveal', 'content-shown');
    runMorphBatch(buildStepperJobs('s01', 4), 3, { revealAncestors: stepperEl ? [stepperEl] : [] });
    setTimeout(function () { hostorgSlide.classList.add('body-reveal'); }, 500);
    return;
  }
  /* Section 02 repeats the same visual language: the hero's subsection
     list flies into the 02.1 stepper before its intro beat enters. */
  if (slides[si].classList.contains('slide-hero02') && step === stepsOf(si) - 1 && slides[si + 1] && slides[si + 1].classList.contains('slide-req')) {
    var reqSlide = slides[si + 1];
    var reqStepper = reqSlide.querySelector('.stepper');
    reqSlide.classList.remove('body-reveal', 'content-shown');
    runMorphBatch(buildStepperJobs('s02', 5), si + 1, { revealAncestors: reqStepper ? [reqStepper] : [] });
    setTimeout(function () { reqSlide.classList.add('body-reveal'); }, 500);
    return;
  }
  /* Section 03: same hero-subs-into-stepper morph again (03.1..03.5 only —
     the hero's 6th "destination" node previews Sprint 6 but isn't part of
     this section's own stepper, so it's excluded from the morph count). */
  if (slides[si].classList.contains('slide-hero03') && step === stepsOf(si) - 1 && slides[si + 1] && slides[si + 1].classList.contains('slide-sprint1')) {
    var sprint1Slide = slides[si + 1];
    var sprint1Stepper = sprint1Slide.querySelector('.stepper');
    sprint1Slide.classList.remove('body-reveal', 'content-shown');
    runMorphBatch(buildStepperJobs('s03', 5), si + 1, { revealAncestors: sprint1Stepper ? [sprint1Stepper] : [] });
    setTimeout(function () { sprint1Slide.classList.add('body-reveal'); }, 500);
    return;
  }
  if (step < stepsOf(si) - 1) { step++; render(); }
  else if (si < slides.length - 1) {
    si++; step = 0;
    var entering = slides[si];
    /* plain (non-morph) arrival at a subsection slide (01.2, 01.3, …) —
       same reset-then-short-delay reveal as the morph-driven ones above,
       so it replays every time rather than only on first visit. */
    if (entering.classList.contains('sub-section-slide')) {
      entering.classList.remove('body-reveal', 'content-shown');
      render();
      setTimeout(function () { entering.classList.add('body-reveal'); }, 500);
    } else {
      render();
    }
  }
}
function back() {
  if (morphing) { if (skipActiveMorph) skipActiveMorph(); return; }
  if (step > 0) { step--; render(); }
  else if (si > 0) { si--; step = stepsOf(si) - 1; render(); }
}

/* click anywhere (except the nav buttons) — a metric viewer on the current
   panel gets first refusal (see syncMetricViewers doc comment above) */
addEventListener('click', function (e) {
  if (e.target.closest('.navbtn')) return;
  var mv = activeMetricViewer();
  if (mv && stepMetricViewer(mv, 1)) return;
  advance();
});
document.getElementById('next').addEventListener('click', advance);
document.getElementById('prev').addEventListener('click', back);

/* scroll */
var lock = false;
addEventListener('wheel', function (e) {
  if (lock) return;
  var dir = e.deltaY > 0 ? 1 : -1;
  var mv = activeMetricViewer();
  lock = true; setTimeout(function () { lock = false; }, 620);
  if (mv && stepMetricViewer(mv, dir)) return;
  if (dir > 0) advance(); else back();
}, { passive: true });

/* keyboard */
addEventListener('keydown', function (e) {
  if (['ArrowRight', 'ArrowDown', ' ', 'PageDown'].indexOf(e.key) >= 0) {
    e.preventDefault();
    var mvN = activeMetricViewer();
    if (mvN && stepMetricViewer(mvN, 1)) return;
    advance();
  } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].indexOf(e.key) >= 0) {
    e.preventDefault();
    var mvP = activeMetricViewer();
    if (mvP && stepMetricViewer(mvP, -1)) return;
    back();
  }
});

/* ---------- single source of truth for section labels ----------
   The stepper bar (01.1 › 01.2 › …) is repeated on every sub-section slide,
   and the same labels also appear on the hero divider slides. Rather than
   hand-editing each copy (a consistency risk as slides grow), the labels
   live here ONCE and are written into every stepper/hero group on load.
   Only textContent is touched — the data-morph attributes and DOM structure
   are left intact, so the numeral-morph animation (which reads text lazily
   at click time) is unaffected. To rename a section or add one, edit here. */
var SECTION_LABELS = {
  '01': ['Host Organization', 'The Problem', 'Existing Solutions', 'Proposed Solution'],
  '02': ['Requirements', 'Methodology', 'Architecture', 'Use Cases', 'Tech Stack'],
  '03': ['Foundations', 'Projects', 'Agile Backlog', 'Tasks & Kanban', 'Productivity', 'Communication']
};
function syncSectionLabels(scopeSel, tagSel, labelSel) {
  document.querySelectorAll(scopeSel).forEach(function (scope) {
    var tags = scope.querySelectorAll(tagSel);
    var labels = scope.querySelectorAll(labelSel);
    if (!tags.length) return;
    var section = (tags[0].textContent.split('.')[0] || '').trim();   // "01.1" -> "01"
    var names = SECTION_LABELS[section];
    if (!names) return;
    tags.forEach(function (t, i) { t.textContent = section + '.' + (i + 1); });
    labels.forEach(function (l, i) { if (names[i] != null) l.textContent = names[i]; });
  });
}
syncSectionLabels('.stepper', '.step-tag', '.step-label');
syncSectionLabels('.slide-hero01, .slide-hero02, .slide-hero03', '.hs-tag', '.hs-label');

/* ---------- metric viewer (03.3 Metrics tab) ----------
   A [data-metric-viewer="key"] block pages through a set of screenshots in
   place of a 3-up row that was unreadable when projected. It is NOT a
   separate interaction layer: clicking/scrolling/arrow-keying anywhere on the
   page already advances or reverses the whole deck (see the three
   window-level listeners below this block), so the viewer has to plug into
   that same gesture rather than add a competing one. The rule the click/
   wheel/keydown handlers all apply is: if the active panel is a metric
   viewer AND stepping in the requested direction stays in range, consume the
   event and swap the image; otherwise let it fall through to advance()/
   back() as normal — so "next" past the last screenshot moves to the next
   slide, and "previous" before the first moves to the previous one. */
var METRIC_SETS = {
  's3-analytics': [
    { src: 'latex/figures/screenshot_P20.png', alt: 'Sprint burndown chart, ideal versus actual remaining story points',
      cap: 'Burndown &mdash; ideal vs. actual remaining points, computed day by day from each task\'s <code>completedAt</code>.' },
    { src: 'latex/figures/screenshot_P21.png', alt: 'Sprint velocity chart, story points completed per finished sprint',
      cap: 'Velocity &mdash; story points completed per finished sprint, the team\'s track record for planning capacity.' },
    { src: 'latex/figures/screenshot_P22.png', alt: 'Gantt chart combining milestones, epics, sprints, and tasks on one timeline',
      cap: 'Gantt &mdash; milestones, epics, sprints, and tasks fanned into one project-wide timeline from four parallel queries.' }
  ]
};
(function preloadMetricImages() {
  Object.keys(METRIC_SETS).forEach(function (key) {
    METRIC_SETS[key].forEach(function (item) { new Image().src = item.src; });
  });
})();

/* animate: false is for the on-entry reset (called from render()) — the
   content is written straight into the already-active layer with
   transitions momentarily killed (.mv-instant), so nothing fades as the tab
   itself is fading/sliding into view. animate: true is real next/prev
   paging: write the new content into the currently-hidden layer, then flip
   which layer carries .mv-active — both layers' opacity transitions run at
   once, the same simultaneous crossfade .slide/.slide.active uses. */
function applyMetricIdx(root, idx, animate) {
  var items = METRIC_SETS[root.getAttribute('data-metric-viewer')];
  var layers = root.querySelectorAll('.mv-layer');
  var activeLayer = root.querySelector('.mv-layer.mv-active') || layers[0];
  var otherLayer = activeLayer === layers[0] ? layers[1] : layers[0];
  root._metricIdx = idx;

  function write(layer) {
    var img = layer.querySelector('[data-metric-img]');
    var cap = layer.querySelector('[data-metric-caption]');
    img.src = items[idx].src; img.alt = items[idx].alt;
    cap.innerHTML = items[idx].cap;
  }

  if (!animate) {
    root.classList.add('mv-instant');
    write(activeLayer);
    activeLayer.classList.add('mv-active');
    otherLayer.classList.remove('mv-active');
    void root.offsetHeight; // force the instant state to apply before re-enabling transitions
    root.classList.remove('mv-instant');
    return;
  }
  write(otherLayer);
  otherLayer.classList.add('mv-active');
  activeLayer.classList.remove('mv-active');
}

/* the panel currently showing a metric viewer, or null — the single source
   of truth the click/wheel/keydown handlers consult before deciding whether
   to page the viewer or the deck. */
function activeMetricViewer() {
  var cur = slides[si];
  var panel = cur && cur.querySelector('.uc-panel.active');
  return panel ? panel.querySelector('[data-metric-viewer]') : null;
}

/* steps the viewer if `dir` stays in range; returns true if it consumed the
   gesture (caller should stop), false at a boundary (caller should fall
   through to advance()/back()). */
function stepMetricViewer(root, dir) {
  var items = METRIC_SETS[root.getAttribute('data-metric-viewer')];
  if (!items) return false;
  var next = (root._metricIdx || 0) + dir;
  if (next < 0 || next >= items.length) return false;
  applyMetricIdx(root, next, true);
  return true;
}

/* called every render() so a viewer always starts on its first screenshot
   when its panel is freshly entered — from either direction — rather than
   resuming wherever it was left on a prior visit. Runs over every viewer in
   the whole deck (not just the current slide) so the "was active last
   render" flag correctly flips back to false once its slide is left. */
function syncMetricViewers(cur) {
  document.querySelectorAll('[data-metric-viewer]').forEach(function (root) {
    var panel = root.closest('.uc-panel');
    var isActive = !!(panel && panel.classList.contains('active') && panel.closest('.slide') === cur);
    if (isActive && !root._mvWasActive) applyMetricIdx(root, 0);
    root._mvWasActive = isActive;
  });
}

render();
