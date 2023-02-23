// -- IMPORT PACKAGES -- //
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


const { expect } = require('chai');
const { ethers } = require('hardhat');

// require("dotenv").config();

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens
const shares = ether

// const FlashLoan = artifacts.require('./FlashLoan')

describe('FlashLoan', () => {
  // Accounts
  let deployer,
      trade

  // Contracts    
  let token1,
      Trader


beforeEach(async () => {
  trade = await ethers.getSigners()
  deployer = trade[1],
})

  it('Borrowing 1M USD and throws revert info msg.', async () => {

    borrowAmount = tokens(1000000)
    accounts = await ethers.getSigners()
    deployer = accounts[0]

    const Trader = await ethers.getContractFactory('Trader')
    Trader = await Trader.deploy()
      
    const Token = await ethers.getContractFactory('Token')
    token1 = await Token.deploy('USD Token', 'USD', '1000000000')


    let transaction = await token1.Trader(borrowAmount).approve(deployer.address, borrowAmount)
    await transaction.wait()

    IERC20(token1).transfer(deployer, IERC20(token1).balanceOf(address(this)) - borrowAmount);

    // Return Funds
    IERC20(token1).transfer(Trader, borrowAmount);
  })          
})
