# STOKANA

STOKANA is a PreStocks discovery terminal for the Solana Stocklana hackathon.

It helps users browse tokenized pre-IPO assets, compare risk-adjusted opportunities, simulate allocation size, save a watchlist, and export a simple bull/bear thesis.

## What It Does

STOKANA connects to live PreStocks product data through `GET /api/prestocks`. The adapter reads the public PreStocks products page, extracts the embedded product payload, and maps it into the app's research model.

The app shows company names, sectors, baseline prices, SPL mint addresses, PreStocks product routes, logos, thesis notes, opportunity scores, and simulated allocations. If the live fetch fails, it falls back to bundled demo data so the demo still works.

## Features

Live PreStocks product universe, search, sector filters, risk scoring, simulated allocations, saved watchlist, shareable asset links, thesis export, SPL mint display, direct PreStocks links, and an interactive Three.js liquid-metal glass UI.

## Project Structure

```text
.
├── docs/                 # Submission notes and demo script
├── src/                  # Browser app
│   ├── app.js            # Data loading, scoring, watchlist, sharing
│   ├── index.html        # App shell
│   ├── scene.js          # Three.js liquid-metal background
│   └── styles.css        # Glassmorphism UI
├── package.json          # Project metadata
├── README.md             # Project overview
└── server.js             # Static server and PreStocks adapter
```

## Run Locally

```bash
node server.js
```

Open `http://localhost:5173`.

No dependency install is required. The Three.js scene loads from the public Three.js CDN; if it is unavailable, the app still works without the animated background.
