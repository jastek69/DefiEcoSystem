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
    // [X] Deploy trader contract
    // [X] Fetch accounts from ethers js library ()getSigners
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
    
    
    // Deploy Trader contract
    console.log(`Deploying Trader contract...\n`)
    const Trader = await ethers.getContractFactory("Trader")    
    const trader = await Trader.deploy(token.address, deployer.address, borrowAmount)
    await trader.deployed()
    console.log(`Trader deployed to: ${trader.address}\n`);


    
    // Call FlashLoan make sure it's working    
    // function flashLoan(uint256 borrowAmount)
    console.log(`Calling Flashloan`);    
    
    
    
    // await flashLoanPool.connect(borrower).flashLoan(borrowAmount); gives ERROR ln 46
   
    await token.connect(borrower).approve(trader.address, borrowAmount);  
    await trader.connect(borrower).flashLoan(borrowAmount)  // gives error ln 30

   
    
   
    let balance = await token.balanceOf(deployer.address);
    expect(balance).to.equal(borrowAmount);
    
    console.log(`FlashLoan sent Tokens: ${ethers.utils.formatEther(borrowAmount)}\n`);

    // await flashLoanPool.connect(deployer).flashLoan(borrowAmount);
    // let balance = await token.balanceOf(deployer.address)

    // expect(balance).to.equal(borrowAmount)
  
    // console.log(`Executed Flashloan: ${amount}\n`);    
            

  })          

})
