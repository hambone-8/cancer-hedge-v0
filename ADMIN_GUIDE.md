# Hedgely V0 - Administrator Guide

This guide is for protocol administrators managing the Hedgely insurance platform.

## Table of Contents
1. [Admin Responsibilities](#admin-responsibilities)
2. [Initial Setup](#initial-setup)
3. [Doctor Management](#doctor-management)
4. [Claims Processing](#claims-processing)
5. [Protocol Controls](#protocol-controls)
6. [Monitoring](#monitoring)
7. [Emergency Procedures](#emergency-procedures)
8. [Best Practices](#best-practices)

## Admin Responsibilities

As a Hedgely administrator, you are responsible for:

- ✅ Vetting and whitelisting qualified doctors
- ✅ Reviewing and approving/rejecting claims
- ✅ Executing payouts for approved claims
- ✅ Monitoring protocol health and reserves
- ✅ Adjusting premiums when necessary
- ✅ Responding to emergencies (pausing protocol if needed)
- ✅ Maintaining transparency and communication with users

**Important:** In V0, the admin role carries significant responsibility. All administrative actions are on-chain and publicly visible for transparency.

## Initial Setup

### 1. Verify Admin Status

After contract deployment, verify you are the admin:

```javascript
// In Hardhat console or via frontend
const riskPool = await ethers.getContractAt("RiskPool", RISKPOOL_ADDRESS)
const adminAddress = await riskPool.admin()
console.log("Admin:", adminAddress)
```

### 2. Access Admin Panel

1. Connect wallet with admin address
2. Navigate to `/admin` on the frontend
3. Verify you can see the admin dashboard

If you see "Access Denied", ensure:
- You're connected with the correct wallet
- The wallet address matches the admin address on-chain

## Doctor Management

### Whitelisting Doctors

**When to Whitelist:**
- Licensed medical doctor verified off-chain
- Completed KYC/credential verification
- Agreed to protocol terms
- Understands how to submit diagnoses

**How to Whitelist:**

1. **Verify Doctor Credentials (Off-Chain)**
   - Check medical license with state medical board
   - Verify identity documents
   - Confirm specialty is relevant (oncology preferred)
   - Document verification in secure records

2. **Whitelist On-Chain**
   - Go to Admin Panel → Doctor Management
   - Enter doctor's wallet address
   - Click "Whitelist Doctor"
   - Confirm transaction in MetaMask
   - Verify success with "Check Status" button

**Example:**
```solidity
// Via contract
verification.whitelistDoctor(0x123...abc)
```

### Removing Doctors

**When to Remove:**
- License suspended or revoked
- Breach of protocol terms
- Suspicious activity detected
- Doctor requested removal

**How to Remove:**
1. Go to Admin Panel → Doctor Management
2. Enter doctor's wallet address
3. Click "Remove Doctor"
4. Confirm transaction
5. Past diagnoses remain valid, but doctor cannot submit new ones

## Claims Processing

### Workflow Overview

```
User Submits Claim
    ↓
Admin Reviews
    ↓
Approve ←→ Reject (with reason)
    ↓
Admin Executes Payout
    ↓
User Receives Funds
```

### Step 1: Review Claim

**What to Check:**

1. **Eligibility**
   - ✅ User is enrolled
   - ✅ Waiting period (6 months) completed
   - ✅ No previous claim

2. **Diagnosis Verification**
   - ✅ Diagnosis exists in Verification contract
   - ✅ Submitted by whitelisted doctor
   - ✅ Stage is valid (II, III, or IV)
   - ✅ Diagnosis date is after enrollment date

3. **Documentation (Off-Chain)**
   - Request medical records if needed
   - Verify diagnosis authenticity with doctor
   - Check for red flags (fraud indicators)

**How to Review:**

1. Go to Admin Panel → Claim Review
2. Enter patient address
3. Review displayed information:
   - Patient address
   - Cancer stage
   - Payout amount
   - Submission date
   - Current status

### Step 2: Approve or Reject

**To Approve:**
1. Verify all checks pass
2. Click "Approve Claim"
3. Confirm transaction
4. Status changes to "Approved"

**To Reject:**
1. Click "Reject Claim"
2. Enter clear rejection reason (will be on-chain)
3. Click "Confirm Rejection"
4. User is notified via blockchain event

**Rejection Reasons (Examples):**
- "Diagnosis not verified by medical board"
- "Enrollment date appears to post-date symptoms"
- "Documentation insufficient"
- "Waiting period not met"

### Step 3: Execute Payout

**Prerequisites:**
- Claim must be approved
- Sufficient funds in reserve
- No pending issues

**How to Execute:**
1. In Claim Review section
2. With approved claim displayed
3. Click "Execute Payout"
4. Confirm transaction
5. USDC transfers to patient's wallet
6. Status updates to "Paid"

**Verify Payout:**
```javascript
// Check user received funds
const usdc = await ethers.getContractAt("IERC20", USDC_ADDRESS)
const balance = await usdc.balanceOf(PATIENT_ADDRESS)
console.log("Patient USDC balance:", ethers.formatUnits(balance, 6))
```

## Protocol Controls

### Updating Premiums

**When to Update:**
- Reserve ratio falls below target
- Claims frequency increases
- Community votes on adjustment (future DAO governance)
- Economic conditions change

**V0 Limits:**
- Maximum 15% increase annually (governance principle)
- Changes affect new enrollments immediately
- Existing users locked at enrollment rate for term

**How to Update:**
1. Go to Admin Panel → Protocol Controls
2. Enter new premium amount (e.g., 25 for $25)
3. Click "Update"
4. Confirm transaction

**Example Calculation:**
```
Current: $20/month
Claims increased 20%
New premium: $20 * 1.20 = $24/month
```

### Pausing Protocol

**When to Pause:**
- 🚨 Security vulnerability discovered
- 🚨 Severe underfunding detected
- 🚨 Fraudulent activity spike
- 🚨 Smart contract bug found

**Effects of Pausing:**
- New enrollments blocked
- Premium payments blocked
- Claims submission blocked
- Claim approvals/payouts still work (admin can process pending)

**How to Pause:**
1. Go to Admin Panel → Protocol Controls
2. Click "Pause Protocol"
3. Confirm transaction
4. Communicate to users immediately

**How to Unpause:**
1. Verify issue resolved
2. Click "Unpause Protocol"
3. Confirm transaction
4. Announce resumption to community

## Monitoring

### Daily Tasks

**Check Reserve Health:**
```javascript
const reserve = await riskPool.getReserveBalance()
const premiums = await riskPool.totalPremiumsCollected()
const payouts = await riskPool.totalPayoutsIssued()

console.log("Reserve:", ethers.formatUnits(reserve, 6), "USDC")
console.log("Total Premiums:", ethers.formatUnits(premiums, 6), "USDC")
console.log("Total Payouts:", ethers.formatUnits(payouts, 6), "USDC")
console.log("Reserve Ratio:", (Number(reserve) / Number(premiums - payouts) * 100).toFixed(2), "%")
```

**Review Pending Claims:**
```javascript
const pendingCount = await riskPool.getPendingClaimsCount()
console.log("Pending Claims:", pendingCount.toString())
```

**Monitor Enrollments:**
```javascript
const enrolled = await riskPool.getEnrolledUsersCount()
console.log("Total Enrolled:", enrolled.toString())
```

### Weekly Tasks

- Review all pending claims
- Check doctor activity logs
- Analyze premium collection rate
- Review reserve projections
- Update community on protocol status

### Monthly Tasks

- Generate financial report
- Review premium adjustment needs
- Audit doctor whitelist
- Security review
- Community governance discussion

### Key Metrics to Track

| Metric | Healthy Range | Action If Outside |
|--------|---------------|-------------------|
| Reserve Ratio | 70-100% | Adjust premiums |
| Pending Claims | 0-5 | Review backlog |
| Active Enrollments | Growing | Marketing effort |
| Payout Rate | <5% enrollees | Fraud check |

## Emergency Procedures

### Scenario 1: Security Breach

1. **Immediate:**
   - Pause protocol
   - Assess vulnerability
   - Contact security auditor

2. **Short-term:**
   - Deploy patch if possible
   - Migrate to new contracts if needed
   - Communicate transparently with users

3. **Long-term:**
   - Post-mortem analysis
   - Implement additional safeguards
   - Community compensation if needed

### Scenario 2: Reserve Depletion

1. **Warning Signs:**
   - Reserve ratio < 50%
   - Multiple large claims pending
   - Enrollment declining

2. **Actions:**
   - Increase premiums (within limits)
   - Pause new enrollments temporarily
   - Seek additional capital/treasury injection
   - Communicate plan to community

### Scenario 3: Fraud Detection

1. **Indicators:**
   - Multiple claims from same doctor
   - Claims spike after enrollment
   - Diagnosis dates suspicious
   - Off-chain investigation concerns

2. **Response:**
   - Reject suspicious claims
   - Remove doctor from whitelist if implicated
   - Pause protocol if widespread
   - Document findings
   - Consider law enforcement if severe

## Best Practices

### Communication

✅ **Do:**
- Be transparent about all admin actions
- Explain reasons for claim rejections
- Regular updates to community
- Document decision-making process
- Respond promptly to user inquiries

❌ **Don't:**
- Make decisions without justification
- Withhold information about protocol health
- Approve claims without proper review
- Change parameters without notice

### Security

✅ **Do:**
- Use hardware wallet for admin account
- Keep private keys secure (hardware wallet, multi-sig in future)
- Test all actions on testnet first
- Maintain admin key backups securely
- Use transaction simulation before signing

❌ **Don't:**
- Share admin credentials
- Use admin account for other purposes
- Sign transactions without review
- Keep keys on internet-connected devices

### Governance Preparation (V1)

- Document all decisions and rationale
- Build consensus before major changes
- Prepare for admin → DAO transition
- Train multiple protocol contributors
- Establish governance frameworks

## Common Questions

**Q: How quickly should I process claims?**
A: Aim for 1-3 business days. Urgent cases (Stage IV) should be prioritized.

**Q: Can I reverse a payout?**
A: No, payouts are irreversible. Review carefully before executing.

**Q: What if I disagree with a whitelisted doctor's diagnosis?**
A: Reject the claim with detailed reasoning. Consider removing doctor if pattern emerges.

**Q: Can users appeal rejections?**
A: Not on-chain in V0. Off-chain communication can lead to resubmission with additional documentation.

**Q: What if the reserve runs out?**
A: Protocol would need to pause payouts until reserves replenished. This is a critical failure scenario requiring community action.

## Contact & Escalation

For V0, admin operates independently but should:
- Maintain public communication channel (Discord, forum)
- Document all major decisions
- Prepare monthly transparency reports
- Build toward decentralized governance

---

## Transitioning to DAO (Future)

This admin role is temporary. V1 will introduce:
- Multi-sig admin control
- Token-based governance
- Automated claim processing
- Decentralized doctor verification

Your role as initial admin is to:
1. Establish best practices
2. Build trust through transparency
3. Document processes for automation
4. Guide community toward self-governance

**Remember:** Every action is on-chain and permanent. Act with integrity and transparency.

