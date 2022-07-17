import { devChains } from "../../helper-hardhat-config";
import { assert, expect } from "chai";
import { ethers, getNamedAccounts } from "hardhat";
import { network } from "hardhat";
import type { Raffle } from "../../typechain-types";
import type { BigNumber } from "ethers";

devChains.includes(network.name)
  ? describe.skip
  : describe("raffle unit tests", () => {
      let raffle: Raffle, raffleEntranceFee: BigNumber, deployer: string;

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        raffle = await ethers.getContract("Raffle", deployer);
        raffleEntranceFee = await raffle.getEntranceFee();
      });

      describe("fullfillRandomWords", () => {
        it("works with live chainlink keepers and vrf, we get a random winner", async () => {
          console.log("setting up test...");

          const startingTimeStamp = await raffle.getLatestTimeStamp();
          const accounts = await ethers.getSigners();

          console.log("setting up listener..");

          await new Promise<void>(async (resolve, reject) => {
            raffle.once("WinnerPicked", async () => {
              console.log("winner picked");
              try {
                const recentWinner = await raffle.getRecentWinner();
                const raffleState = await raffle.getRaffleState();
                const winnerEndingBalance = await accounts[0].getBalance();
                const endingTimeStamp = await raffle.getLatestTimeStamp();

                await expect(raffle.getPlayer(0)).to.be.reverted;
                assert.equal(recentWinner.toString(), accounts[0].address);
                assert.equal(raffleState, 0);
                assert.equal(
                  winnerEndingBalance.toString(),
                  winnerStartingBalance.add(raffleEntranceFee).toString()
                );
                assert(endingTimeStamp > startingTimeStamp);

                resolve();
              } catch (error) {
                console.log(error);
                reject(error);
              }
            });
            console.log("entering raffle..");
            const tx = await raffle.enterRaffle({ value: raffleEntranceFee });
            await tx.wait(1);
            const winnerStartingBalance = await accounts[0].getBalance();
          });
        });
      });
    });
