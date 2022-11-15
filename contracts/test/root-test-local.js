import { expect } from "chai";
import { toNano, WalletTypes, Contract, Signer } from "locklift";
import { FactorySource } from "../build/factorySource";

const Config = require("../scripts/utilsConfig.js"); 
const Helper = require("../scripts/utilsHelper.js"); 

let root;
let signer;
let owner;
let config = Config.readConf();
let addressPair = config.pair;
let addressEver = config.ever;

describe("Test root contract", async function () {
  before(async () => {
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
  });
  describe("Contracts", async function () {

    it("Load contract factory", async function () {
      const sampleData = await locklift.factory.getContractArtifacts("Root");

      expect(sampleData.code).not.to.equal(undefined, "Code should be available");
      expect(sampleData.abi).not.to.equal(undefined, "ABI should be available");
      expect(sampleData.tvc).not.to.equal(undefined, "tvc should be available");
    });

    it("Deploy contract", async function () {
      const INIT_STATE = 0;
      const { contract } = await locklift.tracing.trace(locklift.factory.deployContract({
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
      }));
      root = contract;
      console.log('Root address', root.address.toString())
      expect(await locklift.provider.getBalance(root.address).then(balance => Number(balance))).to.be.above(0);
    });

    it("Interact with contract", async function () {
      let res
      
      res = await root.methods.getDetails({}).call();
      console.log('getDetails', res);

      expect(res.tokenRoot.toString()).to.equal(addressEver, "wrong tokenRoot");
      
    });

    it("Complete Round 1", async function () {
      let res
      
      await Helper.sleep(1000)
      res = await locklift.tracing.trace(root.methods.completeRound({
      }).sendExternal({ publicKey: signer.publicKey }));
      // console.log('res', res)
      // console.log('out', res.transaction.outMessages)
      res = await root.methods.getDetails({}).call();
      console.log('getDetails', res);

    });

    it("Test bets 1", async function () {
      let res
      
      res = await locklift.tracing.trace(root.methods.bet({
        rate: '51000',
        user: owner.address.toString()
      }).send({
          from: owner.address.toString(),
          amount: toNano(11),
      }));

      res = await locklift.tracing.trace(root.methods.bet({
        rate: '52000',
        user: owner.address.toString()
      }).send({
          from: owner.address.toString(),
          amount: toNano(11),
      }));

      res = await root.methods.getUserBets({}).call();
      console.log('getUserBets', res);
    });

    it("Complete Round 2", async function () {

      await Helper.sleep(60000)
      let res = await locklift.tracing.trace(root.methods.completeRound({
      }).sendExternal({ publicKey: signer.publicKey }));
      // console.log('res', res)
      // console.log('out', res.transaction.outMessages)
      res = await root.methods.getDetails({}).call();
      console.log('getDetails', res);
      res = await root.methods.getUserBets({}).call();
      console.log('getUserBets', res);

    });

    it("Test bets 2", async function () {
      let res
      
      res = await root.methods.getDetails({}).call();
      console.log('getDetails', res);

      res = await locklift.tracing.trace(root.methods.bet({
        rate: '51000',
        user: owner.address.toString()
      }).send({
          from: owner.address.toString(),
          amount: toNano(11),
      }));

      res = await locklift.tracing.trace(root.methods.bet({
        rate: '51000',
        user: owner.address.toString()
      }).send({
          from: owner.address.toString(),
          amount: toNano(11),
      }));

      res = await locklift.tracing.trace(root.methods.bet({
        rate: '52000',
        user: owner.address.toString()
      }).send({
          from: owner.address.toString(),
          amount: toNano(11),
      }));

      res = await root.methods.getUserBets({}).call();
      console.log('getUserBets', res.userBets);
    });

    it("Complete Round 3", async function () {

      await Helper.sleep(60000)
      let res = await locklift.tracing.trace(root.methods.completeRound({
      }).sendExternal({ publicKey: signer.publicKey }));
      // console.log('res', res)
      // console.log('out', res.transaction.outMessages)
      res = await root.methods.getDetails({}).call();
      console.log('getDetails', res);
      res = await root.methods.getUserBets({}).call();
      console.log('getUserBets', res);

    });

    it("Destroy", async function () {
      let res
      
      res = await locklift.tracing.trace(root.methods.kill({
      }).send({
          from: owner.address.toString(),
          amount: toNano(1),
      }));

      res = await root.methods.getDetails({}).call();
      console.log('getDetails', res.userBets);
    });

  });
});
