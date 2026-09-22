# StockLana Scout

StockLana Scout is a PreStocks-focused discovery terminal for the Solana Stocklana hackathon. It helps users compare tokenized pre-IPO exposure, simulate an allocation, and generate a concise thesis card that can be shared with a team or community.

## Project structure

```text
.
├── docs/
│   └── SUBMISSION.md     # Hackathon pitch, demo script, and delivery plan
├── src/
│   ├── app.js            # App state, scoring model, filtering, and thesis export
│   ├── index.html        # Static app shell
│   ├── scene.js          # Three.js liquid-metal background scene
│   └── styles.css        # Responsive product UI
├── package.json          # Project metadata and local start script
├── README.md             # Setup and project overview
└── server.js             # Tiny static server for local demos
```

## Why this should win

- Targets the PreStocks bounty directly with a product that drives discovery, research, and decision support.
- Fits the main Stocklana prompt: making stocks on Solana feel more useful than a traditional brokerage account.
- Ships as a fast, no-build web app that can be hosted anywhere and demoed reliably.

## PreStocks integration

The app connects to PreStocks through the local adapter at `GET /api/prestocks`.

That adapter reads the public PreStocks products page, extracts the embedded product payload from the Next.js response, and maps it into the app's research model. It currently pulls live product metadata such as symbol, company name, sector, baseline price, SPL mint address, product route, product logo, and thesis-friendly descriptions.

If the live fetch fails, the browser app falls back to bundled demo data so the hackathon demo remains usable.

## Current product features

- Live PreStocks product universe via `/api/prestocks`
- Search and sector filtering
- Risk-adjusted opportunity scoring
- Simulated allocation sizing
- Saved watchlist in local storage
- Shareable asset URLs with `?asset=SYMBOL`
- Thesis export to clipboard
- Direct PreStocks product links and SPL mint display
- Interactive Three.js liquid-metal background
- Glassmorphism interface styling

## Run locally

```bash
node server.js
```

Then open `http://localhost:5173`.

No dependency install is required.

The Three.js scene loads from the public Three.js CDN at runtime. If the CDN is unavailable, the app still works as a research terminal without the animated background.

## Key docs

- `docs/SUBMISSION.md`: draft submission narrative, pitch, demo flow, and deadline roadmap.

## 3-day delivery plan

Day 1: finish the polished static prototype, product copy, scoring model, and portfolio simulator.

Day 2: improve the live PreStocks data adapter, add wallet-aware UX, and record the core demo flow.

Day 3: final testing, deploy, submit GitHub/live demo/video, and tighten the pitch around PreStocks integration.
