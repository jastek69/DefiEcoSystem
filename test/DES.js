const { expect } = require('chai');
const { ethers } = require('hardhat');





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
        liquidityProvider1,
        liquidityProvider2
    
        // contracts
    let token1,
        token2,
        amm1,
        amm2

    

beforeEach(async () => {
    // Setup accounts
    accounts = await ethers.getSigners()
    deployer = accounts[0]
    liquidityProvider1 = accounts[1]
    liquidityProvider2 = accounts[2]


    // Deploy tokens
    const Token = await ethers.getContractFactory('Token')
    token1 = await Token.deploy('Sobek', 'SOB', '1000000')
    token2 = await Token.deploy('USD Token', 'USD', '1000000')


    // Borrow Flashloan

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


})