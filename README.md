# ScrapeMaster AI

Enterprise autonomous intelligence platform that turns the public web into a programmable database.

## Stack

- Next.js 14 App Router · TypeScript · Tailwind CSS
- Hybrid extraction: Firecrawl (markdown) + Playwright/Browserless (JS-heavy pages)
- GPT-4o Vision mapping, self-healing selectors, enrichment agent
- TanStack Virtual (12k+ row stream), React Flow canvas, Recharts

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Enables real GPT-4o Vision mapping and company enrichment. Without it, the UI runs a high-fidelity simulation. |
| `FIRECRAWL_API_KEY` | Fast markdown/HTML extraction. |
| `BROWSERLESS_API_KEY` | Remote Playwright for JavaScript-heavy pages. |

Use these only on sites you are authorized to collect.

## Modules

| Route | What it does |
| --- | --- |
| `/` | Command center — hours saved, success rate, live cluster logs |
| `/visual-scraper` | Paste a URL → vision schema cards you can confirm |
| `/live` | Shadow Browser + streaming ops console |
| `/data` | Virtualized 12,000-row stream + AI Data Guard |
| `/enrich` | Enrich company names with LinkedIn, industry, tech, news |
| `/workflows` | Node-based scraping flows |
| `/healing` | Broken-selector detection and auto-repair simulation |
| `/connectors` | Salesforce, HubSpot, Notion, Airtable webhook sync |

## Architecture

```
src/
  app/            # routes + API
  components/     # canvas, dashboard, live, visual-scraper
  lib/agents/     # vision-mapper, healer, enricher, data-guard
  lib/scraper/    # firecrawl, playwright, session, hybrid engine
```

The session layer rotates egress profiles and sticky cookies for **authorized** crawls. Challenge pages are routed to the full browser engine or human review — this product does not ship exploit kits or CAPTCHA solvers.
