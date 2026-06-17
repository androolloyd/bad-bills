# Bad Bills — feedback Worker

A tiny Cloudflare Worker that turns site feedback into a **GitHub Issue** (which then triggers the triage → fix pipeline). Cookieless, no database.

## Flow
```
Feedback form (feedback.js)  →  this Worker  →  GitHub Issue (labels: feedback, triage)
                                                  → .github/workflows/triage.yml  (Claude understands + comments)
                                                  → you comment "@claude implement"
                                                  → .github/workflows/fix.yml      (Claude opens a PR)
                                                  → you merge → GitHub Pages redeploys
```
*If this Worker is ever down, `feedback.js` automatically falls back to opening a pre-filled GitHub "new issue" page, so feedback never breaks.*

## Deploy (5 min)
1. **Create a GitHub token** — a *fine-grained PAT* scoped to **only** the `bad-bills` repo with **Issues: Read and write**. Copy it.
2. **Install Wrangler & log in:**
   ```bash
   npm i -g wrangler
   wrangler login
   ```
3. **From this folder**, add the token as a secret and deploy:
   ```bash
   cd feedback-worker
   wrangler secret put GITHUB_TOKEN      # paste the PAT when prompted
   wrangler deploy
   ```
4. **Wire the endpoint.** Two options:
   - **Same-origin (recommended):** in Cloudflare → Workers → your Worker → **Routes**, add `badbills.ca/api/*`. Then `feedback.js` works as-is (`endpoint: "/api/feedback"`).
   - **workers.dev URL:** if you skip the route, set `endpoint` in `feedback.js` to the `https://badbills-feedback.<you>.workers.dev` URL that `wrangler deploy` printed, then commit.

## One-time: create the issue labels
The Worker stamps `feedback` + `triage`. Create the label set once:
```bash
gh label create feedback        --color FBCA04 --description "User-submitted feedback"  -R androolloyd/bad-bills
gh label create triage          --color D4C5F9 --description "Needs triage"             -R androolloyd/bad-bills
gh label create correction      --color D93F0B --description "Factual correction"        -R androolloyd/bad-bills
gh label create outdated-status --color FEF2C0 --description "Bill status changed"        -R androolloyd/bad-bills
gh label create missing-source  --color 0E8A16 --description "Source/citation issue"      -R androolloyd/bad-bills
gh label create bug             --color B60205 --description "Site bug"                    -R androolloyd/bad-bills
gh label create feature         --color 1D76DB --description "Feature request"            -R androolloyd/bad-bills
gh label create spam            --color 333333 --description "Spam/irrelevant"            -R androolloyd/bad-bills
```

## Test
```bash
curl -X POST https://badbills.ca/api/feedback \
  -H 'Content-Type: application/json' \
  -d '{"category":"Correction to a bill","bill":"C-22","message":"Test: status is now X.","page":"https://badbills.ca/"}'
# -> {"ok":true,"url":"https://github.com/androolloyd/bad-bills/issues/NN","number":NN}
```
