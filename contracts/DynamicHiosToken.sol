// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";

contract Name is ERC721 {
    // function to mint
    // store our nfts
    // logic to determine when to show x or y
    //data:image/svg+xml;base65,....
    uint256 s_tokenCounter;
    string constant SVG_PREFIX = "data:image/svg+xml;base64,";

    // string private immutable i_sadToken;
    // string private immutable i_happyToken;

    constructor(string memory sadToken, string memory happyToken) ERC721("SVG Hios Token", "HSVG") {
        s_tokenCounter = 0;
    }

    function svgToUri(string memory svgToken) internal pure returns (string memory) {
        string memory svgEncoded = Base64.encode(bytes(string(abi.encodePacked(svgToken))));

        return string(abi.encodePacked(SVG_PREFIX, svgEncoded));
    }

    function mint() public {
        _safeMint(_msgSender(), s_tokenCounter);
        s_tokenCounter = s_tokenCounter + 1;
    }
}
