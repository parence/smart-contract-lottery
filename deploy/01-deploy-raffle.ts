import { ethers, network } from "hardhat";
import { HardhatRuntimeEnvironment, NetworkConfig } from "hardhat/types";
import { devChains, networkConfig } from "../helper-hardhat-config";
import { verify } from "../utils/verify";

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("30");

async function _deploy(hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId as keyof typeof networkConfig;
  let vrfCoordinatorV2Address, subscriptionId;

  if (devChains.includes(network.name)) {
    const VRFCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );
    vrfCoordinatorV2Address = VRFCoordinatorV2Mock.address;
    const transactionResponse = await VRFCoordinatorV2Mock.createSubscription();
    const transactionReceipt = await transactionResponse.wait(1);
    subscriptionId = transactionReceipt.events[0].args.subId;
    await VRFCoordinatorV2Mock.fundSubscription(
      subscriptionId,
      VRF_SUB_FUND_AMOUNT
    );
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
    subscriptionId = networkConfig[chainId].subscriptionId;
  }

  const entranceFee = networkConfig[chainId].entranceFee;
  const gasLane = networkConfig[chainId].gasLane;
  const callbackGasLimit = networkConfig[chainId].callbackGasLimit;
  const interval = networkConfig[chainId].interval;
  const args = [
    vrfCoordinatorV2Address,
    entranceFee,
    gasLane,
    subscriptionId,
    callbackGasLimit,
    interval,
  ];
  const raffle = await deploy("Raffle", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: devChains.includes(network.name) ? 1 : 5,
  });

  if (!devChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    log("verifying...");
    await verify(raffle.address, args);
    log("-------------------------");
  }
}

_deploy.tags = ["all", "raffle"];
export default _deploy;
