require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config({ path: ".env" })

/** @type import('hardhat/config').HardhatUserConfig */
const RPC_URL = process.env.RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
module.exports = {
    solidity: "0.8.18",
    networks: {
        sepolia: {
            url: "https://eth-sepolia.g.alchemy.com/v2/iPBtgwvjNv19zREWHoSTW9yYA6lJoFnR",
            accounts: [
                "b134013496f8b3fa6b53e8e6ab37a2bce7de43160889b3bfb43461fe3a284046",
            ],
        },
    },
}
