# Hedgely V0 - Complete Setup Guide

This guide will walk you through setting up Hedgely from scratch, including local development, testing, and deployment.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Local Development](#local-development)
4. [Testing](#testing)
5. [Frontend Setup](#frontend-setup)
6. [Common Issues](#common-issues)
7. [Next Steps](#next-steps)

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   ```bash
   node --version  # Should be v18+
   ```
   Download from: https://nodejs.org/

2. **npm** (comes with Node.js)
   ```bash
   npm --version
   ```

3. **Git**
   ```bash
   git --version
   ```

4. **MetaMask Browser Extension**
   - Install from: https://metamask.io/

### Recommended Software

- **Visual Studio Code** or your preferred IDE
- **Hardhat VS Code Extension** for Solidity support

## Initial Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd cancer-hedge-v0

# Install root dependencies (Hardhat, contracts)
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Environment Setup

```bash
# Copy environment files
cp .env.example .env

# Edit .env if needed (for testnet deployment later)
# For local development, defaults are fine
```

## Local Development

### Step 1: Start Hardhat Local Node

Open **Terminal 1** and run:

```bash
npm run node
```

**Expected Output:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
...
```

**Important:** Leave this terminal running! Note down:
- Account #0 address (this will be your admin account)
- Account #0 private key (for importing to MetaMask)

### Step 2: Deploy Contracts

Open **Terminal 2** and run:

```bash
npm run deploy:local
```

**Expected Output:**
```
Deploying Hedgely V0 contracts...

Deploying with account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Account balance: 10000.0 ETH

Deploying Mock USDC token for local testing...
Mock USDC deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3

Deploying Verification contract...
Verification deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

Deploying RiskPool contract...
RiskPool deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

=== Deployment Summary ===
Network: localhost
USDC Token: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Verification: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
RiskPool: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

Save these addresses to your frontend .env.local file!
```

**Copy these addresses!** You'll need them for the frontend.

### Step 3: Configure Frontend

1. Create frontend environment file:
```bash
cd frontend
cp .env.local.example .env.local
```

2. Edit `frontend/.env.local` with the deployed addresses:
```bash
NEXT_PUBLIC_RISKPOOL_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
NEXT_PUBLIC_VERIFICATION_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_USDC_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
```

### Step 4: Start Frontend

In **Terminal 3** (or Terminal 2 if you're done deploying):

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
▲ Next.js 14.0.4
- Local:        http://localhost:3000
- Ready in 2.3s
```

Open your browser to `http://localhost:3000`

### Step 5: Configure MetaMask

#### Add Hardhat Network

1. Open MetaMask
2. Click network dropdown (top)
3. Click "Add Network"
4. Click "Add a network manually"
5. Enter:
   - **Network Name:** Hardhat Local
   - **New RPC URL:** http://127.0.0.1:8545
   - **Chain ID:** 31337
   - **Currency Symbol:** ETH
6. Click "Save"

#### Import Admin Account

1. Click account icon → Import Account
2. Select "Private Key"
3. Paste the private key from Account #0 (from Terminal 1)
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
4. Click "Import"
5. Rename to "Hardhat Admin" for clarity

#### Import Test User Accounts

Repeat the import process for Account #1 and #2 if you want to test as different users:

**Account #1:**
```
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

**Account #2:**
```
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
```

### Step 6: Get Test USDC

The admin account (Account #0) automatically has 1,000,000 USDC after deployment.

To give USDC to other test accounts:

```bash
# In Terminal 2 or a new terminal
npx hardhat console --network localhost
```

Then in the console:
```javascript
const usdc = await ethers.getContractAt("MockUSDC", "0x5FbDB2315678afecb367f032d93F642f64180aa3")
await usdc.mint("0x70997970C51812dc3A010C7d01b50e0d17dc79C8", ethers.parseUnits("100000", 6))
// Replace address with your Account #1 address
```

## Testing

### Run Smart Contract Tests

```bash
# Full test suite
npm test

# Watch mode (re-run on changes)
npm test -- --watch

# Gas reporting
REPORT_GAS=true npm test

# Coverage
npx hardhat coverage
```

**Expected Output:**
```
  RiskPool
    Deployment
      ✓ Should set the deployer as admin
      ✓ Should set correct USDC token address
    ...
    
  Verification
    Deployment
      ✓ Should set the deployer as admin
    ...

  70 passing (5s)
```

## Frontend Setup

### Test Complete User Flow

1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Select MetaMask
   - Approve connection

2. **Enroll as User**
   - On homepage, click "Approve USDC"
   - Confirm MetaMask transaction
   - Click "Enroll Now"
   - Confirm enrollment transaction
   - Should see "You're Enrolled!" message

3. **Test as Admin**
   - Go to Admin page (`/admin`)
   - Should see admin panel (since you're using admin account)

4. **Whitelist a Doctor**
   - Use Account #1 address as doctor
   - Enter address in "Doctor Management"
   - Click "Whitelist Doctor"

5. **Submit Diagnosis (as Doctor)**
   - Switch MetaMask to Account #1
   - Use Hardhat console to submit diagnosis:
   ```javascript
   const verification = await ethers.getContractAt("Verification", "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512")
   await verification.submitDiagnosis("0xYOUR_USER_ADDRESS", 2) // Stage II
   ```

6. **Submit Claim (as User)**
   - Switch back to user account
   - Time travel past waiting period (see below)
   - Go to Claims page
   - Click "Submit Claim"

7. **Approve Claim (as Admin)**
   - Switch to admin account
   - Go to Admin page
   - Enter user address in Claim Review
   - Click "Approve Claim"
   - Click "Execute Payout"
   - User should receive USDC

### Time Travel (Skip Waiting Period)

For testing, you can skip the 6-month waiting period:

```bash
# In Hardhat console
npx hardhat console --network localhost
```

```javascript
// Fast forward 180 days (6 months)
await ethers.provider.send("evm_increaseTime", [180 * 24 * 60 * 60])
await ethers.provider.send("evm_mine", [])
```

## Common Issues

### Issue: "Cannot connect to local node"

**Solution:**
- Ensure Hardhat node is running (`npm run node`)
- Check that RPC URL is correct: `http://127.0.0.1:8545`
- Try restarting the node

### Issue: "Transaction failed: nonce too high"

**Solution:**
- Reset MetaMask account:
  - Settings → Advanced → Clear Activity Tab Data
  - Or reset account nonce manually

### Issue: "Contract address not found"

**Solution:**
- Ensure you've deployed contracts (`npm run deploy:local`)
- Check that addresses in `frontend/.env.local` match deployment output
- Restart frontend dev server

### Issue: "Insufficient funds"

**Solution:**
- Ensure you're using Account #0 (admin) which has 10000 ETH
- Mint USDC to your account (see "Get Test USDC" section)

### Issue: Frontend shows "0x..." for contract addresses

**Solution:**
- Check that `frontend/.env.local` has correct addresses
- Ensure env vars start with `NEXT_PUBLIC_`
- Restart dev server after changing env vars

### Issue: "Cannot read properties of undefined"

**Solution:**
- Make sure MetaMask is connected
- Check that you're on Hardhat Local network in MetaMask
- Refresh the page

## Next Steps

### For Development

1. **Modify Smart Contracts**
   - Edit files in `contracts/`
   - Run tests: `npm test`
   - Redeploy: `npm run deploy:local`

2. **Modify Frontend**
   - Edit files in `frontend/app/` and `frontend/components/`
   - Changes hot-reload automatically

3. **Add Features**
   - See ROADMAP in README.md for ideas
   - Follow existing code patterns

### For Testnet Deployment

1. Get testnet ETH from faucet
2. Update `.env` with:
   - `PRIVATE_KEY=your_private_key`
   - `SEPOLIA_RPC_URL=your_alchemy_or_infura_url`
3. Deploy: `npm run deploy:sepolia`
4. Update frontend with testnet addresses
5. Deploy frontend to Vercel

### For Production

⚠️ **Do NOT deploy to mainnet without:**
- Professional security audit
- Legal review
- Comprehensive testing
- Community feedback
- Insurance coverage

## Support

If you encounter issues:
1. Check this guide thoroughly
2. Review contract tests for examples
3. Check browser console for errors
4. Check terminal outputs for error messages
5. Open an issue on GitHub

---

**Happy Building! 🚀**

