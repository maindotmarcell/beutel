# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Beutel is a non-custodial Bitcoin wallet — a monorepo with a React Native (Expo) mobile app and a Go backend. **Keys never leave the device**: the backend is a stateless read-only proxy for blockchain data via mempool.space.

## Repository Structure

```
beutel/
├── backend/      # Go proxy server (Fiber v2)
└── mobile/       # React Native app (Expo, TypeScript, NativeWind)
```

## Backend (Go)

**Run locally:**
```bash
cd backend
NETWORK=testnet4 go run ./cmd/server
```

**Docker:**
```bash
docker-compose up --build
```

**Environment variables:** `PORT` (default: 3000), `NETWORK` (mainnet | testnet3 | testnet4 | signet, default: mainnet)

**API endpoints:** `GET /health`, `GET /v1/address/{addr}/balance`, `GET /v1/address/{addr}/utxos`, `GET /v1/address/{addr}/transactions`, `GET /v1/fees`, `POST /v1/tx/broadcast`

## Mobile (React Native / Expo)

**Package manager:** pnpm

```bash
cd mobile
pnpm install
pnpm start          # Expo dev server
pnpm run ios
pnpm run android
pnpm run format     # Prettier
```

**Backend URL** is set in `mobile/app.json` under `expo.extra.backendUrl`. Default points to the Railway deployment; override locally as needed.

## Architecture

### Data Flow
1. Mobile fetches UTXOs/fee rates from backend → backend queries mempool.space
2. Mobile builds and signs transactions locally (keys stay on device)
3. Mobile sends pre-signed hex to backend → backend broadcasts

### Mobile Layer (`mobile/src/`)
- **screens/** — Navigation screens (Wallet, Send, Receive, TransactionDetail, Settings)
- **store/** — Zustand stores (`walletStore.ts` is central: wallet lifecycle, balance, transactions, send flow; also `navigationStore.ts`, `themeStore.ts`)
- **services/** — `keyService.ts` (expo-secure-store), `bitcoinService.ts` (signing via @scure/btc-signer), `chainService.ts`
- **api/chainApi.ts** — HTTP client wrapping the backend REST API
- **types/** — Shared TS types (wallet, settings, api)
- **theme/** — Color tokens consumed by Tailwind config (`tailwind.config.ts`)

### Backend Layer (`backend/`)
- `internal/api/` — Fiber handlers + middleware (CORS, logging, recovery) + router
- `internal/chain/` — Provider interface + mempool.space client (`internal/chain/mempool/client.go`). Swap providers here.
- `pkg/types/` — Shared Go types

### Key Libraries
| Side | Library | Purpose |
|---|---|---|
| Mobile | @scure/bip32, bip39 | HD wallet derivation |
| Mobile | @scure/btc-signer | Transaction construction & signing |
| Mobile | expo-secure-store | Secure key storage |
| Mobile | Zustand | State management |
| Mobile | NativeWind + Tailwind | Styling |
| Backend | Fiber v2 | HTTP framework |
| Backend | rs/zerolog | Structured logging |

## TypeScript Path Alias

`@/*` maps to `src/*` (configured in `mobile/tsconfig.json`).
