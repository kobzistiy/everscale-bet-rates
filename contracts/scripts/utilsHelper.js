import { WalletTypes, Address, toNano, fromNano, getRandomNonce, convertAmount, zeroAddress } from "locklift";
const { Account } = require("everscale-standalone-client/nodejs"); 


async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function arraysCompare(a, b) {
  a = Array.isArray(a) ? a : [];
  b = Array.isArray(b) ? b : [];
  return a.length === b.length && a.every(el => b.includes(el));
}

const deployToken = async (signer, owner, name, symbol, decimals = 9) => {
    const TokenWallet = await locklift.factory.getContractArtifacts("TokenWallet");

    let { contract: root } = await locklift.factory.deployContract({
        contract: 'TokenRoot',
        constructorParams: {
            initialSupplyTo: owner.address.toString(),
            initialSupply: locklift.utils.toNano('0'),
            deployWalletValue: locklift.utils.toNano('0.1'),
            mintDisabled: false,
            burnByRootDisabled: true,
            burnPaused: false,
            remainingGasTo: zeroAddress.toString()
        },
        initParams: {
            deployer_: zeroAddress.toString(),
            randomNonce_: locklift.utils.getRandomNonce(),
            rootOwner_: owner.address.toString(),
            name_: name,
            symbol_: symbol,
            decimals_: decimals,
            walletCode_: TokenWallet.code,
        },
        publicKey: signer.publicKey,
        value: locklift.utils.toNano(2),
    });

    console.log(`Token root: ${root.address} - ${symbol}`);
    return root;
}


module.exports = {
  sleep,
  arraysCompare,
  deployToken
};
