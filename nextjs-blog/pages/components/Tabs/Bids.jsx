import { BoltIcon } from "@heroicons/react/24/solid"
import Image from "next/image"
import { formatEther } from "ethers/lib/utils.js"
import React, { useEffect, useState } from "react"
import { truncate } from "truncate-ethereum-address"

const Bids = ({ bids }) => {
    const [bidders, setBidders] = useState([])
    const getBids = () => {
        let bidProposer, bidAmount
        if (bids != undefined && bids.length != 0) {
            bidProposer = bids[0]
            bidAmount = bids[1]
        }
        const arr = []
        let proposer
        let amt
        let obj
        if (bids != undefined) {
            for (let i = 0; i < bidProposer.length; i++) {
                proposer = bidProposer[i]
                for (let j = 0; j < bidAmount.length; j++) {
                    amt = bidAmount[i]
                    console.log(formatEther(amt))
                }
                obj = { bidder: proposer, amt: formatEther(amt) }
                arr.push(obj)
                amt = 0
            }
        }
        console.log(arr)
        setBidders(arr.sort((a, b) => b.amt - a.amt))
    }
    useEffect(() => {
        getBids()
    }, [])

    return (
        <div className="mt-10 scrollbar-hide w-[80%] mb-40">
            <div className="w-full p-5 h-fit border-[#1c2231] border rounded-lg flex flex-col mt-5 ">
                {bids == undefined ? (
                    <div>
                        <BoltIcon className="h-10" />
                        <h1 className="text-xl">
                            " No active bids yet. Be the first to make a bid!"
                        </h1>
                    </div>
                ) : (
                    <div className="w-full ">
                        {bidders.map((bids) => {
                            return (
                                <div
                                    key={bids.amt}
                                    className="flex w-full justify-between text-xl font-medium items-center text-white mb-3"
                                >
                                    <div className="flex items-center">
                                        <div className="h-[3rem] w-[3rem] rounded-full bg-blue-500 mr-3">
                                            <Image
                                                src="/background.webp"
                                                width={50}
                                                height={50}
                                                className="w-full h-full overflow-hidden rounded-full object-cover"
                                                alt="image"
                                            />
                                        </div>
                                        <p>{truncate(bids.bidder)}</p>
                                    </div>
                                    <p>{bids.amt} ETH</p>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Bids
