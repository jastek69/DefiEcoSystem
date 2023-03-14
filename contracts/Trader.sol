// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";
import "./FlashLoanPool.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract Trader {
    // pass in FLP contract address save to State var - NOTE: must deploy FLP first. Be sure to pass tokens in test
   
    address flashLoanPoolAddress; // NEED FlashloanPool address   
    address public owner;
    address token1;
    address constant AMM1 = 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9;
    address constant AMM2 = 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0;
    address constant amm1Token1 = 0x5FbDB2315678afecb367f032d93F642f64180aa3; // SOB
    address constant amm2Token2 = 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512; // USD
    

    // EVENTS
   
    event Loan(            
        address tokenGive,    
        uint256 tokenGiveAmount      
     );
    
    constructor(address _token1, address _flashLoanPoolAddress) payable {
        owner = msg.sender;
        token1 = _token1;   // USD token in Flash pool
        flashLoanPoolAddress = _flashLoanPoolAddress;       
    }     
    
    function flashLoan(uint256 _borrowAmount) public {
        FlashLoanPool(flashLoanPoolAddress).flashLoan(_borrowAmount);
    }  

    // same as FLP receive function
    function receiveTokens(address _token1, uint256 _borrowAmount) public payable {
    console.log('Loan Received (in wei)', _token1, _borrowAmount);

     emit Loan(             // Emit event to prove tokens receive in test     
        address(token1),    // tokenGive,
        _borrowAmount      // tokenGiveAmount       
        );
    

    // Do something with the money here
    // Arbitrage here buy on AMM1 and sell on AMM2
    // use script to get prices to change which will call trader contract to buy and sell

    
    function buyTokens(uint256 _numberOfTokens) public payable {
        require(msg.value == multiply(_numberOfTokens, tokenPrice));
        require(amm2Token2.balanceOf(this) >= _numberOfTokens);
        require(amm2Token2.transfer(msg.sender, _numberOfTokens));

        tokensSold += _numberOfTokens; 

        Sell(msg.sender, _numberOfTokens);
    }


    function arbitrage(AMM1, AMM2, uint256 buyAmount,uint256 sellAmount) external nonReentrant {
        require(buyAmount > 0, "Must buy at least one token");
        require(sellAmount > 0, "Must sell at least one token");

        uint256 balanceBefore = token.balanceOf(address(this));
        require(balanceBefore >= buyAmount, "Not enough tokens in pool");


        // Buy tokens on AMM1
        token.approve(address(AMM1), buyAmount);
        AMM1.buyTokens(buyAmount);

        // Sell tokens on AMM2
        token.approve(address(AMM2), sellAmount);
        AMM2.sellTokens(sellAmount);

        uint256 balanceAfter = token.balanceOf(address(this));
        require(balanceAfter >= balanceBefore, "Arbitrage was not successful");
    }        

    // Return all tokens to the Pool - 
    require(Token(token1).transfer(msg.sender, _borrowAmount), "Transfer of tokens failed");

    } 

}
