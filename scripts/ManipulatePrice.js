// -- IMPORT PACKAGES -- //
require("dotenv").config();

const Web3 = require('web3')
const {
    ChainId,
    Token,
    WETH
} = require("@uniswap/sdk")


const IERC20 = require('@openzeppelin/contracts/build/contracts/ERC20.json')

// -- SETUP NETWORK & WEB3 -- //

const chainId = ChainId.MAINNET
const web3 = new Web3('http://127.0.0.1:7545')





// get pair
const { getPairContract, calculatePrice } = require('../helpers/helpers')

// -- IMPORT & SETUP AMM1 and AMM2 CONTRACTS -- //

const config = require('../config.json')


// -- CONFIGURE VALUES HERE -- //

const UNLOCKED_ACCOUNT = '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc ' // USDC Unlocked Account
const ERC20_ADDRESS = process.env.ARB_AGAINST // USD AMM2
const AMOUNT = '15000000' // 15,000,000 USDC
const GAS = 450000


// -- SETUP ERC20 CONTRACT & TOKEN -- //
const ERC20_CONTRACT = new web3.eth.Contract(IERC20.abi, ERC20_ADDRESS)
const SOB_CONTRACT = new web3.eth.Contract(IERC20.abi, process.env.ARB_FOR)







// -- MAIN SCRIPT -- //

const main = async () => {
    const accounts = await web3.eth.getAccounts()
    const account = accounts[1] // This will be the account to receive USD  after we perform the swap to manipulate price

    const pairContract = await getPairContract(AMM2, ERC20_ADDRESS, process.env.ARB_FOR)
    const token = new Token(
        ChainId.MAINNET,
        ERC20_ADDRESS,
        18, // USDC so 6 instead of 18 decimals
        await ERC20_CONTRACT.methods.symbol().call(),
        await ERC20_CONTRACT.methods.name().call()
    )

    // Fetch price of USDC/WETH before we execute the swap
    const priceBefore = await calculatePrice(pairContract)

    await manipulatePrice(token, account)

    // Fetch price of USDC/WETH after the swap
    const priceAfter = await calculatePrice(pairContract)

    const data = {
        'Price Before': `1 ${SOB[chainId].symbol} = ${Number(priceBefore).toFixed(0)} ${token.symbol}`,
        'Price After': `1 ${SOB[chainId].symbol} = ${Number(priceAfter).toFixed(0)} ${token.symbol}`,
    }

    console.table(data)

    let balance = await SOB_CONTRACT.methods.balanceOf(account).call()
    balance = web3.utils.fromWei(balance.toString(), 'mwei')    //Note: Using USDC so switch to mwei instead of ether

    console.log(`\nBalance in receiver account: ${balance} WETH\n`)
}

main()

// 

// async function getPairAddress(_AMM2, _token0, _token1) {
//     const pairAddress = await _V2Factory.methods.getPair(_token0, _token1).call()
//     return pairAddress
// }

// async function getPairContract(_AMM2, _token0, _token1) {
//     const pairAddress = await getPairAddress(_AMM2, _token0, _token1)
//     const pairContract = new web3.eth.Contract(IUniswapV2Pair.abi, pairAddress)
//     return pairContract
// }

// async function getReserves(_pairContract) {
//     const reserves = await _pairContract.methods.getReserves().call()
//     return [reserves.reserve0, reserves.reserve1]
// }

// async function calculatePrice(_pairContract) {
//     const [reserve0, reserve1] = await getReserves(_pairContract)
//    // return Big(reserve0).div(Big(reserve1)).toString() // non USDC conversion
//    return Big(`${reserve0}000000000000`).div(Big(reserve1)).toString() // USDC as token0/reserve0 conversion   
// }


async function manipulatePrice(token, account) {
    console.log(`\nBeginning Swap...\n`)

    console.log(`Input Token: ${token.symbol}`)
    console.log(`Output Token: ${WETH[chainId].symbol}\n`)

    const amountIn = new web3.utils.BN(
        web3.utils.toWei(AMOUNT, 'mwei')   // Note: Using USDC so switch to mwei instead of ether
    )

    const path = [token.address, process.env.ARB_FOR]
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes

    await ERC20_CONTRACT.methods.approve(AMM2._address, amountIn).send({ from: UNLOCKED_ACCOUNT })
    const receipt = await AMM2.methods.swapExactTokensForTokens(amountIn, 0, path, account, deadline).send({ from: UNLOCKED_ACCOUNT, gas: GAS });

    console.log(`Swap Complete!\n`)

    return receipt
}

