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


    console.log(`Deploying Market contracts ...\n`)
    // Deploy AMM1
    const AMM = await hre.ethers.getContractFactory('AMM')
    const amm1 = await AMM.deploy(sobek.address, usd.address)
    await amm1.deployed()
    console.log(`AMM1 contract deployed to: ${amm1.address}\n`)

    // Deploy AMM2
    const AMM2 = await hre.ethers.getContractFactory('AMM2')
    const amm2 = await AMM2.deploy(sobek.address, usd.address)
    await amm2.deployed()
    console.log(`AMM2 contract deployed to: ${amm2.address}\n`)  
    
      
    // Fund AMMs
    
    console.log(`Adding Liquidity to AMMs...\n`)
    console.log(`Fetching tokens and transferring to accounts ... \n`)

    const usdtAmount = 1000
    const sobekAmount = 1000
    const amm1UsdAmount = tokens(1000000)
    const amm1SobekAmount = tokens(1000000)
    
    // // Add Liquidity to AMM2
    const amm2UsdAmount = tokens(1000000)
    const amm2SobekAmount = tokens(500000)

    await usd.transfer(amm1.address, amm1UsdAmount)
    await sobek.transfer(amm1.address, amm1SobekAmount)
    await usd.transfer(amm2.address, amm2UsdAmount)
    await sobek.transfer(amm2.address, amm2SobekAmount)
    
    const bal = await sobek.balanceOf(deployer.address)
    console.log(`sobek balance: ${ethers.utils.formatEther(bal)}\n`)

    // Get current AMM2 Pool Balance 
    console.log(`AMM2 USD Token Balance: ${ethers.utils.formatEther(await amm2.token1Balance())} \n`)
    console.log(`AMM2 Sobek Token Balance: ${ethers.utils.formatEther(await amm2.token2Balance())} \n`)

    console.log("Transferred liquidity to AMM contracts");

    // Send tokens to liquidity provider
    let transaction
    
    transaction = await sobek.connect(deployer).transfer(investor1.address, tokens(100)) // NOTE: use 'connect' to connect to a contract
    await transaction.wait()

  //  transaction = await sobek.connect(liquidityProvider).transfer(investor2.address, tokens(10000000))
  //  await transaction.wait()   
    

    // Send USD tokens to investor 1
  //  transaction = await usd.connect(liquidityProvider).transfer(investor1.address, tokens(10))
  //  await transaction.wait()
    
    // // Send Sobek tokens to investor 1
    // transaction = await sobek.connect(liquidityProvider).transfer(investor1.address, tokens(10))
    // await transaction.wait()

    // // Send USD tokens to investor 4
    // transaction = await usd.connect(liquidityProvider).transfer(investor4.address, tokens(10))
    // await transaction.wait()
    
    // // Send Sobek tokens to investor 3
    // transaction = await sobek.connect(liquidityProvider).transfer(investor3.address, tokens(10))
    // await transaction.wait()

    // // Send Sobek tokens to investor 3
    // transaction = await sobek.connect(liquidityProvider).transfer(investor3.address, tokens(1500000))
    // await transaction.wait()

    // // Send Sobek tokens to investor 4
    // transaction = await usd.connect(liquidityProvider).transfer(investor4.address, tokens(15000000))
    // await transaction.wait()

    
    //////////////////////////////////////////////////////////////////////////////////////////
    // Add liquidity (create price difference in the AMMs SOB)
    // Add Liquidity to AMM1
    // let amm1UsdAmount = tokens(1000000)
    // let amm1SobAmount = tokens(1000000)
    
    // // Add Liquidity to AMM2
    // let amm2UsdAmount = tokens(1000000)
    // let amm2SobAmount = tokens(500000)

    // // Add liquidity to AMM1
    // transaction = await usd.connect(liquidityProvider).approve(amm1.address, amm1UsdAmount)
    // await transaction.wait()

    // transaction = await sobek.connect(liquidityProvider).approve(amm1.address, amm1SobAmount)
    // await transaction.wait()

    // console.log(`Adding liquidity to AMM1 ... \n`)
    // transaction = await amm1.connect(liquidityProvider).addLiquidity(amm1UsdAmount, amm1SobAmount)
    // await transaction.wait()
    

    // // Add liquidity to AMM2
    // transaction = await usd.connect(liquidityProvider).approve(amm2.address, amm2UsdAmount)
    // await transaction.wait()

    // transaction = await sobek.connect(liquidityProvider).approve(amm2.address, amm2SobAmount)
    // await transaction.wait()

    // console.log(`Adding liquidity to AMM2 ... \n`)
    // transaction = await amm1.connect(liquidityProvider).addLiquidity(amm2UsdAmount, amm2SobAmount)
    // await transaction.wait()


    
    // Deploying Contracts
    console.log(`Deploying contracts...\n`)
    
    // Deploy Flash Loan Pool contract
    const FlashLoanPool = await hre.ethers.getContractFactory("FlashLoanPool")
    const flashLoanPool = await FlashLoanPool.deploy(usd.address)
    await flashLoanPool.deployed()
    console.log(`FlashLoanPool deployed to: ${flashLoanPool.address}\n`);

    // Deploy Trader contract
    const Trader = await hre.ethers.getContractFactory("Trader");
    const trader = await Trader.deploy(usd.address, sobek.address, flashLoanPool.address, amm1.address, amm2.address);
    await trader.deployed();
    console.log(`Trader deployed to: ${trader.address}\n`);

    console.log(`Deployment completed\n`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
