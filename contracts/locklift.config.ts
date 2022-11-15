import { LockliftConfig } from "locklift";
import { FactorySource } from "./build/factorySource";
import { SimpleGiver, GiverWallet, GiverWalletV2_3 } from "./giverSettings";

declare global {
  const locklift: import("locklift").Locklift<FactorySource>;
}

const LOCAL_NETWORK_ENDPOINT = process.env.NETWORK_ENDPOINT || "http://localhost/graphql";

// Create your own link on https://dashboard.evercloud.dev/


const MAIN_NET_NETWORK_ENDPOINT = "https://mainnet.evercloud.dev/{{you_dev_id}}/graphql";
const DEV_NET_NETWORK_ENDPOINT = "https://devnet.evercloud.dev/{{you_dev_id}}/graphql";

const config: LockliftConfig = {
  compiler: {
    // Specify path to your TON-Solidity-Compiler
    // path: "/mnt/o/projects/broxus/TON-Solidity-Compiler/build/solc/solc",

    // Or specify version of compiler
    version: "0.62.0",

    // Specify config for extarnal contracts as in exapmple
    // externalContracts: {
      // "lib/flatqube": ['DexPair']
    // }
  },
  linker: {
    // Specify path to your stdlib
    // lib: "/mnt/o/projects/broxus/TON-Solidity-Compiler/lib/stdlib_sol.tvm",
    // // Specify path to your Linker
    // path: "/mnt/o/projects/broxus/TVM-linker/target/release/tvm_linker",

    // Or specify version of linker
    version: "0.15.48",
  },
  networks: {
    local: {
      // Specify connection settings for https://github.com/broxus/everscale-standalone-client/
      connection: {
        id: 1,
        group: "localnet",
        type: "graphql",
        data: {
          endpoints: [LOCAL_NETWORK_ENDPOINT],
          latencyDetectionInterval: 1000,
          local: true,
        },
      },
      // This giver is default local-node giverV2
      giver: {
        // Check if you need provide custom giver
        giverFactory: (ever, keyPair, address) => new SimpleGiver(ever, keyPair, address),
        address: "",
        key: "",
      },
      tracing: {
        endpoint: LOCAL_NETWORK_ENDPOINT,
      },
      keys: {
        // Use everdev to generate your phrase
        // !!! Never commit it in your repos !!!
        phrase: "action inject penalty envelope rabbit element slim tornado dinner pizza off blood",
        amount: 20,
      },
    },
    test: {
      connection: {
        id: 1,
        group: "dev",
        type: "graphql",
        data: {
          endpoints: [DEV_NET_NETWORK_ENDPOINT],
          latencyDetectionInterval: 1000,
          local: false,
        },
      },
      // This giver is default Wallet
      giver: {
        // Check if you need provide custom giver
        giverFactory: (ever, keyPair, address) => new GiverWallet(ever, keyPair, address),
        address: "",
        phrase: "",
        accountId: 0
      },
      tracing: {
        endpoint: DEV_NET_NETWORK_ENDPOINT,
      },
      keys: {
        // Use everdev to generate your phrase
        // !!! Never commit it in your repos !!!
        // phrase: "math column spread enact carry cross monitor rich now scare air symptom",
        amount: 20,
      },
    },
    main: {
      // Specify connection settings for https://github.com/broxus/everscale-standalone-client/
      connection: {
        id: 1,
        type: "graphql",
        group: "main",
        data: {
          endpoints: [MAIN_NET_NETWORK_ENDPOINT],
          latencyDetectionInterval: 1000,
          local: false,
        },
      },
      // This giver is default Wallet
      giver: {
        // Check if you need provide custom giver
        giverFactory: (ever, keyPair, address) => new GiverWallet(ever, keyPair, address),
        address: "",
        phrase: "",
        accountId: 0
      },
      tracing: {
        endpoint: MAIN_NET_NETWORK_ENDPOINT,
      },
      keys: {
        // Use everdev to generate your phrase
        // !!! Never commit it in your repos !!!
        phrase: "",
        amount: 20,
      },
    },
  },
  mocha: {
    timeout: 2000000,
  },
};

export default config;
