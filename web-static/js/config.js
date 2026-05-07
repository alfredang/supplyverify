// Edit these values to point at your deployed contract.
window.APP_CONFIG = {
  CHAIN_ID: 11155111, // 11155111 = Sepolia, 31337 = Hardhat local
  CHAIN_NAME: "Sepolia",
  RPC_URL: "https://rpc.sepolia.org",
  CONTRACT_ADDRESS: "0x0000000000000000000000000000000000000000",
  WEB3_STORAGE_TOKEN: "", // optional — if empty, uploads return mock CIDs
  EXPLORER: "https://sepolia.etherscan.io",
};

window.STATUS_LABELS = [
  "Manufactured",
  "In Warehouse",
  "In Transit",
  "Received by Distributor",
  "Received by Retailer",
  "Sold to Customer",
  "Recalled",
  "Suspicious",
];

window.SUPPLY_CHAIN_ABI = [
  "function MANUFACTURER_ROLE() view returns (bytes32)",
  "function DISTRIBUTOR_ROLE() view returns (bytes32)",
  "function RETAILER_ROLE() view returns (bytes32)",
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function grantRole(bytes32 role, address account)",
  "function registerProduct(bytes32 id, uint64 expiresAt, string metadataCID)",
  "function updateStatus(bytes32 id, uint8 status, string location, string note)",
  "function transferOwnership(bytes32 id, address to, uint8 newStatus, string location)",
  "function addCheckpoint(bytes32 id, string location, string note)",
  "function flagSuspicious(bytes32 id)",
  "function recall(bytes32 id)",
  "function verify(bytes32 id) view returns (tuple(bytes32 id, address manufacturer, address currentOwner, uint64 producedAt, uint64 expiresAt, uint8 status, string metadataCID, bool flagged, bool exists) product, bool exists)",
  "function getHistory(bytes32 id) view returns (tuple(address actor, uint64 timestamp, uint8 status, string location, string note)[])",
  "function totalProducts() view returns (uint256)",
  "function productIdAt(uint256 index) view returns (bytes32)",
];
