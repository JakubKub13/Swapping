import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import '@openzeppelin/hardhat-upgrades';
import * as dotenv from 'dotenv';
dotenv.config()

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  paths: { tests: "tests" },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      forking: {
        url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
        
      },
      // mining: {
      //   auto: false,
      //   interval: 0,
      //   mempool: {
      //     order: "fifo"
      //   }
      // },
      hardfork: "merge"
    }
  },
};

export default config;
