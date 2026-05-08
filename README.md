# Supply Chain Product Identification System

**Live demo (static build):** <https://alfredang.github.io/supplyverify/>

![Supply Verify landing page](docs/screenshot.png)

Blockchain-backed product authenticity, ownership, and movement tracking. Manufacturers register products on-chain; distributors and retailers append checkpoints; customers verify via QR code without a wallet.

Reference inspiration: <https://github.com/shang-yi-qian/Product-Verify>

## Stack

- **Frontend**: Next.js 14 (App Router) · TypeScript · Tailwind CSS · RainbowKit + wagmi v2 + viem
- **Smart contract**: Solidity 0.8.24 · Hardhat · OpenZeppelin `AccessControl`, `ReentrancyGuard`
- **Storage**: Supabase (Postgres) for off-chain mirror; IPFS (web3.storage) for images & metadata JSON
- **QR**: `qrcode` (gen) + `html5-qrcode` (scan)
- **Network**: Sepolia testnet (chainId 11155111); local Hardhat network supported

## Project layout

```
supplychain/
├── contracts/    # Hardhat project — SupplyChain.sol + tests + deploy script
└── web/          # Next.js app — dashboards, registration, verification, QR
```

## 1. Smart contract

```bash
cd contracts
cp .env.example .env          # fill SEPOLIA_RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY
npm install
npm run compile
npm test                      # all tests must pass
```

### Local deploy

```bash
npm run node                  # in one terminal: starts hardhat node on :8545
npm run deploy:local          # in another: deploys + prints address
```

### Sepolia deploy

```bash
npm run deploy:sepolia
# copy the printed address into web/.env.local NEXT_PUBLIC_CONTRACT_ADDRESS
```

The deployer wallet is granted `DEFAULT_ADMIN_ROLE`. Use the admin dashboard (or `grantRole`) to authorise manufacturer / distributor / retailer wallets.

## 2. Web app

```bash
cd web
cp .env.local.example .env.local   # fill in values (see below)
npm install
npm run dev                        # http://localhost:3000
```

Required env (`web/.env.local`):

| Var | Purpose |
| --- | --- |
| `NEXT_PUBLIC_CHAIN_ID` | `11155111` for Sepolia, `31337` for hardhat |
| `NEXT_PUBLIC_RPC_URL` | RPC for the public verify page |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Address printed by deploy script |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | From <https://cloud.walletconnect.com> |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional off-chain mirror |
| `NEXT_PUBLIC_WEB3_STORAGE_TOKEN` | IPFS upload (falls back to mock CID if missing) |
| `NEXT_PUBLIC_SITE_URL` | Used inside QR codes |

## 3. Pages

| Route | Purpose |
| --- | --- |
| `/` | Landing |
| `/connect` | Wallet connect, role-aware redirect |
| `/admin` | Grant manufacturer/distributor/retailer roles |
| `/manufacturer` | Role dashboard, totals |
| `/products/new` | Register a new product (form → IPFS → on-chain) |
| `/products/[id]` | Product detail, status update, QR |
| `/products/[id]/transfer` | Transfer ownership |
| `/verify` | Look up product by serial+batch or raw ID |
| `/verify/[id]` | **Public** verification page (no wallet needed) |
| `/scan` | Camera-based QR scanner |

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

- **Contract** → Sepolia via `npm run deploy:sepolia`. Optional: verify on Etherscan.
- **Frontend** → Vercel. Import the `web/` directory, set the env vars listed above, deploy.

## 6. End-to-end smoke test

1. `cd contracts && npm test` — all green.
2. Deploy to Sepolia, paste address into `web/.env.local`.
3. `cd web && npm run dev`. Open `http://localhost:3000`.
4. Connect admin wallet → `/admin` → grant `MANUFACTURER_ROLE` to a second wallet.
5. Switch to manufacturer wallet → `/products/new` → register a product. The QR + product ID render.
6. Scan the QR with a phone (or open `/verify/[id]`) → public page loads without a wallet, shows status.
7. From the manufacturer wallet, open `/products/[id]/transfer` → transfer to a distributor wallet that has been granted `DISTRIBUTOR_ROLE` (or any wallet — role only gates writes).
8. Distributor wallet sees `isOwner === true` on the detail page; submit a status update. Reload `/verify/[id]` → new checkpoint appears with Etherscan-linkable actor.
9. Try updating from a third, unrelated wallet → tx reverts with `not current owner`, UI shows error toast.
10. Admin or manufacturer can call `recall(id)` (via Etherscan or a future UI button); status flips to `Recalled` and verify page shows the warning state.

## 7. Security notes

- All on-chain writes are gated by OZ `AccessControl` roles or `onlyOwnerOf(productId)`.
- `nonReentrant` on transfer/status as defensive hardening (no value flows today).
- The frontend treats Supabase as an untrusted cache — every authenticity badge re-reads chain.
- `.env*` files are gitignored. Never commit `PRIVATE_KEY` or `WEB3_STORAGE_TOKEN`.
- Inputs are validated client-side (zod-style checks) and on-chain (`require` statements).

## 8. Future work (not in MVP)

- NFT-style certificate of authenticity per product
- CSV batch import for manufacturers
- Multi-chain support (Polygon, Base, Arbitrum)
- Analytics dashboard with on-chain event indexing (The Graph / Ponder)
- Customer ownership claim flow after retail purchase
