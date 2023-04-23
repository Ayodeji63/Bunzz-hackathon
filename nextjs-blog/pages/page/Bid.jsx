import React, { useContext, useEffect, useState } from "react"
import Header from "../components/Header"
import Image from "next/image"
import Button from "../components/Button"
import Overview from "../components/Tabs/Overview"
import Bids from "../components/Tabs/Bids"
import History from "../components/Tabs/History"
import { truncate } from "truncate-ethereum-address"
import { HookContext, nftDataContext } from "../../context/hook"
import { HeartIcon } from "@heroicons/react/24/solid"
import { ArrowPathIcon, ShareIcon } from "@heroicons/react/24/solid"
import { utils } from "ethers"
import FormInput from "../components/FormInput"
import {
    claim,
    getAuctionEndState,
    getAuctionState,
    placeBid,
} from "../../utils/Auction/getAuction"
import { fetchAuctionById, getAuction } from "../../utils/Auction/CreateNFT"
import { ClipLoader } from "react-spinners"
import { formatEther, formatUnits } from "ethers/lib/utils.js"
import {
    _getAuctionBids,
    addBid,
    claimBids,
    claimToken,
    getAuctionBids,
    getAuctions,
    getLatestProposer,
} from "../../utils/Bunzz/createAuction"
// import {  } from "../";
export const Bid = () => {
    const [clickedNft, setClickedNFT] = useContext(nftDataContext)
    const [page, setPage] = useState("Overview")
    const [bid, setBid] = useState("")
    const { address, provider } = useContext(HookContext)
    const [loading, setLoading] = useState(false)
    const color = "#fff"
    const [timeLeft, setTimeLeft] = useState("")
    const [auctionBids, setAuctionBids] = useState([])
    const [latestBidder, setLatestBidder] = useState({})

    const PlaceBid = async () => {
        try {
            setLoading(true)
            await addBid(provider, bid, clickedNft.auctionId)
            const obj = await getLatestProposer(provider, clickedNft.auctionId)
            setLatestBidder(obj)
            setLoading(false)
        } catch (e) {
            alert(e.message)
            setLoading(false)
        }
    }

    const latestBid = async () => {
        if (provider) {
            const obj = await getLatestProposer(provider, clickedNft.auctionId)
            setLatestBidder(obj)
            const bid = await getAuctionBids(provider, clickedNft.auctionId)
            console.log(bid)
            setAuctionBids(bid)
        }
    }
    useEffect(() => {
        if (provider) {
            setAuctionBids(clickedNft?.nft_bids)
            latestBid()
        }
    }, [])

    const getTime = () => {
        if (clickedNft && clickedNft.nft_Image[0]) {
            const startTime = new Date(
                Number(`${clickedNft?.nft_startTime}`) * 1000
            )
            const endTime = Number(`${clickedNft?.nft_endTime}`)

            const now = new Date().getTime()
            if (startTime > now) {
                setTimeLeft("Auction Hasn't Started")
            } else {
                const unixTimestamp = clickedNft?.nft_endTime
                const date = new Date(`${unixTimestamp}` * 1000).getTime()

                const distance = date - now

                const days = Math.floor(distance / (1000 * 60 * 60 * 24))
                const hours = Math.floor(
                    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                )
                const minutes = Math.floor(
                    (distance % (1000 * 60 * 60)) / (1000 * 60)
                )
                const seconds = Math.floor((distance % (1000 * 60)) / 1000)
                if (distance < 0) {
                    setTimeLeft("00 : 00 : 00 : 00")
                } else {
                    setTimeLeft(
                        `${days < 10 ? "0" + days : days} : ${
                            hours < 10 ? "0" + hours : hours
                        } : ${minutes < 10 ? "0" + minutes : minutes} : ${
                            seconds < 10 ? "0" + seconds : seconds
                        }`
                    )
                }
            }
        }
    }
    setInterval(() => {
        if (provider) {
            getTime()
        }
    }, 1000)
    const claimNft = async () => {
        try {
            setLoading(true)
            await claimToken(provider, clickedNft.auctionId)
            setLoading(false)
        } catch (e) {
            alert(e.message)
            setLoading(false)
        }
    }

    const _claimBids = async () => {
        try {
            setLoading(true)
            await claimBids(provider, clickedNft.auctionId)
            setLoading(false)
        } catch (e) {
            alert(e.message)
            setLoading(false)
        }
    }

    return (
        <section className="min-h-screen min-w-screen mb-40 flex">
            <Header />
            {/* first-div  */}
            {provider && (
                <div className="w-[50%] px-5 ml-40 overflow-hidden h-full flex flex-col items-center mt-40">
                    <div className="h-[70vh]   w-1/2 rounded-lg flex  flex-col justify-center items-center">
                        <div className="h-full w-full flex items-center rounded-lg">
                            <Image
                                src={
                                    clickedNft
                                        ? clickedNft.nft_Image[0]
                                        : "/Fotor_AI.png"
                                }
                                width={1000}
                                height={1000}
                                className="h-full object-centre  rounded-lg w-full"
                                alt="nft-bid-image"
                            />
                        </div>

                        <div className="flex w-full h-12 py-1 bg-[#111524] rounded-2xl justify-evenly mt-5">
                            <div
                                className={`nav ${
                                    page == "Overview" ? `active` : ``
                                }`}
                                onClick={() => setPage("Overview")}
                            >
                                <p>Overview</p>
                            </div>

                            <div
                                className={`nav ${
                                    page == "Bids" ? "active" : ""
                                }`}
                                onClick={() => setPage("Bids")}
                            >
                                <p>Bids</p>
                            </div>

                            <div
                                className={`nav ${
                                    page == "History" ? "active" : ""
                                }`}
                                onClick={() => setPage("History")}
                            >
                                <p>History</p>
                            </div>
                        </div>
                    </div>
                    {page == "Overview" && (
                        <Overview
                            highestBidder={latestBidder?.proposer || ""}
                            highestBid={latestBidder?.bid || ""}
                        />
                    )}
                    {page == "Bids" && <Bids bids={auctionBids} />}
                    {page == "History" && <History />}
                </div>
            )}
            {/* second-/.div  */}
            {provider && (
                <div className=" w-[35%] px-5 h-full mr-5  flex flex-col top-[15%] right-0 fixed ">
                    <div className="">
                        <div className="flex items-center mb-2 ">
                            <Image
                                src={clickedNft?.nft_Image[0]}
                                width={50}
                                height={50}
                                alt="nft-uniswap-logo"
                                className="rounded-full"
                            />
                            <h1 className="text-white font-medium ml-2 text-4xl  font-small">
                                {clickedNft?.nft_Name}
                            </h1>
                        </div>

                        <div className="mt-2 flex items-center mb-7">
                            <div className="">
                                <p className="">Current owner</p>
                                <p className="text-white font-medium">
                                    {truncate(clickedNft.nft_Owner)}
                                </p>
                            </div>
                        </div>
                        <hr className=" h-[1px] mt-1 rounded-lg bg-[#1c2231] border-[#1c2231]  text-2xl w-[100%]" />

                        <div className="flex items-center mt-4 justify-between">
                            <div className="icon2">
                                <HeartIcon className="icon  " />
                                <p className="ml-2">0</p>
                            </div>

                            <div className="icon2">
                                <ShareIcon className="icon" />
                                <p className="ml-2">Share</p>
                            </div>

                            <div className="icon2">
                                <ArrowPathIcon className="icon" />
                                <p className="ml-2">Refresh</p>
                            </div>
                        </div>
                    </div>

                    <div className="border mt-2 p-4 border-[#1c2231] rounded-xl">
                        <div className="flex justify-between">
                            <div className="bg-[#1c2231] rounded-xl p-2 h-[6rem] w-[45%] ">
                                <p>Time left</p>
                                <h1 className="text-white text-2xl font-medium mt-2">
                                    {timeLeft}
                                </h1>
                            </div>
                            <div className="bg-[#1c2231] rounded-xl p-2 h-[6rem] w-[45%] ">
                                <p>Minimum bid</p>
                                <h1 className="text-white text-2xl font-medium mt-2">
                                    {utils.formatEther(clickedNft?.nft_price)}{" "}
                                    ETH
                                </h1>
                            </div>
                        </div>
                        {timeLeft != "Auction Hasn't Started" &&
                            timeLeft != "00 : 00 : 00 : 00" && (
                                <FormInput
                                    name={"Bid"}
                                    placeholder={"Enter Bid"}
                                    required={"required"}
                                    nftParam={bid}
                                    setNftParam={setBid}
                                />
                            )}
                        {timeLeft != "Auction Hasn't Started" &&
                            timeLeft != "00 : 00 : 00 : 00" &&
                            (!loading ? (
                                <Button text={"Place a bid"} click={PlaceBid} />
                            ) : (
                                <Button
                                    text={
                                        <ClipLoader
                                            color={color}
                                            loading={loading}
                                            size={30}
                                            aria-label="Loading Spinner"
                                            data-testid="loader"
                                        />
                                    }
                                />
                            ))}

                        {timeLeft == "Auction Hasn't Started" && (
                            <Button text={"Auction Not Open"} />
                        )}
                        {timeLeft == "00 : 00 : 00 : 00" && (
                            <Button text={"Auction Closed"} />
                        )}
                        {timeLeft == "00 : 00 : 00 : 00" &&
                            latestBidder?.proposer == address &&
                            (!loading ? (
                                <Button text={"Claim NFT"} click={claimNft} />
                            ) : (
                                <Button
                                    text={
                                        <ClipLoader
                                            color={color}
                                            loading={loading}
                                            size={30}
                                            aria-label="Loading Spinner"
                                            data-testid="loader"
                                        />
                                    }
                                />
                            ))}

                        {timeLeft == "00 : 00 : 00 : 00" &&
                            latestBidder?.proposer != address &&
                            (!loading ? (
                                <Button
                                    text={"Claim Bids"}
                                    click={_claimBids}
                                />
                            ) : (
                                <Button
                                    text={
                                        <ClipLoader
                                            color={color}
                                            loading={loading}
                                            size={30}
                                            aria-label="Loading Spinner"
                                            data-testid="loader"
                                        />
                                    }
                                />
                            ))}
                    </div>
                </div>
            )}
        </section>
    )
}

export default Bid
