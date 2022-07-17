import { network, ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { devChains } from "../helper-hardhat-config";

const BASE_FEE = ethers.utils.parseEther("0.25"); // cost per request
const GAS_PRICE_LINK = 1e9; // calculated value based on the gas price of the chain

async function _deploy(hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const args = [BASE_FEE, GAS_PRICE_LINK];

  if (devChains.includes(network.name)) {
    log("local network detected! deploying mocks...");
    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      log: true,
      args,
    });
    log("mocks deployed!");
    log("---------------");
  }
}

_deploy.tags = ["all", "mocks"];
export default _deploy;
