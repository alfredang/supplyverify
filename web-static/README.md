# Supply Verify · static HTML/CSS/JS version

Plain HTML / CSS / vanilla JavaScript port of the Next.js app. Same UI, same flows, no build step.

## Stack (all via CDN, no `npm install` for the frontend)

- **Tailwind CSS** — `cdn.tailwindcss.com` (Play CDN)
- **ethers.js v6** — `cdn.jsdelivr.net/npm/ethers@6.13.2`
- **qrcode** — generation
- **html5-qrcode** — camera scanning
- **lucide** — icons (replaces `lucide-react`)

The smart contract package (`../contracts/`) is unchanged — deploy it the same way.

## Run locally

You can't `file://` open these (the camera + ESM-friendly modules need an `http(s)://` origin and the script-tag CORS rules are happier on a local server). Pick any static server:

```bash
cd web-static
python3 -m http.server 3100
# or
npx serve -l 3100
```

Open <http://localhost:3100>.

## Configure

Edit [js/config.js](js/config.js) — values are inlined, no `.env`:

```js
window.APP_CONFIG = {
  CHAIN_ID: 11155111,                 // 11155111 Sepolia, 31337 Hardhat local
  CHAIN_NAME: "Sepolia",
  RPC_URL: "https://rpc.sepolia.org", // public read RPC
  CONTRACT_ADDRESS: "0x…",            // paste the deployed SupplyChain address
  WEB3_STORAGE_TOKEN: "",             // optional — empty falls back to mock CIDs
  EXPLORER: "https://sepolia.etherscan.io",
};
```

## File map

| Page | URL | Purpose |
| --- | --- | --- |
| Landing | `index.html` | Hero + features |
| Connect | `connect.html` | MetaMask, role-aware redirect |
| Admin | `admin.html` | Grant manufacturer/distributor/retailer roles |
| Manufacturer | `manufacturer.html` | Role dashboard + totals |
| Register | `products-new.html` | Form → IPFS → on-chain → QR |
| Product detail | `product.html?id=0x…` | Detail, status update, QR |
| Transfer | `transfer.html?id=0x…` | Transfer ownership |
| Verify (lookup) | `verify.html` | Look up by serial+batch or raw id |
| Public verify | `verify-detail.html?id=0x…` | No-wallet authenticity page (QR target) |
| Scan | `scan.html` | Camera QR scanner |

Dynamic routes from the Next.js version (`/products/[id]`, `/verify/[id]`) become query strings (`?id=…`).

## What replaced what

| Next.js version | Static version |
| --- | --- |
| `wagmi` + `viem` | `ethers.js` v6 in `js/contract.js` |
| RainbowKit modal | Custom MetaMask button in `js/wallet.js` |
| `sonner` toasts | `Toast` helper in `js/ui.js` |
| App Router file routes | Multiple HTML files + `?id=` query strings |
| Server component verify page | Client-side fetch using public RPC |
| `lucide-react` | `lucide` UMD bundle, `data-lucide="…"` attrs |
| TS types / build | None — single HTML files load directly |

## Deploy

Anything that serves static files works: GitHub Pages, Netlify, Cloudflare Pages, Vercel (drag the folder), nginx, S3+CloudFront. No server runtime required.

## Trade-offs vs the Next.js version

- **No SSR** on `verify-detail.html` — the page mounts, then fetches on-chain. There's a brief "Verifying on-chain…" state.
- **No type safety / HMR** during development.
- **Tailwind Play CDN** is dev-grade; for production swap in a pre-built CSS file (`tailwindcss -i input.css -o styles.css --minify`).
- **MetaMask only** — RainbowKit's broader connector list (Coinbase, WalletConnect, etc.) is gone.

Functionality and visual design are unchanged.
