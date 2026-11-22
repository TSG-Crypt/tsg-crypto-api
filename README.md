# TSG Crypto API

A small Express API that serves cryptocurrency spot prices through an x402 payment-gated endpoint.

## Endpoints

- `GET /` — service information
- `GET /health` — health check
- `GET /api/prices?ids=bitcoin,ethereum&vs_currencies=usd` — paid market-data endpoint

## Environment variables

- `PAY_TO` — public EVM wallet address that receives payments on Base.
- `CDP_API_KEY_ID` — Coinbase Developer Platform API key ID.
- `CDP_API_KEY_SECRET` — Coinbase Developer Platform API key secret. Keep this private.

The paid endpoint is enabled only when all three variables are configured. It uses the authenticated Coinbase CDP-hosted x402 facilitator and accepts exact USDC payments on Base mainnet (`eip155:8453`).

The endpoint charges **$0.001 USDC per request**.

Market data is retrieved from CoinGecko's public simple-price endpoint.

## Local development

Copy `.env.example` to `.env`, fill in the CDP credentials from the Coinbase Developer Platform, then run:

```bash
npm install
npm start
```

Never commit `.env`, API secrets, or private keys.
