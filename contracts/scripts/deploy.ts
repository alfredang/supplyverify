import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying SupplyChain with admin:", deployer.address);

  const SupplyChain = await ethers.getContractFactory("SupplyChain");
  const contract = await SupplyChain.deploy(deployer.address);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("SupplyChain deployed at:", address);
  console.log("\nNext steps:");
  console.log(`  1. Set NEXT_PUBLIC_CONTRACT_ADDRESS=${address} in web/.env.local`);
  console.log("  2. Grant roles to participant wallets via the admin dashboard or:");
  console.log(`     contract.grantRole(MANUFACTURER_ROLE, <wallet>)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
