const hre = require("hardhat")
const { expect } = require('chai');
const { ethers } = require('hardhat');

const config = require('./config.json')
const FlashLoanPool = require('../contracts/FlashLoanPool.sol')

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens
const shares = ether
const Web3 = require('web3')
let web3

// FOR MAINNET
const HDWalletProvider =
   require("@truffle/hdwallet-provider");

   if (!config.PROJECT_SETTINGS.isLocal) {
	const provider = new HDWalletProvider({
		privateKeys:
           [process.env.PRIVATE_KEY],
		providerOrUrl:
           `https://polygon-mainnet.g.alchemy.com/v2/S7gY6EzNj18KlWE922M2kF_YSPs7hCmV`,
	})

	web3 = new Web3(provider)
} else {
    web3 = new Web3('ws://127.0.0.1:7545')
}


async function main() {
  let accounts,
      deployer,
      arbitrager,
      liquidityProvider      

  let token1,
      token2  
    
    accounts = await ethers.getSigners()
    deployer = accounts[0]
    arbitrager = accounts[1]
    liquidityProvider = accounts[2]
    
    
    console.log(`Preparing Transaction...\n`)

    // Fetch the deployed contract
    const FlashLoanPool = await ethers.getContractFactory("FlashLoanPool")
    console.log(`Contract fetched: ${FlashLoanPool.address}`)

    // Fetch account
    const [account] = await hre.ethers.getSigners()
    console.log(`Account fetched: ${account.address}\n`)

    // Perform flashloan    
    const USD = '0x68B1D87F95878fE05B998F19b66F4baba5De1aed'
    const _token0Contract = USD
    const amount = hre.ethers.utils.parseUnits('1000000', "ether")  


    console.log(`Executing Flashloan...\n`)

    let transaction = await FlashLoanPool.connect(deployer).flashLoan(amount) // flashLoan(pool, amount, SOB) 
    // let result = await transaction.wait()

    // Emit an Event
    await expect(transaction).to.emit(FlashLoanPool, 'Loan').withArgs(
      _token0Contract.address,
      amount
    )
    console.log(`Transaction Successful!\n`)
    // console.log(`-- View Transaction --`)
    // console.log(`https://polygonscan.com/tx/${result.transactionHash}`)

    // Fetch token balance after
    const balanceAfter = await _token0Contract.methods.balanceOf(deployer).call()
    const ethBalanceAfter = await web3.eth.getBalance(deployer)
    
    const data = {     
      'ETH Balance After': ethers.utils.formatEther(ethBalanceAfter, 'ether'),      
      'USD Balance AFTER': ethers.utils.formatEther(balanceAfter.toString(), 'ether')            
  }
  console.table(data)
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});
