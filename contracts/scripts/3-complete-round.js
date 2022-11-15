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
  
  res = await root.methods.getUserBets({}).call();
  console.log('getUserBets', res);
  let userBets = res.userBets;
  
  res = await root.methods.completeRound({
  }).sendExternal({ publicKey: signer.publicKey });

  if (userBets.length) {
    let rootEevents = await root.getPastEvents({ filter: event => event.event === "RoundComplated" });
    console.log('rootEevents', rootEevents.events);
    if (rootEevents.events.length) {
      let rootEevent = rootEevents.events[0].data;
      console.log('RoundComplated', rootEevent);
    }  
    // let futureEvent = await root.waitForEvent({ filter: event => event.event === "RoundComplated" });
    // console.log('futureEvent', futureEvent.data);
  }

  res = await root.methods.getDetails({}).call();
  console.log('getDetails', res);
  
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
