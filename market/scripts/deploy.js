// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat")
const { ethers, run, network } = require("hardhat")

async function main() {
    const Token = await hre.ethers.getContractFactory("Token")
    const token = await Token.deploy("Arenamon", "AR")

    token.deployed()

    const MarketPlace = await hre.ethers.getContractFactory("MarketplaceERC721")
    const marketplace = await MarketPlace.deploy()
    // if (network.config.chainId === 11155111 && process.env.E_API_KEY) {
    console.log(`Waiting for block txes`)
    await marketplace.deployTransaction.wait(6)
    await verify(marketplace.address, [])
    // }

    console.log("Token deploeyed with", token.address)
    console.log("MarketPlace deployed with", marketplace.address)
}

async function verify(contractAddress, args) {
    console.log("Verifying Contract....")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already Verified")
        } else {
            console.log(e)
        }
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
