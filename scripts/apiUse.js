// const Web3 = require('web3');
// const fetch = require('node-fetch');
// const yesno = require('yesno');

const chainId = 1;
const web3RpcUrl = 'https://bsc-dataseed.binance.org';
const walletAddress = '0x...xxx'; // Set your wallet address
const privateKey = '0x...xxx'; // Set private key of your wallet. Be careful! Don't share this key to anyone!

const swapParams = {
    fromTokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // USDC
    toTokenAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
    amount: '100000000000000000',
    fromAddress: '0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326',
    slippage: 1,
    disableEstimate: false,
    allowPartialFill: false,
};

const broadcastApiUrl = 'https://tx-gateway.1inch.io/v1.1/' + chainId + '/broadcast';
const apiBaseUrl = 'https://api.1inch.io/v5.0/' + chainId ;
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
    return fetch(apiRequestUrl('/swap', {fromTokenAddress, toTokenAddress, amount, fromAddress, slippage}))
        .then(res => res.json()).then(res => res.tx);
}

function getSwapDataWithParams(_swapParams) {
    return fetch(apiRequestUrl('/swap', _swapParams))
        .then(res => res.json()).then(res => res.tx);
}


async function main() {

    // const allowance = await checkAllowance(swapParams.fromTokenAddress, walletAddress);
    const swapData = await getSwapData("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", "0x111111111117dc0aa78b770fa6a738034120c302", "100000000", "0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326", "1")
    const tx = await getSwapDataWithParams(swapParams)
    console.log(`swap data: `)
    console.log(swapData)
    console.log(`tx:`)
    console.log(tx)
}

main();

// console.log('Allowance: ', allowance);