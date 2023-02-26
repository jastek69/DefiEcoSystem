// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";
import "./FlashLoanPool.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract Trader {
    // pass in FLP contract address save to State var - NOTE: must deploy FLP first
    // NOTE: be sure to pass tokens in test
    address constant flashLoanPool = 0x0; // NEED FlashloanPool address
    uint256 borrowAmount;
    

    address public owner;
    
    constructor(address token1, address _flashLoanPool) payable {
        owner = msg.sender;
    }     
    
    // call FLP similar to IReceiver(msg.sender).receiveTokens(address(token), borrowAmount);
    // will be Public
    function flashloan(address _token1, uint256 _borrowAmount) public {       
        flashLoanPool(msg.sender).receiveTokens(address(_token1), _borrowAmount);    
    }

    
    // **************************************
    // PSUEDO code
    // interface IERC20 {
    //     function transferFrom(
    //         address _token1,
    //         address _to,
    //         uint256 __borrowAmount
    //     ) external
    //     returns (bool success);
    //     }  
    // ************************************** 
    



    // same as FLP receive function - see above
    // will be Public
    function depositLoan(address token1, uint256 _borrowAmount) public payable {
        flashLoanPool.receiveTokens(address(token1), _borrowAmount);   
    
    // do something with the money

    }
}

