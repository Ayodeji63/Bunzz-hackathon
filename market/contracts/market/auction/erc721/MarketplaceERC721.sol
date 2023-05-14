// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./interfaces/IMarketplaceERC721.sol";
import "./MarketplaceStorage.sol";
import "./MarketplaceERC721Receiver.sol";
import "./ERC721Interactions.sol";
import "../../IBunzz.sol";
import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";
import "hardhat/console.sol";

// 507115.069

contract MarketplaceERC721 is
    MarketplaceStorage,
    MarketplaceERC721Receiver,
    ERC721Interactions,
    Ownable,
    IMarketplaceERC721,
    IBunzz,
    AutomationCompatibleInterface
{
    using SafeMath for uint256;
    uint public numOfAuctions;
    address tokenAddress;

    event AuctionCreated(address seller, uint256 tokenId);
    event TokenClaimed(address highestBidder, uint tokenId);

    constructor() {}

    function connectToOtherContracts(
        address[] memory otherContracts
    ) external override onlyOwner {
        _setTokenContract(otherContracts[0]);
        tokenAddress = otherContracts[0];
    }

    function createAuction(
        uint256 tokenId,
        uint256 buyoutPrice,
        uint256 startingPrice,
        uint256 auctionStartDate,
        uint256 auctionEndDate
    ) external override {
        require(
            IERC721(tokenAddress).ownerOf(tokenId) == msg.sender,
            "Marketplace: caller is not the owner of the token"
        );
        require(
            auctionStartDate < auctionEndDate,
            "Marketplace: auction start date is higher then auction end date"
        );

        address seller = msg.sender;

        Auction memory auction = Auction(
            seller,
            tokenId,
            buyoutPrice,
            startingPrice,
            auctionStartDate,
            auctionEndDate,
            false
        );

        _addAuction(auction);
        emit AuctionCreated(seller, tokenId);
        numOfAuctions++;
    }

    function addBid(uint256 tokenId) external payable override {
        require(msg.value > 0, "Marketplace: msg.value is lower then 0");
        Bid memory internalBids = _getBid(tokenId);
        uint256 lastElementPosition;
        bool notInitialized;
        (notInitialized, lastElementPosition) = internalBids
            .bidAmount
            .length
            .trySub(1);
        if (notInitialized == true) {
            require(
                msg.value > internalBids.bidAmount[lastElementPosition],
                "Marketplace: bid value is lower than the biggest bid"
            );
        }
        Auction memory currentAuction = _getAuction(tokenId);
        // Changed block.number to block.timestamp
        require(
            currentAuction.auctionStartBlock < block.timestamp,
            "Marketplace: start block is higher than block.timestamp"
        );
        require(
            currentAuction.auctionEndBlock > block.timestamp,
            "Marketplace: end block is lower then block.timestamp"
        );
        require(
            currentAuction.startingPrice < msg.value,
            "Marketplace: bid value is lower than the starting price"
        );
        require(
            msg.value <= currentAuction.buyoutPrice,
            "Marketplace: bid is higher then buyoutPrice"
        );

        // The balance of NFT in the contract will be 0 because we are not transfering the nft to the contract when creating auction
        require(
            _balance(address(this)) >= 1,
            "Marketplace: the token is not for sale"
        );

        _addBid(tokenId, msg.sender, msg.value);
        if (currentAuction.buyoutPrice == msg.value) {
            _transferTokens(address(this), msg.sender, tokenId);
        }
    }

    function bal() public view returns (uint) {
        return _balance(address(this));
    }

    function claimToken(uint256 tokenId) external override {
        require(
            _balance(address(this)) >= 1,
            "Marketplace: the token is not for sale"
        );
        Auction memory auction = _getAuction(tokenId);
        require(
            auction.auctionEndBlock < block.timestamp,
            "Marketplace: the auction is not yet closed"
        );
        require(
            _getLatestProposer(tokenId) == msg.sender,
            "Marketplace: Claimer is not the auction winner"
        );

        _transferTokens(address(this), msg.sender, tokenId);
        emit TokenClaimed(msg.sender, tokenId);
    }

    function claimBids(uint256 tokenId) external payable override {
        Auction memory auction = _getAuction(tokenId);

        console.log(auction.seller);
        Bid memory bid = _getBid(tokenId);
        uint256 amount = 0;
        if (_getLatestBid(tokenId) != auction.buyoutPrice) {
            require(
                auction.auctionEndBlock < block.timestamp,
                "Marketplace: the auction is not yet closed"
            );
        }

        for (uint256 i = 0; i < bid.bidProposer.length - 1; i++) {
            if (msg.sender == bid.bidProposer[i]) {
                amount = amount.add(bid.bidAmount[i]);
                _deleteBidProposerAndAmount(tokenId, i);
            }
        }

        payable(msg.sender).transfer(amount);
    }

    function retrieveTokenNotSold(uint256 tokenId) external override {
        Auction memory auction = _getAuction(tokenId);
        require(msg.sender == auction.seller);
        require(
            auction.auctionEndBlock < block.timestamp,
            "Marketplace: the auction is not yet closed"
        );
        Bid memory bid = _getBid(tokenId);
        require(
            bid.bidAmount.length == 0,
            "Marketplace: the auction have bids"
        );

        _transferTokens(address(this), msg.sender, tokenId);
        _deleteAuction(tokenId);
    }

    function withdraw(uint256 id) external {
        Auction memory auction = _getAuction(id);
        require(
            msg.sender == auction.seller,
            "Marketplace: caller is not the seller of the token"
        );
        require(
            auction.auctionEndBlock < block.number,
            "Marketplace: the auction is not yet closed"
        );
        require(
            auction.tokensWithdrawed == false,
            "Marketplace: the funds have been already withdrawned"
        );

        uint256 latestBid = _getLatestBid(id);

        _tokensHaveBeenWithdrawed(id);

        payable(msg.sender).transfer(latestBid);
    }

    function getAuctionForTokenId(
        uint256 tokenId
    ) public view override returns (Auction memory) {
        return _getAuction(tokenId);
    }

    function getAuctionBids(
        uint256 tokenId
    ) public view override returns (Bid memory) {
        return _getBid(tokenId);
    }

    function getLatestProposer(uint id) public view returns (address) {
        return _getLatestProposer(id);
    }

    function getLatestBid(uint id) public view returns (uint) {
        return _getLatestBid(id);
    }

    function checkUpkeep(
        bytes calldata checkData
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory /*performData*/)
    {
        Auction memory auction = _getAuction(numOfAuctions);
        upkeepNeeded = block.timestamp > auction.auctionEndBlock;
    }

    function performUpkeep(bytes calldata /*performData*/) external override {
        Auction memory auction = _getAuction(numOfAuctions);
        address highestBidder = _getLatestProposer(numOfAuctions);

        if (block.timestamp > auction.auctionEndBlock) {
            _transferTokens(address(this), highestBidder, numOfAuctions);
            emit TokenClaimed(highestBidder, numOfAuctions);
        }
    }
}
