// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "hardhat/console.sol";

contract SvgHiosToken is ERC721 {
    // function to mint
    // store our nfts
    // logic to determine when to show x or y
    //data:image/svg+xml;base65,....
    uint256 s_tokenCounter;
    string private i_sadTokenURI;
    string private i_happyTokeniURI;
    string constant SVG_PREFIX = "data:image/svg+xml;base64,";
    string constant JSON_PREFIX = "data:application/json;base64,";
    mapping(uint256 => int256) s_tokenToPrice;

    AggregatorV3Interface internal immutable i_priceFeed;

    event NftMinted(uint256 tokenId, int256 priceThreshold);

    constructor(
        address princeFeedAddress,
        string memory sadToken,
        string memory happyToken
    ) ERC721("SVG Hios Token", "HSVG") {
        s_tokenCounter = 0;
        i_sadTokenURI = svgToUri(sadToken);
        i_happyTokeniURI = svgToUri(happyToken);
        i_priceFeed = AggregatorV3Interface(princeFeedAddress);
    }

    function svgToUri(string memory svgToken) internal pure returns (string memory) {
        string memory svgEncoded = Base64.encode(bytes(string(abi.encodePacked(svgToken))));

        return string(abi.encodePacked(SVG_PREFIX, svgEncoded));
    }

    function mint(int256 priceLimit) public {
        s_tokenCounter = s_tokenCounter + 1;
        s_tokenToPrice[s_tokenCounter] = priceLimit;
        _safeMint(_msgSender(), s_tokenCounter);
        emit NftMinted(s_tokenCounter, priceLimit);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        string memory imageURI = i_sadTokenURI;
        int256 priceLimit = s_tokenToPrice[tokenId];
        (, int256 priceFeed, , , ) = i_priceFeed.latestRoundData();

        if (priceLimit <= priceFeed) {
            imageURI = i_happyTokeniURI;
        }

        return
            string(
                abi.encodePacked(
                    JSON_PREFIX,
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                "{"
                                '"name:":"',
                                name(),
                                '",',
                                '"description":"And NFT that changes besed on the Eth price",',
                                '"attributes":[{"trait_type":"coolness","value":100}],',
                                '"image":"',
                                imageURI,
                                '"'
                                "}"
                            )
                        )
                    )
                )
            );
    }

    function getHappySvg() public view returns (string memory) {
        return i_happyTokeniURI;
    }

    function getSadSvg() public view returns (string memory) {
        return i_sadTokenURI;
    }

    function getPriceFeedAddress() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
