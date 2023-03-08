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

    // EVENTS
   
    event Loan(            
        address tokenGive,    
        uint256 tokenGiveAmount      
     );
    
    constructor(address _token1, address _flashLoanPoolAddress) payable {
        owner = msg.sender;
        token1 = _token1;
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

        
    // Return all tokens to the Pool - 
        require(Token(token1).transfer(msg.sender, _borrowAmount), "Transfer of tokens failed");


    // do something with the money   

    }
}
