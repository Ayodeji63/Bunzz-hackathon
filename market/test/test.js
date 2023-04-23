const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers")
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs")
const { expect } = require("chai")
const { ethers } = require("hardhat")
const { utils } = require("ethers")

describe("MarketPlace", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployOneYearLockFixture() {
        // Contracts are deployed using the first signer/account by default

        const buyoutPrice = utils.parseEther("1")
        const startingPrice = utils.parseEther("0.2")
        const auctionStartDate = Math.floor(Date.now() / 1000) + 10
        const auctionEndDate = Math.floor(auctionStartDate + 300)
        const [owner, otherAccount, acct3, acct4] = await ethers.getSigners()

        const MarketPlace = await ethers.getContractFactory("MarketplaceERC721")
        const marketplace = await MarketPlace.deploy()

        const Token = await ethers.getContractFactory("Token")
        const token = await Token.deploy("Badger", "BG")

        await token.deployed()
        const txx = await token.connect(owner).safeMint(owner.address, "")

        await txx.wait()
        const tokenId = await token.connect(owner).TokenId()
        const nft = await marketplace
            .connect(owner)
            .connectToOtherContracts([token.address])
        const tx = await marketplace
            .connect(owner)
            .createAuction(
                tokenId,
                buyoutPrice,
                startingPrice,
                auctionStartDate,
                auctionEndDate
            )
        await tx.wait()

        const transferNFT = await token
            .connect(owner)
            .transferFrom(owner.address, marketplace.address, tokenId)
        await transferNFT.wait()
        return {
            token,
            marketplace,
            owner,
            otherAccount,
            acct3,
            acct4,
            tx,
            txx,
            tokenId,
        }
    }

    describe("Deployment", function () {
        it("Should createAuction", async function () {
            const {
                marketplace,
                owner,
                otherAccount,
                token,
                tx,
                txx,
                tokenId,
            } = await loadFixture(deployOneYearLockFixture)
            expect(await token.connect(owner).getTokenId()).to.equal(tokenId)

            expect(tx)
                .to.emit(marketplace, "AuctionCreated")
                .withArgs(owner.address, tokenId)
        })

        it("Should place Bid", async () => {
            const { marketplace, owner, otherAccount, token, tokenId } =
                await loadFixture(deployOneYearLockFixture)
            await ethers.provider.send("evm_increaseTime", [60])
            const txxx = await marketplace
                .connect(otherAccount)
                .addBid(tokenId, {
                    value: utils.parseEther("0.5"),
                })

            await txxx.wait()
            let txxx2
            try {
                txxx2 = await marketplace
                    .connect(otherAccount)
                    .addBid(tokenId, {
                        value: utils.parseEther("0.5"),
                    })

                await txxx2.wait()
            } catch (e) {
                expect(await txxx2).to.be.revertedWith(
                    "Marketplace: bid value is lower than the biggest bid"
                )
            }

            txxx2 = await marketplace.connect(otherAccount).addBid(tokenId, {
                value: utils.parseEther("0.7"),
            })

            await txxx2.wait()
            const tx2 = await marketplace
                .connect(otherAccount)
                .getAuctionBids(tokenId)
            const tx3 = await marketplace
                .connect(otherAccount)
                .getAuctionForTokenId(tokenId)
        })

        it("Should Cliam Token and Bid", async () => {
            const { marketplace, owner, otherAccount, token, acct3, tokenId } =
                await loadFixture(deployOneYearLockFixture)
            await ethers.provider.send("evm_increaseTime", [60])
            const txxx = await marketplace
                .connect(otherAccount)
                .addBid(tokenId, {
                    value: utils.parseEther("0.5"),
                })

            await txxx.wait()

            const txxx2 = await marketplace
                .connect(otherAccount)
                .addBid(tokenId, {
                    value: utils.parseEther("0.7"),
                })

            await txxx2.wait()
            let txxx3
            try {
                txxx3 = await marketplace
                    .connect(otherAccount)
                    .claimToken(tokenId)
            } catch (error) {
                expect(await txxx3).to.be.revertedWith(
                    "Marketplace: the auction is not yet closed"
                )
            }
            await ethers.provider.send("evm_increaseTime", [3600])

            txxx3 = await marketplace.connect(otherAccount).claimToken(tokenId)
            expect(await txxx3).to.emit(marketplace, "TokenClaimed")
            const txxx4 = await token.connect(otherAccount).ownerOf(tokenId)
            expect(await token.connect(otherAccount).ownerOf(tokenId)).to.equal(
                otherAccount.address
            )
            let txxx5
            txxx5 = await marketplace.connect(owner).getLatestProposer(tokenId)

            console.log(txxx5)

            expect(txxx5).to.equal(otherAccount.address)
            try {
                txxx5 = await marketplace
                    .connect(otherAccount)
                    .claimBids(tokenId)
                await txxx5.wait()
            } catch (e) {
                expect(txxx5).to.be.revertedWith(
                    "Marketplace: caller is not the owner of the token"
                )
            }
            const bBalance = await owner.getBalance()

            txxx5 = await marketplace.connect(owner).claimBids(tokenId)
            await txxx5.wait()
            const aBalance = await owner.getBalance()

            expect(bBalance).to.be.greaterThan(aBalance)
        })
    })
})
