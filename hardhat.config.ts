import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  gasReporter: {
    L1Etherscan: process.env.ETHERSCAN_KEY,
    coinmarketcap: process.env.COINMARKETCAP_KEY,
    currency: "USD",
  },
  networks: {
    hardhat: {
      chainId: 1337,
      initialBaseFeePerGas: 0,
    },
  },
};

export default config;
