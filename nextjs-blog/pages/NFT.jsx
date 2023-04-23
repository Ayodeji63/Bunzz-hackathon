import React, { memo, useContext, useMemo, useState } from "react"
import Image from "next/image"
import Header from "./components/Header"
import CreateNFT from "./page/CreateNFT"
// import { nftData } from "./nftData"
import { HookContext, nftDataContext } from "../context/hook"
import { Router, useRouter } from "next/router"
import Link from "next/link"
import { useEffect } from "react"
import { ethers, utils } from "ethers"
import Button from "./components/Button"
import { ClipLoader } from "react-spinners"
import { _owner, fetchAllAuction } from "../utils/Bunzz/createAuction"
const Nft = () => {
    const [thisOwner, setThisOwner] = useState("")

    const tokenOwner = async () => {
        try {
            const tx = await _owner(provider)
            console.log(tx)
            setThisOwner(tx)
        } catch (e) {
            console.log(e)
        }
    }

    const href = CreateNFT
    const router = useRouter()
    const [nftInfo, setNftInfo] = useState([])
    const { provider, connectWallet, address } = useContext(HookContext)
    let [clickedNFT, setClickedNFT] = useContext(nftDataContext)
    const [loading, setloading] = useState(false)
    const handleClick = (nft) => {
        console.log("pushed")
        setClickedNFT(nft)
        console.log(nft)
        router.push(`/page/Bid?${nft.id}`)
    }
    const color = "#fff"

    const connect = async () => {
        try {
            setloading(true)
            await connectWallet()
            setloading(false)
        } catch (e) {
            console.log(e.message)
        }
    }
    const createPush = () => {
        router.push("/page/CreateNFT")
    }

    const fetch = async () => {
        const data = await fetchAllAuction(provider)
        console.log(data)
        setNftInfo(data)
    }

    if (nftInfo != undefined) {
        nftInfo.sort((a, b) => b.auctionId - a.auctionId)
    }

    useEffect(() => {
        console.log("Getting Auctions")
        fetch()
        tokenOwner()
    }, [provider])

    return (
        <div>
            <Header />
            <div className="nfts-container">
                <div className="pl-10 pr-[8rem] mt-10 h-[30rem] flex rounded-2xl justify-between items-center overflow-hidden  ">
                    <div className="w-1/2">
                        <h1 className="text-6xl font-medium leading-[5rem] text-white mb-10 ">
                            Own ArenaMon <br /> More listings.
                        </h1>

                        {provider && thisOwner == address && (
                            <Button
                                text={"Create NFT"}
                                halfWidth={true}
                                click={() => createPush()}
                            />
                        )}
                    </div>

                    <div className="w-[50%] rounded-2xl h-full overflow-hidden flex items-center justify-center object-contain ">
                        <Image
                            src={"/arenamon.gif"}
                            width={100}
                            height={100}
                            className="object-cover h-full rounded-2xl w-[80%] shadow-blue-500 shadow-xl "
                        />
                    </div>
                </div>
                <div className="nft-text-button">
                    <h2 className="nft-text">Trending NFT Collections:</h2>
                    {/* <a href="Bid" className="create-nft-button cursor-pointer">
                        Create NFT
                    </a> */}
                </div>
                {nftInfo != undefined ? (
                    <div className="nft-cards">
                        {nftInfo?.map((nft) => (
                            <div
                                key={ethers.utils.formatEther(nft.auctionId)}
                                className="nft-card"
                                onClick={() => handleClick(nft)}
                            >
                                <Image
                                    src={nft?.nft_Image[0]}
                                    alt="nft-main-image"
                                    width={100}
                                    height={100}
                                />
                                <span className="owner">{}</span>
                                <h5 className="nft-name">{nft?.nft_Name}</h5>
                                <div className="price-container">
                                    <div className="price">
                                        <span>Price</span>
                                        <h5>
                                            {utils.formatEther(nft?.nft_price)}{" "}
                                            ETH
                                        </h5>
                                    </div>
                                    <div className="bid">
                                        <span>Sell Price</span>
                                        <h5>
                                            {utils.formatEther(
                                                nft?.nft_sellOutPrice
                                            )}{" "}
                                            ETH
                                        </h5>
                                    </div>
                                </div>
                                <div className="overlay">
                                    <div className="action-container">
                                        <button className="action-buy">
                                            Buy Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // <div className="nft-cards flex flex-col">
                    //     <h1>Connect Your Wallet</h1>
                    //     <div className="w-[20%]">
                    //         <Button
                    //             text={
                    //                 !loading ? (
                    //                     "Connect Wallet"
                    //                 ) : (
                    //                     <ClipLoader
                    //                         color={color}
                    //                         loading={loading}
                    //                         size={30}
                    //                         aria-label="Loading Spinner"
                    //                         data-testid="loader"
                    //                     />
                    //                 )
                    //             }
                    //             click={() => connect()}
                    //         />
                    //     </div>
                    // </div>
                    ""
                )}
            </div>
        </div>
    )
}

export default Nft
