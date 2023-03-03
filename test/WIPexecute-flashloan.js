const hre = require("hardhat")
const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
  }
  
const ether = tokens
const shares = ether

// describe('FlashLoan', () => {
//     // Accounts
//     let account,
//         flashLoanPool

//     // Contracts
//     let token1,
//         trader,
//         amm1,
//         amm2


    
 
    
// QUESTIONS:
// Should I place all tests here or create another DES test file
// explain describe
// When to use beforeEach(async () => {  })
// 
// Where to view transcation
//console.log(`-- View Transaction --`)
// console.log(`https://polygonscan.com/tx/${result.transactionHash}`)





    async function main() {
        console.log(`Preparing Transaction...\n`)

        // Fetch the deployed contract
        const address = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
        const FlashLoanPool = await hre.ethers.getContractAt("FlashLoanPool", address)
        console.log(`Contract fetched: ${FlashLoanPool.address}`)

        // Fetch account
        const [account] = await hre.ethers.getSigners()
        console.log(`Account fetched: ${account.address}\n`)

        // Perform flashloan
        const pool = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
        const SOB = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
        const amount = hre.ethers.utils.parseUnits('100000', "ether")

        console.log(`Executing Flashloan...\n`)

        let transaction = await FlashLoanPool.connect(account).flashLoan(amount) // flashLoan(pool, amount, SOB) 
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
 // })