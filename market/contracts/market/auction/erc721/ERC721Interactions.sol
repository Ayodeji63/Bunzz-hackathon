// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ERC721Interactions {
    event TokenSet(address setter, address token);

    address private token;

    function _setTokenContract(address _token) internal {
        require(
            token != _token,
            "ERC721Interactions: The new address is the same as the old one"
        );
        emit TokenSet(msg.sender, _token);
        token = _token;
    }

    function getToken() internal view returns (address) {
        return token;
    }

    function _balance(address owner) internal view returns (uint256) {
        IERC721 _token = IERC721(token);
        uint256 balance = _token.balanceOf(owner);
        return balance;
    }

    function _transferTokens(
        address from,
        address to,
        uint256 id
    ) internal returns (bool) {
        IERC721 _token = IERC721(token);
        _token.safeTransferFrom(from, to, id);
    }
}
