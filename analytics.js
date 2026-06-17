/* ===== Bad Bills — privacy-friendly analytics =====
   Cookieless. No personal data. No consent banner required (PIPEDA/GDPR-friendly).
   Tracks pageviews + custom events: downloads, outbound clicks, province switches, bill expands,
   search use, and filter use.

   >>> TO TURN IT ON: set provider + your ID below, then commit. That's the only step. <<<
   Pick ONE:
     • "plausible"   — best for events; ~$9/mo or self-host. Sign up at plausible.io, add badbills.ca.
     • "goatcounter" — FREE (non-commercial), open source. Sign up at goatcounter.com, get your URL.
     • "cloudflare"  — FREE pageviews (events limited). In Cloudflare dash → Web Analytics → copy token.
     • "none"        — disabled (default until you choose).
*/
(function () {
  var ANALYTICS = {
    provider: "cloudflare",                    // "plausible" | "goatcounter" | "cloudflare" | "none"
    domain: "badbills.ca",                     // Plausible: your site domain
    goatcounter: "",                           // GoatCounter: e.g. "https://badbills.goatcounter.com/count"
    cloudflareToken: ""                        // <<< PASTE your Cloudflare Web Analytics beacon token here to go live
  };

  function el(tag, attrs) { var s = document.createElement(tag); for (var k in attrs) s.setAttribute(k, attrs[k]); return s; }

  function loadPlausible() {
    var s = el("script", { defer: "", "data-domain": ANALYTICS.domain,
      src: "https://plausible.io/js/script.tagged-events.outbound-links.js" });
    document.head.appendChild(s);
    window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments); };
  }
  function loadGoatcounter() {
    window.goatcounter = { no_onload: false };
    document.head.appendChild(el("script", { async: "", "data-goatcounter": ANALYTICS.goatcounter, src: "//gc.zgo.at/count.js" }));
  }
  function loadCloudflare() {
    document.head.appendChild(el("script", { defer: "", src: "https://static.cloudflareinsights.com/beacon.min.js",
      "data-cf-beacon": JSON.stringify({ token: ANALYTICS.cloudflareToken }) }));
  }

  switch (ANALYTICS.provider) {
    case "plausible":   if (ANALYTICS.domain)          loadPlausible();   break;
    case "goatcounter": if (ANALYTICS.goatcounter)     loadGoatcounter(); break;
    case "cloudflare":  if (ANALYTICS.cloudflareToken) loadCloudflare();  break;
  }

  // provider-agnostic custom event tracker
  window.track = function (name, props) {
    try {
      if (ANALYTICS.provider === "plausible" && window.plausible) {
        window.plausible(name, { props: props || {} });
      } else if (ANALYTICS.provider === "goatcounter" && window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({ path: "event:" + name + (props && props.id ? ":" + props.id : ""), title: name, event: true });
      }
      // (Cloudflare Web Analytics is pageview-only; custom events are no-ops there.)
    } catch (e) {}
  };

  // ---- automatic event wiring (works with dynamically-rendered content) ----
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a");
    if (a) {
      var href = a.getAttribute("href") || "";
      if (/\.(pdf|png)$/i.test(href)) window.track("Download", { id: href.split("/").pop() });
      else if (/^https?:\/\//i.test(href) && a.hostname && a.hostname !== location.hostname) window.track("Outbound", { id: a.hostname });
    }
    var chip = e.target.closest && e.target.closest("#province-chips .chip");
    if (chip) window.track("Province", { id: chip.dataset.prov });
    var rchip = e.target.closest && e.target.closest('[data-group] .chip');
    if (rchip) window.track("Filter", { id: (rchip.closest("[data-group]").dataset.group) + ":" + rchip.dataset.risk });
  }, true);

  // bill card expands
  document.addEventListener("toggle", function (e) {
    if (e.target.matches && e.target.matches(".card details") && e.target.open) {
      var c = e.target.closest(".card"), num = c && c.querySelector(".card-num");
      window.track("BillExpand", { id: num ? num.textContent.trim() : "?" });
    }
  }, true);

  // search use (debounced, value-free for privacy)
  var st;
  document.addEventListener("input", function (e) {
    if (e.target.matches && e.target.matches('input[type="search"]')) {
      clearTimeout(st); st = setTimeout(function () { window.track("Search", { id: e.target.id }); }, 1200);
    }
  }, true);
})();
