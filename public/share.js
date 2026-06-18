/* Bad Bills — universal share helper.
   Any element with [data-share] triggers the native share sheet (mobile) or copies
   the page link (desktop). X/Facebook/LinkedIn buttons are plain <a> intent links.
*/
(function () {
  function cur() { return location.href; }
  document.addEventListener("click", function (e) {
    var s = e.target.closest && e.target.closest("[data-share]");
    if (!s) return;
    e.preventDefault();
    var payload = { title: document.title, url: cur() };
    if (navigator.share) {
      navigator.share(payload).then(function () { window.track && window.track("Share", { id: "native" }); }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(cur()).then(function () {
        var orig = s.getAttribute("data-orig") || s.textContent;
        s.setAttribute("data-orig", orig);
        s.textContent = "✓ Link copied";
        setTimeout(function () { s.textContent = orig; }, 1600);
        window.track && window.track("Share", { id: "copy" });
      });
    } else {
      window.prompt("Copy this link:", cur());
    }
  });
})();
