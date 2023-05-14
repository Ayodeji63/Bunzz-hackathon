require("@nomicfoundation/hardhat-toolbox")
require("@nomiclabs/hardhat-etherscan")
require("dotenv").config()
// require("hardhat-")
/** @type import('hardhat/config').HardhatUserConfig */
const RPC_URL = process.env.RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const SEP_URL = process.env.SEP_URL
const API_KEY = process.env.E_API_KEY
module.exports = {
    solidity: "0.8.17",
    networks: {
        sepolia: {
            url: SEP_URL,
            accounts: [PRIVATE_KEY],
        },
        goerli: {
            url: RPC_URL,
            accounts: [PRIVATE_KEY],
            gas: 2100000,
            gasPrice: 8000000000,
        },
    },
    etherscan: {
        apiKey: API_KEY,
    },
}
