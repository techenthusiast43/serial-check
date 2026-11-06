import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = await hre.ethers.provider.getNetwork();

  console.log("----------------------------------------------------");
  console.log("Deploying SerialCheck Contract");
  console.log(`Network Name: ${hre.network.name}`);
  console.log(`Chain ID:     ${network.chainId}`);
  console.log(`Deployer:     ${deployer.address}`);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Balance:      ${hre.ethers.formatEther(balance)} BOT`);
  console.log("----------------------------------------------------");

  const SerialCheck = await hre.ethers.getContractFactory("SerialCheck");
  const serialCheck = await SerialCheck.deploy();
  await serialCheck.waitForDeployment();

  const contractAddress = await serialCheck.getAddress();
  console.log(`>>> SerialCheck successfully deployed to: ${contractAddress}`);

  // Save deployed address and config for frontend integration
  const deploymentsDir = path.join(__dirname, "../src/config");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentData = {
    address: contractAddress,
    network: hre.network.name,
    chainId: Number(network.chainId),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };

  fs.writeFileSync(
    path.join(deploymentsDir, "contract-address.json"),
    JSON.stringify(deploymentData, null, 2)
  );

  // Also auto-update .env with the deployed contract address
  const envPath = path.join(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf-8");
    if (envContent.includes("VITE_CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(
        /VITE_CONTRACT_ADDRESS=.*/g,
        `VITE_CONTRACT_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nVITE_CONTRACT_ADDRESS=${contractAddress}\n`;
    }
    fs.writeFileSync(envPath, envContent);
    console.log(`Updated VITE_CONTRACT_ADDRESS in .env`);
  }

  console.log(`Deployment config saved to src/config/contract-address.json`);
  console.log("----------------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

