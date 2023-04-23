// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IMarketplaceStorage.sol";

interface IMarketplaceERC721 is IMarketplaceStorage {
    function createAuction(
        uint256 tokenId,
        uint256 buyoutPrice,
        uint256 startingPrice,
        uint256 auctionStartDate,
        uint256 auctionEndDate
    ) external;

    function addBid(uint256 tokenId) external payable;

    function claimToken(uint256 tokenId) external;

    function claimBids(uint256 tokenId) external payable;

    function retrieveTokenNotSold(uint256 tokenId) external;

    function getAuctionForTokenId(
        uint256 tokenId
    ) external view returns (Auction memory);

    function getAuctionBids(uint256 tokenId) external view returns (Bid memory);
}
