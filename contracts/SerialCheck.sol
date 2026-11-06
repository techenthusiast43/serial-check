// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SerialCheck
 * @notice Decentralized product serial number registration and verification registry on BOT Chain.
 * @dev Stores cryptographically hashed serial numbers, preserving secrecy of plaintext serials on-chain.
 */
contract SerialCheck {
    enum RegistrationStatus {
        Unregistered, // 0: Not registered
        Registered,   // 1: Active registration
        Revoked       // 2: Revoked by registrant
    }

    struct Product {
        string productName;
        string model;
        address registrant;
        uint64 registeredAt;
        uint64 revokedAt;
        RegistrationStatus status;
    }

    // Mapping from serialHash to Product details
    mapping(bytes32 => Product) private _products;

    // List of serial hashes registered by each address (for efficient dApp querying on public RPCs)
    mapping(address => bytes32[]) private _registrantProducts;

    // Events
    event ProductRegistered(
        bytes32 indexed serialHash,
        address indexed registrant,
        string productName,
        string model,
        uint256 timestamp
    );

    event ProductRevoked(
        bytes32 indexed serialHash,
        address indexed registrant,
        uint256 timestamp
    );

    // Custom errors for clarity and gas efficiency
    error InvalidSerialHash();
    error EmptyProductName();
    error EmptyModel();
    error AlreadyRegistered();
    error NotRegistered();
    error AlreadyRevoked();
    error NotAuthorized();

    /**
     * @notice Register a new product using its local serial hash.
     * @param serialHash Keccak-256 hash of the product serial number.
     * @param productName Human-readable product name.
     * @param model Product model name or number.
     */
    function registerProduct(
        bytes32 serialHash,
        string calldata productName,
        string calldata model
    ) external {
        if (serialHash == bytes32(0)) revert InvalidSerialHash();
        if (bytes(productName).length == 0) revert EmptyProductName();
        if (bytes(model).length == 0) revert EmptyModel();

        Product storage prod = _products[serialHash];
        if (prod.status != RegistrationStatus.Unregistered) {
            revert AlreadyRegistered();
        }

        _products[serialHash] = Product({
            productName: productName,
            model: model,
            registrant: msg.sender,
            registeredAt: uint64(block.timestamp),
            revokedAt: 0,
            status: RegistrationStatus.Registered
        });

        _registrantProducts[msg.sender].push(serialHash);

        emit ProductRegistered(
            serialHash,
            msg.sender,
            productName,
            model,
            block.timestamp
        );
    }

    /**
     * @notice Check registration status of a serial number hash.
     * @param serialHash Keccak-256 hash of the serial number.
     * @return status RegistrationStatus (0: Unregistered, 1: Registered, 2: Revoked).
     */
    function checkSerial(bytes32 serialHash)
        external
        view
        returns (RegistrationStatus)
    {
        return _products[serialHash].status;
    }

    /**
     * @notice Retrieve full product details for a given serial hash.
     * @param serialHash Keccak-256 hash of the serial number.
     */
    function getProduct(bytes32 serialHash)
        external
        view
        returns (
            string memory productName,
            string memory model,
            address registrant,
            uint64 registeredAt,
            uint64 revokedAt,
            RegistrationStatus status
        )
    {
        Product storage prod = _products[serialHash];
        return (
            prod.productName,
            prod.model,
            prod.registrant,
            prod.registeredAt,
            prod.revokedAt,
            prod.status
        );
    }

    /**
     * @notice Revoke a registered product. Only the original registrant can revoke it.
     * @param serialHash Keccak-256 hash of the product serial number to revoke.
     */
    function revokeProduct(bytes32 serialHash) external {
        Product storage prod = _products[serialHash];

        if (prod.status == RegistrationStatus.Unregistered) {
            revert NotRegistered();
        }
        if (prod.status == RegistrationStatus.Revoked) {
            revert AlreadyRevoked();
        }
        if (prod.registrant != msg.sender) {
            revert NotAuthorized();
        }

        prod.status = RegistrationStatus.Revoked;
        prod.revokedAt = uint64(block.timestamp);

        emit ProductRevoked(serialHash, msg.sender, block.timestamp);
    }

    /**
     * @notice Returns all serial hashes registered by a given address.
     * @param registrant Address of the product registrant.
     * @return hashes Array of bytes32 serial hashes.
     */
    function getProductsByRegistrant(address registrant)
        external
        view
        returns (bytes32[] memory)
    {
        return _registrantProducts[registrant];
    }
}

