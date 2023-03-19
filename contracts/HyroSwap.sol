// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract HyroSwap {
    IERC20 public WETH;
    IERC20 public WBTC;

    event Swap(
        address indexed _tokenIn,
        address indexed _tokenOut,
        uint256 _amountIn,
        uint256 _amountOut,
        address indexed _recipient
    );


    constructor(
        address _weth,
        address _wbtc
    ) {
        WETH = IERC20(_weth);
        WBTC = IERC20(_wbtc);
    }


// Single Hop Swap V3
    function hyroSwapUniswapV3(
        address _uniswapV3Router,
        address _tokenIn,
        address _tokenOut,
        uint256 _amount,
        uint256 _amountOutMin
    ) external payable returns (uint256 amountOut) {
        require(_amount > 0, "amount must be greater than 0");
        require(_tokenIn != _tokenOut, "tokenIn and tokenOut must be different");

        IERC20(_tokenIn).transferFrom(msg.sender, address(this), _amount);
        console.log(IERC20(_tokenIn).balanceOf(address(this)), "Balance of token in");
        IERC20(_tokenIn).approve(_uniswapV3Router, _amount);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: _tokenIn,
                tokenOut: _tokenOut,
                fee: 3000,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: _amount,
                amountOutMinimum: _amountOutMin,
                sqrtPriceLimitX96: 0
            });

        amountOut = ISwapRouter(_uniswapV3Router).exactInputSingle(params);
        console.log(amountOut, "Amount out from swap");

        IERC20(_tokenOut).transfer(msg.sender, amountOut);
        emit Swap(_tokenIn, _tokenOut, _amount, amountOut, msg.sender);
        return amountOut;
    }

    function hyroSwapUniswapV3MultiHop() external {}


// Single Hop Swap V2
    function hyroSwapUniswapV2(
        address _uniswapV2Router,
        address _tokenIn,
        address _tokenOut,
        uint256 _amount,
        uint256 _amountOutMin
    ) external {
        require(_amount > 0, "amount must be greater than 0");
        require(_tokenIn != _tokenOut, "tokenIn and tokenOut must be different");

        IERC20(_tokenIn).transferFrom(msg.sender, address(this), _amount);
        console.log(IERC20(_tokenIn).balanceOf(address(this)), "Balance of token in");
        IERC20(_tokenIn).approve(_uniswapV2Router, _amount);

        address[] memory path = new address[](2);
        path[0] = _tokenIn;
        path[1] = _tokenOut;

        uint256[] memory amounts = IUniswapV2Router02(_uniswapV2Router)
            .swapExactTokensForTokens(_amount, _amountOutMin, path, msg.sender, block.timestamp);

        emit Swap(_tokenIn, _tokenOut, _amount, amounts[1], msg.sender);
    }

    function hyroSwapUniswapV2MultiHop() external {}
}