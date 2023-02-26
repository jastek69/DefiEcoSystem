const hre = require("hardhat");


async function main() {
    console.log(`Preparing deployment...\n`)

    // Get the contract to deploy
    const FlashLoanPool = await hre.ethers.getContractFactory("FlashLoanPool")

    // Fetch accounts
    const accounts = await hre.ethers.getSigners()
    console.log(`Accounts fetched:\n${accounts[0].address}\n`)

    console.log(`Deploying contract...\n`)

    const sobFlashloan = await FlashLoanPool.deploy()
    await sobFlashloan.deployed()

    console.log(`SOBEK FlashloanPool Deployed to: ${sobFlashloan.address}\n`)    
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
