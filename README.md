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

## 1. Setup — get Sepolia keys, ETH, and (optional) services

You need three things before deploying anything: a **wallet**, some **Sepolia test ETH**, and (optionally) a **dedicated RPC endpoint**. None of these cost real money — Sepolia is a free testnet.

### 1.1 Install MetaMask

<https://metamask.io/download/> → install the browser extension → create a wallet.

> **Use a fresh MetaMask account dedicated to this demo.** Don't deploy with a wallet that holds mainnet funds — test contracts get redeployed often and you don't want to leak your main private key into a `.env` file or paste it into Remix.

In MetaMask, switch to the **Sepolia** network (top dropdown → "Show test networks" if hidden → Sepolia).

### 1.2 Get Sepolia test ETH from a faucet

You need a small amount of ETH (less than 0.01) to pay gas for deployment + role grants. Free faucets, in order of reliability:

| Faucet | Notes |
| --- | --- |
| [Alchemy Sepolia faucet](https://www.alchemy.com/faucets/ethereum-sepolia) | Most reliable; requires a free Alchemy account |
| [QuickNode faucet](https://faucet.quicknode.com/ethereum/sepolia) | No login, but rate-limited |
| [Infura faucet](https://www.infura.io/faucet/sepolia) | Requires Infura account |
| [sepoliafaucet.com](https://sepoliafaucet.com/) | Mirror of Alchemy's |

Paste your MetaMask address, solve the captcha, wait ~30 seconds. Verify the balance shows up in MetaMask.

### 1.3 (Optional) Sign up for a dedicated RPC endpoint

The frontend already falls back through three free public RPCs (`publicnode`, `tenderly`, `rpc.sepolia.org`), so a personal endpoint is **not required**. Only sign up if you hit rate limits.

| Provider | Free tier |
| --- | --- |
| [Alchemy](https://alchemy.com/) | Create app → network = Sepolia → copy HTTPS URL |
| [Infura](https://app.infura.io/) | Create project → endpoints → Sepolia → copy URL |

Add the URL to the front of `RPC_URLS` in [`web-static/js/config.js`](web-static/js/config.js).

### 1.4 (Optional) web3.storage token for IPFS uploads

Manufacturer registration tries to upload product metadata + image to IPFS. If you skip this, the form still works — uploads return `mock://…` CIDs and the on-chain record points to nothing real.

To enable real IPFS: <https://web3.storage> → sign up → create an API token → paste into `WEB3_STORAGE_TOKEN` in `config.js`.

### 1.5 Where the deployer "private key" comes in

For browser-based deployment via Remix you **don't need to export your private key** — Remix uses MetaMask's *Injected Provider* and signs transactions directly in the extension. The private key never leaves MetaMask.

If you ever want to deploy from a script (Hardhat / Foundry / a bot), then export it: MetaMask → click your account → ⋮ → *Account details* → *Show private key*. Treat that string like a credit card number; never commit it.

## 2. Smart contract

The single source file is [`contracts/contracts/SupplyChain.sol`](contracts/contracts/SupplyChain.sol). The repo intentionally ships **no `package.json`, no `node_modules`, no Hardhat config** — see [`contracts/README.md`](contracts/README.md) for the full Remix walkthrough.

Quick path (assumes you finished section 1):

1. Open <https://remix.ethereum.org>, drag-and-drop `SupplyChain.sol` into the file explorer.
2. **Solidity compiler** tab → version `0.8.24` → **Compile SupplyChain.sol**.
3. **Deploy & run transactions** tab:
   - **Environment**: *Injected Provider — MetaMask*
   - Confirm MetaMask is on Sepolia
   - **Contract**: `SupplyChain`
   - Constructor arg `admin` = your deployer wallet address (this gets `DEFAULT_ADMIN_ROLE`)
   - Click **Deploy**, confirm in MetaMask
4. Copy the deployed contract address (visible under "Deployed Contracts" in Remix).
5. Paste it into [`web-static/js/config.js`](web-static/js/config.js) as `CONTRACT_ADDRESS`. Bump the `?v=N` query string in `web-static/*.html` so Pages serves the new build immediately. Commit and push.

The deployer wallet automatically holds `DEFAULT_ADMIN_ROLE` and can grant manufacturer / distributor / retailer roles either via the in-app admin page or directly from Remix using `grantRole(role, wallet)`.

## 3. Frontend

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

## 4. Pages

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

## 5. Smart contract API

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

## 6. Deployment

- **Contract** → deploy via Remix (see [`contracts/README.md`](contracts/README.md)). Optional: verify on Etherscan from the Remix plugin.
- **Frontend** → already deployed. Any push to `main` that changes `web-static/` triggers [`.github/workflows/pages.yml`](.github/workflows/pages.yml), which uploads `web-static/` to GitHub Pages.

To deploy elsewhere (Netlify, Cloudflare Pages, S3, nginx) just point the host at `web-static/` — no build step.

## 7. Frontend JS modules

| File | Responsibility |
| --- | --- |
| [`web-static/js/config.js`](web-static/js/config.js) | Chain id, RPC fallback list, contract address, web3.storage token, status labels, ABI |
| [`web-static/js/wallet.js`](web-static/js/wallet.js) | MetaMask connect, network switch, account/chain change events; exposes `Wallet.get()`, `Wallet.onChange()`, `Wallet.getReadProvider()` (an ethers `FallbackProvider` over the configured RPCs); the connected wallet button copies the address on click |
| [`web-static/js/contract.js`](web-static/js/contract.js) | `Chain.readContract()` (read-only over public RPC), `Chain.writeContract()` (signer-bound), `Chain.productIdFrom(serial, batch)`, `Chain.getRole(address)` |
| [`web-static/js/ipfs.js`](web-static/js/ipfs.js) | `IPFS.uploadFile`, `IPFS.uploadJson` against web3.storage; falls back to `mock://` CIDs when the token is empty so the form still works for demos |
| [`web-static/js/ui.js`](web-static/js/ui.js) | `Toast.{info,success,error}`, sidebar/topbar injection (`renderShell`), `renderTimeline`, `statusBadge`, and the "Demo not deployed" banner (`renderConfigBanner`) auto-shown when `CONTRACT_ADDRESS` is unconfigured |

## 8. End-to-end smoke test

1. Deploy `SupplyChain.sol` to Sepolia in Remix; paste the address into `web-static/js/config.js`.
2. Open the live site, connect the admin wallet → `admin.html` → grant `MANUFACTURER_ROLE` to a second wallet.
3. Switch to the manufacturer wallet → `products-new.html` → register a product. The QR + product ID render.
4. Scan the QR with a phone (or open `verify-detail.html?id=…`) → public page loads without a wallet, shows status.
5. From the manufacturer wallet, open `transfer.html?id=…` → transfer to a distributor wallet.
6. Distributor wallet sees the owner controls on the detail page; submit a status update. Reload the public verify page — the new checkpoint appears with an Etherscan-linkable actor.
7. Try updating from a third, unrelated wallet → tx reverts with `not current owner`, UI shows an error toast.

## 9. Security notes

- All on-chain writes are gated by OpenZeppelin `AccessControl` roles or an `onlyOwnerOf(productId)` modifier.
- `nonReentrant` on transfer/status as defensive hardening (no value flows today).
- Inputs are validated client-side and on-chain (`require` statements).
- `.env*` files are gitignored. Never commit `PRIVATE_KEY` or any IPFS upload token.

---

Powered by [Tertiary Infotech Academy Pte Ltd](https://www.tertiarycourses.com.sg/).
