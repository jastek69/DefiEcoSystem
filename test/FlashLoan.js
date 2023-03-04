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
    // [X] transfer tokens to FLP
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
    // function depositTokens(uint256 amount) external nonReentrant
    console.log (`Transferring tokens to FlashLoanPool\n`);
    let accounts, deployer, borrower   
    accounts = await ethers.getSigners()
    deployer = accounts[0]
    borrower = accounts[1]
    

    let amount = tokens(10000000)
    let borrowAmount = tokens(1000000)
    let transaction = await token.connect(deployer).approve(flashLoanPool.address, amount)
    await transaction.wait()
   
    await flashLoanPool.connect(deployer).depositTokens(amount)
    await transaction.wait()

    // Balance
    let poolBalance = await token.balanceOf(flashLoanPool.address)
    expect(poolBalance).to.equal(amount)
    console.log(`Transferred Tokens to pool: ${amount}\n`);
    
    

    // Call FlashLoan make sure it's working    
    // function flashLoan(uint256 borrowAmount)
    console.log(`Calling Flashloan`);
    
    
    // transaction = await token.connect(borrower).approve(flashLoanPool.address, borrowAmount)
    // await transaction.wait()
    await flashLoanPool.connect(borrower).flashLoan(borrowAmount);
    let balance = await token.balanceOf(borrower.address)
    
    // transaction = await token.connect(deployer).approve(flashLoanPool.address, borrowAmount)
    // await transaction.wait()
    // await flashLoanPool.connect(deployer).flashLoan(borrowAmount);
    // let balance = await token.balanceOf(deployer.address)

    
    


    expect(balance).to.equal(borrowAmount)
  
    console.log(`Executed Flashloan: ${amount}\n`);
        


    // Deploy Trader contract
    // const Trader = await ethers.getContractFactory('Trader')
    // let trader = await Trader.deploy()    
    // trade = await ethers.getSigners()
    // deployer = trade[0]
    // await token1.approve(trader.address, tokens(1000000))   
    //  let deployer 


    // Fetch accounts from ethers js library
    // accounts = await ethers.getSigners()
    // deployer = accounts[0] 
            
  })          

})