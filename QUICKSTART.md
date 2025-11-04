# Hedgely V0 - Quick Start

Get up and running in 5 minutes!

## Prerequisites

- Node.js 18+
- MetaMask browser extension

## Installation

```bash
# Clone and install
git clone <repo-url>
cd cancer-hedge-v0
npm install
cd frontend && npm install && cd ..
```

## Run Locally

### Terminal 1: Start blockchain
```bash
npm run node
```
📝 **Copy the first account's private key** (you'll need it for MetaMask)

### Terminal 2: Deploy contracts
```bash
npm run deploy:local
```
📝 **Copy the three contract addresses** from the output

### Terminal 3: Configure and start frontend
```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local with the contract addresses you copied
npm run dev
```

### Configure MetaMask

1. **Add Network**
   - Name: Hardhat Local
   - RPC: http://127.0.0.1:8545
   - Chain ID: 31337
   - Symbol: ETH

2. **Import Account**
   - Use the private key from Terminal 1

3. **Visit App**
   - Open http://localhost:3000
   - Connect MetaMask

## Quick Test

```bash
# Optional: Set up test data
npm run setup:testnet
```

This creates:
- ✅ 2 enrolled users with USDC
- ✅ 1 whitelisted doctor
- ✅ 1 pending claim ready for approval
- ✅ Time fast-forwarded past waiting period

## Next Steps

1. **As User**: Enroll, pay premiums, submit claims
2. **As Admin**: Review admin panel, approve claims
3. **As Developer**: Run tests with `npm test`

## Documentation

- 📖 [Complete README](./README.md)
- 🛠 [Detailed Setup Guide](./SETUP_GUIDE.md)
- 👨‍💼 [Admin Guide](./ADMIN_GUIDE.md)

## Troubleshooting

**"Cannot connect to node"**
→ Ensure `npm run node` is running in Terminal 1

**"Wrong network"**
→ Switch MetaMask to "Hardhat Local"

**"Transaction failed"**
→ Reset MetaMask account: Settings → Advanced → Clear Activity Tab Data

**More help**: See [SETUP_GUIDE.md](./SETUP_GUIDE.md)

---

**Happy building! 🚀**

