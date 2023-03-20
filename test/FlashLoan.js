const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens
const shares = ether

describe('FlashLoan', () => {

  let accounts,
      deployer,
      borrower,
      liquidityProvider,
      investor1,
      investor2

  let token,
      token1,
      token2,
      amm1,
      amm2


  beforeEach(async () => {  
    accounts = await ethers.getSigners()
    deployer = accounts[0]
    borrower = accounts[1]
    liquidityProvider = accounts[2]
    investor1 = accounts[3]
    investor2 = accounts[4]

    // Deploy Token
    const Token = await ethers.getContractFactory('Token')
      token = await Token.deploy('USD Token', 'USD', tokens('1000000000')) // Deploy 1 Billion tokens
      token1 = await Token.deploy('USD Token', 'USD', tokens('1000000'))
      token2 = await Token.deploy('Sobek Token', 'SOB', tokens('500000'))

    
    // Send tokens to liquidity provider
    let transaction = await token1.connect(deployer).transfer(liquidityProvider.address, tokens(100000)) // NOTE: use 'connect' to connect to a contract
    await transaction.wait()

    transaction = await token2.connect(deployer).transfer(liquidityProvider.address, tokens(100000)) // NOTE: "let" already done in first declaration
    await transaction.wait()


    // Send token1 to investor1
    transaction = await token1.connect(deployer).transfer(investor1.address, tokens(100000))
    await transaction.wait()

    // Send token2 to investor2
    transaction = await token2.connect(deployer).transfer(investor2.address, tokens(100000))
    await transaction.wait()


    // Deploy AMM1
    console.log('Deploying AMM \n')
    const AMM = await ethers.getContractFactory('AMM')
      amm1 = await AMM.deploy(token1.address, token2.address)

    describe('Deployment AMM', () => {
      it('has an address', async () => {
        expect(amm1.address).to.not.equal(0x0)
      })    
  
      it('tracks token1 address', async () => {
          expect(await amm1.token1()).to.equal(token1.address)
      })
  
      it('tracks token2 address', async () => {
          expect(await amm1.token2()).to.equal(token2.address)
      })  
    })    

    // Deploy AMM2
    console.log('Deploying AMM2 \n')
    const AMM2 = await ethers.getContractFactory('AMM2')
      amm2 = await AMM2.deploy(token1.address, token2.address)

    describe('Deployment AMM2', () => {
      it('has an address', async () => {
        expect(amm2.address).to.not.equal(0x0)
      })    

      it('tracks token1 address', async () => {
          expect(await amm2.token1()).to.equal(token1.address)
      })

      it('tracks token2 address', async () => {
          expect(await amm2.token2()).to.equal(token2.address)
      })
    })

  
  })
 
  it('Borrowing 1M USD and throws revert info msg.', async () => {

    ////////////////////////////////////////////////////////////////////////////////
    // Test will do the following:
    // [X] Deploy token
    // [X] Deploy FLP
    // [X] transfer tokens to FLP
    // [X] Deploy trader contract
    // [X] Fetch accounts from ethers js library ()getSigners
    // [X] Call Flashloan function on the Trader contract and make sure it works
    // [X] Payback FlashLoan
    /////////////////////////////////////////////////////////////////////////////////
     
     
    // Deploy Flash Loan Pool contract
    console.log(`Deploying FlashLoanPool contract...\n`);
    const FlashLoanPool = await ethers.getContractFactory("FlashLoanPool")
    const flashLoanPool = await FlashLoanPool.deploy(token.address)
    await flashLoanPool.deployed()
    console.log(`FlashLoanPool deployed to: ${flashLoanPool.address}\n`);


    // Transfer tokens to FlashLoanPool
    // call depositTokens function from FLP and place 1000000 tokens
    console.log (`Transferring tokens to FlashLoanPool\n`);
    let amount = tokens(1000000000)
    let borrowAmount = tokens(1000000)
    let transaction = await token.connect(deployer).approve(flashLoanPool.address, amount)
    await transaction.wait()
   
    await flashLoanPool.connect(deployer).depositTokens(amount)
    await transaction.wait()

    // LoanPool Balance
    let poolBalance = await token.balanceOf(flashLoanPool.address)
    expect(poolBalance).to.equal(amount)
    console.log(`Transferred Tokens to pool (in wei): ${amount}\n`);    
    

   



    // Deploy Trader contract
    console.log(`Deploying Trader contract...\n`)
    const Trader = await ethers.getContractFactory("Trader")
    const trader = await Trader.deploy(token.address, token1.address, flashLoanPool.address, amm1.address, amm2.address)
    await trader.deployed()
    console.log(`Trader deployed to: ${trader.address}\n`);
    

    // Call FlashLoan    
    console.log(`Calling Flashloan`);
    await token.connect(borrower).approve(trader.address, borrowAmount);  
    transaction = await trader.connect(borrower).flashLoan(borrowAmount);
    await transaction.wait()
     
    // Remove loan payback to test:
    // let balance = await token.balanceOf(trader.address);
    // expect(balance).to.equal(borrowAmount)
    // console.log(`FlashLoan sent Tokens: ${ethers.utils.formatEther(borrowAmount)}\n`);
    // console.log(`FlashLoan Pool balance: ${ethers.utils.formatEther(amount)}\n`);
    

    // Use Emit Event to confirm loan payment
    await expect(transaction).to.emit(trader, 'Loan').withArgs( 
      token.address,   
      borrowAmount
      )     

    // NOTE: To Test if it Fails comment out repay code and check for require statement

    

    

    


    

    
    






    // Execute Trade

    // console.log(`Executing Trade`)
    // let buyAmount = tokens(borrowAmount)
    // let liquidityProvider = accounts[3]
    // transaction = await token1.connect(liquidityProvider).approve(amm2.address, buyAmount)
    // await transaction.wait()

    // Describe Arbitrage - only do arb with no flashloan
    // send tokens to contract in test inside function test line by line
    // console.log(`Calling Arbitrage`);
    // await token2.connect(borrower).approve(trader.address, token1.address, flashLoanPool.address, amm1.address, amm2.address)
    // transaction = await trader.connect(borrower).arbitrage(token1, token2, borrowAmount)
    // await transaction.wait()
    
    // get tokens, then approve, then swap

    // Check Payback Loan
    console.log(`Paying Back FlashLoan`);
    poolBalance = await token.balanceOf(flashLoanPool.address)
    expect(poolBalance).to.equal(amount)
    console.log(`Transferred Tokens to pool: ${amount}\n`);

  })
})
