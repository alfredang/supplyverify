// MetaMask connection — minimal replacement for RainbowKit/wagmi.
window.Wallet = (function () {
  let provider = null;
  let signer = null;
  let address = null;
  let chainId = null;
  const listeners = new Set();

  function emit() {
    listeners.forEach((fn) => fn({ address, chainId, signer }));
  }
  function onChange(fn) {
    listeners.add(fn);
    fn({ address, chainId, signer });
    return () => listeners.delete(fn);
  }

  async function ensureChain() {
    const want = "0x" + window.APP_CONFIG.CHAIN_ID.toString(16);
    const current = await window.ethereum.request({ method: "eth_chainId" });
    if (current !== want) {
      try {
        await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: want }] });
      } catch (e) {
        if (e.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: want,
              chainName: window.APP_CONFIG.CHAIN_NAME,
              rpcUrls: [window.APP_CONFIG.RPC_URL],
              nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
              blockExplorerUrls: [window.APP_CONFIG.EXPLORER],
            }],
          });
        } else {
          throw e;
        }
      }
    }
  }

  async function connect() {
    if (!window.ethereum) {
      window.Toast.error("MetaMask not detected");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      address = accounts[0];
      await ensureChain();
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
      chainId = Number((await provider.getNetwork()).chainId);
      window.ethereum.on("accountsChanged", (accs) => { address = accs[0] || null; emit(); });
      window.ethereum.on("chainChanged", () => location.reload());
      emit();
    } catch (e) {
      window.Toast.error(e.shortMessage || e.message || "Connect failed");
    }
  }

  async function autoConnect() {
    if (!window.ethereum) return;
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (accounts && accounts.length) {
      address = accounts[0];
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
      chainId = Number((await provider.getNetwork()).chainId);
      emit();
    }
  }

  function disconnect() {
    address = null; signer = null; provider = null;
    emit();
  }

  function getReadProvider() {
    return new ethers.JsonRpcProvider(window.APP_CONFIG.RPC_URL);
  }

  function get() {
    return { address, signer, chainId, provider };
  }

  function renderButton(host) {
    if (!host) return;
    function paint() {
      if (address) {
        host.innerHTML = `<button class="wallet-btn connected" id="walletBtn">${window.shortAddr(address)}</button>`;
        host.querySelector("#walletBtn").onclick = disconnect;
      } else {
        host.innerHTML = `<button class="wallet-btn" id="walletBtn">Connect Wallet</button>`;
        host.querySelector("#walletBtn").onclick = connect;
      }
    }
    onChange(paint);
  }

  function renderAllButtons() {
    document.querySelectorAll("[data-wallet-button]").forEach(renderButton);
  }

  return { connect, disconnect, autoConnect, onChange, get, renderButton, renderAllButtons, getReadProvider, ensureChain };
})();

document.addEventListener("DOMContentLoaded", () => {
  if (window.ethereum) window.Wallet.autoConnect();
});
