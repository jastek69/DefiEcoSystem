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
        address _flashToken, // USD
        address _arbToken,   // Sobek Token    
        uint256 _flashAmount            
    ) public  {        // ReentrancyGuard
            
        // track balances of tokens
        uint256 arbAmount = _flashAmount;            
        
        // take flashtoken and swap on AMM1 for arbtoken in USD
        IERC20(_flashToken).approve((AMM1_ADDRESS), arbAmount);   
        AMM(AMM1_ADDRESS).swapToken1(arbAmount);   // Swap USD for SOB tokens on AMM1

        // swap SOB for USD on AMM2
        uint256 token2Balance = IERC20(token2).balanceOf(address(this));
        IERC20(token2).approve(AMM2_ADDRESS, token2Balance);
        AMM(AMM2_ADDRESS).swapToken2(token2Balance);
    }    
}
