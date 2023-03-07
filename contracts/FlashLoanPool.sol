// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// Contract inspired by Damn Vulnerable DeFi
// Original Contract:
// https://github.com/OpenZeppelin/damn-vulnerable-defi/blob/master/contracts/unstoppable/UnstoppableLender.sol

import "hardhat/console.sol";
import "./Token.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IReceiver { // interface for receiveTokens function in Trader.sol
    function receiveTokens(
        address tokenAddress,
        uint256 amount) external;

    
    function flashLoan(
        uint256 borrowAmount) external;
}


contract FlashLoanPool is ReentrancyGuard {
    using SafeMath for uint256;

    Token public token;
    uint256 public poolBalance;

    constructor(address tokenAddress) {
        require(tokenAddress != address(0), "Token address cannot be zero");
        token = Token(tokenAddress);
    }

    function depositTokens(uint256 amount) external nonReentrant {
        require(amount > 0, "Must deposit at least one token");
        // Transfer token from sender. Sender must have first approved them.
        token.transferFrom(msg.sender, address(this), amount);
        poolBalance = poolBalance.add(amount);
    }

    function flashLoan(
        uint256 borrowAmount
    ) external nonReentrant {
        require(borrowAmount > 0, "Must borrow at least one token");
        uint256 balanceBefore = token.balanceOf(address(this));
        require(balanceBefore >= borrowAmount, "Not enough tokens in pool");

        // Ensured by the protocol via the `depositTokens` function
        assert(poolBalance == balanceBefore);

        token.transfer(msg.sender, borrowAmount);

        IReceiver(msg.sender).receiveTokens(address(token), borrowAmount);
    }

        // Payback FlashLoan
    function returnFlashLoan(uint256 borrowAmount) external nonReentrant {
        uint256 balanceBefore = token.balanceOf(address(this));

        // Transfer token 
        token.transferFrom(msg.sender, address(this), borrowAmount);
        poolBalance = poolBalance.add(borrowAmount);
    
    
     uint256 balanceAfter = token.balanceOf(address(this));
     require(balanceAfter >= balanceBefore, "Flash loan hasn't been paid back");
    }
}




    //////////////////////////////////////////////////////////////////////////////////
    // function flashLoanCallBack(
    //     address sender,
    //     uint256,
    //     uint256,
    //     bytes calldata data
    // ) internal {
    //     (address FlashLoanPool, address token, uint256 borrowAmount) = abi.decode(data, address, address, uint256));

    //     require(
    //         sender == address(this) && msg.sender == FlashLoanPool,"
    //         "HANDLE_FLASH_DENIED"
    //     );
    // }
    ///////////////////////////////////////////////////////////////////////////////////////

