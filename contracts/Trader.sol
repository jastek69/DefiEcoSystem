import "hardhat/console.sol";
import "./Token.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IReceiver {
    function receiveTokens(address tokenAddress, uint256 amount) external;
}


contract Trader {
    address public owner;


function FlashLoanPool(
    address token1,
    uint256 borrowAmount 
) external {
    uint256 balanceBefore = IERC20(token1).balanceOf(address(this));

    bytes memory data = abi.encode(
        token1,
        borrowAmount,
        balanceBefore
    );
}

}
