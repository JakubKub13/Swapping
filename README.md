import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IOneInchExchange {
    function swap(IERC20 fromToken, IERC20 toToken, uint256 amount, uint256 minReturn, uint256[] calldata distribution, uint256 flags) external payable;
}

contract OneInchSwapper is Ownable {
    using SafeERC20 for IERC20;

    IOneInchExchange private constant ONE_INCH_EXCHANGE = IOneInchExchange(0x11111112542d85B3EF69AE05771c2dCCff4fAa26);

    function swapTokens(
        IERC20 fromToken,
        IERC20 toToken,
        uint256 amountIn,
        uint256 minReturn,
        uint256[] calldata distribution,
        uint256 flags
    ) external onlyOwner {
        // Approve the 1inch contract to spend `amountIn` tokens
        fromToken.safeIncreaseAllowance(address(ONE_INCH_EXCHANGE), amountIn);

        // Perform the swap on 1inch
        ONE_INCH_EXCHANGE.swap(fromToken, toToken, amountIn, minReturn, distribution, flags);

        // Transfer the swapped tokens to the contract owner
        uint256 balance = toToken.balanceOf(address(this));
        toToken.safeTransfer(owner(), balance);
    }
}