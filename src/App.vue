<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <div class="d-flex align-center">
        <v-img
          alt="Logo"
          class="shrink mr-2"
          contain
          :src="require('../public/logo.jpg')"
          transition="scale-transition"
          width="40"
        />
      </div>

      <v-spacer></v-spacer>

      <v-btn
        @click="connectWallet"
        v-if="screenWallet == 'login'"
        text
      >
        <span class="mr-2">Connect Wallet</span>
      </v-btn>
      <v-btn
        @click="disconnectWallet"
        v-if="screenWallet == 'main'"
        text
      >
        <span class="mr-2">Disconnect Wallet</span>
      </v-btn>
      <v-btn
        href="https://l1.broxus.com/everscale/wallet"
        v-if="screenWallet == 'extension'"
        target
      >
        <span class="mr-2">EVER Wallet</span>
      </v-btn>
    </v-app-bar>

    <v-main>
      <MainBoard/>
    </v-main>
  </v-app>
</template>

<script>
/* eslint-disable */
import { mapActions, mapGetters } from 'vuex'
import MainBoard from './components/MainBoard';

export default {
  name: 'App',

  components: {
    MainBoard,
  },

  data: () => ({
    //
  }),

  methods: {
    ...mapActions(['initWallet', 'connectWallet', 'disconnectWallet', 'subscribeContract', 'getContract']),
  },

  computed: {
    ...mapGetters(['screenWallet', 'network', 'account']),
    //screenWallet() {
      //return this.$store.state.inpage.screenWallet;
    // },
  },

  watch: {
    //'$this.screenWallet': function () {
    //  console.log('screenWallet 2', this.screenWallet);
    //},
  },
    
  async mounted() {
    this.initWallet({
      onWalletConnect: async (providerState) => {
        console.log('onWalletConnect', providerState);
      }
    });
  },
};
</script>
