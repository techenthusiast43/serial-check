import { expect } from "chai";
import hre from "hardhat";

const { ethers } = hre;

describe("SerialCheck Smart Contract", function () {
  let serialCheck;
  let owner;
  let user1;
  let user2;

  // Helper to hash serial numbers like the dApp client does
  function hashSerial(serialNumber) {
    return ethers.keccak256(ethers.toUtf8Bytes(serialNumber.trim()));
  }

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const SerialCheckFactory = await ethers.getContractFactory("SerialCheck");
    serialCheck = await SerialCheckFactory.deploy();
    await serialCheck.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should deploy successfully and have a valid address", async function () {
      const address = await serialCheck.getAddress();
      expect(address).to.properAddress;
    });
  });

  describe("Product Registration", function () {
    it("should register a new product successfully with valid details", async function () {
      const rawSerial = "SN-2026-ALPHA-001";
      const serialHash = hashSerial(rawSerial);
      const productName = "Quantum Processor X1";
      const model = "QP-X1-PRO";

      const tx = await serialCheck.connect(user1).registerProduct(serialHash, productName, model);
      await tx.wait();

      // Check event emission
      await expect(tx)
        .to.emit(serialCheck, "ProductRegistered")
        .withArgs(serialHash, user1.address, productName, model, (val) => val > 0);

      // Verify status is Registered (1)
      const status = await serialCheck.checkSerial(serialHash);
      expect(status).to.equal(1n); // RegistrationStatus.Registered

      // Verify product details
      const product = await serialCheck.getProduct(serialHash);
      expect(product.productName).to.equal(productName);
      expect(product.model).to.equal(model);
      expect(product.registrant).to.equal(user1.address);
      expect(product.registeredAt).to.be.gt(0);
      expect(product.revokedAt).to.equal(0n);
      expect(product.status).to.equal(1n);
    });

    it("should prevent duplicate registrations of the same serial number", async function () {
      const serialHash = hashSerial("SN-DUP-TEST-123");
      
      // First registration succeeds
      await serialCheck.connect(user1).registerProduct(serialHash, "Item A", "Model A");

      // Second registration with the same serial hash must revert
      await expect(
        serialCheck.connect(user2).registerProduct(serialHash, "Item B", "Model B")
      ).to.be.revertedWithCustomError(serialCheck, "AlreadyRegistered");

      // Same user registering same serial hash also reverts
      await expect(
        serialCheck.connect(user1).registerProduct(serialHash, "Item A-Renamed", "Model A")
      ).to.be.revertedWithCustomError(serialCheck, "AlreadyRegistered");
    });

    it("should validate and reject empty product name", async function () {
      const serialHash = hashSerial("SN-TEST-EMPTY-NAME");
      await expect(
        serialCheck.connect(user1).registerProduct(serialHash, "", "Model X")
      ).to.be.revertedWithCustomError(serialCheck, "EmptyProductName");
    });

    it("should validate and reject empty product model", async function () {
      const serialHash = hashSerial("SN-TEST-EMPTY-MODEL");
      await expect(
        serialCheck.connect(user1).registerProduct(serialHash, "Product X", "")
      ).to.be.revertedWithCustomError(serialCheck, "EmptyModel");
    });

    it("should validate and reject zero bytes32 serial hash", async function () {
      const zeroHash = ethers.ZeroHash;
      await expect(
        serialCheck.connect(user1).registerProduct(zeroHash, "Product X", "Model X")
      ).to.be.revertedWithCustomError(serialCheck, "InvalidSerialHash");
    });
  });

  describe("Product Verification & Querying", function () {
    it("should return Unregistered (0) for an unknown/unregistered serial number", async function () {
      const unknownHash = hashSerial("SN-UNKNOWN-99999");
      const status = await serialCheck.checkSerial(unknownHash);
      expect(status).to.equal(0n); // RegistrationStatus.Unregistered

      const product = await serialCheck.getProduct(unknownHash);
      expect(product.productName).to.equal("");
      expect(product.model).to.equal("");
      expect(product.registrant).to.equal(ethers.ZeroAddress);
      expect(product.registeredAt).to.equal(0n);
      expect(product.status).to.equal(0n);
    });
  });

  describe("Product Revocation", function () {
    const rawSerial = "SN-REVOKE-ME-555";
    let serialHash;

    beforeEach(async function () {
      serialHash = hashSerial(rawSerial);
      await serialCheck.connect(user1).registerProduct(serialHash, "Hardware Wallet v2", "HW-200");
    });

    it("should allow the original registrant to revoke their product", async function () {
      const tx = await serialCheck.connect(user1).revokeProduct(serialHash);
      
      await expect(tx)
        .to.emit(serialCheck, "ProductRevoked")
        .withArgs(serialHash, user1.address, (val) => val > 0);

      // Status should now be Revoked (2)
      const status = await serialCheck.checkSerial(serialHash);
      expect(status).to.equal(2n);

      const product = await serialCheck.getProduct(serialHash);
      expect(product.status).to.equal(2n);
      expect(product.revokedAt).to.be.gt(0);
      expect(product.registrant).to.equal(user1.address);
    });

    it("should reject unauthorized revocation from a different wallet", async function () {
      // user2 is not the registrant
      await expect(
        serialCheck.connect(user2).revokeProduct(serialHash)
      ).to.be.revertedWithCustomError(serialCheck, "NotAuthorized");

      // Owner (deployer) is also not the registrant, so should also revert
      await expect(
        serialCheck.connect(owner).revokeProduct(serialHash)
      ).to.be.revertedWithCustomError(serialCheck, "NotAuthorized");
    });

    it("should reject revocation of an unregistered serial number", async function () {
      const unknownHash = hashSerial("SN-NON-EXISTENT");
      await expect(
        serialCheck.connect(user1).revokeProduct(unknownHash)
      ).to.be.revertedWithCustomError(serialCheck, "NotRegistered");
    });

    it("should reject revocation if the product is already revoked", async function () {
      // First revoke
      await serialCheck.connect(user1).revokeProduct(serialHash);

      // Attempt second revoke
      await expect(
        serialCheck.connect(user1).revokeProduct(serialHash)
      ).to.be.revertedWithCustomError(serialCheck, "AlreadyRevoked");
    });

    it("should prevent re-registration of a revoked serial number", async function () {
      // Revoke it
      await serialCheck.connect(user1).revokeProduct(serialHash);

      // Re-registration attempt by anyone must revert
      await expect(
        serialCheck.connect(user1).registerProduct(serialHash, "Hardware Wallet v2 Renewed", "HW-200")
      ).to.be.revertedWithCustomError(serialCheck, "AlreadyRegistered");

      await expect(
        serialCheck.connect(user2).registerProduct(serialHash, "Hardware Wallet v2 Stolen", "HW-200")
      ).to.be.revertedWithCustomError(serialCheck, "AlreadyRegistered");
    });
  });

  describe("Registrant Products Index", function () {
    it("should accurately track all serial hashes registered by a user", async function () {
      const hash1 = hashSerial("SN-USER1-A");
      const hash2 = hashSerial("SN-USER1-B");
      const hash3 = hashSerial("SN-USER2-A");

      await serialCheck.connect(user1).registerProduct(hash1, "Phone A", "Model 1");
      await serialCheck.connect(user1).registerProduct(hash2, "Phone B", "Model 2");
      await serialCheck.connect(user2).registerProduct(hash3, "Laptop C", "Model 3");

      const user1Products = await serialCheck.getProductsByRegistrant(user1.address);
      expect(user1Products.length).to.equal(2);
      expect(user1Products[0]).to.equal(hash1);
      expect(user1Products[1]).to.equal(hash2);

      const user2Products = await serialCheck.getProductsByRegistrant(user2.address);
      expect(user2Products.length).to.equal(1);
      expect(user2Products[0]).to.equal(hash3);

      const ownerProducts = await serialCheck.getProductsByRegistrant(owner.address);
      expect(ownerProducts.length).to.equal(0);
    });
  });
});

