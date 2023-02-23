import "hardhat/console.sol";
import "./Token.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IReceiver {
    function receiveTokens(address tokenAddress, uint256 amount) external;
}

contract Trader {
    address private owner;

    constructor() {
        owner = msg.sender;
    }

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

    require(msg.sender == owner, 'Must be used by owner');

    IERC20(token1).transfer(
        owner,
        IERC20(token1).balanceOf(address(this)) - borrowAmount
        );

        // Return funds
        IERC20(token1).transfer(FlashLoanPool, borrowAmount);
    }
}
