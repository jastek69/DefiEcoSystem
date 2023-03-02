const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens
const shares = ether

describe('FlashLoan', () => {  
 
  it('Borrowing 1M SOB and throws revert info msg.', async () => {

    // [X] Deploy token
    // [X] Deploy FLP
    // [] transfer tokens to FLP
    // [] Deploy trader contract
    // [] Fetch accounts from ethers js library ()getSigners
    // [] Call Flashloan function on the Trader contract and make sure it works

    // Deploy Token
    const Token = await ethers.getContractFactory('Token')
    let token = await Token.deploy('SOB Token', 'SOB', tokens('1000000000')) // Deploy 1 Billion tokens

    
    // Deploy Flash Loan Pool contract
    console.log(`Deploying FlashLoanPool contract...\n`)
    const FlashLoanPool = await ethers.getContractFactory("FlashLoanPool")
    const flashLoanPool = await FlashLoanPool.deploy(token.address)
    await flashLoanPool.deployed()
    console.log(`FlashLoanPool deployed to: ${flashLoanPool.address}\n`);


    // Transfer tokens to FlashLoanPool
    // call depositTokens function from FLP and place 1000000 

    // Deploy Trader contract
    // const Trader = await ethers.getContractFactory('Trader')
    // let trader = await Trader.deploy()
    
    // trade = await ethers.getSigners()
    // deployer = trade[0]

    // await token1.approve(trader.address, tokens(1000000))

    // //Deposit
    // await trader.deposit(token1.address, tokens(1000000))

    // expect(await token1.balanceOf(trader.address)).to.equal(tokens(1000000))
            
  })          

})