const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
    console.log(`Preparing deployment...\n`)

    // Deploy Token
    console.log(`Deploying token...\n`)
    const Token = await ethers.getContractFactory("Token");

    // Deploy USD Token
    let usd = await Token.deploy('usd', 'USD', '1000000000') // 1 Billion tokens
    await usd.deployed()  
    console.log(`USD Token deployed to: ${usd.address}\n`)


    console.log(`Deploying contracts...\n`)
    // Deploy FLP contract
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
