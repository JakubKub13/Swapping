import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract, utils } from "ethers";
import { ethers, network } from "hardhat";
import { HyroSwap } from "../typechain-types";

describe("HyroSwap", () => {
    let HyroSwapContract: HyroSwap;
    let deployer: SignerWithAddress;
    let acc1: SignerWithAddress;
    let acc2: SignerWithAddress;
    let weth: Contract;
    let wbtc: Contract;
    let dai: Contract;
    let usdc: Contract;
    let crv: Contract;
    let uniswapV3Router: Contract;

    const WETH: string = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const WBTC: string = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
    const DAI: string = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const USDC: string = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const CRV: string = "0xD533a949740bb3306d119CC777fa900bA034cd52";
    const UNISWAPV3ROUTER: string = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
    const UNISWAPV2ROUTER: string = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const WBTC_WHALE: string = "0x38720D56899d46cAD253d08f7cD6CC89d2c83190";
    const WETH_WHALE: string = "0x44Cc771fBE10DeA3836f37918cF89368589b6316";
    const DAI_WHALE: string = "0xD831B3353Be1449d7131e92c8948539b1F18b86A";

    beforeEach(async () => {
        [deployer, acc1, acc2] = await ethers.getSigners();
        const hyroSwapFactory = await ethers.getContractFactory("HyroSwap");
        HyroSwapContract = await hyroSwapFactory.deploy(WETH, WBTC) as HyroSwap;
        await HyroSwapContract.deployed();
        console.log("HyroSwap deployed to:", HyroSwapContract.address);

        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [WETH_WHALE]
        });

        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [WBTC_WHALE]
        });

        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [DAI_WHALE]
        })

        weth = await ethers.getContractAt("IERC20", WETH);
        wbtc = await ethers.getContractAt("IERC20", WBTC);
        dai = await ethers.getContractAt("IERC20", DAI);
        usdc = await ethers.getContractAt("IERC20", USDC);
        crv = await ethers.getContractAt("IERC20", CRV);

        //uniswapV3Router = await ethers.getContractAt("IUniswapV3Router", UNISWAPV3ROUTER);

        const wethWhale = await ethers.getSigner(WETH_WHALE);
        await weth.connect(wethWhale).transfer(acc1.address, ethers.utils.parseEther("1000"));

        const wbtcWhale = await ethers.getSigner(WBTC_WHALE);
        await wbtc.connect(wbtcWhale).transfer(acc1.address, ethers.utils.parseUnits("100",8));

        const daiWhale = await ethers.getSigner(DAI_WHALE);
        await dai.connect(daiWhale).transfer(acc1.address, ethers.utils.parseUnits("10000",18));
    });

// UNISWAP V3 SWAP TESTS----------------------------------------------------------------------------------------------------------------------------

    it("Should swap WETH for WBTC uniswapV3 single hop exact input", async() => {
        const wethAmountAcc1BeforeSwap = await weth.balanceOf(acc1.address);
        const wbtcAmountAcc1BeforeSwap = await wbtc.balanceOf(acc1.address);
        console.log("wethAmountAcc1BeforeSwap: ", ethers.utils.formatEther(wethAmountAcc1BeforeSwap));
        console.log("wbtcAmountAcc1BeforeSwap: ", ethers.utils.formatUnits(wbtcAmountAcc1BeforeSwap, 8));
        const approvalTx = await weth.connect(acc1).approve(HyroSwapContract.address, ethers.utils.parseEther("1000"));
        await approvalTx.wait();
        const wethAmountToSwap = ethers.utils.parseEther("50");
        const wethSwapTx = await HyroSwapContract.connect(acc1).hyroSwapUniswapV3SingleHopExactAmountIn(UNISWAPV3ROUTER, WETH, WBTC, wethAmountToSwap, 0);
        await wethSwapTx.wait();
        const wethAmountAcc1AfterSwap = await weth.balanceOf(acc1.address);
        const wbtcAmountAcc1AfterSwap = await wbtc.balanceOf(acc1.address);
        console.log("wethAmountAcc1AfterSwap: ", ethers.utils.formatEther(wethAmountAcc1AfterSwap));
        console.log("wbtcAmountAcc1AfterSwap: ", ethers.utils.formatUnits(wbtcAmountAcc1AfterSwap, 8));
    })

    it("Should swap WBTC for WETH uniswapV3 single hop exact input", async() => {
        const wbtcAmountAcc1BeforeSwap = await wbtc.balanceOf(acc1.address);
        const wethAmountAcc1BeforeSwap = await weth.balanceOf(acc1.address);
        console.log("wbtcAmountAcc1BeforeSwap: ", ethers.utils.formatUnits(wbtcAmountAcc1BeforeSwap, 8));
        console.log("wethAmountAcc1BeforeSwap: ", ethers.utils.formatEther(wethAmountAcc1BeforeSwap));
        const approvalTx = await wbtc.connect(acc1).approve(HyroSwapContract.address, ethers.utils.parseUnits("100",8));
        await approvalTx.wait();
        const wbtcAmountToSwap = ethers.utils.parseUnits("3",8);
        const wbtcSwapTx = await HyroSwapContract.connect(acc1).hyroSwapUniswapV3SingleHopExactAmountIn(UNISWAPV3ROUTER, WBTC, WETH, wbtcAmountToSwap, 0);
        await wbtcSwapTx.wait();
        const wbtcAmountAcc1AfterSwap = await wbtc.balanceOf(acc1.address);
        const wethAmountAcc1AfterSwap = await weth.balanceOf(acc1.address);
        console.log("wbtcAmountAcc1AfterSwap: ", ethers.utils.formatUnits(wbtcAmountAcc1AfterSwap, 8));
        console.log("wethAmountAcc1AfterSwap: ", ethers.utils.formatEther(wethAmountAcc1AfterSwap));
    })

    it("Should swap WETH to USDC to DAI uniswapV3 multi hop exact input", async () => {
        const wethAmountAcc1BeforeSwap = await weth.balanceOf(acc1.address);
        const daiAmountAcc1BeforeSwap = await dai.balanceOf(acc1.address);
        console.log("wethAmountAcc1BeforeSwap: ", ethers.utils.formatEther(wethAmountAcc1BeforeSwap));
        console.log("daiAmountAcc1BeforeSwap: ", ethers.utils.formatEther(daiAmountAcc1BeforeSwap));
        const approvalTx = await weth.connect(acc1).approve(HyroSwapContract.address, ethers.utils.parseEther("1000"));
        await approvalTx.wait();
        const wethAmountToSwap = ethers.utils.parseEther("50");
        const wethSwapTx = await HyroSwapContract.connect(acc1).hyroSwapUniswapV3MultiHopExactInput(UNISWAPV3ROUTER, WETH, USDC, DAI, wethAmountToSwap, 0);
        await wethSwapTx.wait();
        const wethAmountAcc1AfterSwap = await weth.balanceOf(acc1.address);
        const daiAmountAcc1AfterSwap = await dai.balanceOf(acc1.address);
        console.log("wethAmountAcc1AfterSwap: ", ethers.utils.formatEther(wethAmountAcc1AfterSwap));
        console.log("daiAmountAcc1AfterSwap: ", ethers.utils.formatUnits(daiAmountAcc1AfterSwap, 18));
    })

    it("Should swap DAI to USDC to WETH uniswapV3 multi hop exact output", async () => {   /// Debugging this test
        const daiAmountAcc1BeforeSwap = await dai.balanceOf(acc1.address);
        const wethAmountAcc1BeforeSwap = await weth.balanceOf(acc1.address);
        console.log("daiAmountAcc1BeforeSwap: ", ethers.utils.formatUnits(daiAmountAcc1BeforeSwap, 18));
        console.log("wethAmountAcc1BeforeSwap: ", ethers.utils.formatEther(wethAmountAcc1BeforeSwap));
        const approvalTx = await dai.connect(acc1).approve(HyroSwapContract.address, ethers.utils.parseUnits("5000",18));
        await approvalTx.wait();
        const wethAmountDesired = ethers.utils.parseEther("1");
        const daiAmountToSwap = ethers.utils.parseUnits("2000",18);
        const daiSwapTx = await HyroSwapContract.connect(acc1).hyroSwapUniswapV3MultiHopExactOutput(UNISWAPV3ROUTER, DAI, USDC, WETH, wethAmountDesired, daiAmountToSwap);
        await daiSwapTx.wait();
        // const daiAmountAcc1AfterSwap = await dai.balanceOf(acc1.address);
        // const wethAmountAcc1AfterSwap = await weth.balanceOf(acc1.address);
        // console.log("daiAmountAcc1AfterSwap: ", ethers.utils.formatUnits(daiAmountAcc1AfterSwap, 18));
        // console.log("wethAmountAcc1AfterSwap: ", ethers.utils.formatEther(wethAmountAcc1AfterSwap));
    });

// UNISWAP V2 SWAP TESTS----------------------------------------------------------------------------------------------------------------------------
    it("Should swap WETH for WBTC uniswapV2 single hop exact input", async() => {
        const wethAmountAcc1BeforeSwap = await weth.balanceOf(acc1.address);
        const wbtcAmountAcc1BeforeSwap = await wbtc.balanceOf(acc1.address);
        console.log("wethAmountAcc1BeforeSwap: ", ethers.utils.formatEther(wethAmountAcc1BeforeSwap));
        console.log("wbtcAmountAcc1BeforeSwap: ", ethers.utils.formatUnits(wbtcAmountAcc1BeforeSwap, 8));
        const approvalTx = await weth.connect(acc1).approve(HyroSwapContract.address, ethers.utils.parseEther("1000"));
        await approvalTx.wait();
        const wethAmountToSwap = ethers.utils.parseEther("50");
        const wethSwapTx = await HyroSwapContract.connect(acc1).hyroSwapUniswapV2SingleHopExactAmountIn(UNISWAPV2ROUTER ,WETH, WBTC, wethAmountToSwap, 0);
        await wethSwapTx.wait();
        const wethAmountAcc1AfterSwap = await weth.balanceOf(acc1.address);
        const wbtcAmountAcc1AfterSwap = await wbtc.balanceOf(acc1.address);
        console.log("wethAmountAcc1AfterSwap: ", ethers.utils.formatEther(wethAmountAcc1AfterSwap));
        console.log("wbtcAmountAcc1AfterSwap: ", ethers.utils.formatUnits(wbtcAmountAcc1AfterSwap, 8));
    })

    it("Should swap WBTC for WETH uniswapV2 single hop exact input", async() => {
        const wbtcAmountAcc1BeforeSwap = await wbtc.balanceOf(acc1.address);
        const wethAmountAcc1BeforeSwap = await weth.balanceOf(acc1.address);
        console.log("wbtcAmountAcc1BeforeSwap: ", ethers.utils.formatUnits(wbtcAmountAcc1BeforeSwap, 8));
        console.log("wethAmountAcc1BeforeSwap: ", ethers.utils.formatEther(wethAmountAcc1BeforeSwap));
        const approvalTx = await wbtc.connect(acc1).approve(HyroSwapContract.address, ethers.utils.parseUnits("3",8));
        await approvalTx.wait();
        const wbtcAmountToSwap = ethers.utils.parseUnits("3",8);
        const wbtcSwapTx = await HyroSwapContract.connect(acc1).hyroSwapUniswapV2SingleHopExactAmountIn(UNISWAPV2ROUTER, WBTC, WETH, wbtcAmountToSwap, 0);
        await wbtcSwapTx.wait();
        const wbtcAmountAcc1AfterSwap = await wbtc.balanceOf(acc1.address);
        const wethAmountAcc1AfterSwap = await weth.balanceOf(acc1.address);
        console.log("wbtcAmountAcc1AfterSwap: ", ethers.utils.formatUnits(wbtcAmountAcc1AfterSwap, 8));
        console.log("wethAmountAcc1AfterSwap: ", ethers.utils.formatEther(wethAmountAcc1AfterSwap));
    })

    it("Should swap DAI to WETH to CRV uniswapV2 multi hop exact input", async () => {
        const daiAmountAcc1BeforeSwap = await dai.balanceOf(acc1.address);
        const crvAmountAcc1BeforeSwap = await crv.balanceOf(acc1.address);
        console.log("daiAmountAcc1BeforeSwap: ", ethers.utils.formatUnits(daiAmountAcc1BeforeSwap, 18));
        console.log("crvAmountAcc1BeforeSwap: ", ethers.utils.formatUnits(crvAmountAcc1BeforeSwap, 18));
        const approvalTx = await dai.connect(acc1).approve(HyroSwapContract.address, ethers.utils.parseUnits("5000",18));
        await approvalTx.wait();
        const daiAmountToSwap = ethers.utils.parseUnits("5000",18);
        const daiSwapTx = await HyroSwapContract.connect(acc1).hyroSwapUniswapV2MultiHopExactAmountIn(UNISWAPV2ROUTER, DAI, WETH, CRV, daiAmountToSwap, 0);
        await daiSwapTx.wait();
        const daiAmountAcc1AfterSwap = await dai.balanceOf(acc1.address);
        const crvAmountAcc1AfterSwap = await crv.balanceOf(acc1.address);
        console.log("daiAmountAcc1AfterSwap: ", ethers.utils.formatUnits(daiAmountAcc1AfterSwap, 18));
        console.log("crvAmountAcc1AfterSwap: ", ethers.utils.formatUnits(crvAmountAcc1AfterSwap, 18));
    })

    it("Should swap CRV to WETH to DAI uniswapV2 multi hop exact output", async () => {
        const daiAmountAcc1BeforeSwap = await dai.balanceOf(acc1.address);
        const crvAmountAcc1BeforeSwap = await crv.balanceOf(acc1.address);
        console.log("daiAmountAcc1BeforeSwap: ", ethers.utils.formatUnits(daiAmountAcc1BeforeSwap, 18));
        console.log("crvAmountAcc1BeforeSwap: ", ethers.utils.formatUnits(crvAmountAcc1BeforeSwap, 18));
        const approvalTx = await dai.connect(acc1).approve(HyroSwapContract.address, ethers.utils.parseUnits("5000",18));
        await approvalTx.wait();
        const daiAmountToSwap = ethers.utils.parseUnits("5000",18);
        const daiSwapTx = await HyroSwapContract.connect(acc1).hyroSwapUniswapV2MultiHopExactAmountIn(UNISWAPV2ROUTER, DAI, WETH, CRV, daiAmountToSwap, 0);
        await daiSwapTx.wait();
        const daiAmountAcc1AfterSwap = await dai.balanceOf(acc1.address);
        const crvAmountAcc1AfterSwap = await crv.balanceOf(acc1.address);
        console.log("daiAmountAcc1AfterSwap: ", ethers.utils.formatUnits(daiAmountAcc1AfterSwap, 18));
        console.log("crvAmountAcc1AfterSwap: ", ethers.utils.formatUnits(crvAmountAcc1AfterSwap, 18));

        // Second part of the test
        const approvalTx2 = await crv.connect(acc1).approve(HyroSwapContract.address, ethers.utils.parseUnits("4000",18));
        await approvalTx2.wait();
        const crvAmountToSwap = ethers.utils.parseUnits("4000",18);
        const daiAmountDesired = ethers.utils.parseUnits("4000",18);
        const crvSwapTx = await HyroSwapContract.connect(acc1).hyroSwapUniswapV2MultiHopExactAmountOut(UNISWAPV2ROUTER, CRV, WETH, DAI, crvAmountToSwap, daiAmountDesired);
        await crvSwapTx.wait();
        const crvAmountAcc1AfterSwap2 = await crv.balanceOf(acc1.address);
        const daiAmountAcc1AfterSwap2 = await dai.balanceOf(acc1.address);
        console.log("crvAmountAcc1AfterSwap2: ", ethers.utils.formatUnits(crvAmountAcc1AfterSwap2, 18));
        console.log("daiAmountAcc1AfterSwap2: ", ethers.utils.formatUnits(daiAmountAcc1AfterSwap2, 18));
    })

})