// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title  SupplyChain — on-chain product registry, ownership transfer, and movement history.
/// @notice Manufacturers register products; current owners transfer/update; anyone can verify.
contract SupplyChain is AccessControl, ReentrancyGuard {
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE  = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant RETAILER_ROLE     = keccak256("RETAILER_ROLE");

    enum Status {
        Manufactured,
        InWarehouse,
        InTransit,
        ReceivedByDistributor,
        ReceivedByRetailer,
        SoldToCustomer,
        Recalled,
        Suspicious
    }

    struct Product {
        bytes32 id;
        address manufacturer;
        address currentOwner;
        uint64  producedAt;
        uint64  expiresAt;
        Status  status;
        string  metadataCID;  // IPFS CID with full off-chain metadata (name, image, batch, ...)
        bool    flagged;
        bool    exists;
    }

    struct Checkpoint {
        address actor;
        uint64  timestamp;
        Status  status;
        string  location;
        string  note;
    }

    mapping(bytes32 => Product) private _products;
    mapping(bytes32 => Checkpoint[]) private _history;
    bytes32[] private _allProductIds;

    event ProductRegistered(bytes32 indexed id, address indexed manufacturer, string metadataCID);
    event StatusUpdated(bytes32 indexed id, Status status, address indexed actor, string location);
    event OwnershipTransferred(bytes32 indexed id, address indexed from, address indexed to);
    event CheckpointAdded(bytes32 indexed id, address indexed actor, string location, string note);
    event ProductFlagged(bytes32 indexed id, address indexed by);
    event ProductRecalled(bytes32 indexed id, address indexed by);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    modifier productExists(bytes32 id) {
        require(_products[id].exists, "product not found");
        _;
    }

    modifier onlyOwnerOf(bytes32 id) {
        require(_products[id].currentOwner == msg.sender, "not current owner");
        _;
    }

    /// @notice Register a new product. Caller must hold MANUFACTURER_ROLE.
    function registerProduct(
        bytes32 id,
        uint64 expiresAt,
        string calldata metadataCID
    ) external onlyRole(MANUFACTURER_ROLE) {
        require(!_products[id].exists, "duplicate product id");
        require(bytes(metadataCID).length > 0, "metadataCID required");

        _products[id] = Product({
            id: id,
            manufacturer: msg.sender,
            currentOwner: msg.sender,
            producedAt: uint64(block.timestamp),
            expiresAt: expiresAt,
            status: Status.Manufactured,
            metadataCID: metadataCID,
            flagged: false,
            exists: true
        });
        _allProductIds.push(id);

        _history[id].push(Checkpoint({
            actor: msg.sender,
            timestamp: uint64(block.timestamp),
            status: Status.Manufactured,
            location: "Manufacturer",
            note: "Product registered"
        }));

        emit ProductRegistered(id, msg.sender, metadataCID);
    }

    /// @notice Update product status; only current owner.
    function updateStatus(
        bytes32 id,
        Status status,
        string calldata location,
        string calldata note
    ) external nonReentrant productExists(id) onlyOwnerOf(id) {
        _products[id].status = status;
        _history[id].push(Checkpoint({
            actor: msg.sender,
            timestamp: uint64(block.timestamp),
            status: status,
            location: location,
            note: note
        }));
        emit StatusUpdated(id, status, msg.sender, location);
    }

    /// @notice Transfer ownership and append a receiving checkpoint.
    function transferOwnership(
        bytes32 id,
        address to,
        Status newStatus,
        string calldata location
    ) external nonReentrant productExists(id) onlyOwnerOf(id) {
        require(to != address(0), "zero address");
        require(to != msg.sender, "cannot transfer to self");
        address from = _products[id].currentOwner;
        _products[id].currentOwner = to;
        _products[id].status = newStatus;

        _history[id].push(Checkpoint({
            actor: to,
            timestamp: uint64(block.timestamp),
            status: newStatus,
            location: location,
            note: "Ownership transferred"
        }));

        emit OwnershipTransferred(id, from, to);
        emit StatusUpdated(id, newStatus, to, location);
    }

    /// @notice Add a freeform checkpoint without changing status.
    function addCheckpoint(
        bytes32 id,
        string calldata location,
        string calldata note
    ) external productExists(id) onlyOwnerOf(id) {
        _history[id].push(Checkpoint({
            actor: msg.sender,
            timestamp: uint64(block.timestamp),
            status: _products[id].status,
            location: location,
            note: note
        }));
        emit CheckpointAdded(id, msg.sender, location, note);
    }

    /// @notice Flag a product as suspicious. Admin or manufacturer of record.
    function flagSuspicious(bytes32 id) external productExists(id) {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || _products[id].manufacturer == msg.sender,
            "not authorised"
        );
        _products[id].flagged = true;
        _products[id].status = Status.Suspicious;
        emit ProductFlagged(id, msg.sender);
    }

    /// @notice Recall a product. Admin or original manufacturer only.
    function recall(bytes32 id) external productExists(id) {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || _products[id].manufacturer == msg.sender,
            "not authorised"
        );
        _products[id].status = Status.Recalled;
        _history[id].push(Checkpoint({
            actor: msg.sender,
            timestamp: uint64(block.timestamp),
            status: Status.Recalled,
            location: "Recall",
            note: "Product recalled"
        }));
        emit ProductRecalled(id, msg.sender);
    }

    // ---------- Views ----------

    function verify(bytes32 id) external view returns (Product memory product, bool exists) {
        product = _products[id];
        exists = product.exists;
    }

    function getHistory(bytes32 id) external view returns (Checkpoint[] memory) {
        return _history[id];
    }

    function totalProducts() external view returns (uint256) {
        return _allProductIds.length;
    }

    function productIdAt(uint256 index) external view returns (bytes32) {
        return _allProductIds[index];
    }
}
