# TSG Crypto API

A small Express API that serves cryptocurrency spot prices through an x402 payment-gated endpoint.

## Endpoints

- `GET /` — service information
- `GET /health` — health check
- `GET /api/prices?ids=bitcoin,ethereum&vs_currencies=usd` — paid market-data endpoint

## Environment variables

- `PAY_TO` — public EVM wallet address that receives payments on Base.
- `FACILITATOR_URL` — URL of an x402 facilitator that supports Base mainnet (`eip155:8453`).

Copy `.env.example` to `.env` for local development and fill in the values. Never commit `.env` or private keys.

The paid endpoint is enabled only when both variables are configured. It charges **$0.001 USDC per request**.

Market data is retrieved from CoinGecko's public simple-price endpoint.
