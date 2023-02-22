// -- IMPORT PACKAGES -- //
const { expect } = require('chai');
const { ethers } = require('hardhat');

require("dotenv").config();

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens
const shares = ether

// const FlashLoan = artifacts.require('./FlashLoan')

describe('FlashLoan', () => {
  
  let borrowAmount,
      transaction,
      accounts,
      deployer

  // Contracts    
  let token1,
      amm,
      flashloan


beforeEach(async () => {
  accounts = await ethers.getSigners()
  deployer = accounts[1]
})


  it('Borrowing 1M USD and throws revert info msg.', async () => {

    borrowAmount = tokens(1000000)
    accounts = await ethers.getSigners()
    deployer = accounts[0]

    const FlashLoan = await ethers.getContractFactory('FlashLoan')
    flashloan = await FlashLoan.deploy()
      
    const Token = await ethers.getContractFactory('Token')
    token1 = await Token.deploy('USD Token', 'USD', '1000000000')


    let transaction = await token1.FlashLoan(borrowAmount).approve(amm.address, borrowAmount)
    await transaction.wait()
  })          
})
