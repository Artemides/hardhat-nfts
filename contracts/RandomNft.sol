// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.8;

// users need to pay to mint an NFT
// when minting a NFT request a chainlink VRF for a random number
// get a super rare pub, sort of rare shina inu, St. bernard common

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract RandomNft is VRFConsumerBaseV2, ERC721 {
    uint256 private s_tokenCounter;

    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;

    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private REQUEST_CONFIRMATIONS = 3;
    uint32 private NUM_WORDS = 1;

    mapping(uint256 => address) s_requestIdToOwner;

    constructor(
        address vrfCoordinator,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vrfCoordinator) ERC721("Random Hios Token", "RHIOS") {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinator);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        s_tokenCounter = 0;
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

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory /* randomWords */
    ) internal override {
        address hiosOwner = s_requestIdToOwner[requestId];
        uint256 tokenCounter = s_tokenCounter;
        _mint(hiosOwner, tokenCounter);
    }
}
