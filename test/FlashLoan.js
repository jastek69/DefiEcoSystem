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
      arbitrager,
      liquidityProvider,
      investor1,
      investor2
      

  let token1,
      token2,
      amm1,
      amm2


  beforeEach(async () => {  
    accounts = await ethers.getSigners()
    deployer = accounts[0]
    arbitrager = accounts[1]
    liquidityProvider = accounts[2]
    investor1 = accounts[3]
    investor2 = accounts[4]
    

    // Deploy Token
    const Token = await ethers.getContractFactory('Token')
      token1 = await Token.deploy('USD Token', 'USD', tokens('10000000000')) // Deploy 1 Billion tokens
      token2 = await Token.deploy('Sobek Token', 'SOB', tokens('10000000000'))
    
    // Send tokens to liquidity provider
    let transaction = await token1.connect(deployer).transfer(liquidityProvider.address, tokens(10000000)) // NOTE: use 'connect' to connect to a contract
    await transaction.wait()

    transaction = await token2.connect(deployer).transfer(liquidityProvider.address, tokens(10000000)) // NOTE: "let" already done in first declaration
    await transaction.wait()

    // Send token1 to investor1
    transaction = await token1.connect(deployer).transfer(investor1.address, tokens(1000000))
    await transaction.wait()

    // Send token2 to investor2
    transaction = await token2.connect(deployer).transfer(investor2.address, tokens(1000000))
    await transaction.wait()


    // Deploy AMM's
    console.log('Deploying AMM contracts \n')
    const AMM = await ethers.getContractFactory('AMM')
      amm1 = await AMM.deploy(token1.address, token2.address)
      amm2 = await AMM.deploy(token1.address, token2.address)

    
   

    // Add Liquidity to AMM1
    let amm1UsdAmount = tokens(1000000)
    let amm1SobAmount = tokens(1000000)
    
    //Liquidity Provider Approves tokens on AMM1
    transaction = await token1.connect(liquidityProvider).approve(amm1.address, amm1UsdAmount)
    await transaction.wait()

    transaction = await token2.connect(liquidityProvider).approve(amm1.address, amm1SobAmount)
    await transaction.wait()
    
    // Liquidity Provider Adds liquidity on AMM1
    transaction = await amm1.connect(liquidityProvider).addLiquidity(amm1UsdAmount, amm1SobAmount)
    await transaction.wait()


    // Get current AMM1 Pool Balance 
    console.log(`AMM1 USD Token Balance: ${ethers.utils.formatEther(await amm1.token1Balance())} \n`)
    console.log(`AMM1 Sobek Token Balance: ${ethers.utils.formatEther(await amm1.token2Balance())} \n`)

    // Check AMM1 receives tokens
    expect(await token1.balanceOf(amm1.address)).to.equal(amm1UsdAmount)
    expect(await token2.balanceOf(amm1.address)).to.equal(amm1SobAmount)

    expect(await amm1.token1Balance()).to.equal(amm1UsdAmount)
    expect(await amm1.token2Balance()).to.equal(amm1SobAmount)


    // Add Liquidity to AMM2
    let amm2UsdAmount = tokens(1000000)
    let amm2SobAmount = tokens(500000)
    
    //Liquidity Provider Approves tokens on AMM2
    transaction = await token1.connect(liquidityProvider).approve(amm2.address, amm2UsdAmount) // first person to add liquidity so sets the price
    await transaction.wait()

    transaction = await token2.connect(liquidityProvider).approve(amm2.address, amm2SobAmount)
    await transaction.wait()

    // Liquidity Provider Adds liquidity to AMM2
    transaction = await amm2.connect(liquidityProvider).addLiquidity(amm2UsdAmount, amm2SobAmount)
    await transaction.wait()


    // Get current AMM2 Pool Balance 
    console.log(`AMM2 USD Token Balance: ${ethers.utils.formatEther(await amm2.token1Balance())} \n`)
    console.log(`AMM2 Sobek Token Balance: ${ethers.utils.formatEther(await amm2.token2Balance())} \n`)


    // Check AMM2 receives tokens
    expect(await token1.balanceOf(amm2.address)).to.equal(amm2UsdAmount)
    expect(await token2.balanceOf(amm2.address)).to.equal(amm2SobAmount)

    expect(await amm2.token1Balance()).to.equal(amm2UsdAmount)
    expect(await amm2.token2Balance()).to.equal(amm2SobAmount)
  
  })

  describe('Deployment AMM1 and AMM2', () => {
    it('has an address', async () => {
      expect(amm1.address).to.not.equal(0x0)
      expect(amm2.address).to.not.equal(0x0)
    })    

    it('tracks token1 address', async () => {
      expect(await amm1.token1()).to.equal(token1.address)
      expect(await amm2.token1()).to.equal(token1.address)
    })

    it('tracks token2 address', async () => {
      expect(await amm1.token2()).to.equal(token2.address)
      expect(await amm2.token2()).to.equal(token2.address)
    })  
  })

  // it('Borrowing USD and throws revert info msg.', async () => {

  //   ////////////////////////////////////////////////////////////////////////////////
  //   // Test will do the following:
  //   // [X] Deploy token
  //   // [X] Deploy FLP
  //   // [X] transfer tokens to FLP
  //   // [X] Deploy trader contract
  //   // [X] Fetch accounts from ethers js library ()getSigners
  //   // [X] Call Flashloan function on the Trader contract and make sure it works
  //   // [X] Payback FlashLoan
  //   /////////////////////////////////////////////////////////////////////////////////
     
     
  //   // Deploy Flash Loan Pool contract
  //   console.log(`Deploying FlashLoanPool contract...\n`);
  //   const FlashLoanPool = await ethers.getContractFactory("FlashLoanPool")
  //   const flashLoanPool = await FlashLoanPool.deploy(token1.address)
  //   await flashLoanPool.deployed()
  //   console.log(`FlashLoanPool deployed to: ${flashLoanPool.address}\n`);


  //   // Transfer tokens to FlashLoanPool
  //   // call depositTokens function from FLP and place 1000000 tokens
  //   console.log (`Transferring tokens to FlashLoanPool\n`);
  //   let amount = tokens(500000000)
  //   let borrowAmount = tokens(100000)
  //   let transaction = await token1.connect(deployer).approve(flashLoanPool.address, amount)
  //   await transaction.wait()
   
  //   await flashLoanPool.connect(deployer).depositTokens(amount)
  //   await transaction.wait()

  //   // LoanPool Balance
  //   let poolBalance = await token1.balanceOf(flashLoanPool.address)
  //   expect(poolBalance).to.equal(amount)
  //   console.log(`Transferred Tokens to pool (in wei): ${amount}\n`); 
  //   console.log(`Flash Loan Pool Balance: ${ethers.utils.formatEther(await flashLoanPool.poolBalance())} \n`)

  //   // Deploy Trader contract
  //   console.log(`Deploying Trader contract...\n`)
  //   const Trader = await ethers.getContractFactory("Trader")
  //   const trader = await Trader.deploy(token1.address, token2.address, flashLoanPool.address, amm1.address, amm2.address)
  //   await trader.deployed()
  //   console.log(`Trader deployed to: ${trader.address}\n`);    

  //   // Call Arbitrage    
  //   console.log(`Calling Arbitrage`);
  //   await token1.connect(arbitrager).approve(trader.address, borrowAmount); // await not needed so how to reformat if at all?    
  //   transaction = await trader.connect(arbitrager).flashLoan(borrowAmount);
  //   await transaction.wait()

    
  //   console.log(`Flash Loan tokens: ${ethers.utils.formatEther(await arbitrager.token1Balance())} \n`)
   

  //   // Use Emit Event to confirm loan payment
  //   await expect(transaction).to.emit(trader, 'Loan').withArgs( 
  //     token1.address,   
  //     borrowAmount
  //     ) 
  //   // NOTE: To Test if it Fails comment out repay code and check for require statement


  //   // Check Payback Loan
  //   console.log(`Paying Back FlashLoan`);
  //   poolBalance = await token1.balanceOf(flashLoanPool.address)
  //   expect(poolBalance).to.equal(amount)
  //   console.log(`Transferred Tokens to pool: ${amount}\n`);
  // }) // Trying to repay FlashLoan so remove for now

  it('Does Arbitrage...', async () => {    

    // Deploy Trader contract
    console.log(`Deploying Trader contract...\n`)
    const Trader = await ethers.getContractFactory("Trader")
    const trader = await Trader.deploy(token1.address, token2.address, "0x5FbDB2315678afecb367f032d93F642f64180aa3", amm1.address, amm2.address)
    await trader.deployed()
    console.log(`Trader deployed to: ${trader.address}\n`);    


    // Transfer tokens to Trader contract
    // call depositTokens function from FLP and place 1000000 tokens
    console.log (`Transferring tokens to Trader \n`);
    let amount = tokens(1000000)
    let borrowAmount = tokens(100000)
    let transaction = await token1.connect(deployer).transfer(trader.address, amount)
    await transaction.wait()   
     

    // LoanPool Balance
    let arbBalance = await token1.balanceOf(trader.address)
    expect(arbBalance).to.equal(amount)
    console.log(`Transferred Tokens to Trader (in wei): ${amount}\n`);
    

    // Check investor1 balance before swap
    let balance = await token2.balanceOf(deployer.address)
    console.log(`Traders Token2 balance before swap: ${ethers.utils.formatEther(balance)}\n`)

    // Get current AMM1 Pool Balance 
    console.log(`AMM1 USD Token Balance before swap: ${ethers.utils.formatEther(await amm1.token1Balance())} \n`)
    console.log(`AMM1 Sobek Token Balance before swap: ${ethers.utils.formatEther(await amm1.token2Balance())} \n`)
    
    // Get current AMM2 Pool Balance 
    console.log(`AMM2 USD Token Balance before swap: ${ethers.utils.formatEther(await amm2.token1Balance())} \n`)
    console.log(`AMM2 Sobek Token Balance before swap: ${ethers.utils.formatEther(await amm2.token2Balance())} \n`)


    // Call Arb function and test results - check balances make sure values match    
    console.log(`Calling Arbitrage function`)  
    transaction = await trader.connect(deployer).arbitrage(token1.address, token2.address, borrowAmount);
    await transaction.wait()
    console.log(`Arbitrage done (in wei): ${amount}\n`);
  
    // Check balance after swap
    balance = await token2.balanceOf(deployer.address)
    console.log(`Traders Sobek Token balance after swap: ${ethers.utils.formatEther(balance)}\n`)
   
    
    // Get current AMM1 Pool Balance 
    console.log(`AMM1 USD Token Balance after swap: ${ethers.utils.formatEther(await amm1.token1Balance())} \n`)
    console.log(`AMM1 Sobek Token Balance after swap: ${ethers.utils.formatEther(await amm1.token2Balance())} \n`)


    // Get current AMM2 Pool Balance 
    console.log(`AMM2 USD Token Balance after swap: ${ethers.utils.formatEther(await amm2.token1Balance())} \n`)
    console.log(`AMM2 Sobek Token Balance after swap: ${ethers.utils.formatEther(await amm2.token2Balance())} \n`)   

    
  })

})
