const hre = require("hardhat")

async function main() {
    console.log(`Preparing Transaction...\n`)

    // Fetch the deployed contract
    const address = ""
    const sobFlashloan = await hre.ethers.getContractAt("FlashLoanPool", address)
    console.log(`Contract fetched: ${sobFlashloan.address}`)

    // Fetch account
    const [account] = await hre.ethers.getSigners()
    console.log(`Account fetched: ${account.address}\n`)

    // Perform flashloan
    const pool = ''
    const USD = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
    const amount = hre.ethers.utils.parseUnits('1000000', "ether")

    console.log(`Executing Flashloan...\n`)

    const transaction = await sobFlashloan.connect(account).sobFlashLoan(pool, amount, USD)
    const result = await transaction.wait()

    console.log(`Transaction Successful!\n`)
    // console.log(`-- View Transaction --`)
    // console.log(`https://polygonscan.com/tx/${result.transactionHash}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
