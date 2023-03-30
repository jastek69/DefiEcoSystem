// NOTE:
// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.

const { ethers } = require("hardhat");
const hre = require("hardhat");

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
  }
  
  const ether = tokens
  const shares = ether

async function main() {
    console.log(`Preparing deployment...\n`)

    // Deploy Token
    console.log(`Deploying tokens...\n`)
    const Token = await ethers.getContractFactory("Token");

    // Deploy USD Token
    let usd = await Token.deploy('usd', 'USD', '1000000000') // 1 Billion tokens
    await usd.deployed()  
    console.log(`USD Token deployed to: ${usd.address}\n`)


     // Deploy Sobek Token (token 2)
    let sobek = await Token.deploy('Sobek', 'SOB', '1000000000') // 1 Billion tokens
    await sobek.deployed()  
    console.log(`Sobek Token deployed to: ${sobek.address}\n`)


    console.log(`Deploying Market contracts ...\n`)
    // Deploy AMM1
    const AMM1 = await hre.ethers.getContractFactory('AMM1')
    const amm1 = await AMM1.deploy(sobek.address, usd.address)
    console.log(`AMM1 contract deployed to: ${amm1.address}\n`)

    // Deploy AMM2
    const AMM2 = await hre.ethers.getContractFactory('AMM2')
    const amm2 = await AMM2.deploy(sobek.address, usd.address)
    console.log(`AMM2 contract deployed to: ${amm2.address}\n`)


    console.log(`Deploying contracts...\n`)
    // Deploy Flash Loan Pool contract
    const FlashLoanPool = await hre.ethers.getContractFactory("FlashLoanPool")
    const flashLoanPool = await FlashLoanPool.deploy(usd.address)
    await flashLoanPool.deployed()
    console.log(`FlashLoanPool deployed to: ${flashLoanPool.address}\n`);

    // Deploy Trader contract
    const Trader = await ethers.getContractFactory("Trader");
    const trader = await Trader.deploy(usd.address, flashLoanPool.address);
    await trader.deployed();
    console.log(`Trader deployed to: ${trader.address}\n`);    
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
