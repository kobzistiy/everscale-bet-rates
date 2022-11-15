<template>
  <v-container>
    <v-row justify="center">

      <v-col
        class="mb-4"
        cols="12"
      >
        <h1 class="text-center text-h4">
            Welcome to Bet Rates (TEST MODE)
        </h1>
      </v-col>
      
      <v-col
        class="mb-4"
        cols="12"
        sm="6"
        v-if="screenWallet == 'main'"
      >
        <v-row class="mb-4" justify="center">
          <div class="text-center">
            <v-dialog
              v-model="dialog"
              width="500"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  color="red lighten-2"
                  dark
                  v-bind="attrs"
                  v-on="on"
                >
                  About game
                </v-btn>
              </template>

              <v-card>
                <v-card-title class="text-h5 grey lighten-2">
                  About game
                </v-card-title>

                <v-card-text>
                  Description and rules of the game "Everscale Bet Rates".<br/><br/>
The player is asked to guess the course of the north in the <a href='https://app.flatqube.io/pairs/0:771e3d124c7a824d341484718fcf1af03dd4ba1baf280adeb0663bb030ce2bf9'>"wever/usdt"</a> pair according to the <a href='https://app.flatqube.io'>Flat Qube</a> DEX data. The course is determined by the logic: how much usdt can be bought for 1 ever, taking into account the commission.<br/>
The round lasts 12 hours and closes at 00:00 GMT+0 and 12:00 GMT+0. Bets are accepted from the beginning of the round and end 1 hour before the end of the round. The closing of the round may take place a little later than the declared time, this is due to the technical limitations of the blockchain.<br/>
The player can make several bets on different courses to increase his chances of winning. Players who place a bet on the closest course win. If there are several winners, then the winnings are divided equally between them.<br/>
The winning amount is 90% of the sum of bets of all players in the round, 10% is the remuneration for developers.<br/>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="primary"
                    text
                    @click="dialog = false"
                  >
                    I accept
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </div>
        </v-row>
        <v-row class="mb-4" justify="center">
          <h2 class="text-subtitle-1">
            Wallet: {{ WalletAddress }}
          </h2>
        </v-row>
        <v-row class="mb-4" justify="center">
          <h2 class="text-subtitle-1">
            End of the round
          </h2>
        </v-row>
        <v-row class="mb-4" justify="center">
          <h2 class="text-subtitle-0">
            {{ RoundEnd }}
          </h2>
        </v-row>
        <v-row class="mb-4" justify="center">
          <h2 class="text-subtitle-1">
            End of bidding: {{ TimeLeft }} s
          </h2>
        </v-row>
        <v-row class="mb-4" justify="center">
          <h2 class="text-subtitle-1">
            Now Rate: {{ TokenRate.toLocaleString(undefined, { 
              minimumFractionDigits: 6, 
              maximumFractionDigits: 6 
            }) }}
          </h2>
        </v-row>
        <v-row class="mb-4" justify="center">
          <v-text-field 
            :rules="[rules.required, rules.counter]"
            v-model="rateBet"
            v-if="timeLeft > 0"
            placeholder="0.100000"
            style="max-width: 20%; min-width: 150px"
          ></v-text-field>
        </v-row>
        <v-row class="mb-4" justify="center">
          <v-btn variant="outlined" prepend-icon="mdi-export"
            @click="makeBet"
            v-if="timeLeft > 0"
            style="max-width: 20%; min-width: 150px"
          >
            Make a bet
          </v-btn>
        </v-row>
        <v-row class="mb-4" justify="center">
          <v-btn variant="outlined" prepend-icon="mdi-export"
            @click="calcRound"
            v-if="new Date(endRound*1000) < Date.now()"
            style="max-width: 20%; min-width: 150px"
          >
            Calc Round
          </v-btn>
        </v-row>
      </v-col>
      <v-col
        class="mb-4"
        cols="12"
        v-if="screenWallet == 'main'"
      >
        <v-simple-table
          class="mx-auto"
          style="max-width: 80%;"
        >
          <template v-slot:default>
            <thead>
              <tr>
                <th colspan="2">
                  <h2 class="text-center">
                    My Bets
                  </h2>
                </th>
              </tr>
              <tr>
                <th class="text-center">
                  Rate
                </th>
                <th class="text-center">
                  Bets
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in MyBets"
                :key="item.rate"
              >
                <td class="text-center">{{ item.rate }}</td>
                <td class="text-center">{{ item.count }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-col>
      <v-col
        class="mb-12"
        cols="12"
        v-if="screenWallet == 'main'"
      >
        <v-sheet
          class="v-sheet--offset mx-auto"
          color="white"
          elevation="12"
          max-width="calc(80%)"
        >
          <h2 class="text-center">
            All bets in this round
          </h2>
          <v-sparkline
            :labels="BetLabels"
            :value="BetValues"
            color="green"
            line-width="1"
            stroke-linecap="round"
            padding="16"
          ></v-sparkline>
        </v-sheet>
      </v-col>
      <v-col
        class="mb-4"
        cols="12"
        v-if="screenWallet == 'main'"
      >
        <v-simple-table
          class="mx-auto"
          style="max-width: 80%;"
        >
          <template v-slot:default>
            <thead>
              <tr>
                <th colspan="4">
                  <h2 class="text-center">
                    Complated rounds
                  </h2>
                </th>
              </tr>
              <tr>
                <th class="text-center">
                  Round
                </th>
                <th class="text-center">
                  Rate
                </th>
                <th class="text-center">
                  Reward
                </th>
                <th class="text-center">
                  Winners
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in Complated"
                :key="item.hash"
              >
                <td class="text-center">{{ item.time }}</td>
                <td class="text-center">{{ item.rate }}</td>
                <td class="text-center">{{ item.reward }}</td>
                <td class="text-center">{{ item.winners }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-col>
      <v-col
        class="mb-12"
        cols="12"
      >
        <v-row class="mb-4" justify="center">
          <h2 class="text-subtitle-1">
            <v-btn 
              :href="'https://ever.live/accounts/accountDetails?id='+RootAddress"
              target="_blank"
            >Root contract</v-btn>
          </h2>
        </v-row>
      </v-col>
      <v-col
        class="mb-12"
        cols="12"
        v-if="screenWallet == 'extension'"
      >
        <v-row class="mb-4" justify="center">
          <h2 class="text-subtitle-4">
            Please install EVER Wallet chrome extension
          </h2>
        </v-row>
      </v-col>
      <v-col
        class="mb-12"
        cols="12"
        v-if="screenWallet == 'login'"
      >
        <v-row class="mb-4" justify="center">
          <h2 class="text-subtitle-4">
            Please authorize your account on the Main Network
          </h2>
        </v-row>
      </v-col>

    </v-row>
  </v-container>
</template>

<script>
/* eslint-disable */
import { mapActions, mapGetters } from 'vuex'
let abiRoot = require("../../contracts/build/Root.abi.json");
let abiPair = require("../../contracts/build/DexPair.abi.json");
let Config = require("../../contracts/config.json");
let addressRoot = Config.root;
let addressPair = Config.pair;
let addressEver = Config.ever;

export default {
  name: 'MainBoard',

  data: () => ({
    dialog: false,
    TokenRate: 0,
    timeLeft: 0,
    endRound: 0,
    endBidding: 0,
    rateBet: '',
    RootAddress: addressRoot,
    rules: {
      required: value => !!value || 'Required.',
      counter: value => value > 0 || 'Greater than 0',
    },
    MyBets: [],
    Complated: [],
    BetLabels: [],
    BetValues: [],
  }),

  methods: {
    ...mapActions(['subscribeContract', 'getContract']),
    countDownTimer () {
      setTimeout(() => {
        const d = new Date();
        this.timeLeft = Math.floor((new Date(this.endBidding*1000) - Date.now())/1000);
        this.countDownTimer()
      }, 1000)
    },
    subscribeRoot() {
      console.log('subscribeRoot', true);
      this.subscribeContract({
        eventName: 'contractStateChanged',
        address: addressRoot,
        onEvent: async (event) => {
          console.log('Root StateChanged', event);
          await this.updRoundDetails();
          await this.updUserBets();
        }
      });
    },
    subscribePair() {
      console.log('subscribePair', true);
      this.subscribeContract({
        eventName: 'contractStateChanged',
        address: addressPair,
        onEvent: async (event) => {
          console.log('Pair StateChanged', event);
          await this.updRate();
        }
      });
    },
    async updRate() {
      console.log('updRate', true);
      const pair = await this.getContract({
        abi: abiPair,
        address: addressPair,
      });
      try {
          const out = await pair.methods.expectedExchange({
            answerId: '0',
            amount: '1000000000',
            spent_token_root: addressEver,
          }).call();
          console.log('Pair expectedExchange', out);
          this.TokenRate = out.expected_amount / 1000000;
          this.updUserBets();
      } catch (error) {
          console.error(error);
      }
    },
    async updUserBets() {
      console.log('updUserBets', true);
      const root = await this.getContract({
        abi: abiRoot,
        address: addressRoot,
      });
      try {
          const out = await root.methods.getUserBets({}).call();
          console.log('Root getUserBets', out);
          this.MyBets = [];
          this.BetValues = [];
          this.BetLabels = [];
          let _rate = out.userBets.find(obj => obj[0] == this.TokenRate*1000000)
          if (!_rate) {
            out.userBets.push([this.TokenRate*1000000, []])
          }
          if (out.userBets.length <= 1) {
            out.userBets.push([this.TokenRate*1000000, []])
          }
          out.userBets.sort(function(a, b){return a[0]*1 - b[0]*1})
          let addr = this.account.address.toString();
          out.userBets.forEach(el => {
            let my = el[1].filter(obj => obj == addr)
            if (my.length) {
              this.MyBets.push({
                rate: el[0] / 1000000,
                count: my.length,
              });
            }
            this.BetLabels.push((el[0] / 1000000).toLocaleString(undefined, { 
              minimumFractionDigits: 6, 
              maximumFractionDigits: 6 
            }));
            this.BetValues.push(el[1].length);     
          }) 
          
      } catch (error) {
          console.error(error);
      }
    },
    async updRoundDetails() {
      console.log('updRoundDetails', true);
      const root = await this.getContract({
        abi: abiRoot,
        address: addressRoot,
      });
      try {
          const out = await root.methods.getDetails({}).call();
          console.log('Root getDetails', out);
          this.endRound = out.endRound;
          this.endBidding = out.endBidding;
          this.countDownTimer();
      } catch (error) {
          console.error(error);
      }
    },
    async calcRound() {
      console.log('calcRound', true);
      const root = await this.getContract({
        abi: abiRoot,
        address: addressRoot,
      });
      try {
          const out = await root.methods.completeRound({
          }).sendExternal({ publicKey: this.account.publicKey });
          console.log('Root completeRound', out);

      } catch (error) {
          console.error(error);
      }
    },
    async makeBet() {
      console.log('makeBet', true, Math.floor(parseFloat(this.rateBet) * 1000000));
      if (!this.rateBet) return;
      const root = await this.getContract({
        abi: abiRoot,
        address: addressRoot,
      });
      try {
          const out = await root.methods.bet({
              rate: Math.floor(parseFloat(this.rateBet) * 1000000),
              user: this.account.address.toString()
          }).send({
              from: this.account.address.toString(),
              amount: '11000000000',
          });
          console.log('Root getDetails', out);

      } catch (error) {
          console.error(error);
      }
    },
    async getPastRounds() {
      console.log('getPastRounds', true);
      const root = await this.getContract({
        abi: abiRoot,
        address: addressRoot,
      });
      try {
          let pastEvents = await root.getPastEvents({ filter: event => event.event === "RoundComplated" });
          console.log('Complated', pastEvents.events);
          this.Complated = pastEvents.events.map(el => {
            let obj = {
              hash: el.transaction.id.hash,
              time: (new Date(el.transaction.createdAt*1000)).customFormat( "#DD#-#MM#-#YYYY# #hhhh#:#mm#:#ss#" ),
              rate: el.data.rate / 1000000,
              reward: `${el.data.reward / 1000000000} E`,
              winners: el.data.winners.map(addr => {
                return `${addr.toString().substr(0,6)}...${addr.toString().substr(-4,4)}`
              }).join(', '),
            }
            console.log('obj', obj)
            return obj
          })
          console.log('Complated', this.Complated);
      } catch (error) {
          console.error(error);
      }
    },
  },

  computed: {
    ...mapGetters(['screenWallet', 'network', 'account']),
    RoundEnd() {
      return (new Date(this.endRound*1000)).customFormat( "#DD#-#MM#-#YYYY# #hhhh#:#mm#:#ss#" );
    },
    TimeLeft() {
      if (this.timeLeft < 0) return "00:00:00"
      const leftTime = new Date();
      leftTime.setHours(0);
      leftTime.setMinutes(0);
      leftTime.setSeconds(this.timeLeft);
      return (leftTime).customFormat( "#hhhh#:#mm#:#ss#" );
    },
    WalletAddress() {
      if (!this.account) return '';
      let addr = this.account.address.toString()
      return `${addr.substr(0,6)}...${addr.substr(-4,4)}`;
    },
  },

  watch: {
    account(val) {
      console.log('account', val);
      if (val) {
        this.subscribeRoot();
        this.subscribePair();
        this.updRate();
        this.updUserBets();
        this.updRoundDetails();
        this.getPastRounds();
      }
    },
    network(val) {
      console.log('network', val);
      if (val) {
      }
    },
    rateBet(val) {
      this.rateBet = val.replace(/,/g, ".");
    },

  },
    
  async mounted() {
  },
}
</script>
