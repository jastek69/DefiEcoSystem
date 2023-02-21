// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
// const { ethers } = require("hardhat");
const { ethers } = require("hardhat");
const hre = require("hardhat");
// const { TASK_FLATTEN_GET_DEPENDENCY_GRAPH } = require("hardhat/builtin-tasks/task-names");
const config = require('../src/config.json')

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens
const shares = ether

async function main() {

//Fetch Accounts
console.log(`Fetching accounts & network \n`)
const accounts = await ethers.getSigners()


// Fetch Network
const { chainId } = await ethers.provider.getNetwork()

console.log(`Fetching token and transferring to accounts .. \n`)

// Fetch Sobek Token
const sobek = await ethers.getContractAt('Token', config[chainId].sobek.address)
console.log(`Sobek token fetched: ${sobek.address}\n`)

// Fetch USD Token
const usd = await ethers.getContractAt('Token', config[chainId].usd.address)
console.log(`USD token fetched: ${usd.address}\n`)



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Adding Liquidity
//





//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Swap Tokens

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});