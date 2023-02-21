// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;

interface Structs {
    struct Val {
        uint256 value;
    }

    enum ActionType {
        Deposit, // Supply tokens
        Withdraw, // Borrow tokens
        Transfer,
        Buy,
        Sell,
        Trade,
        Liquidate, // Liquidate an undercallateralized or expiring account
        Vaporize, // use access tokens to zero-out a completely negative account
        Call // send aritrary data to an address
    }

    enum AssetDenomination {
        Wei // the amount is denominated in wei
    }

    enum AssetReference {
        Delta // the amount is given as a delte from the current value
    }

    struct AssetAmount {
        bool sign; // true of positive
        AssetDenomination denomination;
        AssetReference ref;
        uint256 value;
    }
    
    struct ActionArgs {
        ActionType actionType;
        uint256 accountId;
        AssetAmount amount;
        uint256 primaryMarketId;
        uint256 secondaryMarketId;
        address otherAddress;
        uint256 otherAccountId;
        bytes data;
    }

    struct Info {
        address owner; // The address that owns the account
        uint256 number; // a nonce that allows a single address to control many accounts
    }

    struct Wei {
        bool sign; // true if positive
        uint256 value;
    }
}

contract SobekAmmPool is Structs {
    function getAccountWei(Info memory account, uint256 marketId)
        public
        view
        returns (Wei memory);
    
    function operate(Info[] memory, ActionArgs[] memory) public;
}

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);
}

contract SobekFlashLoan is Structs {
    SobekAmmPool pool = SobekAmmPool(0x5FbDB2315678afecb367f032d93F642f64180aa3);

    address public WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    mapping(address => uint256) public currencies;

    constructor() public {
        currencies[WETH] = 1;
    }

    modifier onlyPool() {
        require(
            msg.sender == address(pool),
            "SobekFlashLoan: could be called by SobekAmmPool only"
        );
        _;
    }

    function tokenToMarketId(address token) public view returns (uint256) {
        uint256 marketID = currencies[token];
        require(marketID != 0, "Flashloan: Unsupported token");
        return marketID - 1;
    }

    // the Sobek will call `callFunction(address sender, Info memory accountInfo, bytes memory data) public` after during `operate` call
    function flashLoan(
        address token,
        uint256 amount,
        bytes memory data
    ) internal {
        IERC20(token).approve(address(pool), amount + 1);
        Info[] memory infos = new Info[](1);
        ActionArgs[] memory args = new ActionArgs[](3);

        infos[0] = Info(address(this), 0);

        AssetAmount memory wamt = AssetAmount(
            false,
            AssetDenomination.Wei,
            AssetReference.Delta,
            amount
        );
        ActionArgs memory withdraw;
        withdraw.actionType = ActionType.Withdraw;
        withdraw.accountId = 0;
        withdraw.amount = wamt;
        withdraw.primaryMarketId = tokenToMarketId(token);
        withdraw.otherAddress = address(this);

        args[0] = withdraw;

        ActionArgs memory call;
        call.actionType = ActionType.Call;
        call.accountId = 0;
        call.otherAddress = address(this);
        call.data = data;

        args[1] = call;

        ActionArgs memory deposit;
        AssetAmount memory damt = AssetAmount(
            true,
            AssetDenomination.Wei,
            AssetReference.Delta,
            amount + 1
        );
        deposit.actionType = ActionType.Deposit;
        deposit.accountId = 0;
        deposit.amount = damt;
        deposit.primaryMarketId = tokenToMarketId(token);
        deposit.otherAddress = address(this);

        args[2] = deposit;

        pool.operate(infos, args);
    }
}

contract Flashloan is SobekFlashLoan {
    uint256 public loan;

    constructor() public payable {
        (bool success, ) = WETH.call.value(msg.value)("");
        require(success, "fail to get weth");
    }

    // Request Flashloan
    function getFlashLoan(address flashToken, uint256 flashAmount) external {
        uint256 balanceBefore = IERC20(flashToken).balanceOf(address(this));
        bytes memory data = abi.encode(flashToken, flashAmount, balanceBefore);
        flashLoan(flashToken, flashAmount, data); // execution goes to 'callFunction'
    }

    // Flashloan payback
    function callFunction(
        address, /* sender */
        Info calldata, /* accountInfo */
        bytes calldata data
    ) external onlyPool {
        (address flashToken, uint256 flashAmount, uint256 balanceBefore) = abi.decode(data, (address, uint256, uint256)); // decode date from Request
    uint256 balanceAfter= IERC20(flashToken).balanceOf(address(this));  // verify balance
    require(
        balanceAfter - balanceBefore == flashAmount, "contract did not get loan"
    );
    loan = balanceAfter;
          
    }
}
