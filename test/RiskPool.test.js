const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe("RiskPool", function () {
  async function deployRiskPoolFixture() {
    const [admin, user1, user2, doctor1, unauthorized] = await ethers.getSigners();

    // Deploy Mock USDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDC.deploy();

    // Deploy Verification
    const Verification = await ethers.getContractFactory("Verification");
    const verification = await Verification.deploy();

    // Deploy RiskPool
    const RiskPool = await ethers.getContractFactory("RiskPool");
    const riskPool = await RiskPool.deploy(await usdc.getAddress(), await verification.getAddress());

    // Mint USDC to users for testing
    const amount = ethers.parseUnits("100000", 6); // 100k USDC
    await usdc.mint(user1.address, amount);
    await usdc.mint(user2.address, amount);

    return { riskPool, usdc, verification, admin, user1, user2, doctor1, unauthorized };
  }

  describe("Deployment", function () {
    it("Should set the deployer as admin", async function () {
      const { riskPool, admin } = await loadFixture(deployRiskPoolFixture);
      expect(await riskPool.admin()).to.equal(admin.address);
    });

    it("Should set correct USDC token address", async function () {
      const { riskPool, usdc } = await loadFixture(deployRiskPoolFixture);
      expect(await riskPool.usdcToken()).to.equal(await usdc.getAddress());
    });

    it("Should set correct verification contract address", async function () {
      const { riskPool, verification } = await loadFixture(deployRiskPoolFixture);
      expect(await riskPool.verificationContract()).to.equal(await verification.getAddress());
    });

    it("Should not be paused initially", async function () {
      const { riskPool } = await loadFixture(deployRiskPoolFixture);
      expect(await riskPool.paused()).to.be.false;
    });

    it("Should have correct monthly premium", async function () {
      const { riskPool } = await loadFixture(deployRiskPoolFixture);
      expect(await riskPool.monthlyPremium()).to.equal(ethers.parseUnits("20", 6));
    });
  });

  describe("Enrollment", function () {
    it("Should allow user to enroll with valid premium payment", async function () {
      const { riskPool, usdc, user1 } = await loadFixture(deployRiskPoolFixture);
      
      const premium = await riskPool.monthlyPremium();
      await usdc.connect(user1).approve(await riskPool.getAddress(), premium);

      await expect(riskPool.connect(user1).enroll())
        .to.emit(riskPool, "UserEnrolled")
        .to.emit(riskPool, "PremiumPaid");

      const enrollment = await riskPool.getEnrollmentInfo(user1.address);
      expect(enrollment.isActive).to.be.true;
      expect(enrollment.totalPremiumsPaid).to.equal(premium);
    });

    it("Should not allow enrolling twice", async function () {
      const { riskPool, usdc, user1 } = await loadFixture(deployRiskPoolFixture);
      
      const premium = await riskPool.monthlyPremium();
      await usdc.connect(user1).approve(await riskPool.getAddress(), premium * 2n);
      await riskPool.connect(user1).enroll();

      await expect(riskPool.connect(user1).enroll())
        .to.be.revertedWith("User already enrolled");
    });

    it("Should track enrolled users count", async function () {
      const { riskPool, usdc, user1, user2 } = await loadFixture(deployRiskPoolFixture);
      
      const premium = await riskPool.monthlyPremium();
      await usdc.connect(user1).approve(await riskPool.getAddress(), premium);
      await usdc.connect(user2).approve(await riskPool.getAddress(), premium);

      await riskPool.connect(user1).enroll();
      expect(await riskPool.getEnrolledUsersCount()).to.equal(1);

      await riskPool.connect(user2).enroll();
      expect(await riskPool.getEnrolledUsersCount()).to.equal(2);
    });

    it("Should update total premiums collected", async function () {
      const { riskPool, usdc, user1 } = await loadFixture(deployRiskPoolFixture);
      
      const premium = await riskPool.monthlyPremium();
      await usdc.connect(user1).approve(await riskPool.getAddress(), premium);
      await riskPool.connect(user1).enroll();

      expect(await riskPool.totalPremiumsCollected()).to.equal(premium);
    });
  });

  describe("Premium Payments", function () {
    it("Should allow enrolled user to pay premium", async function () {
      const { riskPool, usdc, user1 } = await loadFixture(deployRiskPoolFixture);
      
      const premium = await riskPool.monthlyPremium();
      await usdc.connect(user1).approve(await riskPool.getAddress(), premium * 2n);
      await riskPool.connect(user1).enroll();

      await expect(riskPool.connect(user1).payPremium())
        .to.emit(riskPool, "PremiumPaid")
        .withArgs(user1.address, premium, await time.latest() + 1);

      const enrollment = await riskPool.getEnrollmentInfo(user1.address);
      expect(enrollment.totalPremiumsPaid).to.equal(premium * 2n);
    });

    it("Should not allow non-enrolled user to pay premium", async function () {
      const { riskPool, usdc, user1 } = await loadFixture(deployRiskPoolFixture);
      
      const premium = await riskPool.monthlyPremium();
      await usdc.connect(user1).approve(await riskPool.getAddress(), premium);

      await expect(riskPool.connect(user1).payPremium())
        .to.be.revertedWith("User not enrolled");
    });
  });

  describe("Waiting Period", function () {
    it("Should correctly track waiting period", async function () {
      const { riskPool, usdc, user1 } = await loadFixture(deployRiskPoolFixture);
      
      const premium = await riskPool.monthlyPremium();
      await usdc.connect(user1).approve(await riskPool.getAddress(), premium);
      await riskPool.connect(user1).enroll();

      expect(await riskPool.hasPassedWaitingPeriod(user1.address)).to.be.false;

      // Fast forward 6 months
      await time.increase(180 * 24 * 60 * 60);

      expect(await riskPool.hasPassedWaitingPeriod(user1.address)).to.be.true;
    });
  });

  describe("Claims", function () {
    async function enrollUserWithDiagnosis() {
      const fixture = await loadFixture(deployRiskPoolFixture);
      const { riskPool, usdc, verification, user1, doctor1 } = fixture;

      // Enroll user
      const premium = await riskPool.monthlyPremium();
      await usdc.connect(user1).approve(await riskPool.getAddress(), premium);
      await riskPool.connect(user1).enroll();

      // Fast forward past waiting period
      await time.increase(180 * 24 * 60 * 60);

      // Whitelist doctor and submit diagnosis
      await verification.whitelistDoctor(doctor1.address);
      await verification.connect(doctor1).submitDiagnosis(user1.address, 2); // Stage II

      return fixture;
    }

    it("Should allow user to submit claim after waiting period with valid diagnosis", async function () {
      const { riskPool, user1 } = await enrollUserWithDiagnosis();

      await expect(riskPool.connect(user1).submitClaim())
        .to.emit(riskPool, "ClaimSubmitted");

      const claim = await riskPool.getClaimInfo(user1.address);
      expect(claim.stage).to.equal(1); // STAGE_II
      expect(claim.amount).to.equal(ethers.parseUnits("25000", 6)); // $25k
      expect(claim.approved).to.be.false;
      expect(claim.paid).to.be.false;
    });

    it("Should calculate correct payout amounts for different stages", async function () {
      const { riskPool, usdc, verification, user1, user2, doctor1, admin } = await loadFixture(deployRiskPoolFixture);

      // Enroll multiple users
      const premium = await riskPool.monthlyPremium();
      await usdc.connect(user1).approve(await riskPool.getAddress(), premium);
      await usdc.connect(user2).approve(await riskPool.getAddress(), premium);
      await usdc.connect(admin).approve(await riskPool.getAddress(), premium);
      
      await riskPool.connect(user1).enroll();
      await riskPool.connect(user2).enroll();
      await riskPool.connect(admin).enroll();

      // Fast forward
      await time.increase(180 * 24 * 60 * 60);

      // Whitelist doctor
      await verification.whitelistDoctor(doctor1.address);

      // Stage II - $25k
      await verification.connect(doctor1).submitDiagnosis(user1.address, 2);
      await riskPool.connect(user1).submitClaim();
      let claim = await riskPool.getClaimInfo(user1.address);
      expect(claim.amount).to.equal(ethers.parseUnits("25000", 6));

      // Stage III - $50k
      await verification.connect(doctor1).submitDiagnosis(user2.address, 3);
      await riskPool.connect(user2).submitClaim();
      claim = await riskPool.getClaimInfo(user2.address);
      expect(claim.amount).to.equal(ethers.parseUnits("50000", 6));

      // Stage IV - $75k
      await verification.connect(doctor1).submitDiagnosis(admin.address, 4);
      await riskPool.connect(admin).submitClaim();
      claim = await riskPool.getClaimInfo(admin.address);
      expect(claim.amount).to.equal(ethers.parseUnits("75000", 6));
    });

    it("Should not allow claim before waiting period", async function () {
      const { riskPool, usdc, verification, user1, doctor1 } = await loadFixture(deployRiskPoolFixture);

      const premium = await riskPool.monthlyPremium();
      await usdc.connect(user1).approve(await riskPool.getAddress(), premium);
      await riskPool.connect(user1).enroll();

      await verification.whitelistDoctor(doctor1.address);
      await verification.connect(doctor1).submitDiagnosis(user1.address, 2);

      await expect(riskPool.connect(user1).submitClaim())
        .to.be.revertedWith("Waiting period not completed");
    });

    it("Should not allow claim without diagnosis", async function () {
      const { riskPool, usdc, user1 } = await loadFixture(deployRiskPoolFixture);

      const premium = await riskPool.monthlyPremium();
      await usdc.connect(user1).approve(await riskPool.getAddress(), premium);
      await riskPool.connect(user1).enroll();

      await time.increase(180 * 24 * 60 * 60);

      await expect(riskPool.connect(user1).submitClaim())
        .to.be.revertedWith("No diagnosis found");
    });

    it("Should not allow claim if user not enrolled", async function () {
      const { riskPool, user1 } = await loadFixture(deployRiskPoolFixture);

      await expect(riskPool.connect(user1).submitClaim())
        .to.be.revertedWith("User not enrolled");
    });
  });

  describe("Claim Approval and Payout", function () {
    async function setupApprovedClaim() {
      const fixture = await loadFixture(deployRiskPoolFixture);
      const { riskPool, usdc, verification, user1, doctor1 } = fixture;

      // Fund the pool with enough USDC
      await usdc.mint(await riskPool.getAddress(), ethers.parseUnits("100000", 6));

      // Enroll user
      const premium = await riskPool.monthlyPremium();
      await usdc.connect(user1).approve(await riskPool.getAddress(), premium);
      await riskPool.connect(user1).enroll();

      // Fast forward past waiting period
      await time.increase(180 * 24 * 60 * 60);

      // Whitelist doctor and submit diagnosis
      await verification.whitelistDoctor(doctor1.address);
      await verification.connect(doctor1).submitDiagnosis(user1.address, 2); // Stage II

      // Submit claim
      await riskPool.connect(user1).submitClaim();

      return fixture;
    }

    it("Should allow admin to approve a claim", async function () {
      const { riskPool, admin, user1 } = await setupApprovedClaim();

      await expect(riskPool.connect(admin).approveClaim(user1.address))
        .to.emit(riskPool, "ClaimApproved")
        .withArgs(user1.address, ethers.parseUnits("25000", 6), await time.latest() + 1);

      const claim = await riskPool.getClaimInfo(user1.address);
      expect(claim.approved).to.be.true;
    });

    it("Should allow admin to execute payout for approved claim", async function () {
      const { riskPool, usdc, admin, user1 } = await setupApprovedClaim();

      await riskPool.connect(admin).approveClaim(user1.address);

      const balanceBefore = await usdc.balanceOf(user1.address);

      await expect(riskPool.connect(admin).executePayout(user1.address))
        .to.emit(riskPool, "PayoutExecuted")
        .withArgs(user1.address, ethers.parseUnits("25000", 6), await time.latest() + 1);

      const balanceAfter = await usdc.balanceOf(user1.address);
      expect(balanceAfter - balanceBefore).to.equal(ethers.parseUnits("25000", 6));

      const claim = await riskPool.getClaimInfo(user1.address);
      expect(claim.paid).to.be.true;

      const enrollment = await riskPool.getEnrollmentInfo(user1.address);
      expect(enrollment.hasClaimed).to.be.true;
    });

    it("Should not allow executing payout without approval", async function () {
      const { riskPool, admin, user1 } = await setupApprovedClaim();

      await expect(riskPool.connect(admin).executePayout(user1.address))
        .to.be.revertedWith("Claim not approved");
    });

    it("Should not allow non-admin to approve claims", async function () {
      const { riskPool, user1, unauthorized } = await setupApprovedClaim();

      await expect(riskPool.connect(unauthorized).approveClaim(user1.address))
        .to.be.revertedWith("Only admin can call this function");
    });

    it("Should allow admin to reject a claim", async function () {
      const { riskPool, admin, user1 } = await setupApprovedClaim();

      await expect(riskPool.connect(admin).rejectClaim(user1.address, "Invalid documentation"))
        .to.emit(riskPool, "ClaimRejected")
        .withArgs(user1.address, "Invalid documentation", await time.latest() + 1);

      const claim = await riskPool.getClaimInfo(user1.address);
      expect(claim.timestamp).to.equal(0); // Claim deleted
    });

    it("Should update total payouts issued", async function () {
      const { riskPool, admin, user1 } = await setupApprovedClaim();

      await riskPool.connect(admin).approveClaim(user1.address);
      await riskPool.connect(admin).executePayout(user1.address);

      expect(await riskPool.totalPayoutsIssued()).to.equal(ethers.parseUnits("25000", 6));
    });
  });

  describe("Admin Functions", function () {
    it("Should allow admin to update premium", async function () {
      const { riskPool, admin } = await loadFixture(deployRiskPoolFixture);

      const newPremium = ethers.parseUnits("25", 6);
      await expect(riskPool.connect(admin).updatePremium(newPremium))
        .to.emit(riskPool, "PremiumUpdated")
        .withArgs(ethers.parseUnits("20", 6), newPremium, await time.latest() + 1);

      expect(await riskPool.monthlyPremium()).to.equal(newPremium);
    });

    it("Should allow admin to pause protocol", async function () {
      const { riskPool, admin } = await loadFixture(deployRiskPoolFixture);

      await expect(riskPool.connect(admin).pause())
        .to.emit(riskPool, "ProtocolPaused");

      expect(await riskPool.paused()).to.be.true;
    });

    it("Should allow admin to unpause protocol", async function () {
      const { riskPool, admin } = await loadFixture(deployRiskPoolFixture);

      await riskPool.connect(admin).pause();
      
      await expect(riskPool.connect(admin).unpause())
        .to.emit(riskPool, "ProtocolUnpaused");

      expect(await riskPool.paused()).to.be.false;
    });

    it("Should prevent enrollment when paused", async function () {
      const { riskPool, usdc, admin, user1 } = await loadFixture(deployRiskPoolFixture);

      await riskPool.connect(admin).pause();

      const premium = await riskPool.monthlyPremium();
      await usdc.connect(user1).approve(await riskPool.getAddress(), premium);

      await expect(riskPool.connect(user1).enroll())
        .to.be.revertedWith("Protocol is paused");
    });

    it("Should not allow non-admin to pause", async function () {
      const { riskPool, unauthorized } = await loadFixture(deployRiskPoolFixture);

      await expect(riskPool.connect(unauthorized).pause())
        .to.be.revertedWith("Only admin can call this function");
    });
  });

  describe("Reserve Balance", function () {
    it("Should correctly track reserve balance", async function () {
      const { riskPool, usdc, user1 } = await loadFixture(deployRiskPoolFixture);

      const premium = await riskPool.monthlyPremium();
      await usdc.connect(user1).approve(await riskPool.getAddress(), premium);
      await riskPool.connect(user1).enroll();

      expect(await riskPool.getReserveBalance()).to.equal(premium);
    });
  });
});

