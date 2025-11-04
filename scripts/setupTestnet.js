const hre = require("hardhat");

/**
 * Helper script to set up a test environment with sample data
 * Use this after deploying contracts locally to test the full workflow
 */

async function main() {
  console.log("Setting up test environment...\n");

  // Get signers
  const [admin, doctor, user1, user2] = await hre.ethers.getSigners();

  // Contract addresses (update these after deployment)
  const USDC_ADDRESS = process.env.USDC_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const VERIFICATION_ADDRESS = process.env.VERIFICATION_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const RISKPOOL_ADDRESS = process.env.RISKPOOL_ADDRESS || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

  // Get contracts
  const usdc = await hre.ethers.getContractAt("MockUSDC", USDC_ADDRESS);
  const verification = await hre.ethers.getContractAt("Verification", VERIFICATION_ADDRESS);
  const riskPool = await hre.ethers.getContractAt("RiskPool", RISKPOOL_ADDRESS);

  console.log("Admin:", admin.address);
  console.log("Doctor:", doctor.address);
  console.log("User1:", user1.address);
  console.log("User2:", user2.address);
  console.log();

  // 1. Mint USDC to users
  console.log("1. Minting USDC to test users...");
  const amount = hre.ethers.parseUnits("100000", 6); // 100k USDC each
  await usdc.mint(user1.address, amount);
  await usdc.mint(user2.address, amount);
  console.log("✓ Minted 100,000 USDC to user1 and user2\n");

  // 2. Whitelist doctor
  console.log("2. Whitelisting doctor...");
  await verification.whitelistDoctor(doctor.address);
  console.log("✓ Doctor whitelisted:", doctor.address, "\n");

  // 3. Enroll user1
  console.log("3. Enrolling user1...");
  const premium = await riskPool.monthlyPremium();
  await usdc.connect(user1).approve(RISKPOOL_ADDRESS, premium);
  await riskPool.connect(user1).enroll();
  console.log("✓ User1 enrolled with premium:", hre.ethers.formatUnits(premium, 6), "USDC\n");

  // 4. Enroll user2
  console.log("4. Enrolling user2...");
  await usdc.connect(user2).approve(RISKPOOL_ADDRESS, premium);
  await riskPool.connect(user2).enroll();
  console.log("✓ User2 enrolled\n");

  // 5. Fast forward time past waiting period
  console.log("5. Fast forwarding time (180 days)...");
  await hre.ethers.provider.send("evm_increaseTime", [180 * 24 * 60 * 60]);
  await hre.ethers.provider.send("evm_mine", []);
  console.log("✓ Time advanced 180 days\n");

  // 6. Doctor submits diagnosis for user1
  console.log("6. Doctor submitting diagnosis for user1 (Stage II)...");
  await verification.connect(doctor).submitDiagnosis(user1.address, 2);
  console.log("✓ Diagnosis submitted\n");

  // 7. User1 submits claim
  console.log("7. User1 submitting claim...");
  await riskPool.connect(user1).submitClaim();
  console.log("✓ Claim submitted\n");

  // 8. Display current state
  console.log("=== Current State ===");
  const enrollmentInfo1 = await riskPool.getEnrollmentInfo(user1.address);
  const claimInfo1 = await riskPool.getClaimInfo(user1.address);
  const reserveBalance = await riskPool.getReserveBalance();
  const totalPremiums = await riskPool.totalPremiumsCollected();
  const pendingClaims = await riskPool.getPendingClaimsCount();

  console.log("\nUser1 Status:");
  console.log("- Enrolled:", enrollmentInfo1[2]);
  console.log("- Has Claimed:", enrollmentInfo1[3]);
  console.log("- Total Premiums Paid:", hre.ethers.formatUnits(enrollmentInfo1[4], 6), "USDC");

  console.log("\nUser1 Claim:");
  console.log("- Stage:", claimInfo1[0]);
  console.log("- Approved:", claimInfo1[2]);
  console.log("- Paid:", claimInfo1[3]);
  console.log("- Amount:", hre.ethers.formatUnits(claimInfo1[4], 6), "USDC");

  console.log("\nProtocol Stats:");
  console.log("- Reserve Balance:", hre.ethers.formatUnits(reserveBalance, 6), "USDC");
  console.log("- Total Premiums:", hre.ethers.formatUnits(totalPremiums, 6), "USDC");
  console.log("- Pending Claims:", pendingClaims.toString());

  console.log("\n=== Next Steps ===");
  console.log("1. Go to admin panel on frontend");
  console.log("2. Review claim for user1:", user1.address);
  console.log("3. Approve and execute payout");
  console.log("\nOr run the following commands:");
  console.log(`await riskPool.approveClaim("${user1.address}")`);
  console.log(`await riskPool.executePayout("${user1.address}")`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

