const hre = require("hardhat");

async function main() {
  const ChainTalk = await hre.ethers.getContractFactory("ChainTalk");
  const chainTalk = await ChainTalk.deploy();

  await chainTalk.waitForDeployment();

  console.log(
    `ChainTalk deployed to: ${await chainTalk.getAddress()}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});