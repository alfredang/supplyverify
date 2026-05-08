# Supply Chain Product Identification System

**Live demo:** <https://alfredang.github.io/supplyverify/>

![Supply Verify landing page](docs/screenshot.png)

Blockchain-backed product authenticity, ownership, and movement tracking. Manufacturers register products on-chain; distributors and retailers append checkpoints; customers verify via QR code without a wallet.

Reference inspiration: <https://github.com/shang-yi-qian/Product-Verify>

## Stack

- **Frontend** — plain HTML, CSS, and vanilla JavaScript. No build step, no bundler, no Node runtime.
  - Tailwind CSS via Play CDN
  - ethers.js v6 (UMD bundle) for all chain calls
  - `qrcode` for QR generation, `html5-qrcode` for camera scanning
  - `lucide` icons
  - MetaMask via `window.ethereum`
- **Smart contract** — Solidity 0.8.24 using OpenZeppelin `AccessControl` + `ReentrancyGuard`. Compiled and deployed via [Remix](https://remix.ethereum.org) — the repo ships **no Node toolchain** at all.
- **Network** — Sepolia testnet (chainId 11155111). Hardhat local network supported for development.
- **Hosting** — GitHub Pages, deployed automatically via GitHub Actions on every push to `main` that touches `web-static/`.

## Project layout

```
supplychain/
├── contracts/      # Just SupplyChain.sol + a Remix walkthrough — no Node tooling
└── web-static/     # Frontend — pure HTML/CSS/JS (deployed to GitHub Pages)
```

## 1. Smart contract

The single source file is [`contracts/contracts/SupplyChain.sol`](contracts/contracts/SupplyChain.sol). The repo intentionally ships **no `package.json`, no `node_modules`, no Hardhat config** — see [`contracts/README.md`](contracts/README.md) for the Remix-based compile/deploy walkthrough.

Quick path:

1. Open <https://remix.ethereum.org>, drop in `SupplyChain.sol`.
2. Compile with Solidity `0.8.24`.
3. **Deploy & run** → *Injected Provider — MetaMask* on Sepolia → constructor `admin` = your wallet.
4. Copy the deployed address into [`web-static/js/config.js`](web-static/js/config.js) → `CONTRACT_ADDRESS`.

The deployer wallet automatically holds `DEFAULT_ADMIN_ROLE` and can grant manufacturer / distributor / retailer roles either via the admin page or directly from Remix.

## 2. Frontend

The frontend is plain static files — open them with any HTTP server. The camera QR scanner needs an `http(s)://` origin (it won't work over `file://`).

```bash
cd web-static
python3 -m http.server 3100   # or:  npx serve -l 3100
```

Open <http://localhost:3100>.

### Configure

Edit [`web-static/js/config.js`](web-static/js/config.js) — values are inlined, no `.env`:

```js
window.APP_CONFIG = {
  CHAIN_ID: 11155111,                 // 11155111 Sepolia, 31337 Hardhat local
  CHAIN_NAME: "Sepolia",
  RPC_URLS: [                         // viem-style FallbackProvider list — first that responds wins
    "https://ethereum-sepolia-rpc.publicnode.com",
    "https://sepolia.gateway.tenderly.co",
    "https://rpc.sepolia.org",
  ],
  CONTRACT_ADDRESS: "0x…",            // paste the deployed SupplyChain address
  WEB3_STORAGE_TOKEN: "",             // optional — empty falls back to mock CIDs
  EXPLORER: "https://sepolia.etherscan.io",
};
```

While `CONTRACT_ADDRESS` is the zero address, every dashboard page renders a **"Demo not deployed"** banner explaining what's needed; chain reads/writes are skipped instead of throwing cryptic errors. Once a real address is set, the banner disappears and the site goes fully live.

> **Cache-busting:** all `<script src="js/...">` and `<link href="css/...">` tags carry a `?v=N` query string. Bump the number whenever you edit `js/*.js` or `css/styles.css` so visitors fetch the new build (Pages and browsers otherwise hold the old version for ~10 min).

## 3. Pages

| Page | URL | Purpose |
| --- | --- | --- |
| Landing | `index.html` | Hero + features |
| Connect | `connect.html` | MetaMask connect, role-aware redirect |
| Admin | `admin.html` | Grant manufacturer/distributor/retailer roles |
| Manufacturer | `manufacturer.html` | Role dashboard, totals, quick links |
| Register | `products-new.html` | Form → IPFS → on-chain → QR |
| Product detail | `product.html?id=0x…` | Detail, status update, QR |
| Transfer | `transfer.html?id=0x…` | Transfer ownership |
| Verify (lookup) | `verify.html` | Look up by serial+batch or raw id |
| Public verify | `verify-detail.html?id=0x…` | **No-wallet** authenticity page (QR target) |
| Scan | `scan.html` | Camera-based QR scanner |

Dynamic routes use `?id=…` query strings — no router required.

The public verify page (`verify-detail.html`) distinguishes three failure modes instead of one:

- **Demo not deployed** — `CONTRACT_ADDRESS` is the zero address.
- **Could not reach the network** — RPC call failed; all configured `RPC_URLS` were unreachable.
- **Not authentic** — the contract responded but no product matches that id.

## 4. Smart contract API

```
registerProduct(bytes32 id, uint64 expiresAt, string metadataCID)   // MANUFACTURER_ROLE
updateStatus(bytes32 id, Status s, string location, string note)    // current owner
transferOwnership(bytes32 id, address to, Status s, string loc)     // current owner
addCheckpoint(bytes32 id, string location, string note)             // current owner
flagSuspicious(bytes32 id)                                          // admin or manufacturer
recall(bytes32 id)                                                  // admin or manufacturer

verify(bytes32 id) → (Product, bool exists)                         // public view
getHistory(bytes32 id) → Checkpoint[]                               // public view
```

`bytes32 id = keccak256(serialNumber + "|" + batchNumber)` — serial+batch must be unique.

Statuses: `Manufactured`, `InWarehouse`, `InTransit`, `ReceivedByDistributor`, `ReceivedByRetailer`, `SoldToCustomer`, `Recalled`, `Suspicious`.

## 5. Deployment

- **Contract** → deploy via Remix (see [`contracts/README.md`](contracts/README.md)). Optional: verify on Etherscan from the Remix plugin.
- **Frontend** → already deployed. Any push to `main` that changes `web-static/` triggers [`.github/workflows/pages.yml`](.github/workflows/pages.yml), which uploads `web-static/` to GitHub Pages.

To deploy elsewhere (Netlify, Cloudflare Pages, S3, nginx) just point the host at `web-static/` — no build step.

## 6. Frontend JS modules

| File | Responsibility |
| --- | --- |
| [`web-static/js/config.js`](web-static/js/config.js) | Chain id, RPC fallback list, contract address, web3.storage token, status labels, ABI |
| [`web-static/js/wallet.js`](web-static/js/wallet.js) | MetaMask connect, network switch, account/chain change events; exposes `Wallet.get()`, `Wallet.onChange()`, `Wallet.getReadProvider()` (an ethers `FallbackProvider` over the configured RPCs); the connected wallet button copies the address on click |
| [`web-static/js/contract.js`](web-static/js/contract.js) | `Chain.readContract()` (read-only over public RPC), `Chain.writeContract()` (signer-bound), `Chain.productIdFrom(serial, batch)`, `Chain.getRole(address)` |
| [`web-static/js/ipfs.js`](web-static/js/ipfs.js) | `IPFS.uploadFile`, `IPFS.uploadJson` against web3.storage; falls back to `mock://` CIDs when the token is empty so the form still works for demos |
| [`web-static/js/ui.js`](web-static/js/ui.js) | `Toast.{info,success,error}`, sidebar/topbar injection (`renderShell`), `renderTimeline`, `statusBadge`, and the "Demo not deployed" banner (`renderConfigBanner`) auto-shown when `CONTRACT_ADDRESS` is unconfigured |

## 7. End-to-end smoke test

1. Deploy `SupplyChain.sol` to Sepolia in Remix; paste the address into `web-static/js/config.js`.
2. Open the live site, connect the admin wallet → `admin.html` → grant `MANUFACTURER_ROLE` to a second wallet.
3. Switch to the manufacturer wallet → `products-new.html` → register a product. The QR + product ID render.
4. Scan the QR with a phone (or open `verify-detail.html?id=…`) → public page loads without a wallet, shows status.
5. From the manufacturer wallet, open `transfer.html?id=…` → transfer to a distributor wallet.
6. Distributor wallet sees the owner controls on the detail page; submit a status update. Reload the public verify page — the new checkpoint appears with an Etherscan-linkable actor.
7. Try updating from a third, unrelated wallet → tx reverts with `not current owner`, UI shows an error toast.

## 8. Security notes

- All on-chain writes are gated by OpenZeppelin `AccessControl` roles or an `onlyOwnerOf(productId)` modifier.
- `nonReentrant` on transfer/status as defensive hardening (no value flows today).
- Inputs are validated client-side and on-chain (`require` statements).
- `.env*` files are gitignored. Never commit `PRIVATE_KEY` or any IPFS upload token.

---

Powered by [Tertiary Infotech Academy Pte Ltd](https://www.tertiarycourses.com.sg/).
