import { toNano, WalletTypes, Contract, Signer } from "locklift";

const Config = require("../scripts/utilsConfig.js"); 
const Helper = require("../scripts/utilsHelper.js"); 

let root;
let signer;
let owner;
let config = Config.readConf();
let addressPair = config.pair;
let addressEver = config.ever;

async function main() {
  signer = (await locklift.keystore.getSigner("0"));
  console.log('signer', signer)
  // const { account: _owner } = await locklift.factory.accounts.addNewAccount({
    // publicKey: signer.publicKey,
    // type: WalletTypes.WalletV3,
    // value: toNano(1000),
  // });
  // console.log('giver', locklift.giver);
  const _owner = await locklift.factory.accounts.addExistingAccount({
    publicKey: signer.publicKey,
    type: WalletTypes.WalletV3,
  });
  owner = _owner;
  console.log(`Owner address: ${owner.address.toString()}`);

  const { contract } = await locklift.factory.deployContract({
    contract: "Root",
    publicKey: signer.publicKey,
    initParams: {
      _nonce: locklift.utils.getRandomNonce(),
    },
    constructorParams: {
      owner: owner.address.toString(),
      tokenRoot: addressEver,
      pairRoot: addressPair,
    },
    value: locklift.utils.toNano(5.1),
  });
  root = contract;
  console.log('Root address', root.address.toString())

  let res
  res = await root.methods.getDetails({}).call();
  console.log('getDetails', res);

  let conf = Config.readConf();
  conf.root = root.address.toString()
  Config.saveConf(conf)

}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
