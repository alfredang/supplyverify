import { keccak256, toBytes } from "viem";

export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 11155111);

export const STATUS_LABELS = [
  "Manufactured",
  "In Warehouse",
  "In Transit",
  "Received by Distributor",
  "Received by Retailer",
  "Sold to Customer",
  "Recalled",
  "Suspicious",
] as const;

export const STATUS_COLORS: Record<number, string> = {
  0: "bg-emerald-100 text-emerald-800",
  1: "bg-amber-100 text-amber-800",
  2: "bg-blue-100 text-blue-800",
  3: "bg-indigo-100 text-indigo-800",
  4: "bg-violet-100 text-violet-800",
  5: "bg-slate-200 text-slate-800",
  6: "bg-red-100 text-red-800",
  7: "bg-red-200 text-red-900",
};

export const ROLES = {
  ADMIN: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
  MANUFACTURER: keccak256(toBytes("MANUFACTURER_ROLE")),
  DISTRIBUTOR: keccak256(toBytes("DISTRIBUTOR_ROLE")),
  RETAILER: keccak256(toBytes("RETAILER_ROLE")),
};

export function productIdFrom(serial: string, batch: string): `0x${string}` {
  return keccak256(toBytes(`${serial}|${batch}`));
}

export const supplyChainAbi = [
  { type: "constructor", inputs: [{ name: "admin", type: "address" }], stateMutability: "nonpayable" },
  { type: "function", name: "MANUFACTURER_ROLE", stateMutability: "view", inputs: [], outputs: [{ type: "bytes32" }] },
  { type: "function", name: "DISTRIBUTOR_ROLE", stateMutability: "view", inputs: [], outputs: [{ type: "bytes32" }] },
  { type: "function", name: "RETAILER_ROLE", stateMutability: "view", inputs: [], outputs: [{ type: "bytes32" }] },
  {
    type: "function",
    name: "hasRole",
    stateMutability: "view",
    inputs: [{ name: "role", type: "bytes32" }, { name: "account", type: "address" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "grantRole",
    stateMutability: "nonpayable",
    inputs: [{ name: "role", type: "bytes32" }, { name: "account", type: "address" }],
    outputs: [],
  },
  {
    type: "function",
    name: "registerProduct",
    stateMutability: "nonpayable",
    inputs: [
      { name: "id", type: "bytes32" },
      { name: "expiresAt", type: "uint64" },
      { name: "metadataCID", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "updateStatus",
    stateMutability: "nonpayable",
    inputs: [
      { name: "id", type: "bytes32" },
      { name: "status", type: "uint8" },
      { name: "location", type: "string" },
      { name: "note", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "transferOwnership",
    stateMutability: "nonpayable",
    inputs: [
      { name: "id", type: "bytes32" },
      { name: "to", type: "address" },
      { name: "newStatus", type: "uint8" },
      { name: "location", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "addCheckpoint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "id", type: "bytes32" },
      { name: "location", type: "string" },
      { name: "note", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "flagSuspicious",
    stateMutability: "nonpayable",
    inputs: [{ name: "id", type: "bytes32" }],
    outputs: [],
  },
  {
    type: "function",
    name: "recall",
    stateMutability: "nonpayable",
    inputs: [{ name: "id", type: "bytes32" }],
    outputs: [],
  },
  {
    type: "function",
    name: "verify",
    stateMutability: "view",
    inputs: [{ name: "id", type: "bytes32" }],
    outputs: [
      {
        type: "tuple",
        name: "product",
        components: [
          { name: "id", type: "bytes32" },
          { name: "manufacturer", type: "address" },
          { name: "currentOwner", type: "address" },
          { name: "producedAt", type: "uint64" },
          { name: "expiresAt", type: "uint64" },
          { name: "status", type: "uint8" },
          { name: "metadataCID", type: "string" },
          { name: "flagged", type: "bool" },
          { name: "exists", type: "bool" },
        ],
      },
      { name: "exists", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "getHistory",
    stateMutability: "view",
    inputs: [{ name: "id", type: "bytes32" }],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { name: "actor", type: "address" },
          { name: "timestamp", type: "uint64" },
          { name: "status", type: "uint8" },
          { name: "location", type: "string" },
          { name: "note", type: "string" },
        ],
      },
    ],
  },
  { type: "function", name: "totalProducts", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  {
    type: "function",
    name: "productIdAt",
    stateMutability: "view",
    inputs: [{ name: "index", type: "uint256" }],
    outputs: [{ type: "bytes32" }],
  },
] as const;

export function explorerTxUrl(hash: string) {
  if (CHAIN_ID === 11155111) return `https://sepolia.etherscan.io/tx/${hash}`;
  return `https://etherscan.io/tx/${hash}`;
}

export function explorerAddrUrl(addr: string) {
  if (CHAIN_ID === 11155111) return `https://sepolia.etherscan.io/address/${addr}`;
  return `https://etherscan.io/address/${addr}`;
}
