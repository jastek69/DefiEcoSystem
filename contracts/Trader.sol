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
    
    // call FLP similar to IReceiver(msg.sender).receiveTokens(address(token), borrowAmount);
    // will be Public
    function flashLoan(uint256 _borrowAmount) public {       
        FlashLoanPool(flashLoanPoolAddress).flashLoan(_borrowAmount);
    }  

    // NOTES
    // same as FLP receive function - see above
    // will be Public
    function receiveTokens(address _token1, uint256 _borrowAmount) public payable {
    console.log('Loan Received', _token1, _borrowAmount);
    
    // track balance = await token1.balanceOf(token1.address);
        
    // do something with the money   
    
    }
}
