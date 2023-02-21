const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens
const share = ether

/**************************************************
* Tests:
* 1.	Make sure it can borrow and payback
* 2.	2 simple swaps on each AMM
* 3.	Arbitrage trade without loan
* 4.	Arbitrage trade with Flashloan
* 
**************************************************/
describe('DES', () => {
    // Accounts
    let accounts,
        deployer,
        liquidityProvider1, // AMM
        liquidityProvider2, // AMM2
        trader1Amm,
        trader2Amm,
        trader3Amm2,
        trader4Amm2
    
        // contracts
    let token1, // Sobek token
        token2, // USD token 
        // token 3 and token 4?
        amm1,
        amm2
    

    beforeEach(async () => {
        // Setup accounts
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        liquidityProvider1 = accounts[1]
        liquidityProvider2 = accounts[2]
        trader1Amm = accounts[3]
        trader2Amm = accounts[4]
        trader3Amm2 = accounts[5]
        trader4Amm2 = accounts[6]


        // Deploy tokens
        const Token = await ethers.getContractFactory('Token')
        token1 = await Token.deploy('Sobek', 'SOB', '1000000')
        token2 = await Token.deploy('USD Token', 'USD', '1000000')

        // Send Tokens to liquidity provider in AMM1
        let transaction = await token1.connect(deployer).transfer(liquidityProvider1.address, tokens(1000000))
        await transaction.wait()

        transaction = await token2.connect(deployer).transfer(liquidityProvider1.address, tokens(1000000))
        await transaction.wait()

        // Send Tokens to liquidity provider in AMM2
        transaction = await token1.connect(deployer).transfer(liquidityProvider2.address, tokens(1000000))
        await transaction.wait()

        transaction = await token2.connect(deployer).transfer(liquidityProvider2.address, tokens(1000000))
        await transaction.wait()


        // Send 25% to trader1 and trader2 in AMM
        transaction = await token1.connect(deployer).transfer(trader1Amm.address, tokens(250000))
        await transaction.wait()

        transaction = await token2.connect(deployer).transfer(trader2Amm.address, tokens(250000))
        await transaction.wait()

        // Send 25% to trader3 and trader4 in AMM2
        transaction = await token1.connect(deployer).transfer(trader3Amm2.address, tokens(250000))
        await transaction.wait()

        transaction = await token2.connect(deployer).transfer(trader4Amm2.address, tokens(250000))
        await transaction.wait()
    })

  

    describe('Deployment', () => {

        it('has an address', async () => {
            expect(amm1.address).to.not.equal(0x0)        
        })

        it('has an address', async () => {
            expect(amm2.address).to.not.equal(0x0)        
        })

        it('tracks token1 address', async () => {
            expect(await amm1.token1()).to.equal.apply(token1.address)
        })

        it('tracks token2 address', async () => {
            expect(await amm1.token1()).to.equal.apply(token2.address)
        })
    })


    describe('Swapping Tokens', () => {
        let amount, transaction, result, estimate, balance  // vars to use for swapping tokens

        // Borrow Flashloan
        // Flashloan implementation here to borrow tokens

        
        it('facilitates swaps', async () => {   

            ////////////////////////////////////////////////////////////////////////////////////////////////////////
            // trader1 Swap Tokens from AMM to AMM2
            // Check Price before initiating trade
            console.log(`Price: ${await amm1.token2Balance() / await amm1.token1Balance()} \n`)
            console.log(`Price: ${await amm2.token2Balance() / await amm2.token1Balance()} \n`)

            // Approve tokens for swap
            transaction = await token1.connect(trader1Amm).approve(amm1.address, tokens(50000))
            await transaction.wait()
            
            // Check trader1 balance before swap
            balance = await token1.blanceOf(trader1Amm.address)
            console.log(`Trader1 Token2 (USDC) balance before swap:" ${ethers.utils.formatEther(balance)}\n`)

            // Estimate amount of tokens trader 1 will receive after swapping including slippage
            estimate = await amm2.calculateToken1Swap(tokens(1))
            console.log(`Token1 (SOBEK) amount investor1 will receive after swap: ${ethers.utils.formatEther(estimate)}\n`)
            
            // Trader 1 swaps token to AMM2
            transaction = await amm2.connect(trader1Amm).swapToken1(tokens(1))
            result = await transaction.wait()

            //Emit an Event - Check for Swap event
            await expect(transaction).to.emit(amm2, 'Swap').withArgs(
                trader1Amm.address,
                token1.address,
                tokens(1),
                token2.address,
                estimate,
                await amm1.token1Balance(),
                await amm2.token2Balance(),
                (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp
                )
            
            // Check Balances after swap
            balance = await token2.balanceOf(trader1Amm.address)
            expect(await token1.balanceOf(amm1.address)).to.equal(await amm1.token1Balance())
            expect(await token2.balanceOf(amm1.address)).to.equal(await amm1.token2Balance())
            expect(await token1.balanceOf(amm2.address)).to.equal(await amm2.token1Balance())
            expect(await token2.balanceOf(amm2.address)).to.equal(await amm2.token2Balance())

            // Check Price after swapping -- token2Balance/token1Balance
            console.log(`Price: ${await amm1.token2Balance() / await amm1.token1Balance()} \n`)
            console.log(`Price: ${await amm2.token2Balance() / await amm2.token1Balance()} \n`)            


        })
    })

})
