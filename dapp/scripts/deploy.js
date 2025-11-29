const hre = require("hardhat");

async function main() {
  const registry = await hre.ethers.deployContract("CertificateRegistry");
  await registry.waitForDeployment();

  console.log("CertificateRegistry deployed to:", registry.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});