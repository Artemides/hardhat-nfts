// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract RandomNft is VRFConsumerBaseV2, ERC721URIStorage {
    enum Rarety {
        HELIOS_CLASSIC,
        HELIOS_RARE,
        HELIOS_MITHIC,
        HELIOS_ULTRA
    }

    uint256 private s_tokenCounter;
    string[] internal i_heliosUris;

    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;

    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private REQUEST_CONFIRMATIONS = 3;
    uint32 private NUM_WORDS = 1;

    mapping(uint256 => address) s_requestIdToOwner;

    uint8 private constant MAX_RARETY_CHANCE = 100;

    error RandomNft__RaretyOutOfBounds();

    constructor(
        address vrfCoordinator,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        string[3] memory heliosUris
    ) VRFConsumerBaseV2(vrfCoordinator) ERC721("Random Hios Token", "RHIOS") {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinator);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        s_tokenCounter = 0;
        i_heliosUris = heliosUris;
    }

    function requestRandomNFT() public returns (uint256 requestId) {
        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        s_requestIdToOwner[requestId] = msg.sender;
    }

    function getRaretyFromRandomWord(uint256 raretyChance) internal pure returns (Rarety) {
        uint256 leftLimit = 0;
        uint256[4] memory raretyChances = getRarityChances();

        for (uint256 i = 0; i < raretyChances.length; i++) {
            if (raretyChance > leftLimit && raretyChance <= raretyChances[i]) {
                return Rarety(i);
            }
            leftLimit = raretyChances[i];
        }
        revert RandomNft__RaretyOutOfBounds();
    }

    function getRarityChances() private pure returns (uint256[4] memory) {
        return [60, 80, 95, uint256(MAX_RARETY_CHANCE)];
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        address hiosOwner = s_requestIdToOwner[requestId];
        uint256 tokenId = s_tokenCounter;

        uint256 raretyChance = randomWords[0] % MAX_RARETY_CHANCE;
        Rarety raretyMinted = getRaretyFromRandomWord(raretyChance);
        _mint(hiosOwner, tokenId);
        _setTokenURI(tokenId, i_heliosUris[uint256(raretyMinted)]);
    }
}
