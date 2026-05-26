# HamzaCoin Web3 dApp

> React + Vite + ethers v6 frontend for a learn-to-earn ERC20 on Ethereum Sepolia testnet. Read a Wikipedia article, answer a 5-question AI quiz, claim HMZ from a signature-gated on-chain faucet, then send it anywhere with a custom memo.

![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06b6d4?logo=tailwindcss&logoColor=white)
![Ethers.js](https://img.shields.io/badge/Ethers.js-v6.13-2535a0)
![Network](https://img.shields.io/badge/Network-Sepolia_Testnet-7c3aed)
![License](https://img.shields.io/badge/License-MIT-green)

This is one of three repos. The others are the [smart contracts](https://github.com/tahabakri/hamzacoin-contract) and the [backend](https://github.com/tahabakri/hamzacoin-backend). You need all three running to demo the project end-to-end.

---

## What this is

A browser-based dApp that does three things:

1. **Connects MetaMask** to the Sepolia network and shows your HMZ balance and on-chain transfer history.
2. **Sends HMZ** to any Sepolia address with a custom memo tagged `Tip Friend`, `Cafe Spot`, or `Book Rec`.
3. **Learn & Earn** — picks a Wikipedia article, fetches an AI-generated 5-question quiz from the backend, grades your answers, and claims 1–5 HMZ from a signature-gated on-chain faucet.

Single-page React app, no router, no Redux. State lives in a few custom hooks and gets passed down.

---

## What you'll have when you're done

Follow this guide and you will have:

- The frontend running at `http://localhost:5173`
- A MetaMask wallet connected to Sepolia with some test ETH
- The ability to read, take a quiz, and claim HMZ from the on-chain faucet
- The ability to send HMZ to any wallet with a memo
- A live activity feed showing every HMZ transfer on Sepolia in real time
- A foundation you can fork and reskin into your own coin's website

---

## Live demo

| Property | Value |
| --- | --- |
| **HamzaCoin (ERC20)** | `0x619F30ec004442cdc3BE060FC927A3688054e6c3` |
| **Network** | Sepolia Testnet (chain ID `11155111` / `0xaa36a7`) |
| **Etherscan** | [sepolia.etherscan.io/address/0x619F30ec004442cdc3BE060FC927A3688054e6c3](https://sepolia.etherscan.io/address/0x619F30ec004442cdc3BE060FC927A3688054e6c3) |
| **Smart contract repo** | [github.com/tahabakri/hamzacoin-contract](https://github.com/tahabakri/hamzacoin-contract) |
| **Backend repo** | [github.com/tahabakri/hamzacoin-backend](https://github.com/tahabakri/hamzacoin-backend) |

To add HMZ to MetaMask: **Import Token** → paste the contract address → symbol `HMZ`, decimals `18`.

---

## Tech stack

| Layer | Tool | Version |
| --- | --- | --- |
| Framework | React | 18.3 |
| Build tool | Vite | 5 |
| Language | TypeScript (strict) | 5.5 |
| Styling | TailwindCSS | 3.4 |
| Web3 | ethers.js | 6.13 |
| Icons | `@iconify/react` (Solar Linear set) | 5 |
| WebGL background | Three.js (wave-equation fluid shader) | 0.184 |
| Charts | recharts (lazy-loaded) | 3.8 |
| Confetti | canvas-confetti | 1.9 |
| Sound + haptics | Web Audio API + `navigator.vibrate` | native |
| Fonts | Inter, JetBrains Mono, Bebas Neue, Lora (Google Fonts) | — |

No Redux. No React Query. No router. Anchor-scrolled single page.

---

## Project architecture

```
┌─────────────────────────┐   wikipedia api   ┌─────────────────┐
│  hamzacoin-react        │ ────────────────▶ │  en.wikipedia   │
│  React + Vite + ethers  │ ◀──── article ──── │  (no key)       │
└────────┬────────────────┘                   └─────────────────┘
         │ POST /api/generate-quiz
         │ POST /api/verify-and-sign
         ▼
┌─────────────────────────┐    groq llama 3.3 ┌─────────────────┐
│  hamzacoin-backend      │ ────────────────▶ │   Groq API      │
│  Express + EIP-712      │ ◀──── 5 mcqs ──── │                 │
└────────┬────────────────┘                   └─────────────────┘
         │ signs (user, score, articleHash)
         ▼
┌─────────────────────────┐                   ┌─────────────────┐
│  user's MetaMask        │ ─── claimReward ─▶│ HamzaFaucet     │
│                         │                   │  (Sepolia)      │
└─────────────────────────┘                   └────────┬────────┘
                                                       │ transfer
                                                       ▼
                                               ┌─────────────────┐
                                               │ HamzaCoin ERC20 │
                                               │  (Sepolia)      │
                                               └─────────────────┘
```

This repo is the top-left box. It talks to Wikipedia (no API key needed), to the local backend (which talks to Groq), and to two smart contracts on Sepolia (HamzaCoin for balances/transfers, HamzaFaucet for claims).

---

## How it actually works

1. **You connect MetaMask.** The frontend asks MetaMask for your wallet address and switches you to Sepolia.
2. **You pick a Wikipedia article.** Random, featured (Blockchain, Bitcoin, Ethereum, Cryptography, Computer Science, Distributed Computing), or your own search. The plain-text article is fetched via Wikipedia's API. No key needed.
3. **The backend asks Groq to make 5 questions.** The frontend posts the article text to `POST http://localhost:3001/api/generate-quiz`. The backend turns it into 5 multiple-choice questions via Groq's `llama-3.3-70b-versatile` model and returns the questions without the correct answers.
4. **You answer the questions.** One option per question, no time limit. Keys `1`–`4` work as shortcuts.
5. **The backend grades and signs.** Click *Grade my answers*. The frontend posts your answers to `POST /api/verify-and-sign`. The backend checks them against the cached correct answers, computes a score (0–5), and signs an EIP-712 message `{ user, score, articleHash }` with its private key.
6. **You submit the signature to the smart contract.** The frontend calls `faucet.claimReward(score, articleHash, signature)` from your MetaMask wallet.
7. **The contract verifies and pays out.** It recomputes the same digest, runs `ECDSA.recover` on the signature, checks the signer is the trusted one, marks the claim, and transfers `score × 1 HMZ` to you.
8. **Confetti fires.** A soft ding plays, haptics pulse (on mobile), coffee-colored confetti shoots from the corners, your balance updates, and the win drops into the Recent Moments feed.

---

## Prerequisites

| Tool | Why | How to install / check |
| --- | --- | --- |
| Node.js 18+ | Runs Vite | [nodejs.org](https://nodejs.org) → install LTS. Check: `node --version` |
| Git | Clone the repos | [git-scm.com](https://git-scm.com) → install. Check: `git --version` |
| MetaMask | Wallet that holds test ETH and signs transactions | Browser extension from [metamask.io](https://metamask.io) |
| Sepolia ETH | Pays gas | Free from [faucet.alchemy.com](https://www.alchemy.com/faucets/ethereum-sepolia). 0.05 SepoliaETH is enough for many claims. |
| Groq API key | Used by the backend to write quiz questions | [console.groq.com/keys](https://console.groq.com/keys) → Sign in → API Keys → **Create API Key** → copy. Free tier is enough for development. |
| Backend running locally | Generates and signs quizzes | See Step 3 below. |
| VS Code (recommended) | Editor with TypeScript + Tailwind extensions | [code.visualstudio.com](https://code.visualstudio.com) + the "Tailwind CSS IntelliSense" extension. |

> Use a brand-new MetaMask account that has never held real money. Make this a habit early.

---

## Step-by-step setup

This is a three-piece project. If you're starting from this repo, you still need to set up the other two. Full flow below.

### Step 1: Clone all the repos

```bash
# in any working folder (e.g. C:/Users/you/dev/)
git clone https://github.com/tahabakri/hamzacoin-contract.git
git clone https://github.com/tahabakri/hamzacoin-website.git
git clone https://github.com/tahabakri/hamzacoin-backend.git
```

You should end up with:

```text
your-dev-folder/
├── crypto_class/                  ← contracts
└── hamzacoin-website/
    ├── hamzacoin-react/           ← you are here
    └── hamzacoin-backend/         ← backend
```

### Step 2: Set up the contracts

Follow the README in `crypto_class/`:

```bash
# in crypto_class/
npm install
cp .env.example .env
# fill in PRIVATE_KEY (export from MetaMask, dev wallet only)
# fill in SEPOLIA_RPC_URL (free from dashboard.alchemy.com)

npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
# save the HamzaCoin address (or reuse 0x619F30ec004442cdc3BE060FC927A3688054e6c3)

# add HMZ_CONTRACT_ADDRESS + TRUSTED_SIGNER_ADDRESS to .env
npx hardhat run scripts/deploy-faucet.js --network sepolia
# save the faucet address

$env:FAUCET_ADDRESS="0xYourFaucetAddress"
npx hardhat run scripts/fund-faucet.js --network sepolia
# funds the faucet with 1000 HMZ
```

### Step 3: Set up the backend

```bash
# in hamzacoin-backend/
npm install
cp .env.example .env
# fill in GROQ_API_KEY  (https://console.groq.com/keys)
# fill in SIGNER_PRIVATE_KEY  (same wallet you used as the TRUSTED_SIGNER in Step 2)
# fill in FAUCET_CONTRACT_ADDRESS  (from Step 2)

npm run dev
```

The backend should print:

```text
HamzaCoin backend listening on http://localhost:3001
  signer address:    0x...
  faucet contract:   0x...
```

Smoke test:

```bash
curl http://localhost:3001/health
```

Leave this terminal running.

### Step 4: Set up the frontend (this repo)

In a new terminal:

```bash
# in hamzacoin-react/
npm install
cp .env.example .env
```

Fill in `.env`:

| Variable | What it is | Where to get it |
| --- | --- | --- |
| `VITE_BACKEND_URL` | URL of the local backend that generates and signs quizzes. | `http://localhost:3001` for local dev. |
| `VITE_FAUCET_ADDRESS` | Address of the deployed HamzaFaucet contract. The frontend calls `claimReward` here. | The address printed by `deploy-faucet.js` in Step 2. |

Start the dev server:

```bash
# in hamzacoin-react/
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite gives you hot-module reload — edit a component and the page updates without a refresh.

For a production build:

```bash
# in hamzacoin-react/
npm run build      # tsc + vite build → dist/
npm run preview    # serves dist/ on http://localhost:4173
```

Deploy `dist/` to any static host: Vercel, Netlify, Cloudflare Pages, GitHub Pages, S3. The backend needs separate deployment.

### Step 5: Test the full flow

1. Open `http://localhost:5173`.
2. Click **Connect Wallet** in the top-right. Approve in MetaMask, accept the Sepolia switch.
3. Click **Learn & Earn** in the header. The section scrolls into view.
4. Click **Random article** (or pick a featured one, or search).
5. Read the article. When you reach the end, the **Start Quiz** button activates.
6. Answer the 5 questions. Use keys `1`–`4` to select an option, or click. Arrow buttons navigate.
7. Click **Grade my answers**. The backend grades and signs.
8. See your score (0 to 5). For score > 0 the **Claim X HMZ** button appears.
9. Click claim. MetaMask pops up.
10. Confirm the transaction. ~15 seconds later it confirms.
11. Confetti fires. Your balance updates. The Recent Moments feed shows your new earning.
12. Scroll down to the **Send HMZ** section to send some HMZ to a friend's wallet address with a memo.

### Step 6 (bonus): Deploy your own coin

This site is meant to be cloned and reskinned. To launch your own coin (e.g. `AhmedCoin / AHM`):

1. Fork all the repos.
2. In `crypto_class/`, edit `contracts/HamzaCoin.sol` — change the name and symbol passed to the `ERC20` constructor (and rename the file/contract if you want). Redeploy.
3. Optionally redeploy a new faucet pointing at your new token.
4. In this repo's `src/utils/constants.ts`, update `CONTRACT_ADDRESS` to your token's address. The ABI stays the same — every ERC20 has the same functions.
5. Update `.env` with the new `VITE_FAUCET_ADDRESS`.
6. Retheme: `tailwind.config.js` has a `coffee` color palette (50 → 950). Rename it (e.g. `sand`, `forest`, `ocean`) and change the hex values. Then run a find-and-replace across the components to switch class names. The whole site re-themes.
7. Update meta tags in `index.html` (title, description, OG tags) to match your project.
8. Update this `README.md`.

---

## Folder structure

```text
hamzacoin-react/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── .env.example
└── src/
    ├── main.tsx
    ├── App.tsx                       # composes hooks + sections
    ├── index.css                     # Tailwind + custom keyframes
    ├── vite-env.d.ts                 # types for VITE_* env vars
    ├── types/
    │   └── ethereum.d.ts             # window.ethereum typing
    ├── utils/
    │   ├── constants.ts              # addresses, ABIs, RPC URLs
    │   ├── confetti.ts               # CONFETTI_COLORS + fireSideCannons
    │   ├── errors.ts                 # friendlyError() — Web3 error translator
    │   ├── format.ts                 # formatAddress, formatBalance
    │   ├── network.ts                # ensureSepoliaNetwork (switch + add fallback)
    │   ├── audio.ts                  # Web Audio bell + brown-noise generator
    │   ├── transfers.ts              # groupByDay, computeHolders, topSenders (pure)
    │   └── learnEarn.ts              # featured articles, reading-time, sanitizer
    ├── hooks/
    │   ├── useWallet.ts              # account, chain, connect, disconnect
    │   ├── useHmzContract.ts         # balance, sendHmz, history
    │   ├── useFaucetContract.ts      # claimReward on HamzaFaucet
    │   ├── useFaucetBalance.ts       # polls faucet.faucetBalance() for the hero
    │   ├── useReadOnlyContract.ts    # public JsonRpcProvider + contract
    │   ├── useTotalSupply.ts         # 30s polling, visibility-aware
    │   ├── useTransferEvents.ts      # live contract.on("Transfer")
    │   ├── useTransferHistory.ts     # 50k-block window, derives daily/holders/top
    │   ├── useLatestBlock.ts         # 12s blockNumber poll
    │   ├── useLearnEarnState.ts      # FSM: picking → reading → quizzing → claimed
    │   ├── useLearnEarnProgress.ts   # localStorage of completed articles
    │   ├── useWikipediaArticle.ts    # Wikipedia REST + action APIs, abortable
    │   ├── useAnimatedNumber.ts      # RAF ease-out tween
    │   ├── useRelativeTime.ts        # "X ago" ticker
    │   ├── useSettings.ts            # localStorage prefs (sound / motion / etc)
    │   ├── useSound.ts               # AudioContext + AnalyserNode, bell + ambient
    │   ├── useHaptic.ts              # navigator.vibrate wrapper
    │   ├── useIsMobile.ts            # viewport check
    │   ├── useGhostTransfers.ts      # synthetic transfers in demo mode
    │   ├── useConnectionQuality.ts   # network quality probing
    │   └── useRecipientHistory.ts    # localStorage of past send recipients
    └── components/
        ├── Header.tsx                # nav + block counter + wallet pill
        ├── Hero.tsx                  # headline + token overview + live cards
        ├── About.tsx                 # "What this actually is" + Real / Display
        ├── Capabilities.tsx          # the 3 honest feature cards
        ├── LearnEarn.tsx             # the Learn & Earn section orchestrator
        ├── learn-earn/               # subcomponents for LearnEarn
        │   ├── ArticlePicker.tsx
        │   ├── ArticleReader.tsx
        │   ├── QuizPanel.tsx
        │   ├── ScoreReveal.tsx
        │   ├── ClaimReward.tsx
        │   └── ProgressBar.tsx
        ├── DemoSection.tsx           # Send HMZ wrapper
        ├── SendForm.tsx              # the transfer form + confetti on success
        ├── Stats.tsx                 # the live Recent Moments feed
        ├── NetworkActivity.tsx       # global Transfer event stream
        ├── TransactionMap.tsx        # SVG node-link diagram with particles
        ├── NetworkInsights.tsx       # charts section, lazy-mounted
        ├── DailyVolumeChart.tsx      # recharts AreaChart (lazy-loaded)
        ├── PersonalChart.tsx         # recharts BarChart (lazy-loaded)
        ├── Leaderboard.tsx           # top-10 senders
        ├── BlockCounter.tsx          # live Sepolia block number
        ├── SettingsMenu.tsx          # sound / motion / demo toggles
        ├── StatusBanner.tsx          # error + wrong-network banner
        ├── MobileWalletBanner.tsx    # "open in MetaMask app" prompt
        ├── FluidBackground.tsx       # Three.js wave-equation background
        ├── SpinningCoin.tsx          # Three.js HMZ coin
        ├── CoffeeSteam.tsx           # SVG steam wisps
        ├── AnimatedNumber.tsx        # tween wrapper
        ├── AudioVisualizer.tsx       # canvas frequency bars
        ├── ErrorBoundary.tsx
        ├── LazyMount.tsx             # IntersectionObserver gate
        ├── Technical.tsx             # contract source viewer + Etherscan
        ├── FAQ.tsx
        ├── Creator.tsx
        ├── FinalCTA.tsx
        └── Footer.tsx
```

---

## Common errors

| Error | What it means | Fix |
| --- | --- | --- |
| `could not detect network` | The frontend can't talk to your wallet. | Make sure MetaMask is installed and unlocked. The app prompts to switch to Sepolia automatically. |
| `Faucet not configured` (in the claim box) | `VITE_FAUCET_ADDRESS` in `.env` is empty. | Set it to the address you deployed in Step 2. |
| `Invalid signature` (contract revert) | The backend's `SIGNER_PRIVATE_KEY` doesn't match the `trustedSigner` set on the faucet. | Redeploy the faucet with the matching signer, *or* update the backend `.env`. |
| `Already claimed` (contract revert) | You already claimed for this exact article. | Pick a different article. One claim per `(user, articleHash)`. |
| `Quiz expired or not found` (HTTP 410) | Backend restarted or 1 hour passed. | Click **Change article** and re-fetch the quiz. |
| `Insufficient HMZ in faucet` / `HMZ transfer failed` | The faucet has no tokens left. | Refund it from `crypto_class/`: `npx hardhat run scripts/fund-faucet.js --network sepolia`. |
| CORS error in browser console | Frontend is on a port (e.g. `5175`) the backend doesn't allowlist. | Use port `5173` or `5174`, *or* add yours to the CORS allowlist in `hamzacoin-backend/src/server.ts`. |
| `nonce too high` in MetaMask | MetaMask remembers stale transactions from a previous local node. | MetaMask → Settings → Advanced → **Clear activity tab data**. |
| `429 Too Many Requests` from `/api/generate-quiz` | You hit the per-IP rate limit (20/hour). | Wait, or restart the backend to reset the in-memory limiter. |
| `insufficient funds` for gas | Your wallet has zero or near-zero Sepolia ETH. | Get free Sepolia ETH from [faucet.alchemy.com](https://www.alchemy.com/faucets/ethereum-sepolia). |
| `Backend missing required env var: GROQ_API_KEY` (backend crashes on boot) | You didn't fill in `.env` in `hamzacoin-backend/`. | Set `GROQ_API_KEY`, `SIGNER_PRIVATE_KEY`, `FAUCET_CONTRACT_ADDRESS`. |

---

## Security warnings

- **Never push your `.env` file to GitHub.** The `.gitignore` already excludes it, but always double-check `git status` before committing.
- **Never paste your private key into a chat with an AI assistant, support form, Discord channel, or Telegram group.** No one legitimate needs your private key, ever.
- **Use a fresh wallet for development.** Create a new MetaMask account that has no mainnet money on it.
- **This is a testnet project.** HMZ has no monetary value. Sepolia ETH is free from faucets. Nothing here is real money.
- **The backend's `SIGNER_PRIVATE_KEY` controls who can mint rewards.** Anyone who has it can sign valid claims for any score. If you suspect it's leaked, redeploy the faucet or call `setTrustedSigner` with a fresh wallet.
- **Fund the faucet only with what you're prepared to lose.** Even on testnet, a misconfigured signer key can drain the full balance.

---

## What I learned building this

- **MetaMask + ethers v6** — `BrowserProvider`, signers, `eth_requestAccounts`, the 4902 chain-not-added fallback, `accountsChanged` / `chainChanged` listeners, cleanup on unmount.
- **Custom React hooks for Web3 state** — instead of context or Redux, the wallet, the contracts, and the FSM each live in their own hook. Components stay dumb.
- **ethers v6 changes from v5** — `BigNumber` is gone (everything is `bigint`), `Web3Provider` became `BrowserProvider`, `utils.*` got flattened.
- **EIP-712 typed-data signing** — what the wallet pop-up sees, why the domain/types/value must match the contract byte-for-byte, how `signTypedData` and `ECDSA.recover` come back together.
- **Reading on-chain events** — `contract.queryFilter(contract.filters.Transfer(from, to), fromBlock, toBlock)` to backfill history, then `contract.on("Transfer")` for live updates.
- **TypeScript strict + external APIs** — typing `window.ethereum`, narrowing thrown errors, `as const` on ABIs so ethers can infer the function signatures, `ImportMeta.env` typing for `VITE_*` vars.
- **WebGL shaders** — wave-equation fluid simulation with ping-pong render targets, mouse-impulse forces, the basics of vertex + fragment shaders.
- **Web Audio synthesis** — generating a bell sound and ambient brown noise from primitives, no audio file shipped.
- **`prefers-reduced-motion`** — gating animations both with CSS media queries and a user-overridable settings menu.
- **JSON-only LLM prompts** — telling Groq to respond with only JSON, validating the structure server-side before trusting it.

---

## Architecture deep-dive

### Custom React hooks

All Web3 state lives in a few hooks. Components are dumb.

**`useWallet`** ([src/hooks/useWallet.ts](src/hooks/useWallet.ts)) owns:
- `account`, `chainId`, `provider`, `isConnecting`, `isCorrectNetwork`, `error`
- `connect()`, `disconnect()`, `ensureSepolia()`, `clearError()`

**`useHmzContract`** ([src/hooks/useHmzContract.ts](src/hooks/useHmzContract.ts)) owns:
- `balance`, `balanceError`, `isLoadingBalance`
- `txStatus`, `isTxPending`
- `recentTransfers`
- `sendHmz()`, `refreshBalance()`, `appendLocalTransfer()`

**`useFaucetContract`** ([src/hooks/useFaucetContract.ts](src/hooks/useFaucetContract.ts)) owns:
- `txStatus`, `isClaimPending`
- `claim({ score, articleHash, signature })`, `reset()`

**`useFaucetBalance`** ([src/hooks/useFaucetBalance.ts](src/hooks/useFaucetBalance.ts)) reads the faucet's HMZ balance every 30 s so the Hero card can show "Faucet has N HMZ" honestly.

**`useLearnEarnState`** ([src/hooks/useLearnEarnState.ts](src/hooks/useLearnEarnState.ts)) is a `useReducer`-based FSM: `picking → reading → quizzing → grading → scoring → claiming → claimed`.

### Separation of concerns

```text
window.ethereum  ──►  utils/network.ts    ──►  hooks/useWallet.ts     ──►  components/*
                      utils/constants.ts  ──►  hooks/useHmzContract   ──►
                      utils/confetti.ts   ──►  hooks/useFaucetContract ──►
                      utils/errors.ts     ──►
```

Components import from hooks. Hooks import from utils. Utils never import from components or hooks.

### Type-safe contracts

ABIs are `as const`-asserted in [src/utils/constants.ts](src/utils/constants.ts). ethers v6 infers the function signatures from the ABI, so calls like `contract.transfer(recipient, parsedAmount)` get checked at compile time. Return types come back as `bigint`, not `BigNumber`.

`window.ethereum` is typed in [src/types/ethereum.d.ts](src/types/ethereum.d.ts).

---

## Using on mobile

The dApp is responsive from 320 px upward and ships PWA-style metadata.

### Signing transactions

Mobile Safari and Chrome cannot run the MetaMask browser extension. To sign HMZ transfers from a phone you need **MetaMask Mobile**:

1. **Open the site in MetaMask's in-app browser.** Tap the banner at the top of the page that says *"On mobile? Open this in the MetaMask app for full Web3 access."* It links to:

   ```text
   https://metamask.app.link/dapp/<your-host>/
   ```

   You can also paste this URL straight into MetaMask Mobile's address bar.

2. **Open the site in regular Safari / Chrome** to read on-chain data (balances, transfer feed, charts) without connecting a wallet.

If you're already inside MetaMask Mobile (UA contains `MetaMaskMobile`), the banner stays hidden.

### Performance on mobile

Heavy visual features auto-downscale on small viewports:

| Feature | Desktop | Mobile (≤ 768 px) |
| --- | --- | --- |
| Fluid background render target | × 1.0 | × 0.6 (× 1.25 dpr cap) |
| Spinning coin geometry | 96 segments | 32 segments |
| Spinning coin face texture | 512 px | 256 px |
| Transaction map particles | up to 14 | up to 6 |
| Map ambient interval | 850 ms | 1400 ms |
| Audio visualizer bars | 32 | 24 |

Sections below the fold (`TransactionMap`) are wrapped in `IntersectionObserver` and only start their render loop once they're scrolled near.

---

## How to use this as a template for your own coin

1. Fork all three repos on GitHub.
2. Pick your coin's name + symbol (e.g. `AhmedCoin / AHM`).
3. In `crypto_class/`, rename the contract and redeploy. Save the new addresses (see that repo's README).
4. In this repo's `src/utils/constants.ts`, update `CONTRACT_ADDRESS` to your new token's address. The ABI works for any ERC20 — no other change needed for sends.
5. Update `.env`: `VITE_FAUCET_ADDRESS` to your new faucet.
6. **Retheme the site.** `tailwind.config.js` has a `coffee` color palette (50–950) that every component references. Rename it (e.g. `sand`, `forest`, `ocean`) and update the hex values. Then find-and-replace `coffee-` across the source. The whole site re-themes.
7. Update text and imagery: edit the headline + subtitle in `src/components/Hero.tsx`, the feature cards in `src/components/Capabilities.tsx`, the FAQ in `src/components/FAQ.tsx`, the Creator attribution.
8. Update meta tags in `index.html` (title, description, og:* tags) to match your project.
9. Update each `package.json` `name` field.
10. Update this `README.md` to describe your project.

The whole site is structured so that swapping the coin name, symbol, address, and color palette gives you a fresh-looking site in an afternoon.

---

## License

[MIT](LICENSE) — use it, change it, ship something cool.

---

## Credits

- Built by [Taha Bakri](https://github.com/tahabakri) as a learning project.
- Bitcoin whitepaper — Satoshi Nakamoto (2008).
- [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts) for the audited ERC20 and EIP-712 base classes the smart contracts inherit from.
- [Groq](https://groq.com) for fast LLM inference (Llama 3.3 70B).
- [Wikipedia](https://www.wikipedia.org) for the article content the quiz pulls from (CC BY-SA).
- [Iconify](https://iconify.design) — Solar Linear icon set.

---

## Companion repos

- **Smart contracts**: [github.com/tahabakri/hamzacoin-contract](https://github.com/tahabakri/hamzacoin-contract)
- **Frontend (this repo)**: [github.com/tahabakri/hamzacoin-website](https://github.com/tahabakri/hamzacoin-website)
- **Backend**: [github.com/tahabakri/hamzacoin-backend](https://github.com/tahabakri/hamzacoin-backend)
