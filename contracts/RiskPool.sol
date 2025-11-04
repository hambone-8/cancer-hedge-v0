// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IERC20.sol";
import "./Verification.sol";

/**
 * @title RiskPool
 * @dev Core treasury contract managing enrollments, premiums, and payouts for Hedgely protocol
 * @notice V0: Admin-controlled with manual claim approvals
 */
contract RiskPool {
    /// @dev User enrollment information
    struct Enrollment {
        uint256 enrollmentDate;
        uint256 lastPremiumPayment;
        bool isActive;
        bool hasClaimed;
        uint256 totalPremiumsPaid;
    }

    /// @dev Claim information
    struct Claim {
        address patient;
        Verification.CancerStage stage;
        uint256 timestamp;
        bool approved;
        bool paid;
        uint256 amount;
    }

    /// @notice Admin address with control privileges
    address public admin;

    /// @notice USDC token contract address
    IERC20 public usdcToken;

    /// @notice Verification contract address
    Verification public verificationContract;

    /// @notice Monthly premium amount in USDC (with 6 decimals for USDC)
    uint256 public monthlyPremium = 20 * 10**6; // $20 USDC

    /// @notice Waiting period in seconds (6 months)
    uint256 public constant WAITING_PERIOD = 180 days;

    /// @notice Payout amounts by cancer stage (in USDC with 6 decimals)
    uint256 public constant STAGE_II_PAYOUT = 25_000 * 10**6;   // $25,000
    uint256 public constant STAGE_III_PAYOUT = 50_000 * 10**6;  // $50,000
    uint256 public constant STAGE_IV_PAYOUT = 75_000 * 10**6;   // $75,000

    /// @notice Protocol paused state
    bool public paused;

    /// @notice Total premiums collected
    uint256 public totalPremiumsCollected;

    /// @notice Total payouts issued
    uint256 public totalPayoutsIssued;

    /// @notice Mapping of user address to enrollment info
    mapping(address => Enrollment) public enrollments;

    /// @notice Mapping of user address to claim info
    mapping(address => Claim) public claims;

    /// @notice Array of all enrolled users
    address[] public enrolledUsers;

    /// @notice Array of all pending claims
    address[] public pendingClaims;

    /// @notice Emitted when a user enrolls
    event UserEnrolled(address indexed user, uint256 timestamp);

    /// @notice Emitted when a premium is paid
    event PremiumPaid(address indexed user, uint256 amount, uint256 timestamp);

    /// @notice Emitted when a claim is submitted
    event ClaimSubmitted(
        address indexed patient,
        Verification.CancerStage stage,
        uint256 amount,
        uint256 timestamp
    );

    /// @notice Emitted when a claim is approved
    event ClaimApproved(address indexed patient, uint256 amount, uint256 timestamp);

    /// @notice Emitted when a claim is rejected
    event ClaimRejected(address indexed patient, string reason, uint256 timestamp);

    /// @notice Emitted when a payout is executed
    event PayoutExecuted(address indexed patient, uint256 amount, uint256 timestamp);

    /// @notice Emitted when the protocol is paused
    event ProtocolPaused(uint256 timestamp);

    /// @notice Emitted when the protocol is unpaused
    event ProtocolUnpaused(uint256 timestamp);

    /// @notice Emitted when monthly premium is updated
    event PremiumUpdated(uint256 oldPremium, uint256 newPremium, uint256 timestamp);

    /// @dev Restricts function access to admin only
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    /// @dev Prevents function execution when protocol is paused
    modifier whenNotPaused() {
        require(!paused, "Protocol is paused");
        _;
    }

    /// @dev Prevents function execution when protocol is not paused
    modifier whenPaused() {
        require(paused, "Protocol is not paused");
        _;
    }

    /**
     * @dev Constructor sets the admin, USDC token, and verification contract
     * @param _usdcToken Address of the USDC token contract
     * @param _verificationContract Address of the Verification contract
     */
    constructor(address _usdcToken, address _verificationContract) {
        require(_usdcToken != address(0), "Invalid USDC token address");
        require(_verificationContract != address(0), "Invalid verification contract address");
        
        admin = msg.sender;
        usdcToken = IERC20(_usdcToken);
        verificationContract = Verification(_verificationContract);
        paused = false;
    }

    /**
     * @notice Enroll a user in the protocol
     * @dev User must approve USDC transfer before calling this function
     */
    function enroll() external whenNotPaused {
        require(!enrollments[msg.sender].isActive, "User already enrolled");
        require(
            usdcToken.transferFrom(msg.sender, address(this), monthlyPremium),
            "Premium payment failed"
        );

        enrollments[msg.sender] = Enrollment({
            enrollmentDate: block.timestamp,
            lastPremiumPayment: block.timestamp,
            isActive: true,
            hasClaimed: false,
            totalPremiumsPaid: monthlyPremium
        });

        enrolledUsers.push(msg.sender);
        totalPremiumsCollected += monthlyPremium;

        emit UserEnrolled(msg.sender, block.timestamp);
        emit PremiumPaid(msg.sender, monthlyPremium, block.timestamp);
    }

    /**
     * @notice Pay monthly premium
     * @dev User must approve USDC transfer before calling this function
     */
    function payPremium() external whenNotPaused {
        require(enrollments[msg.sender].isActive, "User not enrolled");
        require(
            usdcToken.transferFrom(msg.sender, address(this), monthlyPremium),
            "Premium payment failed"
        );

        enrollments[msg.sender].lastPremiumPayment = block.timestamp;
        enrollments[msg.sender].totalPremiumsPaid += monthlyPremium;
        totalPremiumsCollected += monthlyPremium;

        emit PremiumPaid(msg.sender, monthlyPremium, block.timestamp);
    }

    /**
     * @notice Submit a claim for payout
     * @dev Requires a verified diagnosis from Verification contract
     */
    function submitClaim() external whenNotPaused {
        require(enrollments[msg.sender].isActive, "User not enrolled");
        require(!enrollments[msg.sender].hasClaimed, "User has already claimed");
        require(!claims[msg.sender].timestamp > 0, "Claim already submitted");
        
        // Check waiting period
        require(
            block.timestamp >= enrollments[msg.sender].enrollmentDate + WAITING_PERIOD,
            "Waiting period not completed"
        );

        // Get diagnosis from Verification contract
        (
            Verification.CancerStage stage,
            ,
            uint256 diagnosisTimestamp,
            bool exists
        ) = verificationContract.getDiagnosis(msg.sender);

        require(exists, "No diagnosis found");
        require(stage != Verification.CancerStage.NONE, "Invalid diagnosis stage");
        
        // Ensure diagnosis was made after enrollment
        require(
            diagnosisTimestamp >= enrollments[msg.sender].enrollmentDate,
            "Diagnosis predates enrollment"
        );

        // Calculate payout amount based on stage
        uint256 payoutAmount;
        if (stage == Verification.CancerStage.STAGE_II) {
            payoutAmount = STAGE_II_PAYOUT;
        } else if (stage == Verification.CancerStage.STAGE_III) {
            payoutAmount = STAGE_III_PAYOUT;
        } else if (stage == Verification.CancerStage.STAGE_IV) {
            payoutAmount = STAGE_IV_PAYOUT;
        }

        claims[msg.sender] = Claim({
            patient: msg.sender,
            stage: stage,
            timestamp: block.timestamp,
            approved: false,
            paid: false,
            amount: payoutAmount
        });

        pendingClaims.push(msg.sender);

        emit ClaimSubmitted(msg.sender, stage, payoutAmount, block.timestamp);
    }

    /**
     * @notice Approve a claim (admin only)
     * @param patient The address of the patient
     */
    function approveClaim(address patient) external onlyAdmin {
        require(claims[patient].timestamp > 0, "No claim found");
        require(!claims[patient].approved, "Claim already approved");
        require(!claims[patient].paid, "Claim already paid");

        claims[patient].approved = true;

        emit ClaimApproved(patient, claims[patient].amount, block.timestamp);
    }

    /**
     * @notice Reject a claim (admin only)
     * @param patient The address of the patient
     * @param reason The reason for rejection
     */
    function rejectClaim(address patient, string calldata reason) external onlyAdmin {
        require(claims[patient].timestamp > 0, "No claim found");
        require(!claims[patient].paid, "Claim already paid");

        // Remove claim
        delete claims[patient];

        // Remove from pending claims
        _removePendingClaim(patient);

        emit ClaimRejected(patient, reason, block.timestamp);
    }

    /**
     * @notice Execute payout for an approved claim
     * @param patient The address of the patient
     */
    function executePayout(address patient) external onlyAdmin {
        require(claims[patient].approved, "Claim not approved");
        require(!claims[patient].paid, "Claim already paid");
        
        uint256 payoutAmount = claims[patient].amount;
        require(
            usdcToken.balanceOf(address(this)) >= payoutAmount,
            "Insufficient funds in pool"
        );

        claims[patient].paid = true;
        enrollments[patient].hasClaimed = true;
        totalPayoutsIssued += payoutAmount;

        // Remove from pending claims
        _removePendingClaim(patient);

        require(
            usdcToken.transfer(patient, payoutAmount),
            "Payout transfer failed"
        );

        emit PayoutExecuted(patient, payoutAmount, block.timestamp);
    }

    /**
     * @notice Update monthly premium amount (admin only)
     * @param newPremium New monthly premium amount
     */
    function updatePremium(uint256 newPremium) external onlyAdmin {
        require(newPremium > 0, "Invalid premium amount");
        uint256 oldPremium = monthlyPremium;
        monthlyPremium = newPremium;
        emit PremiumUpdated(oldPremium, newPremium, block.timestamp);
    }

    /**
     * @notice Pause the protocol (admin only)
     */
    function pause() external onlyAdmin whenNotPaused {
        paused = true;
        emit ProtocolPaused(block.timestamp);
    }

    /**
     * @notice Unpause the protocol (admin only)
     */
    function unpause() external onlyAdmin whenPaused {
        paused = false;
        emit ProtocolUnpaused(block.timestamp);
    }

    /**
     * @notice Get reserve balance (current pool balance)
     * @return uint256 Current USDC balance in the pool
     */
    function getReserveBalance() external view returns (uint256) {
        return usdcToken.balanceOf(address(this));
    }

    /**
     * @notice Get enrollment info for a user
     * @param user The address of the user
     * @return enrollmentDate When the user enrolled
     * @return lastPremiumPayment When the user last paid premium
     * @return isActive Whether the user is currently enrolled
     * @return hasClaimed Whether the user has claimed
     * @return totalPremiumsPaid Total premiums paid by the user
     */
    function getEnrollmentInfo(address user)
        external
        view
        returns (
            uint256 enrollmentDate,
            uint256 lastPremiumPayment,
            bool isActive,
            bool hasClaimed,
            uint256 totalPremiumsPaid
        )
    {
        Enrollment memory enrollment = enrollments[user];
        return (
            enrollment.enrollmentDate,
            enrollment.lastPremiumPayment,
            enrollment.isActive,
            enrollment.hasClaimed,
            enrollment.totalPremiumsPaid
        );
    }

    /**
     * @notice Get claim info for a user
     * @param user The address of the user
     * @return stage Cancer stage
     * @return timestamp When the claim was submitted
     * @return approved Whether the claim is approved
     * @return paid Whether the claim has been paid
     * @return amount Payout amount
     */
    function getClaimInfo(address user)
        external
        view
        returns (
            Verification.CancerStage stage,
            uint256 timestamp,
            bool approved,
            bool paid,
            uint256 amount
        )
    {
        Claim memory claim = claims[user];
        return (claim.stage, claim.timestamp, claim.approved, claim.paid, claim.amount);
    }

    /**
     * @notice Get number of enrolled users
     * @return uint256 Number of enrolled users
     */
    function getEnrolledUsersCount() external view returns (uint256) {
        return enrolledUsers.length;
    }

    /**
     * @notice Get number of pending claims
     * @return uint256 Number of pending claims
     */
    function getPendingClaimsCount() external view returns (uint256) {
        return pendingClaims.length;
    }

    /**
     * @notice Check if user has passed waiting period
     * @param user The address of the user
     * @return bool True if waiting period has passed
     */
    function hasPassedWaitingPeriod(address user) external view returns (bool) {
        if (!enrollments[user].isActive) {
            return false;
        }
        return block.timestamp >= enrollments[user].enrollmentDate + WAITING_PERIOD;
    }

    /**
     * @dev Internal function to remove a pending claim
     * @param patient The address of the patient
     */
    function _removePendingClaim(address patient) internal {
        for (uint256 i = 0; i < pendingClaims.length; i++) {
            if (pendingClaims[i] == patient) {
                pendingClaims[i] = pendingClaims[pendingClaims.length - 1];
                pendingClaims.pop();
                break;
            }
        }
    }

    /**
     * @notice Transfer admin role to a new address
     * @param newAdmin The address of the new admin
     */
    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid admin address");
        admin = newAdmin;
    }
}

