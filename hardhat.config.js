require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

module.exports = {
  solidity: "0.8.9",
  networks: {
    amoy: {
      url: "https://rpc-amoy.polygon.technology",
      chainId: 80002,
      accounts: ["85e31e62d1e066d0147bf294c7b322c1f09926c8dda88f4a3c68a3ce55929621"],
    },
  },
  sourcify: {
    enabled: true, // Enables Sourcify verification
  },
};