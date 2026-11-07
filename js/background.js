/*
  Ambient background: a slowly pulsing dark gradient behind the particles.
  The palette follows the visitor's local time of day. It only uses things the
  browser already knows without any permission prompt (clock, motion and
  data-saver preferences, tab visibility). Nothing is stored or sent anywhere.

  Preview any hour by adding ?hour=19 (or 6.5, 13, ...) to the URL.
*/
(function () {
  "use strict";

  // Colour anchors through the day (hour → base + three glow colours). Kept
  // deliberately dark so white text and particles stay readable.
  var ANCHORS = [
    { h: 0,    name: "night",     base: "#05060f", c: ["#1b1446", "#0b2a4a", "#2a0f3d"] },
    { h: 5,    name: "night",     base: "#05060f", c: ["#1b1446", "#0b2a4a", "#2a0f3d"] },
    { h: 6.5,  name: "dawn",      base: "#0d0610", c: ["#4a1838", "#3a2410", "#1f1a4a"] },
    { h: 9,    name: "morning",   base: "#030b10", c: ["#0d3b4a", "#12305e", "#0f4038"] },
    { h: 13,   name: "midday",    base: "#03090f", c: ["#0e3f5c", "#0a4a4a", "#1a2f66"] },
    { h: 17.5, name: "golden hour", base: "#0e0806", c: ["#4d2410", "#4a1430", "#24204f"] },
    { h: 19.5, name: "dusk",      base: "#0a0612", c: ["#3d1250", "#541a2e", "#12245a"] },
    { h: 22,   name: "night",     base: "#05060f", c: ["#1b1446", "#0b2a4a", "#2a0f3d"] },
    { h: 24,   name: "night",     base: "#05060f", c: ["#1b1446", "#0b2a4a", "#2a0f3d"] }
  ];

  function hexToRgb(hex) {
    var n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mix(a, b, t) {
    var x = hexToRgb(a), y = hexToRgb(b);
    return "rgb(" + [0, 1, 2].map(function (i) {
      return Math.round(x[i] + (y[i] - x[i]) * t);
    }).join(", ") + ")";
  }
  function smooth(t) { return t * t * (3 - 2 * t); }

  function currentHour() {
    var q = new URLSearchParams(location.search).get("hour");
    if (q !== null && !isNaN(parseFloat(q))) return ((parseFloat(q) % 24) + 24) % 24;
    var d = new Date();
    return d.getHours() + d.getMinutes() / 60;
  }

  function paletteFor(hour) {
    for (var i = 0; i < ANCHORS.length - 1; i++) {
      var a = ANCHORS[i], b = ANCHORS[i + 1];
      if (hour >= a.h && hour <= b.h) {
        var t = b.h === a.h ? 0 : smooth((hour - a.h) / (b.h - a.h));
        return {
          name: t < 0.5 ? a.name : b.name,
          base: mix(a.base, b.base, t),
          c: [0, 1, 2].map(function (k) { return mix(a.c[k], b.c[k], t); })
        };
      }
    }
    return { name: "night", base: ANCHORS[0].base, c: ANCHORS[0].c.slice() };
  }

  // ----- build the layer (sits behind #particles-js) -----
  var layer = document.createElement("div");
  layer.id = "bg-gradient";
  layer.setAttribute("aria-hidden", "true");
  layer.innerHTML = '<span class="blob b1"></span><span class="blob b2"></span><span class="blob b3"></span>';
  var particles = document.getElementById("particles-js");
  document.body.insertBefore(layer, particles || document.body.firstChild);

  // ----- calm it down when the visitor or device asks for it -----
  var mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var conn = navigator.connection || {};
  var lowEnd = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) ||
               (navigator.deviceMemory && navigator.deviceMemory <= 2);
  function applyStillness() {
    var still = (mq && mq.matches) || conn.saveData === true || lowEnd;
    layer.classList.toggle("still", !!still);
  }
  applyStillness();
  if (mq && mq.addEventListener) mq.addEventListener("change", applyStillness);

  // Pause the animation while the tab is in the background
  document.addEventListener("visibilitychange", function () {
    layer.classList.toggle("paused", document.hidden);
  });

  // ----- footer note so visitors know it's deliberate -----
  var note = null;
  var footerP = document.querySelector(".site-footer p");
  if (footerP) {
    note = document.createElement("span");
    note.className = "bg-note";
    footerP.appendChild(note);
  }

  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function paint() {
    var p = paletteFor(currentHour());
    layer.style.setProperty("--bg-base", p.base);
    layer.style.setProperty("--bg-c1", p.c[0]);
    layer.style.setProperty("--bg-c2", p.c[1]);
    layer.style.setProperty("--bg-c3", p.c[2]);
    if (themeMeta) themeMeta.setAttribute("content", p.base);
    if (note) note.textContent = " · Background: " + p.name + " palette, from your local time";
  }

  paint();
  requestAnimationFrame(function () { layer.classList.add("ready"); });
  setInterval(paint, 60 * 1000);
})();
