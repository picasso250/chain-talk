const hre = require("hardhat");

async function main() {
  const OnChainDiary = await hre.ethers.getContractFactory("OnChainDiary");
  const diary = await OnChainDiary.deploy();

  await diary.waitForDeployment();

  console.log(
    `OnChainDiary deployed to: ${await diary.getAddress()}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});