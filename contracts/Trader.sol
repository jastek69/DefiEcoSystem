// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";
import "./FlashLoanPool.sol";
import "./AMM1.sol";
import "./AMM2.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract Trader is ReentrancyGuard {
    // pass in FLP contract address save to State var - NOTE: must deploy FLP first. Be sure to pass tokens in test
   
    address flashLoanPoolAddress; // NEED FlashloanPool address   
    address public owner; 
    address AMM1_ADDRESS;     // should this be in the constructor
    address AMM2_ADDRESS;     // should this be in the contsructor
    address token1;  // SOB
    address token2;  // USD
    

    // EVENTS   
    event Loan(            
        address tokenGive,    
        uint256 tokenGiveAmount      
     );
    
    // Events
        // emit Buy(
        //     address(owner),
        //     _numberOfTokens
        // );

        // emit Sell(
        //     address(owner),
        //     tokensSold
        // );


    constructor(address _token1, address _token2, address _flashLoanPoolAddress, address _AMM1_ADDRESS, address _AMM2_ADDRESS) payable {
        owner = msg.sender;        
        token1 = _token1;   // USD token in Flash pool
        token2 = _token2;
        flashLoanPoolAddress = _flashLoanPoolAddress;
        AMM1_ADDRESS = _AMM1_ADDRESS;
        AMM2_ADDRESS = _AMM2_ADDRESS;
    }   
    
    function flashLoan(uint256 _borrowAmount) public { // getting USD ammtoken2
        FlashLoanPool(flashLoanPoolAddress).flashLoan(_borrowAmount);
    }  

    // same as FLP receive function
    function receiveTokens(address _flashToken, uint256 _borrowAmount) public payable {
    console.log('Loan Received (in wei)', token1, _borrowAmount);

     emit Loan(             // Emit event to prove tokens receive in test     
        address(_flashToken),
        _borrowAmount      // tokenGiveAmount       
        );
                
    
    // Do something with the money here - call arbitrage function    
    // Arbitrage here buy on AMM1 and sell on AMM2
    // TODO: advanced - use script to get prices to change which will call trader contract to buy and sell     
    
      // How and what vars to add when calling function here?
      // 
      arbitrage(token1, token2, _borrowAmount );

    
    // Return all tokens to the Pool
    require(Token(token1).transfer(msg.sender, _borrowAmount), "Transfer of tokens failed");

    IERC20(token1).transfer(
        owner,
        IERC20(token1).balanceOf(address(this))
    );
}

    //////////////////////////////////////////////////////////////////////////////
    // NOTES
    // FLOW: 
    // Flashloan in USD 
    // Buy Tokens on AMM1: swap Tokens USD for SOB on AMM1 >> buy SOB tokens 
    // Swap/sell Tokens on AMM2: SOB for USD on AMM2
    // calculate Withdraw amount then removeLiquidity and payback Loan
    

    function arbitrage(            
        address _flashToken,
        address _arbToken,       
        uint256 _flashAmount            
    ) public  {        // ReentrancyGuard
            
        // track balances of tokens
        uint256 arbAmount = _flashAmount;
        uint256 arbBalance = IERC20(_arbToken).balanceOf(address(this));
        
        // take flashtoken and swap on AMM1 for arbtoken
        // Swap USD for SOB tokens
        IERC20(_arbToken).approve(address(AMM1_ADDRESS), arbAmount);        
        AMM(AMM1_ADDRESS).swapToken2(arbAmount);
        
    // Test on each step can remove test after sauccess

        // require(arbAmount > 0, "Must buy at least one token");


        // // check balance of arbtoken
        // uint256 balanceBefore = IERC20.AMM2(token1).balanceOf(address(this));
        // uint256 balanceAfter = IERC20(arbToken).balanceOf(address(this)) + flashAmount;
        // require(balanceAfter >= arbAmount, "Not enough tokens to Trade");


        // // swap all arbtokens on Amm2 for flashtoken 
        // // check balance of flashtoken
        // // Swap SOB tokens for USD
        // IERC20(arbToken).approve(address(AMM2_ADDRESS), arbAmount);
        // AMM2_ADDRESS.swapToken1(arbAmount);
        // uint256 flashBalance = IERC20(flashToken).balanceOf(address(this)); 


        // // subtract of flashtoken from flashloan amount to determine profit        
        // // Calculate Withdraw Amount and then Remove Liquidity on AMM2
        // uint256 profit = flashBalance - flashAmount;
        // IERC20(arbToken).approve(address(AMM2_ADDRESS), arbAmount);
        
        // uint256 withDrawAmount = AMM2_ADDRESS.calculateWithdrawAmount(profit);
        // AMM2_ADDRESS.removeLiquidity(withDrawAmount);

        // balanceAfter = IERC20(arbToken).balanceOf(address(this));
        // require(balanceAfter >= balanceBefore, "Arbitrage was not successful");

        // // payback flashloan        
        // // send profit to dev/user       
    }    
}
