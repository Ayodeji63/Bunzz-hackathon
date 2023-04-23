import { Contract, ethers, utils } from "ethers"

import { NFTStorage } from "nft.storage"
import {
    BUNZZ_MARKETPLACE_ABI,
    BUNZZ_MARKETPLACE_ADDRESS,
    BUNZZ_TOKEN_ABI,
    BUNZZ_TOKEN_ADDRESS,
    TOKEN_ABI,
    TOKEN_CONTRACT_ADDRESS,
} from "../../constants"
import { arrayify } from "ethers/lib/utils"

const API_KEY = process.env.API_KEY
export const bunzzNft = async (provider, image, address) => {
    try {
        const client = new NFTStorage({ token: API_KEY })
        const imageData = new Blob([image])
        const ipfHash = await client.storeBlob(imageData)
        console.log(ipfHash)
        const signer = provider.getSigner()

        const bunzzNftContract = new Contract(
            BUNZZ_TOKEN_ADDRESS,
            BUNZZ_TOKEN_ABI,
            signer
        )

        const tx = await bunzzNftContract.safeMint(address, ipfHash)
        await tx.wait()

        const tokenId = await bunzzNftContract.TokenId()

        console.log(tokenId)
        return tokenId
    } catch (e) {
        console.error(e)
    }
}

export const connect = async (provider) => {
    try {
        const signer = provider.getSigner()
        const marketplace = new Contract(
            BUNZZ_MARKETPLACE_ADDRESS,
            BUNZZ_MARKETPLACE_ABI,
            signer
        )

        const token = new Contract(BUNZZ_TOKEN_ADDRESS, BUNZZ_TOKEN_ABI, signer)

        const tx = await marketplace.connectToOtherContracts([
            BUNZZ_TOKEN_ADDRESS,
        ])

        await tx.wait(1)
    } catch (e) {
        console.error(e)
    }
}
export const bunzzAuction = async (
    provider,
    tokenId,
    buyoutPrice,
    startingPrice,
    auctionStartDate,
    auctionEndDate
) => {
    try {
        const signer = provider.getSigner()
        const marketplace = new Contract(
            BUNZZ_MARKETPLACE_ADDRESS,
            BUNZZ_MARKETPLACE_ABI,
            signer
        )

        const tx = await marketplace.createAuction(
            tokenId,
            buyoutPrice,
            startingPrice,
            auctionStartDate,
            auctionEndDate
        )

        await tx.wait()
    } catch (e) {
        console.log(e)
    }
}
export const transferNFT = async (provider, address, tokenId) => {
    try {
        const signer = provider.getSigner()
        const bunzzNftContract = new Contract(
            BUNZZ_TOKEN_ADDRESS,
            BUNZZ_TOKEN_ABI,
            signer
        )

        const tx = await bunzzNftContract.transferFrom(
            address,
            BUNZZ_MARKETPLACE_ADDRESS,
            tokenId
        )
        await tx.wait()
    } catch (e) {
        console.error(e)
    }
}
export const getAuctionBids = async (provider, id) => {
    try {
        const signer = provider.getSigner()
        const marketplace = new Contract(
            BUNZZ_MARKETPLACE_ADDRESS,
            BUNZZ_MARKETPLACE_ABI,
            signer
        )
        const bids = await marketplace.getAuctionBids(id)

        return bids
    } catch (e) {
        console.error(e)
    }
}

export const fetchAuctionById = async (provider, id) => {
    try {
        const signer = provider.getSigner()
        const marketplace = new Contract(
            BUNZZ_MARKETPLACE_ADDRESS,
            BUNZZ_MARKETPLACE_ABI,
            signer
        )
        const token = new Contract(BUNZZ_TOKEN_ADDRESS, BUNZZ_TOKEN_ABI, signer)

        const _tokenUri = await token.tokenURI(id)
        const _name = await token.name()
        const _symbol = await token.symbol()
        console.log(_tokenUri)

        const auction = await marketplace.getAuctionForTokenId(id)

        const nft_Image = await fetchMetadata(_tokenUri)

        const bids = await marketplace.getAuctionBids(id)
        console.log(bids)
        const auctionProposal = {
            auctionId: id,
            nft_tokenId: auction,
            nft_Name: `${_name}#00${id}`,
            nft_Symbol: _symbol,
            nft_tokenURI: _tokenUri,
            nft_Image: nft_Image,
            nft_price: auction.startingPrice,
            nft_sellOutPrice: auction.buyoutPrice,
            nft_Owner: auction.seller,
            nft_startTime: auction.auctionStartBlock,
            nft_endTime: auction.auctionEndBlock,
            nft_address: TOKEN_CONTRACT_ADDRESS,
            nft_bids: bids,
        }
        console.log(auctionProposal)
        return auctionProposal
    } catch (e) {
        console.log(e)
    }
}

export const getAuction = async (provider) => {
    try {
        const signer = provider.getSigner()
        const marketplace = new Contract(
            BUNZZ_MARKETPLACE_ADDRESS,
            BUNZZ_MARKETPLACE_ABI,
            signer
        )
        const auctionNum = await marketplace.numOfAuctions()

        console.log(parseInt(auctionNum))
        const param = await fetchAuctionById(provider, parseInt(auctionNum) - 1)
        return param
    } catch (e) {
        console.error(e)
    }
}

const fetchMetadata = async (hash) => {
    try {
        // console.log(ipfsHash)s
        let fileResult = []
        const res = await fetch(`https://ipfs.io/ipfs/${hash}`)
        // console.log(res)
        const blob = await res.blob()
        const fileReader = new FileReader()
        fileReader.readAsBinaryString(blob)
        fileReader.onloadend = () => {
            const dataUrl = fileReader.result
            // console.log(dataUrl)
            fileResult.push(dataUrl)
        }
        console.log(fileResult)
        return fileResult
    } catch (e) {
        console.log(e.message)
    }
}

export const fetchAllAuction = async (provider) => {
    try {
        const marketplace = new Contract(
            BUNZZ_MARKETPLACE_ADDRESS,
            BUNZZ_MARKETPLACE_ABI,
            provider
        )
        const numOfAuctions = await marketplace.numOfAuctions()
        const auctions = []
        for (let i = 0; i < numOfAuctions; i++) {
            const auction = await fetchAuctionById(provider, i)
            auctions.push(auction)
        }
        console.log(auctions)
        return auctions
    } catch (e) {
        console.error(e)
    }
}

export const addBid = async (provider, bid, tokenId) => {
    try {
        const signer = provider.getSigner()
        const marketplace = new Contract(
            BUNZZ_MARKETPLACE_ADDRESS,
            BUNZZ_MARKETPLACE_ABI,
            signer
        )
        const tx = await marketplace.addBid(tokenId, {
            value: utils.parseEther(bid),
        })
        await tx.wait(1)
    } catch (e) {
        console.error(e)
    }
}

export const claimToken = async (provider, id) => {
    try {
        const signer = provider.getSigner()
        const marketplace = new Contract(
            BUNZZ_MARKETPLACE_ADDRESS,
            BUNZZ_MARKETPLACE_ABI,
            signer
        )

        const tx = await marketplace.claimToken(id)
        await tx.wait(1)
    } catch (e) {
        console.error(e)
    }
}

export const claimBids = async (provider, id) => {
    try {
        const signer = provider.getSigner()
        const marketplace = new Contract(
            BUNZZ_MARKETPLACE_ADDRESS,
            BUNZZ_MARKETPLACE_ABI,
            signer
        )

        const tx = await marketplace.claimBids(id)
        await tx.wait(1)
    } catch (e) {
        console.error(e)
    }
}

export const getLatestProposer = async (provider, id) => {
    try {
        const signer = provider.getSigner()
        const marketplace = new Contract(
            BUNZZ_MARKETPLACE_ADDRESS,
            BUNZZ_MARKETPLACE_ABI,
            signer
        )
        const proposer = await marketplace.getLatestProposer(id)
        console.log(proposer)

        const bid = await marketplace.getLatestBid(id)
        console.log(bid)

        const obj = { proposer, bid }
        return obj
    } catch (e) {
        console.error(e)
    }
}

export const _owner = async (provider) => {
    try {
        const token = new Contract(
            BUNZZ_TOKEN_ADDRESS,
            BUNZZ_TOKEN_ABI,
            provider
        )
        const tx = await token.owner()
        console.log(tx)
        return tx
    } catch (e) {}
}
