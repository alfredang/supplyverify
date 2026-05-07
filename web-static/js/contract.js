// ethers Contract helpers
window.Chain = (function () {
  function readContract() {
    return new ethers.Contract(window.APP_CONFIG.CONTRACT_ADDRESS, window.SUPPLY_CHAIN_ABI, window.Wallet.getReadProvider());
  }
  function writeContract() {
    const { signer } = window.Wallet.get();
    if (!signer) throw new Error("Wallet not connected");
    return new ethers.Contract(window.APP_CONFIG.CONTRACT_ADDRESS, window.SUPPLY_CHAIN_ABI, signer);
  }
  function productIdFrom(serial, batch) {
    return ethers.keccak256(ethers.toUtf8Bytes(`${serial}|${batch}`));
  }
  function roleHash(name) {
    if (name === "ADMIN") return "0x" + "0".repeat(64);
    return ethers.keccak256(ethers.toUtf8Bytes(name + "_ROLE"));
  }
  async function getRole(address) {
    if (!address) return "customer";
    const c = readContract();
    try {
      const [admin, mfg, dist, ret] = await Promise.all([
        c.hasRole(roleHash("ADMIN"), address),
        c.hasRole(roleHash("MANUFACTURER"), address),
        c.hasRole(roleHash("DISTRIBUTOR"), address),
        c.hasRole(roleHash("RETAILER"), address),
      ]);
      if (admin) return "admin";
      if (mfg) return "manufacturer";
      if (dist) return "distributor";
      if (ret) return "retailer";
      return "customer";
    } catch (e) {
      console.warn("Role lookup failed", e);
      return "customer";
    }
  }
  return { readContract, writeContract, productIdFrom, roleHash, getRole };
})();
