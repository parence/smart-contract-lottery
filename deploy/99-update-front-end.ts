import { ethers, network } from "hardhat";
import fs from "fs";

const FRONTEND_CONST_PATH = "../10-nextjs-smartcontract-lottery/constants/";
const ADDRESS_FILE = FRONTEND_CONST_PATH + "contractAddress.json";
const ABI_FILE = FRONTEND_CONST_PATH + "abi.json";

async function _deploy() {
  if (process.env.UPDATE_FRONT_END) {
    console.log("updating frontend...");
    updateContractAddresses();
    updateAbi();
  }
}

async function updateAbi() {
  const raffle = await ethers.getContract("Raffle");
  fs.writeFileSync(
    ABI_FILE,
    raffle.interface.format(ethers.utils.FormatTypes.json) as string
  );
}

async function updateContractAddresses() {
  const raffle = await ethers.getContract("Raffle");
  const chainId = network.config.chainId!.toString();
  const currentAddresses = JSON.parse(fs.readFileSync(ADDRESS_FILE, "utf8"));
  if (chainId in currentAddresses) {
    if (!currentAddresses[chainId].includes(raffle.address)) {
      currentAddresses[chainId].push(raffle.address);
    }
  } else {
    currentAddresses[chainId] = [raffle.address];
  }
  fs.writeFileSync(ADDRESS_FILE, JSON.stringify(currentAddresses));
}

_deploy.tags = ["all", "frontent"];
export default _deploy;
