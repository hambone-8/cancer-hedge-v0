const hre = require("hardhat");

async function main() {
  console.log("Deploying Hedgely V0 contracts...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // For local testing, we'll deploy a mock USDC token
  // For testnet/mainnet, use the actual USDC address from environment variables
  let usdcAddress;

  if (hre.network.name === "localhost" || hre.network.name === "hardhat") {
    console.log("Deploying Mock USDC token for local testing...");
    const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
    const mockUSDC = await MockUSDC.deploy();
    await mockUSDC.waitForDeployment();
    usdcAddress = await mockUSDC.getAddress();
    console.log("Mock USDC deployed to:", usdcAddress, "\n");
  } else if (hre.network.name === "sepolia") {
    usdcAddress = process.env.USDC_SEPOLIA;
    console.log("Using USDC Sepolia address:", usdcAddress, "\n");
  } else if (hre.network.name === "polygonMumbai") {
    usdcAddress = process.env.USDC_MUMBAI;
    console.log("Using USDC Mumbai address:", usdcAddress, "\n");
  }

  // Deploy Verification contract
  console.log("Deploying Verification contract...");
  const Verification = await hre.ethers.getContractFactory("Verification");
  const verification = await Verification.deploy();
  await verification.waitForDeployment();
  const verificationAddress = await verification.getAddress();
  console.log("Verification deployed to:", verificationAddress);

  // Deploy RiskPool contract
  console.log("\nDeploying RiskPool contract...");
  const RiskPool = await hre.ethers.getContractFactory("RiskPool");
  const riskPool = await RiskPool.deploy(usdcAddress, verificationAddress);
  await riskPool.waitForDeployment();
  const riskPoolAddress = await riskPool.getAddress();
  console.log("RiskPool deployed to:", riskPoolAddress);

  // Summary
  console.log("\n=== Deployment Summary ===");
  console.log("Network:", hre.network.name);
  console.log("USDC Token:", usdcAddress);
  console.log("Verification:", verificationAddress);
  console.log("RiskPool:", riskPoolAddress);
  console.log("\nSave these addresses to your frontend .env.local file!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

