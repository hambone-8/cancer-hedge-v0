# Hedgely V0 - Decentralized Cancer Support Protocol

A transparent, blockchain-based protocol providing financial relief for individuals diagnosed with invasive breast cancer.

## Overview

Hedgely is a decentralized insurance alternative built on Ethereum, offering one-time lump-sum payments to users diagnosed with Stage II-IV breast cancer. The protocol prioritizes simplicity, transparency, and fairness—delivering coverage without bureaucracy, profit-seeking intermediaries, or administrative waste.

**Key Features:**
- 🔒 **Transparent**: All funds and transactions publicly visible on blockchain
- ⚡ **Simple**: One-time payment upon verified diagnosis, no paperwork
- 🤝 **Fair**: No pre-existing condition checks, community-governed
- 💰 **Affordable**: ~$20/month premium with clear payout structure

## Architecture

### Smart Contracts

- **RiskPool.sol**: Core treasury managing enrollments, premiums, and payouts
- **Verification.sol**: Doctor whitelisting and diagnosis verification
- **MockUSDC.sol**: Test USDC token for local development

### Frontend

- **Next.js 14** with TypeScript
- **RainbowKit** for wallet connection
- **Wagmi** for Ethereum interactions
- **Recharts** for data visualization
- **Tailwind CSS** for styling

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd cancer-hedge-v0
```

2. **Install dependencies**
```bash
# Install contract dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

3. **Set up environment variables**
```bash
# Copy example env files
cp .env.example .env
cp frontend/.env.local.example frontend/.env.local
```

### Local Development

#### 1. Start Hardhat Node

In terminal 1:
```bash
npm run node
```

This starts a local Ethereum node at `http://127.0.0.1:8545`

#### 2. Deploy Contracts

In terminal 2:
```bash
npm run deploy:local
```

Copy the deployed contract addresses from the output and update `frontend/.env.local`:
```
NEXT_PUBLIC_RISKPOOL_ADDRESS=0x...
NEXT_PUBLIC_VERIFICATION_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
```

#### 3. Start Frontend

In terminal 3:
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000`

#### 4. Configure Wallet

1. Open MetaMask
2. Add network:
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency: ETH

3. Import test account (from Hardhat node output):
   - Copy private key of Account #0 (deployer/admin)
   - Import into MetaMask

### Running Tests

```bash
# Run all tests
npm test

# Run with gas reporting
REPORT_GAS=true npm test

# Run with coverage
npm run coverage
```

## Usage Guide

### For Users

#### 1. Enrollment
1. Connect your wallet
2. Approve USDC spending
3. Click "Enroll Now"
4. Pay first month's premium ($20 USDC)

#### 2. Pay Premiums
- Go to Dashboard
- Click "Pay Premium"
- Approve transaction

#### 3. Submit Claim
- Wait for 6-month waiting period
- Have doctor submit diagnosis (doctor must be whitelisted)
- Go to Claims page
- Click "Submit Claim"
- Wait for admin approval
- Receive payout to your wallet

### For Administrators

#### 1. Whitelist Doctor
1. Go to Admin panel
2. Enter doctor's wallet address
3. Click "Whitelist Doctor"

#### 2. Review Claims
1. Go to Admin panel
2. Enter patient address in "Claim Review"
3. Review claim details
4. Approve or reject claim
5. If approved, execute payout

#### 3. Protocol Controls
- Update monthly premium
- Pause/unpause protocol (emergency only)

## Project Structure

```
cancer-hedge-v0/
├── contracts/              # Solidity smart contracts
│   ├── RiskPool.sol
│   ├── Verification.sol
│   ├── MockUSDC.sol
│   └── interfaces/
├── scripts/                # Deployment scripts
│   └── deploy.js
├── test/                   # Contract tests
│   ├── RiskPool.test.js
│   └── Verification.test.js
├── frontend/               # Next.js frontend
│   ├── app/               # Pages
│   ├── components/        # React components
│   ├── lib/               # Utilities and configs
│   └── public/
├── hardhat.config.js
├── package.json
└── README.md
```

## Smart Contract API

### RiskPool

**User Functions:**
- `enroll()` - Enroll in the protocol
- `payPremium()` - Pay monthly premium
- `submitClaim()` - Submit a claim for payout

**Admin Functions:**
- `approveClaim(address patient)` - Approve a claim
- `rejectClaim(address patient, string reason)` - Reject a claim
- `executePayout(address patient)` - Execute approved payout
- `updatePremium(uint256 newPremium)` - Update monthly premium
- `pause() / unpause()` - Pause/unpause protocol

**View Functions:**
- `getEnrollmentInfo(address user)` - Get user enrollment details
- `getClaimInfo(address user)` - Get user claim details
- `getReserveBalance()` - Get current reserve balance
- `hasPassedWaitingPeriod(address user)` - Check waiting period status

### Verification

**Admin Functions:**
- `whitelistDoctor(address doctor)` - Whitelist a doctor
- `removeDoctor(address doctor)` - Remove a doctor

**Doctor Functions:**
- `submitDiagnosis(address patient, uint8 stage)` - Submit diagnosis (stage 2-4)

**View Functions:**
- `getDiagnosis(address patient)` - Get patient diagnosis
- `isWhitelistedDoctor(address doctor)` - Check doctor whitelist status

## Coverage Details

### Monthly Premium
- $20 USDC per month (adjustable by governance)

### Payouts by Stage
- **Stage II**: $25,000 USDC
- **Stage III**: $50,000 USDC
- **Stage IV**: $75,000 USDC

### Eligibility
- Diagnosis by U.S.-licensed medical doctor (whitelisted)
- 6-month waiting period post-enrollment
- No underwriting or pre-existing condition checks
- One-time payout per enrollment

## Security Considerations

### V0 Limitations

1. **Admin Control**: Single admin address controls all protocol functions. Future versions will implement DAO governance.

2. **Doctor Verification**: Manual whitelisting by admin. Future versions will use multi-sig or decentralized verification.

3. **Claim Verification**: Manual review by admin. Future versions will implement multi-doctor sign-off and reputation systems.

4. **No Recurrence Logic**: Only one claim per enrollment. Future versions may support multiple claims.

5. **Wallet Recovery**: No mechanism for lost keys. Consider implementing social recovery in v1.

### Best Practices

- Keep private keys secure
- Test thoroughly on testnet before mainnet
- Start with small amounts
- Regular security audits recommended for production

## Testing Coverage

Comprehensive test suite covering:
- ✅ User enrollment and duplicate prevention
- ✅ Premium payments
- ✅ Waiting period enforcement
- ✅ Claim submission and validation
- ✅ Admin claim approval/rejection
- ✅ Payout execution
- ✅ Doctor whitelisting
- ✅ Diagnosis submission
- ✅ Access control
- ✅ Pause/unpause functionality

## Roadmap

### V1 Planned Features
- DAO governance with token-based voting
- Multi-doctor claim verification
- Merkle proof individual verification
- Doctor staking and slashing
- Yield generation on reserves (Aave, Compound)
- Premium adjustment algorithm
- Event indexing for full transaction history

### V2+ Potential Features
- Additional cancer types (lung, colorectal, leukemia)
- Non-cancer diseases (ALS, MS, kidney disease)
- Geographic expansion beyond U.S.
- Zero-knowledge proof integration for privacy
- Cross-chain deployment
- Mobile app

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Disclaimer

**This is experimental software.** Hedgely v0 is a prototype and should not be used with real funds without proper auditing. This is not traditional insurance and may face regulatory challenges. Use at your own risk.

## Support

For questions, issues, or feature requests:
- Open an issue on GitHub
- Join our community Discord (coming soon)

---

*"Elegance is not the abundance of simplicity. It is the absence of complexity."* — Vitalik Buterin

