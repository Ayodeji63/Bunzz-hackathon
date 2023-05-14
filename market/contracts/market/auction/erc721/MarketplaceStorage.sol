// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IMarketplaceStorage.sol";

contract MarketplaceStorage is IMarketplaceStorage {
    mapping(uint256 => Auction) private auctions;
    mapping(uint256 => Bid) private bids;

    function _auctions(uint256 id) internal view returns (Auction memory) {
        return auctions[id];
    }

    function _bids(uint256 id) internal view returns (Bid memory) {
        return bids[id];
    }

    function _addAuction(Auction memory auction) internal {
        auctions[auction.tokenId] = auction;
    }

    function _tokensHaveBeenWithdrawed(uint256 id) internal {
        require(auctions[id].tokensWithdrawed == false);
        auctions[id].tokensWithdrawed = true;
    }

    function _addBid(uint256 id, Bid memory bid) internal {
        bids[id] = bid;
    }

    function _getBid(uint256 id) internal view returns (Bid memory) {
        Bid memory bid = bids[id];
        return bid;
    }

    function _getAuction(uint256 id) internal view returns (Auction memory) {
        Auction memory auction = auctions[id];
        return auction;
    }

    function _addBid(uint256 id, address proposer, uint256 amount) internal {
        bids[id].bidAmount.push(amount);
        bids[id].bidProposer.push(proposer);
    }

    function _deleteBidProposerAndAmount(uint256 id, uint256 index) internal {
        delete bids[id].bidProposer[index];
        delete bids[id].bidAmount[index];
    }

    function _deleteAuction(uint id) internal {
        delete auctions[id];
    }

    function _getLatestBidAmountAndProposer(
        uint256 id
    ) internal view returns (address, uint256) {
        uint256 amount = _getLatestBid(id);
        address proposer = _getLatestProposer(id);
        return (proposer, amount);
    }

    function _getLatestProposer(uint256 id) internal view returns (address) {
        Bid memory bid = bids[id];
        require(
            bid.bidProposer.length >= 1,
            "MarketplaceStorage: bidProposer is empty"
        );
        address proposer = bid.bidProposer[bid.bidProposer.length - 1];
        return proposer;
    }

    function _getLatestBid(uint256 id) internal view returns (uint256) {
        Bid memory bid = bids[id];
        require(
            bid.bidAmount.length >= 1,
            "MarketplaceStorage: bidAmount is empty"
        );
        uint256 amount = bid.bidAmount[bid.bidAmount.length - 1];
        return amount;
    }
}
