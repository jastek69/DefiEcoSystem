// -- IMPORT PACKAGES -- //
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Contract } from "hardhat/internal/hardhat-network/stack-traces/model";


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
  deployer = trade[1]
})

  it('Borrowing 1M USD and throws revert info msg.', async () => {
    const Token = await ethers.getContractFactory('Token')
    let token1 = await Token.deploy('USD Token', 'USD', tokens('10000000')) // Deploy 1 Billion tokens

    const Trader = await ethers.getContractFactory('Trader')
    let trader = await Trader.deploy()
    
    trade = await ethers.getSigners()
    deployer = trade[0]

    await token1.approve(trader.address, tokens(1000000))

    //Deposit
    await trader.deposit(token1.address, tokens(1000000))

    expect(await token1.balanceOf(trader.address)).to.equal(tokens(1000000))
    })        
  })          

