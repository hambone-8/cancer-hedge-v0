export const CONTRACTS = {
  riskPool: process.env.NEXT_PUBLIC_RISKPOOL_ADDRESS || '',
  verification: process.env.NEXT_PUBLIC_VERIFICATION_ADDRESS || '',
  usdc: process.env.NEXT_PUBLIC_USDC_ADDRESS || '',
}

// ABI excerpts - minimal interfaces for the functions we need
export const RISKPOOL_ABI = [
  'function enroll() external',
  'function payPremium() external',
  'function submitClaim() external',
  'function approveClaim(address patient) external',
  'function rejectClaim(address patient, string reason) external',
  'function executePayout(address patient) external',
  'function pause() external',
  'function unpause() external',
  'function updatePremium(uint256 newPremium) external',
  'function getEnrollmentInfo(address user) external view returns (uint256 enrollmentDate, uint256 lastPremiumPayment, bool isActive, bool hasClaimed, uint256 totalPremiumsPaid)',
  'function getClaimInfo(address user) external view returns (uint8 stage, uint256 timestamp, bool approved, bool paid, uint256 amount)',
  'function getReserveBalance() external view returns (uint256)',
  'function hasPassedWaitingPeriod(address user) external view returns (bool)',
  'function monthlyPremium() external view returns (uint256)',
  'function totalPremiumsCollected() external view returns (uint256)',
  'function totalPayoutsIssued() external view returns (uint256)',
  'function paused() external view returns (bool)',
  'function admin() external view returns (address)',
  'function enrolledUsers(uint256) external view returns (address)',
  'function pendingClaims(uint256) external view returns (address)',
  'function getEnrolledUsersCount() external view returns (uint256)',
  'function getPendingClaimsCount() external view returns (uint256)',
  'event UserEnrolled(address indexed user, uint256 timestamp)',
  'event PremiumPaid(address indexed user, uint256 amount, uint256 timestamp)',
  'event ClaimSubmitted(address indexed patient, uint8 stage, uint256 amount, uint256 timestamp)',
  'event ClaimApproved(address indexed patient, uint256 amount, uint256 timestamp)',
  'event ClaimRejected(address indexed patient, string reason, uint256 timestamp)',
  'event PayoutExecuted(address indexed patient, uint256 amount, uint256 timestamp)',
] as const

export const VERIFICATION_ABI = [
  'function whitelistDoctor(address doctor) external',
  'function removeDoctor(address doctor) external',
  'function submitDiagnosis(address patient, uint8 stage) external',
  'function getDiagnosis(address patient) external view returns (uint8 stage, address doctor, uint256 timestamp, bool exists)',
  'function isWhitelistedDoctor(address doctor) external view returns (bool)',
  'function admin() external view returns (address)',
  'event DoctorWhitelisted(address indexed doctor, uint256 timestamp)',
  'event DoctorRemoved(address indexed doctor, uint256 timestamp)',
  'event DiagnosisSubmitted(address indexed patient, address indexed doctor, uint8 stage, uint256 timestamp)',
] as const

export const USDC_ABI = [
  'function balanceOf(address account) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
] as const

// Cancer stage enum mapping
export enum CancerStage {
  NONE = 0,
  STAGE_II = 1,
  STAGE_III = 2,
  STAGE_IV = 3,
}

export const STAGE_NAMES = {
  [CancerStage.NONE]: 'None',
  [CancerStage.STAGE_II]: 'Stage II',
  [CancerStage.STAGE_III]: 'Stage III',
  [CancerStage.STAGE_IV]: 'Stage IV',
}

export const STAGE_PAYOUTS = {
  [CancerStage.STAGE_II]: 25000,
  [CancerStage.STAGE_III]: 50000,
  [CancerStage.STAGE_IV]: 75000,
}

