import { toNano, WalletTypes, Contract, Signer, Address } from "locklift";

const Config = require("../scripts/utilsConfig.js"); 
const Helper = require("../scripts/utilsHelper.js"); 

let root;
let signer;
let owner;

async function main() {
  signer = (await locklift.keystore.getSigner("0"));
  console.log('signer', signer)
  // const { account: _owner } = await locklift.factory.accounts.addNewAccount({
    // publicKey: signer.publicKey,
    // type: WalletTypes.WalletV3,
    // value: toNano(1000),
  // });
  const _owner = await locklift.factory.accounts.addExistingAccount({
    publicKey: signer.publicKey,
    type: WalletTypes.WalletV3,
  });
  owner = _owner;
  console.log(`Owner address: ${owner.address.toString()}`);
  
  let conf = Config.readConf();

  root = locklift.factory.getDeployedContract(
    "Root",
    new Address(conf.root),
  ); 
  console.log('Root address', root.address.toString())

  let res
  
  res = await root.methods.bet({
    rate: Math.floor(Math.random() * 100000),
    user: owner.address.toString()
  }).send({
      from: owner.address.toString(),
      amount: toNano(11),
  });

  res = await root.methods.getDetails({}).call();
  console.log('getDetails', res);
  
  res = await root.methods.getUserBets({}).call();
  console.log('getUserBets', res);
  
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
