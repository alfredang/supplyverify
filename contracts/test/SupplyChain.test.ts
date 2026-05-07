import { expect } from "chai";
import { ethers } from "hardhat";

const STATUS = {
  Manufactured: 0,
  InWarehouse: 1,
  InTransit: 2,
  ReceivedByDistributor: 3,
  ReceivedByRetailer: 4,
  SoldToCustomer: 5,
  Recalled: 6,
  Suspicious: 7,
};

describe("SupplyChain", () => {
  async function deploy() {
    const [admin, mfg, dist, retailer, customer, outsider] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("SupplyChain");
    const sc = await Factory.deploy(admin.address);
    await sc.waitForDeployment();

    const MANUFACTURER_ROLE = await sc.MANUFACTURER_ROLE();
    const DISTRIBUTOR_ROLE = await sc.DISTRIBUTOR_ROLE();
    const RETAILER_ROLE = await sc.RETAILER_ROLE();

    await sc.connect(admin).grantRole(MANUFACTURER_ROLE, mfg.address);
    await sc.connect(admin).grantRole(DISTRIBUTOR_ROLE, dist.address);
    await sc.connect(admin).grantRole(RETAILER_ROLE, retailer.address);

    return { sc, admin, mfg, dist, retailer, customer, outsider };
  }

  const id = ethers.keccak256(ethers.toUtf8Bytes("SN-001|BATCH-A"));
  const cid = "bafyTestCID";

  it("registers a product and emits event", async () => {
    const { sc, mfg } = await deploy();
    await expect(sc.connect(mfg).registerProduct(id, 0, cid))
      .to.emit(sc, "ProductRegistered")
      .withArgs(id, mfg.address, cid);

    const [product, exists] = await sc.verify(id);
    expect(exists).to.equal(true);
    expect(product.manufacturer).to.equal(mfg.address);
    expect(product.currentOwner).to.equal(mfg.address);
    expect(product.status).to.equal(STATUS.Manufactured);
  });

  it("prevents duplicate product ids", async () => {
    const { sc, mfg } = await deploy();
    await sc.connect(mfg).registerProduct(id, 0, cid);
    await expect(sc.connect(mfg).registerProduct(id, 0, cid)).to.be.revertedWith("duplicate product id");
  });

  it("rejects registration from non-manufacturer", async () => {
    const { sc, outsider } = await deploy();
    await expect(sc.connect(outsider).registerProduct(id, 0, cid)).to.be.reverted;
  });

  it("transfers ownership and accumulates history", async () => {
    const { sc, mfg, dist } = await deploy();
    await sc.connect(mfg).registerProduct(id, 0, cid);
    await sc.connect(mfg).transferOwnership(id, dist.address, STATUS.ReceivedByDistributor, "Warehouse-A");
    const [product] = await sc.verify(id);
    expect(product.currentOwner).to.equal(dist.address);
    expect(product.status).to.equal(STATUS.ReceivedByDistributor);

    const history = await sc.getHistory(id);
    expect(history.length).to.equal(2);
  });

  it("blocks status update from non-owner", async () => {
    const { sc, mfg, dist } = await deploy();
    await sc.connect(mfg).registerProduct(id, 0, cid);
    await expect(
      sc.connect(dist).updateStatus(id, STATUS.InTransit, "Truck-7", "")
    ).to.be.revertedWith("not current owner");
  });

  it("allows manufacturer or admin to recall", async () => {
    const { sc, admin, mfg } = await deploy();
    await sc.connect(mfg).registerProduct(id, 0, cid);
    await sc.connect(admin).recall(id);
    const [product] = await sc.verify(id);
    expect(product.status).to.equal(STATUS.Recalled);
  });

  it("flags suspicious", async () => {
    const { sc, mfg } = await deploy();
    await sc.connect(mfg).registerProduct(id, 0, cid);
    await sc.connect(mfg).flagSuspicious(id);
    const [product] = await sc.verify(id);
    expect(product.flagged).to.equal(true);
    expect(product.status).to.equal(STATUS.Suspicious);
  });
});
