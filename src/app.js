const fallbackAssets = [
  {
    ticker: "OPENAIx",
    name: "OpenAI",
    sector: "AI Infrastructure",
    price: 84.12,
    change: 4.8,
    liquidity: 74,
    narrative: 98,
    markup: 42,
    risk: 4,
    address: "PreStocks demo asset",
    bull: "Category-defining AI platform with developer, enterprise, and consumer demand in the same flywheel.",
    bear: "Private valuation expectations are intense, and any slowdown in model advantage could compress enthusiasm quickly."
  },
  {
    ticker: "ANTHx",
    name: "Anthropic",
    sector: "AI Infrastructure",
    price: 1039.93,
    change: -0.9,
    liquidity: 68,
    narrative: 94,
    markup: 35,
    risk: 4,
    address: "PreStocks demo asset",
    bull: "Claude adoption gives this asset a clear public-market story before the company is public.",
    bear: "Compute costs, safety positioning, and competitive pressure can make private-market marks hard to underwrite."
  },
  {
    ticker: "SPCXx",
    name: "SpaceX",
    sector: "Aerospace",
    price: 227.64,
    change: 1.7,
    liquidity: 61,
    narrative: 91,
    markup: 29,
    risk: 3,
    address: "PreStocks demo asset",
    bull: "Starlink, launch cadence, and defense demand create multiple ways for the thesis to work.",
    bear: "Liquidity can be episodic and the valuation already prices in years of operational excellence."
  },
  {
    ticker: "FIGAIx",
    name: "Figure AI",
    sector: "Robotics",
    price: 38.45,
    change: 8.2,
    liquidity: 44,
    narrative: 89,
    markup: 52,
    risk: 5,
    address: "PreStocks demo asset",
    bull: "Humanoid robotics is a huge narrative market, and small float can make discovery powerful.",
    bear: "Execution timelines are long, margins are unknown, and hype can outrun proof."
  },
  {
    ticker: "STRIPEx",
    name: "Stripe",
    sector: "Fintech",
    price: 63.2,
    change: 0.6,
    liquidity: 58,
    narrative: 82,
    markup: 24,
    risk: 2,
    address: "PreStocks demo asset",
    bull: "Durable payments infrastructure with clean IPO comparables and broad institutional recognition.",
    bear: "Growth may look less explosive than AI names, making short-term attention harder to capture."
  },
  {
    ticker: "DATABRx",
    name: "Databricks",
    sector: "Data Platforms",
    price: 71.9,
    change: 2.4,
    liquidity: 52,
    narrative: 84,
    markup: 31,
    risk: 3,
    address: "PreStocks demo asset",
    bull: "Enterprise AI workloads make data infrastructure easier to explain to public-market investors.",
    bear: "Cloud platform competition and complex valuation comps require patience."
  }
];

let assets = [...fallbackAssets];

const state = {
  selected: assets[0],
  search: "",
  sector: "all",
  risk: Number(localStorage.getItem("stocklana-risk") || 3),
  watchlist: new Set(JSON.parse(localStorage.getItem("stocklana-watchlist") || "[]"))
};

const assetGrid = document.querySelector("#assetGrid");
const template = document.querySelector("#assetCardTemplate");
const sectorFilter = document.querySelector("#sectorFilter");
const searchInput = document.querySelector("#searchInput");
const riskSlider = document.querySelector("#riskSlider");
const memoTitle = document.querySelector("#memoTitle");
const memoSubtitle = document.querySelector("#memoSubtitle");
const memoBody = document.querySelector("#memoBody");
const marketCount = document.querySelector("#marketCount");
const averageScore = document.querySelector("#averageScore");
const portfolioValue = document.querySelector("#portfolioValue");
const exportButton = document.querySelector("#exportButton");
const shareButton = document.querySelector("#shareButton");
const dataSource = document.querySelector("#dataSource");
const watchlistCount = document.querySelector("#watchlistCount");
const watchlistChips = document.querySelector("#watchlistChips");

riskSlider.value = String(state.risk);

function scoreAsset(asset) {
  const riskFit = 100 - Math.abs(asset.risk - state.risk) * 18;
  const markupDiscipline = 100 - asset.markup;
  return Math.round(asset.liquidity * 0.24 + asset.narrative * 0.36 + markupDiscipline * 0.22 + riskFit * 0.18);
}

function allocationFor(asset) {
  const score = scoreAsset(asset);
  const base = state.risk * 2.2;
  const riskPenalty = asset.risk > state.risk ? (asset.risk - state.risk) * 1.8 : 0;
  return Math.max(2, Math.min(18, Math.round(base + score / 12 - riskPenalty)));
}

function filteredAssets() {
  return assets
    .filter((asset) => state.sector === "all" || asset.sector === state.sector)
    .filter((asset) => `${asset.name} ${asset.ticker}`.toLowerCase().includes(state.search.toLowerCase()))
    .sort((a, b) => scoreAsset(b) - scoreAsset(a));
}

function renderFilters() {
  sectorFilter.innerHTML = '<option value="all">All sectors</option>';
  const sectors = [...new Set(assets.map((asset) => asset.sector))].sort();
  sectors.forEach((sector) => {
    const option = document.createElement("option");
    option.value = sector;
    option.textContent = sector;
    sectorFilter.append(option);
  });
}

function isWatched(asset) {
  return state.watchlist.has(asset.symbol || asset.ticker);
}

function saveWatchlist() {
  localStorage.setItem("stocklana-watchlist", JSON.stringify([...state.watchlist]));
}

function selectAsset(asset, updateUrl = true) {
  state.selected = asset;

  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set("asset", asset.symbol || asset.ticker);
    window.history.replaceState({}, "", url);
  }

  render();
}

function toggleWatchlist(asset) {
  const id = asset.symbol || asset.ticker;

  if (state.watchlist.has(id)) {
    state.watchlist.delete(id);
  } else {
    state.watchlist.add(id);
  }

  saveWatchlist();
  render();
}

function renderWatchlist() {
  const watchedAssets = assets.filter(isWatched);
  watchlistCount.textContent = `${watchedAssets.length} saved`;
  watchlistChips.innerHTML = "";

  if (watchedAssets.length === 0) {
    const empty = document.createElement("small");
    empty.textContent = "Save assets from the memo.";
    watchlistChips.append(empty);
    return;
  }

  watchedAssets.forEach((asset) => {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.type = "button";
    chip.textContent = asset.symbol || asset.ticker;
    chip.addEventListener("click", () => selectAsset(asset));
    watchlistChips.append(chip);
  });
}

function renderAssets() {
  const matches = filteredAssets();
  assetGrid.innerHTML = "";
  marketCount.textContent = `${assets.length} assets`;
  averageScore.textContent = Math.round(assets.reduce((sum, asset) => sum + scoreAsset(asset), 0) / assets.length);
  portfolioValue.textContent = `$${(10000 + matches.reduce((sum, asset) => sum + asset.change * allocationFor(asset) * 4, 0)).toLocaleString()}`;

  matches.forEach((asset) => {
    const fragment = template.content.cloneNode(true);
    const button = fragment.querySelector(".asset-button");
    button.classList.toggle("active", state.selected.ticker === asset.ticker);
    const logo = fragment.querySelector(".asset-logo");
    logo.hidden = !asset.logo;
    logo.src = asset.logo || "";
    fragment.querySelector(".ticker").textContent = asset.ticker;
    fragment.querySelector(".name").textContent = asset.name;
    fragment.querySelector(".sector").textContent = asset.sector;
    fragment.querySelector(".score").textContent = `${scoreAsset(asset)} scout score`;
    fragment.querySelector(".watch-badge").textContent = isWatched(asset) ? "Saved" : "";
    button.addEventListener("click", () => {
      selectAsset(asset);
    });
    assetGrid.append(fragment);
  });
}

function renderMemo() {
  const asset = state.selected;
  const allocation = allocationFor(asset);
  memoTitle.textContent = `${asset.name} thesis`;
  memoSubtitle.textContent = `${asset.ticker} · $${asset.price.toLocaleString()} · ${asset.change >= 0 ? "+" : ""}${asset.change}% 24h demo move`;
  memoBody.classList.remove("empty");
  memoBody.innerHTML = `
    <div class="memo-block"><strong>Scout score</strong><span class="allocation">${scoreAsset(asset)}/100</span></div>
    <div class="memo-actions">
      <button id="watchButton" type="button">${isWatched(asset) ? "Remove from watchlist" : "Save to watchlist"}</button>
      ${asset.route ? `<a class="memo-link-button" href="${asset.route}" target="_blank" rel="noreferrer">Open on PreStocks</a>` : ""}
    </div>
    <div class="memo-block"><strong>Bull case</strong><p>${asset.bull}</p></div>
    <div class="memo-block"><strong>Bear case</strong><p>${asset.bear}</p></div>
    <div class="memo-block"><strong>Suggested simulated allocation</strong><p><span class="allocation">${allocation}%</span> of a high-conviction PreStocks sleeve. Not financial advice.</p></div>
    <div class="memo-block"><strong>PreStocks link</strong><p>${asset.route ? `<a href="${asset.route}" target="_blank" rel="noreferrer">${asset.route}</a>` : "Fallback demo asset. Live route unavailable."}</p></div>
    <div class="memo-block"><strong>SPL mint</strong><p>${asset.address || "Unavailable"}</p></div>
  `;
  document.querySelector("#watchButton").addEventListener("click", () => toggleWatchlist(asset));
}

function render() {
  renderAssets();
  renderWatchlist();
  renderMemo();
}

searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderAssets();
});

sectorFilter.addEventListener("change", (event) => {
  state.sector = event.target.value;
  renderAssets();
});

riskSlider.addEventListener("input", (event) => {
  state.risk = Number(event.target.value);
  localStorage.setItem("stocklana-risk", String(state.risk));
  render();
});

exportButton.addEventListener("click", async () => {
  const asset = state.selected;
  const text = `StockLana Scout thesis: ${asset.name} (${asset.ticker})
Score: ${scoreAsset(asset)}/100
Simulated allocation: ${allocationFor(asset)}%
Bull: ${asset.bull}
Bear: ${asset.bear}
Built for the Solana Stocklana hackathon and PreStocks bounty.`;

  await navigator.clipboard.writeText(text);
  exportButton.textContent = "Copied";
  setTimeout(() => {
    exportButton.textContent = "Export thesis";
  }, 1600);
});

shareButton.addEventListener("click", async () => {
  const asset = state.selected;
  const url = new URL(window.location.href);
  url.searchParams.set("asset", asset.symbol || asset.ticker);
  await navigator.clipboard.writeText(url.toString());
  shareButton.textContent = "Link copied";
  setTimeout(() => {
    shareButton.textContent = "Share asset";
  }, 1600);
});

async function loadPreStocksProducts() {
  try {
    const response = await fetch("/api/prestocks");

    if (!response.ok) {
      throw new Error(`PreStocks adapter returned ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data.products) || data.products.length === 0) {
      throw new Error("PreStocks adapter returned no products");
    }

    assets = data.products;
    const requestedAsset = new URLSearchParams(window.location.search).get("asset");
    state.selected = assets.find((asset) => asset.symbol === requestedAsset || asset.ticker === requestedAsset) || assets[0];
    dataSource.textContent = `Live PreStocks data · ${new Date(data.fetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  } catch (error) {
    assets = [...fallbackAssets];
    const requestedAsset = new URLSearchParams(window.location.search).get("asset");
    state.selected = assets.find((asset) => asset.symbol === requestedAsset || asset.ticker === requestedAsset) || assets[0];
    dataSource.textContent = "Fallback demo data · PreStocks unavailable";
    console.warn(error);
  }
}

async function init() {
  await loadPreStocksProducts();
  renderFilters();
  render();
}

init();
