// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Verification
 * @dev Manages doctor verification and diagnosis submissions for Hedgely protocol
 * @notice V0: Admin-controlled doctor whitelisting with manual verification
 */
contract Verification {
    /// @dev Cancer stages supported by the protocol
    enum CancerStage {
        NONE,
        STAGE_II,
        STAGE_III,
        STAGE_IV
    }

    /// @dev Diagnosis information for a patient
    struct Diagnosis {
        address patient;
        CancerStage stage;
        address doctor;
        uint256 timestamp;
        bool exists;
    }

    /// @notice Admin address with control privileges
    address public admin;

    /// @notice Mapping of whitelisted doctor addresses
    mapping(address => bool) public whitelistedDoctors;

    /// @notice Mapping of patient address to their diagnosis
    mapping(address => Diagnosis) public diagnoses;

    /// @notice Emitted when a doctor is added to the whitelist
    event DoctorWhitelisted(address indexed doctor, uint256 timestamp);

    /// @notice Emitted when a doctor is removed from the whitelist
    event DoctorRemoved(address indexed doctor, uint256 timestamp);

    /// @notice Emitted when a diagnosis is submitted
    event DiagnosisSubmitted(
        address indexed patient,
        address indexed doctor,
        CancerStage stage,
        uint256 timestamp
    );

    /// @dev Restricts function access to admin only
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    /// @dev Restricts function access to whitelisted doctors only
    modifier onlyWhitelistedDoctor() {
        require(whitelistedDoctors[msg.sender], "Only whitelisted doctors can call this function");
        _;
    }

    /**
     * @dev Constructor sets the deployer as admin
     */
    constructor() {
        admin = msg.sender;
    }

    /**
     * @notice Whitelist a doctor address
     * @param doctor The address of the doctor to whitelist
     */
    function whitelistDoctor(address doctor) external onlyAdmin {
        require(doctor != address(0), "Invalid doctor address");
        require(!whitelistedDoctors[doctor], "Doctor already whitelisted");
        
        whitelistedDoctors[doctor] = true;
        emit DoctorWhitelisted(doctor, block.timestamp);
    }

    /**
     * @notice Remove a doctor from the whitelist
     * @param doctor The address of the doctor to remove
     */
    function removeDoctor(address doctor) external onlyAdmin {
        require(whitelistedDoctors[doctor], "Doctor not whitelisted");
        
        whitelistedDoctors[doctor] = false;
        emit DoctorRemoved(doctor, block.timestamp);
    }

    /**
     * @notice Submit a diagnosis for a patient
     * @param patient The address of the patient
     * @param stage The cancer stage (2, 3, or 4)
     */
    function submitDiagnosis(
        address patient,
        uint8 stage
    ) external onlyWhitelistedDoctor {
        require(patient != address(0), "Invalid patient address");
        require(stage >= 2 && stage <= 4, "Invalid stage: must be 2, 3, or 4");
        require(!diagnoses[patient].exists, "Diagnosis already exists for patient");

        CancerStage cancerStage;
        if (stage == 2) {
            cancerStage = CancerStage.STAGE_II;
        } else if (stage == 3) {
            cancerStage = CancerStage.STAGE_III;
        } else {
            cancerStage = CancerStage.STAGE_IV;
        }

        diagnoses[patient] = Diagnosis({
            patient: patient,
            stage: cancerStage,
            doctor: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        emit DiagnosisSubmitted(patient, msg.sender, cancerStage, block.timestamp);
    }

    /**
     * @notice Get diagnosis information for a patient
     * @param patient The address of the patient
     * @return stage The cancer stage
     * @return doctor The doctor who submitted the diagnosis
     * @return timestamp When the diagnosis was submitted
     * @return exists Whether a diagnosis exists
     */
    function getDiagnosis(address patient)
        external
        view
        returns (
            CancerStage stage,
            address doctor,
            uint256 timestamp,
            bool exists
        )
    {
        Diagnosis memory diagnosis = diagnoses[patient];
        return (diagnosis.stage, diagnosis.doctor, diagnosis.timestamp, diagnosis.exists);
    }

    /**
     * @notice Check if an address is a whitelisted doctor
     * @param doctor The address to check
     * @return bool True if the address is whitelisted
     */
    function isWhitelistedDoctor(address doctor) external view returns (bool) {
        return whitelistedDoctors[doctor];
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

