const hre = require("hardhat")
const { expect } = require('chai');
const { ethers } = require('hardhat');

const config = require('../src/config.json')


const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens
const shares = ether

const main = async () => {  
    
    let accounts = await ethers.getSigners()
    let deployer = accounts[0]
    let arbitrager = accounts[1]
    let liquidityProvider = accounts[2]
    
    let borrowAmount = tokens(1000000)
    
    let token1, token2
    let transaction

    // Fetch network
    const { chainId } = await ethers.provider.getNetwork()

   // const Token = await ethers.getContractFactory('Token')
     

    // Fetch deployed token
    const usd = await ethers.getContractAt('USD Token', config[chainId].usd.address)
    console.log(`Token fetched: ${usd.address}\n` )

    const sobek = await ethers.getContractAt('Sobek Token', config[chainId].sobek.address)
    console.log(`Token fetched: ${sobek.address}\n` )

    console.log(`Preparing Transaction...\n`)

    // Fetch the deployed contract
    const flashLoanPool = await ethers.getContractAt('FlashLoanPool', config[chainId].flashLoanPool.address)
    console.log(`FlashLoan fetched: ${flashLoanPool.address}`)

    const trader = await ethers.getContractAt('Trader', config[chainId].trader.address)
    console.log(`Contract fetched: ${trader.address}`)

    // Fetch account
    const [account] = await hre.ethers.getSigners()
    console.log(`Account fetched: ${account.address}\n`)

        
    // Perform flashloan use Arbitrage with FlashLoan from Trader
    // const USD = '0x68B1D87F95878fE05B998F19b66F4baba5De1aed'    
   // const borrowAmount = hre.ethers.utils.parseUnits('1000000', "ether")  

    
    console.log(`Executing Flashloan...\n`)


  let result

    
// call flashloan function
transaction = await trader.connect(deployer).flashLoan(borrowAmount);
result = await transaction.wait()

// Emit an Event
// await expect(transaction).to.emit(trader, 'Loan').withArgs(
//     token1.address,
//     borrowAmount
// )

// check token1 balance for Trader.sol
// let balance1 = await usd.balanceOf(trader.address)    
// let traderUSDBalance = await usd.balanceOf(trader.address)
// // expect(traderUSDBalance).to.equal(balance1)
// console.log(`Trader contract USD Token balance after swap: ${ethers.utils.formatEther(balance1)}\n`)

// // check token2 bal for trader.sol
// let balance2 = await sobek.balanceOf(trader.address)  
// let traderSobBalance = await sobek.balanceOf(trader.address)
// // expect(traderSobBalance).to.equal(balance2)
// console.log(`Trader contract SOB Token balance after swap: ${ethers.utils.formatEther(balance2)}\n`)

// check token1 bal for deployer wallet (this is who received profit)
let balance1 = await usd.balanceOf(deployer.address)
let deployerUSDBalance = await usd.balanceOf(deployer.address)
// expect(deployerUSDBalance).to.equal(balance3)
console.log(`Deployers USD Token balance after swap: ${ethers.utils.formatEther(deployerUSDBalance)}\n`)    

// check token2 bal for deployer wallet (this is who received profit)
let balance2 = await token2.balanceOf(deployer.address)
let deployerSOBBalance = await token2.balanceOf(deployer.address)
// expect(deployerSOBBalance).to.equal(balance2)
console.log(`Deployers Sobek Token balance after swap: ${ethers.utils.formatEther(deployerSOBBalance)}\n`)
 

console.log(`Transaction Successful!\n`)
// console.log(`-- View Transaction --`)
// console.log(`https://polygonscan.com/tx/${result.transactionHash}`)
// Fetch token balance after

   
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});
