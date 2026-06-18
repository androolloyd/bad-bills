import { FEDERAL } from './federal.mjs';
import { PROVINCES } from './provinces.mjs';
import { ENRICH } from './enrich.mjs';
import { VOTES } from './votes.mjs';
import { SLUGS } from './slugs.mjs';

export { FEDERAL, PROVINCES, ENRICH, VOTES, SLUGS };

export const SITE = 'https://badbills.ca';
export const UPDATED = 'June 18, 2026';
export const FED_BILL_BASE = 'https://www.parl.ca/legisinfo/en/bill/45-1/';
export const PROV_ORDER = [
  'Nova Scotia', 'Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba',
  'Saskatchewan', 'New Brunswick', 'Prince Edward Island', 'Newfoundland and Labrador',
  'Yukon', 'Northwest Territories', 'Nunavut',
];
export const RISK_LABEL = { high: 'High concern', medium: 'Watch closely', low: 'Lower concern', positive: 'Rights-positive' };

export function provinceNames() {
  const have = Object.keys(PROVINCES);
  const o = PROV_ORDER.filter((n) => have.includes(n));
  have.forEach((n) => { if (!o.includes(n)) o.push(n); });
  return o;
}

export function allBills() {
  const out = [];
  FEDERAL.forEach((b) => {
    const slug = SLUGS['fed|' + b.num];
    out.push({ b, jur: 'Federal', section: 'federal', slug, og: ENRICH[slug], vote: VOTES[b.num] || null, link: FED_BILL_BASE + b.id });
  });
  provinceNames().forEach((n) => {
    const p = PROVINCES[n];
    (p.bills || []).forEach((b) => {
      const slug = SLUGS[n + '|' + b.num];
      out.push({ b, jur: n, section: 'provinces', slug, og: ENRICH[slug], vote: null, link: p.billsUrl });
    });
  });
  return out;
}

export const TOTAL = allBills().length;

export function jurisdictions() {
  const list = [{
    slug: SLUGS['j|Federal — Parliament of Canada'] || 'federal',
    name: 'Federal', label: 'Federal — Parliament of Canada', section: 'federal', bills: FEDERAL,
    meta: { legislature: 'Parliament of Canada', session: '45th Parliament, 1st session',
      government: 'Liberal majority under Prime Minister Mark Carney',
      billsUrl: 'https://www.parl.ca/legisinfo', membersUrl: 'https://www.ourcommons.ca/members/en', notes: '' },
  }];
  provinceNames().forEach((n) => {
    const p = PROVINCES[n];
    list.push({ slug: SLUGS['j|' + n] || (p.abbr || n).toLowerCase(), name: n, label: n, section: 'provinces', bills: p.bills || [], meta: p });
  });
  return list;
}

export function billBySlug(slug) { return allBills().find((x) => x.slug === slug); }
export function jurBySlug(slug) { return jurisdictions().find((j) => j.slug === slug); }

// concern-level breakdown (for the donut on the home page)
export function riskBreakdown() {
  const c = { high: 0, medium: 0, low: 0, positive: 0 };
  allBills().forEach((x) => { c[x.b.risk] = (c[x.b.risk] || 0) + 1; });
  return c;
}
