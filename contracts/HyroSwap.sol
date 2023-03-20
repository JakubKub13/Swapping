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
    function hyroSwapUniswapV3SingleHopExactAmountIn(
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

    function hyroSwapUniswapV3SingleHopExactAmountOut(
        address _uniswapV3Router,
        address _tokenIn,
        address _tokenOut,
        uint256 _amountOutDesired,
        uint256 _amountInMax
    ) external {
        require(_amountOutDesired > 0, "amount must be greater than 0");
        require(_tokenIn != _tokenOut, "tokenIn and tokenOut must be different");

        IERC20(_tokenIn).transferFrom(msg.sender, address(this), _amountInMax);
        IERC20(_tokenIn).approve(_uniswapV3Router, _amountInMax);

        ISwapRouter.ExactOutputSingleParams memory params = ISwapRouter
            .ExactOutputSingleParams({
                tokenIn: _tokenIn,
                tokenOut: _tokenOut,
                fee: 3000,
                recipient: msg.sender,
                deadline: block.timestamp,
                amountOut: _amountOutDesired,
                amountInMaximum: _amountInMax,
                sqrtPriceLimitX96: 0
            });
        uint256 amountIn = ISwapRouter(_uniswapV3Router).exactOutputSingle(params);

        if(amountIn < _amountInMax) {
            IERC20(_tokenIn).approve(_uniswapV3Router, 0);
            IERC20(_tokenIn).transfer(msg.sender, _amountInMax - amountIn);
        }
    }

// WETH -> USDC -> DAI
    function hyroSwapUniswapV3MultiHopExactInput(
        address _uniswapV3Router,
        address _tokenIn,
        address _pathToken,
        address _tokenOut,
        uint256 _amountIn,
        uint256 _amountOutMin
    ) external {
        require(_amountIn > 0, "amount must be greater than 0");
        require(_tokenIn != _tokenOut, "tokenIn and tokenOut must be different");

        IERC20(_tokenIn).transferFrom(msg.sender, address(this), _amountIn);
        IERC20(_tokenIn).approve(_uniswapV3Router, _amountIn);

        bytes memory path = abi.encodePacked(
            _tokenIn,
            uint24(3000),
            _pathToken,
            uint24(100),
            _tokenOut
        );

        ISwapRouter.ExactInputParams memory params = ISwapRouter
            .ExactInputParams({
                path: path,
                recipient: msg.sender,
                deadline: block.timestamp,
                amountIn: _amountIn,
                amountOutMinimum: _amountOutMin
            });

        ISwapRouter(_uniswapV3Router).exactInput(params);
    }

// DAI -> USDC -> WETH
    function hyroSwapUniswapV3MultiHopExactOutput(
        address _uniswapV3Router,
        address _tokenIn,
        address _pathToken,
        address _tokenOut,
        uint256 _amountOutDesired,
        uint256 _amountInMax
    ) external {
        require(_amountOutDesired > 0, "amount must be greater than 0");
        require(_tokenIn != _tokenOut, "tokenIn and tokenOut must be different");

        IERC20(_tokenIn).transferFrom(msg.sender, address(this), _amountInMax);
        IERC20(_tokenIn).approve(_uniswapV3Router, _amountInMax);

        bytes memory path = abi.encodePacked(
            _tokenIn,
            uint24(100),
            _pathToken,
            uint24(3000),
            _tokenOut
        );

        ISwapRouter.ExactOutputParams memory params = ISwapRouter
            .ExactOutputParams({
                path: path,
                recipient: msg.sender,
                deadline: block.timestamp,
                amountOut: _amountOutDesired,
                amountInMaximum: _amountInMax
            });

        uint256 amountIn = ISwapRouter(_uniswapV3Router).exactOutput(params);

        if(amountIn < _amountInMax) {
            IERC20(_tokenIn).approve(_uniswapV3Router, 0);
            IERC20(_tokenIn).transfer(msg.sender, _amountInMax - amountIn);
        }
    }


// UNISWAP V2 -----------------------------------------------------------------------------------------------------------------------------

    function hyroSwapUniswapV2SingleHopExactAmountIn(
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

        IUniswapV2Router02(_uniswapV2Router)
            .swapExactTokensForTokens(_amount, _amountOutMin, path, msg.sender, block.timestamp);
    }

    function hyroSwapUniswapV2SingleHopExactAmountOut(
        address _uniswapV2Router,
        address _tokenIn,
        address _tokenOut,
        uint256 _amountOutDesired,
        uint256 _amountInMax
    ) external {
        require(_amountOutDesired > 0, "amount must be greater than 0");
        require(_tokenIn != _tokenOut, "tokenIn and tokenOut must be different");

        IERC20(_tokenIn).transferFrom(msg.sender, address(this), _amountInMax);
        console.log(IERC20(_tokenIn).balanceOf(address(this)), "Balance of token in");
        IERC20(_tokenIn).approve(_uniswapV2Router, _amountInMax);

        address[] memory path = new address[](2);
        path[0] = _tokenIn;
        path[1] = _tokenOut;

        uint256[] memory amounts = IUniswapV2Router02(_uniswapV2Router)
            .swapTokensForExactTokens(_amountOutDesired, _amountInMax, path, msg.sender, block.timestamp);

        if(amounts[0] < _amountInMax) {
            IERC20(_tokenIn).transfer(msg.sender, _amountInMax - amounts[0]);
        }
    }

// Swap DAI to WETh to CRV
    function hyroSwapUniswapV2MultiHopExactAmountIn(
        address _uniswapV2Router,
        address _tokenIn,
        address _pathToken, 
        address _tokenOut, 
        uint256 _amountIn,
        uint256 _amountOutMin
    ) external {
        require(_amountIn > 0, "amount must be greater than 0");
        require(_tokenIn != _pathToken && _tokenIn != address(0), "tokenIn and tokenOut must be different");
        require(_pathToken != _tokenOut && _pathToken != address(0), "tokenIn and tokenOut must be different");
        require(_tokenOut != address(0), "tokenOut must be different");

        IERC20(_tokenIn).transferFrom(msg.sender, address(this), _amountIn);
        IERC20(_tokenIn).approve(_uniswapV2Router, _amountIn);
        address[] memory path = new address[](3);
        path[0] = _tokenIn;
        path[1] = _pathToken;
        path[2] = _tokenOut;

        IUniswapV2Router02(_uniswapV2Router)
            .swapExactTokensForTokens(_amountIn, _amountOutMin, path, msg.sender, block.timestamp);
    }

    function hyroSwapUniswapV2MultiHopExactAmountOut(
        address _uniswapV2Router,
        address _tokenIn,
        address _pathToken,
        address _tokenOut,
        uint256 _amountOutDesired,
        uint256 _amountInMax
    ) external {
        require(_amountOutDesired > 0, "amount must be greater than 0");
        require(_tokenIn != _pathToken && _tokenIn != address(0), "tokenIn and tokenOut must be different");
        require(_pathToken != _tokenOut && _pathToken != address(0), "tokenIn and tokenOut must be different");
        require(_tokenOut != address(0), "tokenOut must be different");

        IERC20(_tokenIn).transferFrom(msg.sender, address(this), _amountInMax);
        IERC20(_tokenIn).approve(_uniswapV2Router, _amountInMax);
        address[] memory path = new address[](3);
        path[0] = _tokenIn;
        path[1] = _pathToken;
        path[2] = _tokenOut;

        uint256[] memory amounts = IUniswapV2Router02(_uniswapV2Router)
            .swapTokensForExactTokens(_amountOutDesired, _amountInMax, path, msg.sender, block.timestamp);

        if(amounts[0] < _amountInMax) {
            IERC20(_tokenIn).transfer(msg.sender, _amountInMax - amounts[0]);
        }
    }
}