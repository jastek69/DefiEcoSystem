const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
    console.log(`Preparing deployment...\n`)

    // Deploy Token
    console.log(`Deploying token...\n`)
    const Token = await ethers.getContractFactory("Token");

    // Deploy Sobek Token
    let sobek = await Token.deploy('Sobek', 'SOB', '1000000000') // 1 Billion tokens
    await sobek.deployed()  
    console.log(`Sobek Token deployed to: ${sobek.address}\n`)


    console.log(`Deploying contract...\n`)
    // Deploy FLP contract
    const FlashLoanPool = await hre.ethers.getContractFactory("FlashLoanPool")
    const flashLoanPool = await FlashLoanPool.deploy(sobek.address)
    await flashLoanPool.deployed()
    console.log(`FlashLoanPool deployed to:", ${flashLoanPool.address}\n`);

    // Deploy Trader contract
    const Trader = await ethers.getContractFactory("Trader");
    const trader = await Trader.deploy(sobek.address, flashLoanPool.address, 1000000000);
    await trader.deployed();
    console.log(`Trader deployed to:", ${trader.address}\n`);      
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
