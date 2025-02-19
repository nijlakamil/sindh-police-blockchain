const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const ImageStorage = await hre.ethers.getContractFactory("ImageStorage");

  console.log("Deploying contract...");

  // Deploy contract (use deployContract for Hardhat's newer versions)
  const imageStorage = await ImageStorage.deploy();

  console.log(`Waiting for contract to be deployed...`);
  await imageStorage.waitForDeployment(); // Use this instead of deployed()

  console.log(`Contract deployed at: ${imageStorage.target}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
