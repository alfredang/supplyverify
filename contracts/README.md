# SupplyChain smart contract

Single Solidity file: [`contracts/SupplyChain.sol`](contracts/SupplyChain.sol).

The project deliberately ships **no Node toolchain** — no `package.json`, no `node_modules`, no Hardhat. Use any browser-based or Rust-based workflow to compile, test, or deploy.

## Compile + deploy with Remix (zero install)

1. Open <https://remix.ethereum.org>.
2. Drag-and-drop `contracts/SupplyChain.sol` into the file explorer (or paste the file contents into a new tab).
3. **Solidity compiler** tab → set version `0.8.24`, click **Compile**.
4. **Deploy & run transactions** tab:
   - **Environment**: *Injected Provider — MetaMask*. Switch MetaMask to Sepolia first.
   - **Contract**: `SupplyChain`.
   - **Constructor arg `admin`**: paste your deployer wallet (it gets `DEFAULT_ADMIN_ROLE`).
   - Click **Deploy**, confirm in MetaMask.
5. Copy the deployed contract address → paste into [`../web-static/js/config.js`](../web-static/js/config.js) as `CONTRACT_ADDRESS`. Bump the `?v=N` query string in `web-static/*.html` so the change ships through cache.

## Granting roles

The deployer holds `DEFAULT_ADMIN_ROLE`. Grant participant roles either via the in-app `admin.html` page (after pointing it at the live contract) or directly from Remix:

- `MANUFACTURER_ROLE` = `keccak256("MANUFACTURER_ROLE")`
- `DISTRIBUTOR_ROLE` = `keccak256("DISTRIBUTOR_ROLE")`
- `RETAILER_ROLE` = `keccak256("RETAILER_ROLE")`

Use the auto-generated role getters on the deployed contract (`MANUFACTURER_ROLE()` etc.) to read each `bytes32`, then call `grantRole(role, wallet)`.

## Tests (optional, requires Node)

The original test suite (7 cases — register, dup-prevention, role enforcement, transfer, status update, recall, flag) was removed when the Node tooling was stripped. The tests are preserved in git history (`git log --diff-filter=D -- contracts/test`) if you ever want to restore them.
