/* ===== Bad Bills — feedback widget =====
   Floating "Feedback" button + modal. On submit it POSTs to a Cloudflare Worker
   (which opens a GitHub Issue). If the Worker isn't reachable, it falls back to
   opening a pre-filled GitHub "new issue" page — so feedback ALWAYS works.

   >>> CONFIG: once your Worker is deployed, leave endpoint as "/api/feedback"
       (if you route the Worker at badbills.ca/api/* in Cloudflare) or set it to
       the full https://...workers.dev URL. <<<
*/
(function () {
  var CFG = Object.assign({
    endpoint: "/api/feedback",          // Cloudflare Worker route (same-origin) or full Worker URL
    repo: "androolloyd/bad-bills"        // used only for the no-Worker fallback
  }, window.FEEDBACK || {});

  var CATS = ["Correction to a bill", "Outdated status", "Missing or wrong source",
              "Add a bill we're missing", "Bug / broken link", "Suggestion", "Other"];

  function h(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  }

  // ---------- build DOM ----------
  var btn = h("button", { id: "fb-btn", "aria-label": "Send feedback", title: "Send feedback / report a correction" }, "💬 Feedback");
  var overlay = h("div", { id: "fb-overlay", "aria-hidden": "true" });
  overlay.innerHTML =
    '<div id="fb-modal" role="dialog" aria-modal="true" aria-labelledby="fb-title">' +
      '<button id="fb-x" aria-label="Close">×</button>' +
      '<h3 id="fb-title">Send feedback</h3>' +
      '<p class="fb-sub">Spotted a wrong status, a missing source, or a typo? Tell us — it becomes a tracked issue and gets fixed.</p>' +
      '<form id="fb-form">' +
        '<label class="fb-l">What kind of feedback?</label>' +
        '<select id="fb-cat" class="fb-in">' + CATS.map(function (c) { return '<option>' + c + '</option>'; }).join("") + '</select>' +
        '<label class="fb-l" id="fb-billwrap" style="display:none">Which bill?</label>' +
        '<input id="fb-bill" class="fb-in" style="display:none" placeholder="e.g. C-22, or Ontario Bill 5">' +
        '<label class="fb-l">Your feedback</label>' +
        '<textarea id="fb-msg" class="fb-in" rows="5" placeholder="What\'s wrong or what should change? A link to a source helps a lot."></textarea>' +
        '<label class="fb-l">Email (optional — if you want a reply)</label>' +
        '<input id="fb-email" class="fb-in" type="email" placeholder="you@example.com">' +
        '<input id="fb-hp" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">' +
        '<div class="fb-row"><button type="submit" id="fb-send" class="fb-btn-send">Send feedback</button><span id="fb-status"></span></div>' +
        '<p class="fb-note">Submitting opens a public GitHub issue. Don\'t include sensitive personal info.</p>' +
      '</form>' +
    '</div>';

  function ready() {
    document.body.appendChild(btn);
    document.body.appendChild(overlay);

    var cat = overlay.querySelector("#fb-cat"),
        billWrap = overlay.querySelector("#fb-billwrap"),
        bill = overlay.querySelector("#fb-bill"),
        msg = overlay.querySelector("#fb-msg"),
        email = overlay.querySelector("#fb-email"),
        hp = overlay.querySelector("#fb-hp"),
        status = overlay.querySelector("#fb-status"),
        form = overlay.querySelector("#fb-form"),
        send = overlay.querySelector("#fb-send");

    function syncBill() {
      var show = /bill|status|source/i.test(cat.value);
      billWrap.style.display = bill.style.display = show ? "" : "none";
    }
    cat.addEventListener("change", syncBill); syncBill();

    function open(prefill) {
      prefill = prefill || {};
      if (prefill.category) cat.value = prefill.category;
      if (prefill.bill) { bill.value = prefill.bill; cat.value = "Correction to a bill"; }
      syncBill();
      status.textContent = ""; status.className = "";
      overlay.classList.add("show"); overlay.setAttribute("aria-hidden", "false");
      setTimeout(function () { (prefill.bill ? msg : cat).focus(); }, 50);
    }
    function close() { overlay.classList.remove("show"); overlay.setAttribute("aria-hidden", "true"); }
    window.openFeedback = open;

    btn.addEventListener("click", function () { open(); });
    overlay.querySelector("#fb-x").addEventListener("click", close);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && overlay.classList.contains("show")) close(); });

    // delegated openers: any element with [data-feedback]; optional data-fb-bill / data-fb-category
    document.addEventListener("click", function (e) {
      var t = e.target.closest && e.target.closest("[data-feedback]");
      if (t) { e.preventDefault(); open({ bill: t.getAttribute("data-fb-bill") || "", category: t.getAttribute("data-fb-category") || "" }); }
    });

    function ghFallback(payload) {
      var title = "[Feedback] " + payload.category + (payload.bill ? " — " + payload.bill : "");
      var body = "**Category:** " + payload.category + "\n" +
        (payload.bill ? "**Bill/Page:** " + payload.bill + "\n" : "") +
        "**URL:** " + payload.page + "\n\n**Feedback:**\n" + payload.message +
        (payload.email ? "\n\n**Contact:** " + payload.email : "");
      var url = "https://github.com/" + CFG.repo + "/issues/new?labels=feedback,triage" +
        "&title=" + encodeURIComponent(title) + "&body=" + encodeURIComponent(body);
      window.open(url, "_blank", "noopener");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!msg.value.trim()) { status.textContent = "Please add a message."; status.className = "fb-err"; return; }
      var payload = {
        category: cat.value, bill: bill.value.trim(), message: msg.value.trim(),
        email: email.value.trim(), page: location.href, title: document.title,
        hp: hp.value, context: "ua:" + navigator.userAgent.slice(0, 60)
      };
      send.disabled = true; status.textContent = "Sending…"; status.className = "";
      fetch(CFG.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        .then(function (r) { if (!r.ok) throw new Error("bad status " + r.status); return r.json(); })
        .then(function (res) {
          status.innerHTML = res && res.url ? 'Thank you! <a href="' + res.url + '" target="_blank" rel="noopener">Track it →</a>' : "Thank you! Your feedback was sent.";
          status.className = "fb-ok"; form.reset(); syncBill();
          if (window.track) window.track("Feedback", { id: payload.category });
        })
        .catch(function () {
          // Worker not deployed / unreachable → open a pre-filled GitHub issue instead
          status.innerHTML = "Opening GitHub to finish submitting…";
          ghFallback(payload);
          if (window.track) window.track("FeedbackFallback", { id: payload.category });
        })
        .finally(function () { send.disabled = false; });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();
})();
