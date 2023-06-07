// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.8;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract Erc721Remake is Context, ERC165, IERC721, IERC721Metadata {
    using Address for address;
    using Strings for uint256;

    //define name and symbol states
    //define  a mapping from tokenid to owner _owners
    //define mapping with the balances of an address _balanceOf
    //define mapping for token approvals tokenid to address _tokenApprovals
    //definde mapping for operator approvals owner -> operator -> bool _operator Approvals

    // initialize the constructor setting up the name and the symbol
    string private _name;
    string private _symbol;

    mapping(uint256 => address) _owners;
    mapping(address => uint256) _balanceOf;
    mapping(uint256 => address) _tokenApprovals;
    mapping(address => mapping(address => bool)) _operatorApprovals;

    constructor() {}
}
