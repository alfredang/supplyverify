window.IPFS = (function () {
  const TOKEN = window.APP_CONFIG.WEB3_STORAGE_TOKEN;
  const ENDPOINT = "https://api.web3.storage/upload";

  async function uploadFile(file) {
    if (!TOKEN) return `mock://${file.name}-${Date.now()}`;
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Authorization: "Bearer " + TOKEN },
      body: file,
    });
    if (!res.ok) throw new Error("IPFS upload failed: " + res.status);
    const json = await res.json();
    return json.cid;
  }

  async function uploadJson(data) {
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const file = new File([blob], "metadata.json");
    return uploadFile(file);
  }

  return { uploadFile, uploadJson };
})();
