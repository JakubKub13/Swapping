// const Web3 = require('web3');
// const fetch = require('node-fetch');
// const yesno = require('yesno');

const chainId = 56;
const web3RpcUrl = 'https://bsc-dataseed.binance.org';
const walletAddress = '0x...xxx'; // Set your wallet address
const privateKey = '0x...xxx'; // Set private key of your wallet. Be careful! Don't share this key to anyone!

const swapParams = {
    fromTokenAddress: '0x111111111117dc0aa78b770fa6a738034120c302', // 1INCH
    toTokenAddress: '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3', // DAI
    amount: '100000000000000000',
    fromAddress: walletAddress,
    slippage: 1,
    disableEstimate: false,
    allowPartialFill: false,
};

const broadcastApiUrl = 'https://tx-gateway.1inch.io/v1.1/' + chainId + '/broadcast';
const apiBaseUrl = 'https://api.1inch.io/v5.0/' + chainId +'/';
// const web3 = new Web3(web3RpcUrl);

function apiRequestUrl(methodName, queryParams) {
    console.log(apiBaseUrl + methodName + '?' + (new URLSearchParams(queryParams)).toString())
    return apiBaseUrl + methodName + '?' + (new URLSearchParams(queryParams)).toString();
}

function checkAllowance(tokenAddress, walletAddress) {
    return fetch(apiRequestUrl('/approve/allowance', {tokenAddress, walletAddress}))
        .then(res => res.json())
        .then(res => res.allowance);
}

function getSwapData(fromTokenAddress, toTokenAddress, amount, fromAddress, slippage) {
    return fetch(apiRequestUrl('swap', {fromTokenAddress, toTokenAddress, amount, fromAddress, slippage}))
        .then(res => res.json())
}


async function main() {

    // const allowance = await checkAllowance(swapParams.fromTokenAddress, walletAddress);
    const swapData = getSwapData("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", "0x111111111117dc0aa78b770fa6a738034120c302", "1", "0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326", "1")
    await swapData
    console.log(swapData)
}

main();

// console.log('Allowance: ', allowance);