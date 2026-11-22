import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (_req, res) => {
  res.json({
    name: "TSG Crypto API",
    description: "Paid cryptocurrency market data API",
    endpoints: {
      health: "GET /health",
      prices: "GET /api/prices?ids=bitcoin,ethereum&vs_currencies=usd"
    }
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "tsg-crypto-api" });
});

const payTo = process.env.PAY_TO;
const facilitatorUrl = process.env.FACILITATOR_URL;

if (payTo && facilitatorUrl) {
  const facilitator = new HTTPFacilitatorClient({ url: facilitatorUrl });
  const resourceServer = new x402ResourceServer(facilitator)
    .register("eip155:8453", new ExactEvmScheme());

  app.use(
    paymentMiddleware(
      {
        "GET /api/prices": {
          accepts: {
            scheme: "exact",
            price: "$0.001",
            network: "eip155:8453",
            payTo
          },
          description: "Current USD prices for selected cryptocurrencies",
          mimeType: "application/json"
        }
      },
      resourceServer
    )
  );

  app.get("/api/prices", async (req, res) => {
    try {
      const ids = String(req.query.ids || "bitcoin,ethereum")
        .split(",")
        .map((id) => id.trim().toLowerCase())
        .filter((id) => /^[a-z0-9-]{1,50}$/.test(id))
        .slice(0, 10);

      const currencies = String(req.query.vs_currencies || "usd")
        .split(",")
        .map((currency) => currency.trim().toLowerCase())
        .filter((currency) => /^[a-z]{3,5}$/.test(currency))
        .slice(0, 5);

      if (ids.length === 0 || currencies.length === 0) {
        return res.status(400).json({ error: "Provide valid ids and vs_currencies" });
      }

      const url = new URL("https://api.coingecko.com/api/v3/simple/price");
      url.searchParams.set("ids", ids.join(","));
      url.searchParams.set("vs_currencies", currencies.join(","));

      const response = await fetch(url);
      if (!response.ok) {
        return res.status(502).json({
          error: "Market data provider error",
          providerStatus: response.status
        });
      }

      const data = await response.json();
      return res.json({
        source: "CoinGecko",
        retrievedAt: new Date().toISOString(),
        prices: data
      });
    } catch (error) {
      console.error("Price request failed:", error);
      return res.status(500).json({ error: "Unable to retrieve market data" });
    }
  });
} else {
  console.warn("Paid endpoint is not enabled. Set PAY_TO and FACILITATOR_URL.");
}

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`TSG Crypto API listening on port ${PORT}`);
  });
}

export default app;
