const { TonClient, signerKeys } = require("@eversdk/core");
const { libNode } = require("@eversdk/lib-node");
const { Account } = require("@eversdk/appkit");

var express = require('express')
var path = require('path')
var serveStatic = require('serve-static')
let app = express()

const abiRouter = require("../contracts/build/Root.abi.json");
let Config = require("../contracts/config.json");
let addressRoot = Config.root;

TonClient.useBinaryLibrary(libNode);
const MAIN_NET_NETWORK_ENDPOINT = "https://mainnet.evercloud.dev/{{you_dev_id}}/graphql";
const DEV_NET_NETWORK_ENDPOINT = "https://devnet.evercloud.dev/{{you_dev_id}}/graphql";

let account;
let nextRound = 0;


(async () => {
    landing();
    const endpoint = MAIN_NET_NETWORK_ENDPOINT;
    const client = new TonClient({ network: { endpoints: [endpoint] } });
    try {
        await main(client);
    } catch (err) {
        console.error(err);
    } finally {
        client.close();
    }
})();

function countractTimer() {
  setTimeout(async () => {
    if (Date.now() / 1000 >= nextRound) {
      let response
      
      response = await account.run("completeRound", {});
      console.log('completeRound', response.decoded.output);
      
      response = await account.runLocal("getDetails", {});
      console.log('getDetails', response.decoded.output);
    
      nextRound = response.decoded.output.endRound * 1;
    }

    countractTimer()
  }, 200)
}

async function main(client) {
    const keys = await client.crypto.generate_random_sign_keys();
    const signer = signerKeys(keys);
    account = new Account({abi: abiRouter}, { address: addressRoot, signer, client });

    let response = await account.runLocal("getDetails", {});
    console.log('getDetails', response.decoded.output);
    
    nextRound = response.decoded.output.endRound * 1;

    countractTimer();
}

function landing() {
    app.use(serveStatic(path.join(__dirname, '../dist'), { index: ['index.html', 'index.htm'] }));
    app.listen(80);
}


