// NOTE:
// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.

const { ethers } = require("hardhat");
const hre = require("hardhat");

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
  }
  
  const ether = tokens
  const shares = ether

async function main() {

    console.log(`Preparing deployment...\n`)

    console.log(`Fetching accounts \n`)
    const accounts = await ethers.getSigners()
    const deployer = accounts[0]
    const liquidityProvider = accounts[1]
    const investor1 = accounts[2]
    const investor2 = accounts[3]
    const investor3 = accounts[4]
    const investor4 = accounts[5]
    const arbitrager = accounts[6]

    let transaction

    // Deploy Token
    console.log(`Deploying tokens...\n`)
    const Token = await ethers.getContractFactory("Token");

    // Deploy USD Token (token 1)
    let usd = await Token.deploy('USD Token', 'USD', tokens(1000000000)) // 1 Billion tokens
    await usd.deployed()  
    console.log(`USD Token deployed to: ${usd.address}\n`)

    // Deploy Sobek Token (token 2)
    let sobek = await Token.deploy('Sobek Token', 'SOB', tokens(1000000000)) // 1 Billion tokens
    await sobek.deployed()  
    console.log(`Sobek Token deployed to: ${sobek.address}\n`)


    // Send tokens to liquidity provider
    transaction = await usd.connect(deployer).transfer(liquidityProvider.address, tokens(10000000)) // NOTE: use 'connect' to connect to a contract
    await transaction.wait()
    transaction = await sobek.connect(deployer).transfer(liquidityProvider.address, tokens(10000000)) // NOTE: "let" already done in first declaration
    await transaction.wait()
    
    console.log(`Deploying Market contracts ...\n`)
    console.log('Deploying AMM contracts \n')
    const AMM = await ethers.getContractFactory('AMM')
      let amm1 = await AMM.deploy(usd.address, sobek.address)
      let amm2 = await AMM.deploy(usd.address, sobek.address)    
    
    console.log(`AMM1 contract deployed to: ${amm1.address}\n`)
    console.log(`AMM2 contract deployed to: ${amm2.address}\n`)  
    
      
    // Fund AMMs    
    console.log(`Adding Liquidity to AMMs...\n`)
    console.log(`Fetching tokens and transferring to accounts ... \n`)
   
    // AMM1 token amounts
    let amm1UsdAmount = tokens(1000000)
    let amm1SobekAmount = tokens(1000000)
    
    // AMM2 token amounts
    let amm2UsdAmount = tokens(1000000)
    let amm2SobekAmount = tokens(500000)    

    // Add Liquidity to AMM1
    //Liquidity Provider Approves tokens on AMM1
    transaction = await usd.connect(deployer).approve(amm1.address, amm1UsdAmount)
    await transaction.wait()

    transaction = await sobek.connect(deployer).approve(amm1.address, amm1SobekAmount)
    await transaction.wait()
  
    // Liquidity Provider Adds liquidity on AMM1
    transaction = await amm1.connect(deployer).addLiquidity(amm1UsdAmount, amm1SobekAmount)
    await transaction.wait()

    // Add Liquidity to AMM2
    //Liquidity Provider Approves tokens on AMM2
    transaction = await usd.connect(deployer).approve(amm2.address, amm2UsdAmount)
    await transaction.wait()

    transaction = await sobek.connect(deployer).approve(amm2.address, amm2SobekAmount)
    await transaction.wait()
  
    // Liquidity Provider Adds liquidity on AMM2
    transaction = await amm2.connect(deployer).addLiquidity(amm2UsdAmount, amm2SobekAmount)
    await transaction.wait()

    
    const bal = await sobek.balanceOf(deployer.address)
    console.log(`sobek balance: ${ethers.utils.formatEther(bal)}\n`)

    // Get current AMM1 Pool Balance   
    console.log(`AMM1 USD Token Balance: ${ethers.utils.formatEther(await usd.balanceOf(amm1.address))} \n`)
    console.log(`AMM1 Sobek Token Balance: ${ethers.utils.formatEther(await sobek.balanceOf(amm1.address))} \n`)
       

    // Get current AMM2 Pool Balance    
    console.log(`AMM2 USD Token Balance: ${ethers.utils.formatEther(await usd.balanceOf(amm2.address))} \n`)
    console.log(`AMM2 Sobek Token Balance: ${ethers.utils.formatEther(await sobek.balanceOf(amm2.address))} \n`)
    console.log("Transferred liquidity to AMM contracts");

    
    // Deploying Contracts
    console.log(`Deploying contracts...\n`)
    
    // Deploy Flash Loan Pool contract
    const FlashLoanPool = await hre.ethers.getContractFactory("FlashLoanPool")
    const flashLoanPool = await FlashLoanPool.deploy(usd.address)
    await flashLoanPool.deployed()
    console.log(`FlashLoanPool deployed to: ${flashLoanPool.address}\n`);


    // Adding Liquidity to FlashLoan Pool
    console.log(`Funding FlashLoan Pool with USD\n`)
    let flashLoanUsdAmount = tokens(5000000)  
    await usd.transfer(flashLoanPool.address, flashLoanUsdAmount)
    
    const poolBal = await usd.balanceOf(flashLoanPool.address)
    console.log(`FlashLoan Pool balance USD: ${ethers.utils.formatEther(poolBal)}\n`)

    // Deploy Trader contract
    const Trader = await hre.ethers.getContractFactory("Trader");
    const trader = await Trader.deploy(usd.address, sobek.address, flashLoanPool.address, amm1.address, amm2.address);
    await trader.deployed();
    console.log(`Trader deployed to: ${trader.address}\n`);

    // send 1 million tokens to trader.sol
    console.log (`Transferring tokens to Trader \n`);   
    let traderUSDAmount = tokens(1000000)
    let traderSOBAmount = tokens(1000000)

    transaction = await usd.connect(deployer).transfer(trader.address, traderUSDAmount)
    await transaction.wait()

    transaction = await sobek.connect(deployer).transfer(trader.address, traderSOBAmount)
    await transaction.wait()

    console.log(`Deployment completed\n`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
