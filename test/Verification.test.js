const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Verification", function () {
  async function deployVerificationFixture() {
    const [admin, doctor1, doctor2, patient1, patient2, unauthorized] = await ethers.getSigners();

    const Verification = await ethers.getContractFactory("Verification");
    const verification = await Verification.deploy();

    return { verification, admin, doctor1, doctor2, patient1, patient2, unauthorized };
  }

  describe("Deployment", function () {
    it("Should set the deployer as admin", async function () {
      const { verification, admin } = await loadFixture(deployVerificationFixture);
      expect(await verification.admin()).to.equal(admin.address);
    });
  });

  describe("Doctor Whitelisting", function () {
    it("Should allow admin to whitelist a doctor", async function () {
      const { verification, doctor1 } = await loadFixture(deployVerificationFixture);
      
      await expect(verification.whitelistDoctor(doctor1.address))
        .to.emit(verification, "DoctorWhitelisted")
        .withArgs(doctor1.address, await ethers.provider.getBlockNumber() + 1);

      expect(await verification.whitelistedDoctors(doctor1.address)).to.be.true;
      expect(await verification.isWhitelistedDoctor(doctor1.address)).to.be.true;
    });

    it("Should not allow whitelisting the same doctor twice", async function () {
      const { verification, doctor1 } = await loadFixture(deployVerificationFixture);
      
      await verification.whitelistDoctor(doctor1.address);
      await expect(verification.whitelistDoctor(doctor1.address))
        .to.be.revertedWith("Doctor already whitelisted");
    });

    it("Should not allow whitelisting zero address", async function () {
      const { verification } = await loadFixture(deployVerificationFixture);
      
      await expect(verification.whitelistDoctor(ethers.ZeroAddress))
        .to.be.revertedWith("Invalid doctor address");
    });

    it("Should not allow non-admin to whitelist a doctor", async function () {
      const { verification, doctor1, unauthorized } = await loadFixture(deployVerificationFixture);
      
      await expect(verification.connect(unauthorized).whitelistDoctor(doctor1.address))
        .to.be.revertedWith("Only admin can call this function");
    });

    it("Should allow admin to remove a doctor", async function () {
      const { verification, doctor1 } = await loadFixture(deployVerificationFixture);
      
      await verification.whitelistDoctor(doctor1.address);
      
      await expect(verification.removeDoctor(doctor1.address))
        .to.emit(verification, "DoctorRemoved")
        .withArgs(doctor1.address, await ethers.provider.getBlockNumber() + 1);

      expect(await verification.whitelistedDoctors(doctor1.address)).to.be.false;
    });

    it("Should not allow removing a doctor that is not whitelisted", async function () {
      const { verification, doctor1 } = await loadFixture(deployVerificationFixture);
      
      await expect(verification.removeDoctor(doctor1.address))
        .to.be.revertedWith("Doctor not whitelisted");
    });
  });

  describe("Diagnosis Submission", function () {
    it("Should allow whitelisted doctor to submit diagnosis", async function () {
      const { verification, doctor1, patient1 } = await loadFixture(deployVerificationFixture);
      
      await verification.whitelistDoctor(doctor1.address);
      
      await expect(verification.connect(doctor1).submitDiagnosis(patient1.address, 2))
        .to.emit(verification, "DiagnosisSubmitted")
        .withArgs(patient1.address, doctor1.address, 1, await ethers.provider.getBlockNumber() + 1); // CancerStage.STAGE_II = 1

      const diagnosis = await verification.getDiagnosis(patient1.address);
      expect(diagnosis.stage).to.equal(1); // STAGE_II
      expect(diagnosis.doctor).to.equal(doctor1.address);
      expect(diagnosis.exists).to.be.true;
    });

    it("Should allow all valid stages (2, 3, 4)", async function () {
      const { verification, doctor1, patient1, patient2, admin } = await loadFixture(deployVerificationFixture);
      
      await verification.whitelistDoctor(doctor1.address);
      
      // Stage II
      await verification.connect(doctor1).submitDiagnosis(patient1.address, 2);
      let diagnosis = await verification.getDiagnosis(patient1.address);
      expect(diagnosis.stage).to.equal(1); // STAGE_II enum value

      // Stage III
      await verification.connect(doctor1).submitDiagnosis(patient2.address, 3);
      diagnosis = await verification.getDiagnosis(patient2.address);
      expect(diagnosis.stage).to.equal(2); // STAGE_III enum value

      // Stage IV
      await verification.connect(doctor1).submitDiagnosis(admin.address, 4);
      diagnosis = await verification.getDiagnosis(admin.address);
      expect(diagnosis.stage).to.equal(3); // STAGE_IV enum value
    });

    it("Should not allow invalid stages", async function () {
      const { verification, doctor1, patient1 } = await loadFixture(deployVerificationFixture);
      
      await verification.whitelistDoctor(doctor1.address);
      
      await expect(verification.connect(doctor1).submitDiagnosis(patient1.address, 1))
        .to.be.revertedWith("Invalid stage: must be 2, 3, or 4");

      await expect(verification.connect(doctor1).submitDiagnosis(patient1.address, 5))
        .to.be.revertedWith("Invalid stage: must be 2, 3, or 4");
    });

    it("Should not allow non-whitelisted doctor to submit diagnosis", async function () {
      const { verification, doctor1, patient1 } = await loadFixture(deployVerificationFixture);
      
      await expect(verification.connect(doctor1).submitDiagnosis(patient1.address, 2))
        .to.be.revertedWith("Only whitelisted doctors can call this function");
    });

    it("Should not allow diagnosis for zero address", async function () {
      const { verification, doctor1 } = await loadFixture(deployVerificationFixture);
      
      await verification.whitelistDoctor(doctor1.address);
      
      await expect(verification.connect(doctor1).submitDiagnosis(ethers.ZeroAddress, 2))
        .to.be.revertedWith("Invalid patient address");
    });

    it("Should not allow duplicate diagnosis for the same patient", async function () {
      const { verification, doctor1, patient1 } = await loadFixture(deployVerificationFixture);
      
      await verification.whitelistDoctor(doctor1.address);
      await verification.connect(doctor1).submitDiagnosis(patient1.address, 2);
      
      await expect(verification.connect(doctor1).submitDiagnosis(patient1.address, 3))
        .to.be.revertedWith("Diagnosis already exists for patient");
    });
  });

  describe("Admin Transfer", function () {
    it("Should allow admin to transfer admin role", async function () {
      const { verification, admin, doctor1 } = await loadFixture(deployVerificationFixture);
      
      await verification.transferAdmin(doctor1.address);
      expect(await verification.admin()).to.equal(doctor1.address);
      
      // Old admin should no longer have admin rights
      await expect(verification.connect(admin).whitelistDoctor(admin.address))
        .to.be.revertedWith("Only admin can call this function");
    });

    it("Should not allow transfer to zero address", async function () {
      const { verification } = await loadFixture(deployVerificationFixture);
      
      await expect(verification.transferAdmin(ethers.ZeroAddress))
        .to.be.revertedWith("Invalid admin address");
    });

    it("Should not allow non-admin to transfer admin role", async function () {
      const { verification, doctor1, unauthorized } = await loadFixture(deployVerificationFixture);
      
      await expect(verification.connect(unauthorized).transferAdmin(doctor1.address))
        .to.be.revertedWith("Only admin can call this function");
    });
  });
});

