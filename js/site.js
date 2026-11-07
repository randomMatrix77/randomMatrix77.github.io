/* Small site behaviours: scroll reveal, active nav link, footer year, contact form. */
(function () {
  "use strict";

  /* Highlight the current page in the navbar */
  var page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".navbar .nav-link").forEach(function (a) {
    if (a.getAttribute("href") === page) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }
  });

  /* Fade sections in as they scroll into view */
  var items = document.querySelectorAll(".reveal");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -40px 0px", threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* Footer year */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* Contact form: open the visitor's mail app with the message pre-filled */
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var message = form.elements.message.value.trim();
      var subject = "Portfolio contact" + (name ? " from " + name : "");
      var body = message + (name || email ? "\n\n— " + name + (email ? " (" + email + ")" : "") : "");
      window.location.href = "mailto:shaikh.mohsin@protonmail.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
    });
  }
})();

/* Stop any playing YouTube video when its project modal closes */
document.addEventListener("hidden.bs.modal", function (e) {
  e.target.querySelectorAll("iframe").forEach(function (f) {
    var src = f.getAttribute("src");
    f.setAttribute("src", "about:blank");
    f.setAttribute("src", src);
  });
});
