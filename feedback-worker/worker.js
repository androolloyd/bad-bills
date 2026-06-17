/* Bad Bills — feedback Worker (Cloudflare).
   Receives JSON from the site's feedback form and opens a GitHub Issue.
   Secrets/vars (set with `wrangler secret put` / wrangler.toml [vars]):
     GITHUB_TOKEN  - fine-grained PAT with Issues: Read & Write on the repo (SECRET)
     REPO          - "androolloyd/bad-bills"
*/
const ALLOWED_ORIGINS = [
  "https://badbills.ca",
  "https://www.badbills.ca",
  "https://androolloyd.github.io"
];

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin);

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return json({ error: "POST only" }, 405, cors);

    let d;
    try { d = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400, cors); }

    // Honeypot: bots fill hidden field -> pretend success, create nothing.
    if (d.hp) return json({ ok: true }, 200, cors);

    const message = (d.message || "").trim();
    if (message.length < 3) return json({ error: "Message required" }, 400, cors);
    if (message.length > 5000) return json({ error: "Message too long" }, 400, cors);

    const category = (d.category || "General").slice(0, 60);
    const billStr = (d.bill || "").slice(0, 80);
    const title = `[Feedback] ${category}${billStr ? " — " + billStr : ""}`;

    const body = [
      `**Category:** ${category}`,
      billStr ? `**Bill / page:** ${billStr}` : "",
      d.page ? `**URL:** ${d.page}` : "",
      d.email ? `**Contact:** ${String(d.email).slice(0, 120)}` : "",
      "",
      "**Feedback**",
      "",
      message,
      "",
      "---",
      `_Submitted via the site feedback form._`
    ].filter(Boolean).join("\n");

    const resp = await fetch(`https://api.github.com/repos/${env.REPO}/issues`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "badbills-feedback-worker",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title, body, labels: ["feedback", "triage"] })
    });

    if (!resp.ok) {
      const detail = (await resp.text()).slice(0, 300);
      return json({ error: "GitHub API error", status: resp.status, detail }, 502, cors);
    }
    const issue = await resp.json();
    return json({ ok: true, url: issue.html_url, number: issue.number }, 200, cors);
  }
};

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}
function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), { status: status || 200, headers: { "Content-Type": "application/json", ...cors } });
}
