const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "src");
const port = Number(process.env.PORT || 5173);
const prestocksProductsUrl = "https://prestocks.com/products";

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function extractPreStocksProducts(html) {
  const marker = '\\"products\\":';
  const markerIndex = html.indexOf(marker);

  if (markerIndex === -1) {
    throw new Error("PreStocks products payload not found");
  }

  const start = markerIndex + marker.length;
  let depth = 0;
  let end = -1;
  let inString = false;
  let escaped = false;

  for (let index = start; index < html.length; index += 1) {
    const char = html[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString && char === "[") {
      depth += 1;
    }

    if (!inString && char === "]") {
      depth -= 1;

      if (depth === 0) {
        end = index + 1;
        break;
      }
    }
  }

  if (end === -1) {
    throw new Error("PreStocks products payload was incomplete");
  }

  const escapedJson = html.slice(start, end);
  const json = escapedJson.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  return JSON.parse(json);
}

function mapPreStocksProduct(product) {
  const valuation = Number(product.baselineValuationBillions || product.lastRoundValuation || 0);
  const price = Number(product.baselinePrice || product.caplightPrice || product.brokerQuote || 0);

  const markup = product.newsHeadlineValuation && valuation
    ? Math.max(0, Math.min(95, Math.round(((product.newsHeadlineValuation - valuation) / valuation) * 100)))
    : 24;

  return {
    ticker: `${product.symbol}x`,
    symbol: product.symbol,
    name: product.name,
    sector: product.industry || "Private Markets",
    price,
    change: 0,
    liquidity: product.hadronPublishEnabled ? 68 : 44,
    narrative: product.newsHeadlineValuation ? 90 : 78,
    markup,
    risk: product.industry === "AI" || product.industry === "Robotics" ? 4 : 3,
    address: product.splMint,
    route: `https://prestocks.com/products/${product.route}`,
    logo: product.productLogo ? `https://prestocks.com${product.productLogo}` : "",
    bull: product.miniDescription || product.detailedDescription || `${product.name} is listed on PreStocks.`,
    bear: product.hasContraryResearch
      ? "PreStocks flags contrary research for this asset, so valuation and liquidity should be reviewed carefully."
      : "Private-market tokens can have limited liquidity, fast-changing marks, and high valuation uncertainty."
  };
}

async function sendPreStocksProducts(res) {
  try {
    const response = await fetch(prestocksProductsUrl, {
      headers: {
        "User-Agent": "StockLana-Scout/0.1"
      }
    });

    if (!response.ok) {
      throw new Error(`PreStocks responded with ${response.status}`);
    }

    const html = await response.text();
    const products = extractPreStocksProducts(html).map(mapPreStocksProduct);

    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300"
    });
    res.end(JSON.stringify({
      source: prestocksProductsUrl,
      fetchedAt: new Date().toISOString(),
      products
    }));
  } catch (error) {
    res.writeHead(502, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    });
    res.end(JSON.stringify({
      error: error.message
    }));
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/api/prestocks") {
    sendPreStocksProducts(res);
    return;
  }

  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.normalize(path.join(root, pathname));

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": types[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`StockLana Scout running at http://localhost:${port}`);
});
