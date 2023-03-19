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
    let uniswapV3Router: Contract;

    const WETH: string = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const WBTC: string = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
    const UNISWAPV3ROUTER: string = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
    const UNISWAPV2ROUTER: string = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const WBTC_WHALE: string = "0x020d0886D0a1b55E9362f9b00095Db5775C7754d";
    const WETH_WHALE: string = "0x44Cc771fBE10DeA3836f37918cF89368589b6316";

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

        weth = await ethers.getContractAt("IERC20", WETH);
        wbtc = await ethers.getContractAt("IERC20", WBTC);
        //uniswapV3Router = await ethers.getContractAt("IUniswapV3Router", UNISWAPV3ROUTER);

        const wethWhale = await ethers.getSigner(WETH_WHALE);
        await weth.connect(wethWhale).transfer(acc1.address, ethers.utils.parseEther("1000"));

        const wbtcWhale = await ethers.getSigner(WBTC_WHALE);
        await wbtc.connect(wbtcWhale).transfer(acc1.address, ethers.utils.parseUnits("100",8));
    });

    it("Should swap WETH for WBTC uniswapV3 single hop", async() => {
        const wethAmountAcc1BeforeSwap = await weth.balanceOf(acc1.address);
        const wbtcAmountAcc1BeforeSwap = await wbtc.balanceOf(acc1.address);
        console.log("wethAmountAcc1BeforeSwap: ", ethers.utils.formatEther(wethAmountAcc1BeforeSwap));
        console.log("wbtcAmountAcc1BeforeSwap: ", ethers.utils.formatUnits(wbtcAmountAcc1BeforeSwap, 8));
        const approvalTx = await weth.connect(acc1).approve(HyroSwapContract.address, ethers.utils.parseEther("1000"));
        await approvalTx.wait();
        const wethAmountToSwap = ethers.utils.parseEther("50");
        const wethSwapTx = await HyroSwapContract.connect(acc1).hyroSwapUniswapV3(UNISWAPV3ROUTER, WETH, WBTC, wethAmountToSwap, 0);
        await wethSwapTx.wait();
        const wethAmountAcc1AfterSwap = await weth.balanceOf(acc1.address);
        const wbtcAmountAcc1AfterSwap = await wbtc.balanceOf(acc1.address);
        console.log("wethAmountAcc1AfterSwap: ", ethers.utils.formatEther(wethAmountAcc1AfterSwap));
        console.log("wbtcAmountAcc1AfterSwap: ", ethers.utils.formatUnits(wbtcAmountAcc1AfterSwap, 8));
    })

    it("Should swap WBTC for WETH uniswapV3 single hop", async() => {
        const wbtcAmountAcc1BeforeSwap = await wbtc.balanceOf(acc1.address);
        const wethAmountAcc1BeforeSwap = await weth.balanceOf(acc1.address);
        console.log("wbtcAmountAcc1BeforeSwap: ", ethers.utils.formatUnits(wbtcAmountAcc1BeforeSwap, 8));
        console.log("wethAmountAcc1BeforeSwap: ", ethers.utils.formatEther(wethAmountAcc1BeforeSwap));
        const approvalTx = await wbtc.connect(acc1).approve(HyroSwapContract.address, ethers.utils.parseUnits("100",8));
        await approvalTx.wait();
        const wbtcAmountToSwap = ethers.utils.parseUnits("3",8);
        const wbtcSwapTx = await HyroSwapContract.connect(acc1).hyroSwapUniswapV3(UNISWAPV3ROUTER, WBTC, WETH, wbtcAmountToSwap, 0);
        await wbtcSwapTx.wait();
        const wbtcAmountAcc1AfterSwap = await wbtc.balanceOf(acc1.address);
        const wethAmountAcc1AfterSwap = await weth.balanceOf(acc1.address);
        console.log("wbtcAmountAcc1AfterSwap: ", ethers.utils.formatUnits(wbtcAmountAcc1AfterSwap, 8));
        console.log("wethAmountAcc1AfterSwap: ", ethers.utils.formatEther(wethAmountAcc1AfterSwap));
    })

    it("Should swap WETH for WBTC uniswapV2 single hop", async() => {
        const wethAmountAcc1BeforeSwap = await weth.balanceOf(acc1.address);
        const wbtcAmountAcc1BeforeSwap = await wbtc.balanceOf(acc1.address);
        console.log("wethAmountAcc1BeforeSwap: ", ethers.utils.formatEther(wethAmountAcc1BeforeSwap));
        console.log("wbtcAmountAcc1BeforeSwap: ", ethers.utils.formatUnits(wbtcAmountAcc1BeforeSwap, 8));
        const approvalTx = await weth.connect(acc1).approve(HyroSwapContract.address, ethers.utils.parseEther("1000"));
        await approvalTx.wait();
        const wethAmountToSwap = ethers.utils.parseEther("50");
        const wethSwapTx = await HyroSwapContract.connect(acc1).hyroSwapUniswapV2(UNISWAPV2ROUTER ,WETH, WBTC, wethAmountToSwap, 0);
        await wethSwapTx.wait();
        const wethAmountAcc1AfterSwap = await weth.balanceOf(acc1.address);
        const wbtcAmountAcc1AfterSwap = await wbtc.balanceOf(acc1.address);
        console.log("wethAmountAcc1AfterSwap: ", ethers.utils.formatEther(wethAmountAcc1AfterSwap));
        console.log("wbtcAmountAcc1AfterSwap: ", ethers.utils.formatUnits(wbtcAmountAcc1AfterSwap, 8));
    })

    it("Should swap WBTC for WETH uniswapV2 single hop", async() => {
        const wbtcAmountAcc1BeforeSwap = await wbtc.balanceOf(acc1.address);
        const wethAmountAcc1BeforeSwap = await weth.balanceOf(acc1.address);
        console.log("wbtcAmountAcc1BeforeSwap: ", ethers.utils.formatUnits(wbtcAmountAcc1BeforeSwap, 8));
        console.log("wethAmountAcc1BeforeSwap: ", ethers.utils.formatEther(wethAmountAcc1BeforeSwap));
        const approvalTx = await wbtc.connect(acc1).approve(HyroSwapContract.address, ethers.utils.parseUnits("3",8));
        await approvalTx.wait();
        const wbtcAmountToSwap = ethers.utils.parseUnits("3",8);
        const wbtcSwapTx = await HyroSwapContract.connect(acc1).hyroSwapUniswapV2(UNISWAPV2ROUTER, WBTC, WETH, wbtcAmountToSwap, 0);
        await wbtcSwapTx.wait();
        const wbtcAmountAcc1AfterSwap = await wbtc.balanceOf(acc1.address);
        const wethAmountAcc1AfterSwap = await weth.balanceOf(acc1.address);
        console.log("wbtcAmountAcc1AfterSwap: ", ethers.utils.formatUnits(wbtcAmountAcc1AfterSwap, 8));
        console.log("wethAmountAcc1AfterSwap: ", ethers.utils.formatEther(wethAmountAcc1AfterSwap));
    })
})