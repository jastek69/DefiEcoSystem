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


contract Trader {
    // pass in FLP contract address save to State var - NOTE: must deploy FLP first. Be sure to pass tokens in test
   
    address flashLoanPoolAddress; // NEED FlashloanPool address   
    address public owner;
    address token1;
    address constant AMM1_ADDRESS = 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9;
    address constant AMM2_ADDRESS = 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0;
    address constant amm1Token1 = 0x5FbDB2315678afecb367f032d93F642f64180aa3; // SOB
    address constant amm2Token2 = 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512; // USD
    

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
                
    
    // Do something with the money here - call arbitrage function    
    // Arbitrage here buy on AMM1 and sell on AMM2
    // TODO: advanced - use script to get prices to change which will call trader contract to buy and sell     
    
      arbitrage(AMM1_ADDRESS, AMM2_ADDRESS, _token1, _borrowAmount );

    
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
        address flashToken,
        address arbToken,
        uint256 flashAmount            
    ) external ReentrancyGuard {
            
        // track balances of tokens
        uint256 arbAmount = flashAmount;
        uint256 arbBalance = IERC20(arbToken).balanceOf(address(this));
        
        // address[] memory path = new address[](2);
        //     path[0] = arbToken;
        //     path[1] = flashToken;                
        
        // take flashtoken and swap on AMM1 for arbtoken
        // Swap USD for SOB tokens
        IERC20(arbToken).approve(address(AMM), arbAmount);     
        AMM(AMM1_ADDRESS).swapToken2(arbAmount);
        
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
