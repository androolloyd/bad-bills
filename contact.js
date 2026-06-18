/* Bad Bills — "Contact your reps" tool.
   Type a postal code OR an address -> finds your MP + provincial/territorial member
   (Open North Represent API; addresses geocoded via OpenStreetMap Nominatim) -> editable
   letter -> opens a prefilled email from YOUR address (best deliverability, not spam).
   No backend; the last location you used is remembered on this device only.
*/
(function () {
  var REP = "https://represent.opennorth.ca/";
  var GEO = "https://nominatim.openstreetmap.org/search";
  var LS = "bw-loc";
  var PC_RE = /[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d/;
  var RELEVANT = /House of Commons|Legislative Assembly|National Assembly|House of Assembly/i;
  var state = { reps: [] };

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function firstName(n) { return String(n || "").split(" ")[0]; }
  function dedupe(list) { var seen = {}, out = []; list.forEach(function (r) { var k = (r.name || "") + "|" + (r.representative_set_name || ""); if (seen[k]) return; seen[k] = 1; out.push(r); }); return out; }
  function relevant(reps) {
    return reps.filter(function (r) { return RELEVANT.test(r.representative_set_name || ""); })
      .sort(function (a, b) { return (/House of Commons/i.test(a.representative_set_name) ? 0 : 1) - (/House of Commons/i.test(b.representative_set_name) ? 0 : 1); });
  }
  function status(msg, cls) { var s = $("ct-status"); if (s) { s.textContent = msg || ""; s.className = "ct-status" + (cls ? " " + cls : ""); } }

  function byPostal(pc) {
    return fetch(REP + "postcodes/" + encodeURIComponent(pc.toUpperCase().replace(/\s+/g, "")) + "/")
      .then(function (r) { if (!r.ok) throw new Error("nf"); return r.json(); })
      .then(function (j) { return dedupe([].concat(j.representatives_centroid || [], j.representatives_concordance || [])); });
  }
  function byPoint(lat, lng) {
    return fetch(REP + "representatives/?point=" + lat + "," + lng + "&limit=100")
      .then(function (r) { if (!r.ok) throw new Error("nf"); return r.json(); })
      .then(function (j) { return dedupe(j.objects || []); });
  }
  function geocode(q) {
    return fetch(GEO + "?format=json&countrycodes=ca&limit=1&q=" + encodeURIComponent(q))
      .then(function (r) { if (!r.ok) throw new Error("geo"); return r.json(); })
      .then(function (a) { if (!a || !a.length) throw new Error("nomatch"); return { lat: (+a[0].lat).toFixed(5), lng: (+a[0].lon).toFixed(5) }; });
  }

  function subjectFor() {
    var s = ($("ct-subj").value || "").trim(); if (s) return s;
    var bill = ($("ct-bill").value || "").trim();
    return "Constituent concern about " + (bill || "legislation before the House");
  }
  function bodyFor(rep) {
    var name = ($("ct-name").value || "").trim() || "[your name]";
    var bill = ($("ct-bill").value || "").trim() || "legislation currently before the House";
    var msg = ($("ct-msg").value || "").trim();
    return "Dear " + rep.name + ",\n\n" +
      "I am a constituent" + (rep.district_name ? (" in " + rep.district_name) : "") + " writing to you about " + bill + ".\n\n" +
      (msg || "I have serious concerns about this and I am asking you to take a clear, public position on it.") + "\n\n" +
      "As my elected representative, I'd value knowing where you stand and how you intend to vote, and I'd appreciate a reply.\n\n" +
      "Thank you,\n" + name;
  }
  function repByEmail(e) { for (var i = 0; i < state.reps.length; i++) if (state.reps[i].email === e) return state.reps[i]; return null; }
  function phoneOf(r) { var o = r.offices || []; var i; for (i = 0; i < o.length; i++) if (/constituency/i.test(o[i].type) && o[i].tel) return o[i].tel; for (i = 0; i < o.length; i++) if (o[i].tel) return o[i].tel; return ""; }

  function downloadScript() {
    if (!state.reps.length) return;
    var bill = ($("ct-bill").value || "").trim() || "a bill currently before the House";
    var name = ($("ct-name").value || "").trim() || "[your name]";
    var district = (state.reps[0] && state.reps[0].district_name) ? state.reps[0].district_name : "";
    var L = ["BAD BILLS — Call script   (badbills.ca)", "Re: " + bill, "", "WHO TO CALL"];
    state.reps.forEach(function (r) { var t = phoneOf(r); L.push("• " + r.name + " (" + (r.elected_office || "") + ")" + (t ? " — " + t : " — no number listed") + (r.district_name ? "   [" + r.district_name + "]" : "")); });
    L.push("", "WHAT TO SAY",
      '"Hi, my name is ' + name + " and I'm a constituent" + (district ? " in " + district : "") + ". I'm calling about " + bill + ". I'd like my representative to take a clear, public position on it. Can you tell me where they stand and how they plan to vote? Thank you.\"",
      "", "TIPS",
      "• Keep it short and polite — 30 seconds is plenty.",
      "• You don't need to be an expert. Say you're a constituent, name the bill, and ask their position.",
      "• Phone calls are weighed more heavily than emails — constituency offices tally them.",
      "", "Made with badbills.ca");
    var blob = new Blob([L.join("\n")], { type: "text/plain" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a"); a.href = url; a.download = "call-script.txt"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    if (window.track) window.track("CallScript", {});
  }

  function repCard(r) {
    var fed = /House of Commons/i.test(r.representative_set_name);
    var email = r.email || "";
    var tel = phoneOf(r);
    var callBtn = tel ? '<a class="b2 ct-call" href="tel:' + esc(tel.replace(/[^\d+]/g, "")) + '">📞 ' + esc(tel) + '</a>' : '';
    var meta = [r.party_name, r.district_name, r.representative_set_name].filter(Boolean).map(esc).join(" · ");
    var action = email
      ? '<a class="b2 bx ct-mail" data-email="' + esc(email) + '" href="#">✉️ Email ' + esc(firstName(r.name)) + '</a>' +
        '<button class="b2 ct-copy" type="button" data-email="' + esc(email) + '">Copy letter</button>'
      : (r.url ? '<a class="b2" href="' + esc(r.url) + '" target="_blank" rel="noopener">Open contact page →</a>' : '<span class="muted">No public email listed</span>');
    return '<div class="ct-rep"><div class="ct-rep-h"><b>' + esc(r.name) + '</b> <span class="pill ' + (fed ? "pill-move" : "pill-law") + '">' + esc(r.elected_office || (fed ? "MP" : "Member")) + '</span></div>' +
      '<div class="ct-rep-m">' + meta + '</div><div class="ct-rep-a">' + action + callBtn + '</div></div>';
  }
  function renderReps(reps) {
    var rel = relevant(reps);
    if (!rel.length) { status("No federal or provincial representative found for that location. Try a postal code.", "err"); return; }
    state.reps = rel;
    status(rel.length + " representative" + (rel.length === 1 ? "" : "s") + " found — edit the letter below, then send it from your email.", "ok");
    $("ct-form").style.display = "";
    $("ct-reps").innerHTML = rel.map(repCard).join("");
  }

  function lookup(val, silent) {
    val = (val || "").trim();
    if (val.length < 3) { if (!silent) status("Enter your postal code or address.", "err"); return; }
    var pc = val.match(PC_RE);
    status("Finding your representatives…");
    (pc ? byPostal(pc[0]) : geocode(val).then(function (g) { return byPoint(g.lat, g.lng); }))
      .then(function (reps) { try { localStorage.setItem(LS, val); } catch (e) {} renderReps(reps); if (window.track) window.track("ContactLookup", { id: pc ? "postal" : "address" }); })
      .catch(function () { status(pc ? "Couldn't find that postal code — double-check it." : "Couldn't find that address — try your postal code instead.", "err"); });
  }

  function build() {
    var host = $("contact-tool"); if (!host) return;
    host.innerHTML =
      '<div class="ct-loc">' +
        '<input id="ct-loc-input" class="search" placeholder="Your postal code or address (e.g. B3H 4R2)" autocomplete="postal-code">' +
        '<button id="ct-find" class="share-btn x" type="button">Find my reps</button>' +
      '</div>' +
      '<div id="ct-status" class="ct-status"></div>' +
      '<div id="ct-form" class="ct-form" style="display:none">' +
        '<div class="ct-grid">' +
          '<label>Bill / topic<input id="ct-bill" class="fb-in" placeholder="e.g. C-22, or the issue"></label>' +
          '<label>Your name<input id="ct-name" class="fb-in" placeholder="Jane Doe"></label>' +
        '</div>' +
        '<label class="fb-l">Subject</label><input id="ct-subj" class="fb-in" placeholder="(auto-filled — edit if you like)">' +
        '<label class="fb-l">Your message <span style="text-transform:none;font-weight:400">(optional — a default is added if blank)</span></label>' +
        '<textarea id="ct-msg" class="fb-in" rows="4" placeholder="Add a sentence or two in your own words — it makes a real difference."></textarea>' +
        '<div class="ct-tools"><button id="ct-dl" class="b2" type="button">⬇️ Download call script (.txt)</button></div>' +
        '<div id="ct-reps" class="ct-reps"></div>' +
      '</div>';

    $("ct-find").addEventListener("click", function () { lookup($("ct-loc-input").value); });
    $("ct-loc-input").addEventListener("keydown", function (e) { if (e.key === "Enter") lookup($("ct-loc-input").value); });
    var dl = $("ct-dl"); if (dl) dl.addEventListener("click", downloadScript);
    host.addEventListener("click", function (e) {
      var m = e.target.closest(".ct-mail");
      if (m) { e.preventDefault(); var r = repByEmail(m.getAttribute("data-email")); if (r) window.location.href = "mailto:" + encodeURIComponent(r.email) + "?subject=" + encodeURIComponent(subjectFor()) + "&body=" + encodeURIComponent(bodyFor(r)); if (window.track) window.track("ContactEmail", {}); return; }
      var c = e.target.closest(".ct-copy");
      if (c) { var r2 = repByEmail(c.getAttribute("data-email")); if (r2 && navigator.clipboard) navigator.clipboard.writeText(bodyFor(r2)).then(function () { var o = c.textContent; c.textContent = "✓ Copied"; setTimeout(function () { c.textContent = o; }, 1500); }); return; }
    });

    var bill = new URLSearchParams(location.search).get("bill");
    var saved; try { saved = localStorage.getItem(LS); } catch (e) {}
    if (saved) { $("ct-loc-input").value = saved; lookup(saved, true); }
    if (bill) {
      $("ct-form").style.display = "";
      var b = $("ct-bill"); if (b) b.value = bill;
      if (!saved) status("Enter your postal code or address above to find your reps for this bill.");
      var act = $("act"); if (act) setTimeout(function () { act.scrollIntoView({ behavior: "smooth" }); }, 250);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
