/* ===== BillWatch — app logic ===== */
(function () {
  "use strict";

  // ---------- FEDERAL DATA (hand-verified, as of June 17 2026) ----------
  const FED_BILL_BASE = "https://www.parl.ca/legisinfo/en/bill/45-1/";
  const FEDERAL = [
    { num:"C-22", id:"c-22", featured:true, title:"Lawful Access Act, 2026", sponsor:"Public Safety Minister Gary Anandasangaree", status:"In committee (SECU) — passed 2nd reading Apr 20; being rushed before summer", st:"move", risk:"high",
      sum:`The surveillance powers carved out of the border bill (C-2). Lets police and CSIS demand "subscriber information" (name, address, account and device IDs) on a low "reasonable suspicion" threshold without a warrant; adds "confirmation of service" demands with gag orders; metadata retention; and pressures providers to build access capabilities.`,
      forr:`Police say the law predates modern apps and slows serious investigations.`,
      against:`The CCLA and Citizen Lab catalogued its flaws; the Privacy Commissioner, Michael Geist and Fasken call it the central privacy concern of the session. Apple warned it would force companies to break encryption by inserting backdoors.`,
      priv:`The country's highest-stakes privacy fight: warrantless/low-threshold data access, gag orders, encryption backdoors, and U.S. cross-border data demands (CLOUD Act).`,
      who:`Everyone with a phone or internet account; encrypted-service users; journalists and their sources.` },

    { num:"C-2", id:"c-2", featured:true, title:"Strong Borders Act (omnibus origin)", sponsor:"Public Safety Minister Gary Anandasangaree", status:"Stalled at 2nd reading — split into C-12 (law) + C-22", st:"stall", risk:"high",
      sum:`The original 127-page omnibus on border security, immigration/asylum, anti-money-laundering and sweeping new police/CSIS data powers. After a backlash it was split: immigration/border → C-12 (now law); surveillance → C-22 (in committee).`,
      forr:`Targets fentanyl, gun smuggling and organized crime; responds to U.S. border pressure. Splitting the bill was itself a partial concession.`,
      against:`300+ organizations demanded full withdrawal. The government's own Charter Statement flags Section 8 (search/seizure) risks: a lowered warrant standard, warrantless inquiries to banks, hotels, car rentals, doctors and telecoms, and CSIS queries about non-citizens "on no grounds at all." Lawyers call a constitutional challenge inevitable.`,
      priv:`Origin of the surveillance fight — its live concerns now flow through C-12 (enacted) and C-22 (in committee).`,
      who:`Everyone online, mail senders, immigrants and asylum seekers, journalists.` },

    { num:"C-12", id:"c-12", title:"Strengthening Canada's Immigration System and Borders Act", sponsor:"Public Safety Minister Gary Anandasangaree", status:"Law — Royal Assent March 26, 2026", st:"law", risk:"high",
      sum:`The border/immigration half of C-2, now law. Sets new asylum time limits — people in Canada more than a year are barred from a refugee hearing — lets the government pause, cancel or change immigration applications and documents "in the public interest," expands data-sharing, and gives Canada Post authority to open mail in some cases.`,
      forr:`Faster removals, asylum-system integrity, and alignment with U.S. border demands.`,
      against:`The one-year bar can trap genuine refugees; broad ministerial discretion; the Canadian Council for Refugees opposed it.`,
      priv:`Cross-agency/government data-sharing, mail-opening powers, and reduced asylum due process.`,
      who:`Immigrants, refugees, and anyone who receives mail.` },

    { num:"C-8", id:"c-8", featured:true, title:"Cyber Security Act (Telecom Act + Critical Cyber Systems Protection Act)", sponsor:"Public Safety Minister Gary Anandasangaree", status:"Law — Royal Assent June 15, 2026 (S.C. 2026, c.9)", st:"law", risk:"medium",
      sum:`Lets Cabinet and the Industry Minister order telecoms to secure their systems and drop specified vendors, and creates the Critical Cyber Systems Protection Act for finance, telecom, energy, nuclear and transportation (mandatory protections, incident reports, binding directions).`,
      forr:`Real protection for hospitals, banks, grids and pipelines against ransomware and state-backed cyberattacks; aligns Canada with allies.`,
      against:`Sweeping powers with thin independent oversight: orders can be secret and even forbid disclosing that they exist; heavy compliance costs.`,
      priv:`Secrecy/gag provisions mean a company could be ordered to act with no public transparency; security power concentrated in Cabinet.`,
      who:`Telecom/internet customers and operators of critical infrastructure — ultimately everyone.` },

    { num:"C-9", id:"c-9", featured:true, title:"Combatting Hate Act", sponsor:"Justice Minister Sean Fraser", status:"Passed House & Senate (amended June 4) — awaiting final concurrence + Royal Assent", st:"move", risk:"medium",
      sum:`Amends the Criminal Code on hate propaganda and hate crime, creates offences for obstructing access to places of worship, schools and community centres, and toughens penalties for hate-motivated crime.`,
      forr:`Responds to a documented rise in hate incidents and protects people's ability to worship and gather safely; welcomed by many faith and community groups.`,
      against:`The CCLA, Canadian Constitution Foundation, Canadian Labour Congress and several religious groups warn the wording is broad and could chill free expression, good-faith religious teaching, and peaceful protest or picket lines.`,
      priv:`The fight here is free expression and freedom of assembly, not data privacy — outcome depends heavily on how police and courts apply it.`,
      who:`Minority and faith communities (intended protection); protesters, clergy and online commentators (expression risk).` },

    { num:"C-14", id:"c-14", featured:true, title:"Bail and Sentencing Reform Act", sponsor:"Justice Minister", status:"Law — Royal Assent June 15, 2026 (S.C. 2026, c.11)", st:"law", risk:"medium",
      sum:`Makes bail harder via expanded "reverse onus" (the accused must justify release) for repeat/violent crime, auto theft, home invasion, organized crime and infrastructure offences; allows consecutive sentences; and ends house arrest for sexual assault.`,
      forr:`Responds to strong public concern about repeat violent offenders and car theft; targets organized crime; victims' advocates back the sexual-assault change.`,
      against:`The CCLA and Canadian Bar Association warn of Charter Section 7 violations — "no evidence bail causes crime" — more pre-trial jailing of legally-innocent people, and disproportionate impact on Indigenous, Black and racialized people.`,
      priv:`Due process, the presumption of innocence, and equality rights.`,
      who:`Anyone charged before trial; marginalized communities most acutely; crime victims (intended benefit).` },

    { num:"C-34", id:"c-34", featured:true, title:"Safe Social Media Act (enacts the Digital Safety Act)", sponsor:"Minister of Canadian Heritage", status:"In progress (introduced ~June 2026)", st:"move", risk:"high",
      sum:`Would ban under-16s from social media; require platforms to use age verification/estimation (ID upload or AI face-scan); create a Digital Safety Commission (fines up to 3% of global revenue); and add AI-chatbot rules. Verification data is supposed to be discarded after the check.`,
      forr:`Targets youth mental health and online harms, with a regulator that has real teeth.`,
      against:`The CCLA and Michael Geist warn that keeping kids out means every adult must verify too — effectively mandating ID or face-scans to use the internet — and the verification infrastructure is permanent even if the ban is "temporary."`,
      priv:`Age verification becomes identity verification for everyone; biometric/face-scan risks; chills anonymous speech (whistleblowers, abuse survivors, dissidents).`,
      who:`Every social-media user, teens under 16, and platforms.` },

    { num:"C-36", id:"c-36", title:"Protecting Privacy and Consumer Data Act (PIPEDA reform)", sponsor:"Minister of AI & Digital Innovation, Evan Solomon", status:"First reading June 15, 2026 — earliest stage", st:"move", risk:"medium",
      sum:`Replaces Part 1 of PIPEDA (Canada's private-sector privacy law). Adds consent rules, rights to access and delete your data, breach-notification duties, mandatory privacy officers, and rules for AI "automated decision systems" — including an explanation when AI makes a significant decision about you — plus a new compliance commission.`,
      forr:`A long-overdue modernization of consumer privacy with new AI transparency.`,
      against:`The CCLA says it actually erodes federal privacy rights and fails to meaningfully address well-documented AI harms; the strength of the rights depends on enforcement teeth and "legitimate business interest" exceptions.`,
      priv:`Could either strengthen or weaken your data rights — the fine print and final amendments decide.`,
      who:`Every consumer, and every business that handles personal data.` },

    { num:"C-25", id:"c-25", title:"Strong and Free Elections Act", sponsor:"Minister of Democratic Institutions", status:"In Senate committee", st:"move", risk:"medium",
      sum:`Targets foreign interference and deepfakes: extends interference offences to between elections, bans foreign influence on nominations and leadership races, bans crypto/money-order/prepaid donations, tightens third-party foreign funding, and curbs "long-ballot" protests.`,
      forr:`Modernizes election-integrity defences and closes real loopholes.`,
      against:`Watch effects on legitimate third-party advocacy and free political expression, plus how political parties handle voter data.`,
      priv:`Political-party data rules and voter data.`,
      who:`Voters, parties, and advocacy groups.` },

    { num:"C-29", id:"c-29", title:"Financial Crimes Agency Act", sponsor:"Government bill", status:"Second reading", st:"move", risk:"medium",
      sum:`Creates a new standalone federal financial-crime police agency (money laundering, fraud, sanctions evasion, crypto laundering, cyber-enabled crime) with investigative, policing and asset-recovery powers, wired into the Privacy Act, Criminal Code, immigration and sanctions laws.`,
      forr:`Canada has been criticized as weak on money laundering ("snow-washing"); a dedicated agency could finally deliver enforcement.`,
      against:`A powerful new body plugged into financial and personal data — oversight and accountability are the open questions.`,
      priv:`Broad data access across financial and personal records.`,
      who:`The financial sector, suspects, and ordinary account-holders indirectly.` },

    { num:"C-5", id:"c-5", title:"One Canadian Economy Act", sponsor:"Dominic LeBlanc", status:"Law — Royal Assent June 26, 2025 (S.C. 2025, c.2)", st:"law", risk:"medium",
      sum:`Enacts the Free Trade and Labour Mobility in Canada Act and the Building Canada Act — removes interprovincial trade/labour barriers and lets Cabinet fast-track "national-interest" projects, partly bypassing normal review timelines.`,
      forr:`Could boost growth and get pipelines, transmission and housing built faster; a response to the U.S. trade war.`,
      against:`First Nations (incl. Chiefs of Ontario) and environmental groups warn it bypasses meaningful Indigenous consultation and environmental review, with broad Cabinet discretion.`,
      priv:`Minimal data privacy; the civil-liberties concern is Indigenous rights (duty to consult, UNDRIP) and environmental protection.`,
      who:`Indigenous communities, the environment, industry and workers.` },

    { num:"C-4", id:"c-4", title:"Making Life More Affordable for Canadians Act", sponsor:"Finance Minister", status:"Law — Royal Assent March 12, 2026", st:"law", risk:"positive",
      sum:`Cuts the lowest income-tax rate from 15% to 14%, eliminates GST for first-time buyers on new homes up to $1M (reduced up to $1.5M), repeals the consumer carbon price, and changes political parties' personal-information rules.`,
      forr:`Direct cost-of-living relief; the carbon-price repeal was widely popular.`,
      against:`Repeal removes a climate tool and the rebate many lower-income households received; the home-buyer break may partly inflate prices.`,
      priv:`Nationalizes (modest) privacy rules for political parties.`,
      who:`Taxpayers, first-time home buyers, and lower-income households.` },

    { num:"C-3", id:"c-3", title:"Citizenship Act amendment ('Lost Canadians')", sponsor:"Immigration Minister", status:"Law — Royal Assent Nov 20, 2025 (S.C. 2025, c.5)", st:"law", risk:"positive",
      sum:`Restores citizenship-by-descent rights that courts had struck down, fixing the "Lost Canadians" problem.`,
      forr:`Corrects a rights violation and helps affected families.`,
      against:`Limited opposition.`,
      priv:`Minimal.`,
      who:`Canadians born abroad and their children.` },

    { num:"C-19", id:"c-19", title:"Canada Groceries and Essentials Benefit", sponsor:"Finance Minister", status:"Law — Royal Assent Feb 12, 2026", st:"law", risk:"positive",
      sum:`Creates a new income-tested benefit to help with the cost of food and essentials.`,
      forr:`Targeted cost-of-living relief.`,
      against:`Debate over whether the scope and amount are adequate.`,
      priv:`Minimal.`,
      who:`Lower-income households.` },

    { num:"C-16", id:"c-16", title:"Protecting Victims Act", sponsor:"Justice Minister", status:"In committee", st:"move", risk:"positive",
      sum:`Improves disclosure to victims and the submission of victim statements in the corrections/parole process, with child-protection and gender-based-violence measures.`,
      forr:`Strengthens victims' rights in the justice system.`,
      against:`Limited.`,
      priv:`Handling of victim information.`,
      who:`Crime victims.` },

    { num:"C-20", id:"c-20", title:"Build Canada Homes", sponsor:"Government bill", status:"In committee", st:"move", risk:"positive",
      sum:`Stands up a federal housing agency to boost supply, part of the government's housing push.`,
      forr:`Aimed squarely at the housing-affordability crisis.`,
      against:`Questions about execution, cost and how fast it delivers.`,
      priv:`Minimal.`,
      who:`Renters and would-be buyers.` },

    { num:"C-37", id:"c-37", title:"First Nations Clean Water", sponsor:"Indigenous Services", status:"In progress", st:"move", risk:"positive",
      sum:`Creates an enforceable safe-drinking-water framework for First Nations.`,
      forr:`An overdue fix for a long-standing rights and public-health failure.`,
      against:`Questions about funding adequacy and enforcement.`,
      priv:`Minimal.`,
      who:`First Nations communities.` }
  ];

  // ---------- helpers ----------
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const RISK_LABEL = { high:"High concern", medium:"Watch closely", low:"Lower concern", positive:"Rights-positive" };
  const stClass = (st) => st === "law" ? "pill-law" : st === "stall" ? "pill-stall" : "pill-move";
  const slugOf = (key) => (window.OG_SLUGS || {})[key];

  function badge(risk){ return `<span class="badge b-${risk}">${RISK_LABEL[risk]}</span>`; }
  function statusPill(b){ return `<span class="pill ${stClass(b.st)}">${b.status}</span>`; }

  function trackerCard(b, link, og, jur) {
    const more = `
      <div class="more">
        <span class="lab">✅ The case for</span>${b.forr}
        <span class="lab">⚠️ The case against</span>${b.against}
        <span class="lab">🔐 Privacy &amp; civil liberties</span>${b.priv}
        <span class="lab">👥 Who it affects</span>${b.who}
        ${(window.ENRICH && og && window.ENRICH[og] && window.ENRICH[og].factCheck) ? `<span class="lab">✔️ Fact-check</span>${window.ENRICH[og].factCheck}` : ``}
        ${og ? `<span class="lab">🔗 Full page</span><a href="b/${og}.html">Sources, fact-check &amp; commentary →</a>` : ``}
        ${link ? `<span class="lab">🔗 Official</span><a href="${link}" target="_blank" rel="noopener">View on the legislature site →</a>` : ``}
      </div>`;
    return `<article class="card r-${b.risk}">
      <div class="card-top"><span class="card-num">${b.num}</span>${badge(b.risk)}${jur ? `<span class="juris">· ${jur}</span>` : ``}</div>
      <h3>${b.title}</h3>
      <div style="margin:-2px 0 8px">${statusPill(b)}</div>
      <p class="sum">${b.sum}</p>
      ${b.sponsor ? `<p class="sum" style="font-size:13px;color:var(--muted);margin-top:-4px">Sponsor: ${b.sponsor}</p>` : ``}
      ${og ? `<div class="card-share"><a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(b.num + " — " + b.title)}&url=${encodeURIComponent("https://badbills.ca/b/" + og + ".html")}" target="_blank" rel="noopener">𝕏 Share</a> · <a href="b/${og}.html">Full page →</a></div>` : ``}
      <details><summary>Strengths · weaknesses · privacy · who</summary>${more}</details>
    </article>`;
  }

  function redflagCard(b, link, og) {
    return `<article class="rf">
      <div class="rf-head"><span class="rf-num">${b.num}</span>${badge(b.risk)}</div>
      <h3>${b.title}</h3>
      <div style="margin:-4px 0 10px">${statusPill(b)}</div>
      <p class="blurb">${b.sum}</p>
      <h4>✅ The case for</h4><p class="for">${b.forr}</p>
      <h4>⚠️ The case against</h4><p class="against">${b.against}</p>
      <div class="priv"><b>🔐 Privacy &amp; civil liberties:</b> ${b.priv}</div>
      <h4 style="margin-top:12px">👥 Who it affects</h4><p class="for">${b.who}</p>
      <p style="margin-top:12px">${og ? `<a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(b.num + " — " + b.title)}&url=${encodeURIComponent("https://badbills.ca/b/" + og + ".html")}" target="_blank" rel="noopener">𝕏 Share</a> &nbsp;·&nbsp; <a href="b/${og}.html">📚 Sources &amp; commentary →</a>` : ``}${og && link ? ` &nbsp;·&nbsp; ` : ``}${link ? `<a href="${link}" target="_blank" rel="noopener">Official bill page →</a>` : ``}</p>
    </article>`;
  }

  function matches(b, q) {
    if (!q) return true;
    q = q.toLowerCase();
    return [b.num, b.title, b.sum, b.forr, b.against, b.priv, b.who, b.sponsor, b.status]
      .filter(Boolean).join(" ").toLowerCase().includes(q);
  }

  // ---------- FEDERAL render ----------
  function renderFederalRedflags() {
    const host = $("#federal-redflags");
    host.innerHTML = FEDERAL.filter(b => b.featured)
      .map(b => redflagCard(b, FED_BILL_BASE + b.id, slugOf("fed|" + b.num))).join("");
  }
  const fedState = { q:"", risk:"all" };
  function renderFederalTracker() {
    const host = $("#federal-grid");
    const list = FEDERAL.filter(b => (fedState.risk === "all" || b.risk === fedState.risk) && matches(b, fedState.q));
    $("#fed-count").textContent = `${list.length} federal bill${list.length===1?"":"s"} shown`;
    host.innerHTML = list.length ? list.map(b => trackerCard(b, FED_BILL_BASE + b.id, slugOf("fed|" + b.num))).join("")
      : `<div class="empty">No federal bills match that filter.</div>`;
  }

  // ---------- PROVINCES render ----------
  const PROV = window.PROVINCES_DATA || {};
  const PROV_ORDER = ["Nova Scotia","Ontario","Quebec","British Columbia","Alberta","Manitoba","Saskatchewan","New Brunswick","Prince Edward Island","Newfoundland and Labrador"];
  const provState = { name:null, q:"", risk:"all" };

  function provinceNames() {
    const have = Object.keys(PROV);
    const ordered = PROV_ORDER.filter(n => have.includes(n));
    have.forEach(n => { if (!ordered.includes(n)) ordered.push(n); });
    return ordered;
  }

  function buildProvinceChips() {
    const host = $("#province-chips");
    const names = provinceNames();
    if (!names.length) { host.innerHTML = `<span class="muted">Provincial data loading…</span>`; return; }
    if (!provState.name) provState.name = names[0];
    host.innerHTML = names.map(n => {
      const ab = (PROV[n] && PROV[n].abbr) ? PROV[n].abbr : n;
      return `<button class="chip ${n===provState.name?"active":""}" data-prov="${n}">${n} <span class="muted" style="font-weight:600">${ab}</span></button>`;
    }).join("");
    $$("#province-chips .chip").forEach(c => c.addEventListener("click", () => {
      provState.name = c.dataset.prov; provState.q = ""; provState.risk = "all";
      const s = $("#prov-search"); if (s) s.value = "";
      $$('[data-group="prov-risk"] .chip').forEach(x => x.classList.toggle("active", x.dataset.risk === "all"));
      buildProvinceChips(); renderProvince();
    }));
  }

  function renderProvinceContext() {
    const p = PROV[provState.name];
    const host = $("#prov-context");
    if (!p) { host.innerHTML = ""; return; }
    const links = [];
    if (p.billsUrl) links.push(`<a href="${p.billsUrl}" target="_blank" rel="noopener">Official bills list →</a>`);
    if (p.membersUrl) links.push(`<a href="${p.membersUrl}" target="_blank" rel="noopener">Find your member →</a>`);
    const jslug = slugOf("j|" + provState.name);
    if (jslug) links.push(`<a href="j/${jslug}.html">Share this province →</a>`);
    host.innerHTML = `
      <div class="pc-name">${provState.name} <span class="muted" style="font-weight:600;font-size:14px">· ${p.legislature || ""}</span></div>
      <div class="pc-meta"><b>Session:</b> ${p.session || "—"} &nbsp;·&nbsp; <b>Government:</b> ${p.government || "—"}</div>
      ${p.notes ? `<div class="pc-meta" style="margin-top:6px">${p.notes}</div>` : ``}
      ${links.length ? `<div class="pc-links">${links.join(" &nbsp; ")}</div>` : ``}`;
  }

  function renderProvince() {
    renderProvinceContext();
    const p = PROV[provState.name];
    const host = $("#prov-grid");
    if (!p) { host.innerHTML = `<div class="empty">No data yet for this province.</div>`; $("#prov-count").textContent=""; return; }
    const list = (p.bills||[]).filter(b => (provState.risk==="all" || b.risk===provState.risk) && matches(b, provState.q));
    $("#prov-count").textContent = `${list.length} bill${list.length===1?"":"s"} shown for ${provState.name}`;
    host.innerHTML = list.length ? list.map(b => trackerCard(b, p.billsUrl, slugOf(provState.name + "|" + b.num))).join("")
      : `<div class="empty">No bills match that filter for ${provState.name}.</div>`;
  }

  // ---------- GLOBAL SEARCH (all bills) ----------
  const allState = { q: "", jur: "all", risk: "all", status: "all" };
  function allBills() {
    const out = FEDERAL.map(b => ({ b, jur: "Federal", link: FED_BILL_BASE + b.id, og: slugOf("fed|" + b.num) }));
    provinceNames().forEach(n => { const p = PROV[n]; (p.bills || []).forEach(b => out.push({ b, jur: n, link: p.billsUrl, og: slugOf(n + "|" + b.num) })); });
    return out;
  }
  function buildJurSelect() {
    const sel = $("#jur-all"); if (!sel) return;
    sel.innerHTML = ['<option value="all">All legislatures</option>', '<option value="Federal">🇨🇦 Federal</option>']
      .concat(provinceNames().map(n => `<option value="${n}">${n} (${(PROV[n] || {}).abbr || ""})</option>`)).join("");
    sel.value = allState.jur;
  }
  function renderSearch() {
    const host = $("#search-grid"); if (!host) return;
    const all = allBills();
    const q = allState.q.toLowerCase();
    const list = all.filter(e =>
      (allState.jur === "all" || e.jur === allState.jur) &&
      (allState.risk === "all" || e.b.risk === allState.risk) &&
      (allState.status === "all" || e.b.st === allState.status) &&
      (matches(e.b, allState.q) || e.jur.toLowerCase().includes(q))
    );
    const cnt = $("#all-count"); if (cnt) cnt.textContent = `${list.length} of ${all.length} bills`;
    host.innerHTML = list.length ? list.map(e => trackerCard(e.b, e.link, e.og, e.jur)).join("")
      : `<div class="empty">No bills match. Try fewer filters or a different word.</div>`;
  }

  // ---------- filter wiring ----------
  function wireChips(group, onPick) {
    $$(`[data-group="${group}"] .chip`).forEach(c => c.addEventListener("click", () => {
      $$(`[data-group="${group}"] .chip`).forEach(x => x.classList.remove("active"));
      c.classList.add("active"); onPick(c.dataset.risk);
    }));
  }

  function wire() {
    const fs = $("#fed-search"); if (fs) fs.addEventListener("input", e => { fedState.q = e.target.value; renderFederalTracker(); });
    wireChips("fed-risk", r => { fedState.risk = r; renderFederalTracker(); });
    const ps = $("#prov-search"); if (ps) ps.addEventListener("input", e => { provState.q = e.target.value; renderProvince(); });
    wireChips("prov-risk", r => { provState.risk = r; renderProvince(); });
    // global search
    const qa = $("#q-all"); if (qa) qa.addEventListener("input", e => { allState.q = e.target.value; renderSearch(); });
    const ja = $("#jur-all"); if (ja) ja.addEventListener("change", e => { allState.jur = e.target.value; renderSearch(); });
    wireChips("all-risk", r => { allState.risk = r; renderSearch(); });
    $$('[data-group="all-status"] .chip').forEach(c => c.addEventListener("click", () => {
      $$('[data-group="all-status"] .chip').forEach(x => x.classList.remove("active"));
      c.classList.add("active"); allState.status = c.dataset.status; renderSearch();
    }));
  }

  // ---------- theme ----------
  function initTheme() {
    const saved = localStorage.getItem("bw-theme");
    if (saved) document.documentElement.setAttribute("data-theme", saved);
    const btn = $("#themeToggle");
    const sync = () => { btn.textContent = document.documentElement.getAttribute("data-theme") === "dark" ? "☀️" : "🌙"; };
    sync();
    btn.addEventListener("click", () => {
      const dark = document.documentElement.getAttribute("data-theme") === "dark";
      document.documentElement.setAttribute("data-theme", dark ? "light" : "dark");
      localStorage.setItem("bw-theme", dark ? "light" : "dark"); sync();
    });
  }

  // ---------- public hook to inject provinces after load ----------
  window.BillWatch = {
    addProvinces(obj) { Object.assign(PROV, obj); buildProvinceChips(); renderProvince(); buildJurSelect(); renderSearch(); }
  };

  // ---------- init ----------
  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    renderFederalRedflags();
    renderFederalTracker();
    buildProvinceChips();
    renderProvince();
    buildJurSelect();
    renderSearch();
    wire();
  });
})();
