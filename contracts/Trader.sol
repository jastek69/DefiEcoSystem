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
    uint256 borrowAmount;
    address public owner;
    address token1;
    
    constructor(address _token1, address _flashLoanPoolAddress, uint256 _borrowAmount) payable {
        owner = msg.sender;
        token1 = _token1;
        flashLoanPoolAddress = _flashLoanPoolAddress;
        borrowAmount = _borrowAmount;
    }     
    
    function flashLoan(uint256 _borrowAmount) public {       
        FlashLoanPool(flashLoanPoolAddress).flashLoan(_borrowAmount);
    }  

    // same as FLP receive function
    function receiveTokens(address _token1, uint256 _borrowAmount) public payable {
    console.log('Loan Received', _token1, _borrowAmount);        
    }

    // do something with the money 
    
    // Return Funds
    function returnFlashLoan(address _token1, uint256 _borrowAmount) public payable {
        console.log('Loan Paid Back', _token1, _borrowAmount);

    // IReceiver(token1).transfer(flashLoanPoolAddress, borrowAmount);

    }
}

