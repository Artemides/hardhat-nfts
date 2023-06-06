import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { developmentChains } from "../hardhat.config.helper";
import { HiosNft } from "../typechain-types";
import { assert } from "chai";

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Hios Nft Token", () => {
          let hiosNft: HiosNft;
          let deployer: string;
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture("all");
              hiosNft = await ethers.getContract("HiosNft", deployer);
          });

          describe("Constructor", () => {
              it("Starts the nft's Id at 0", async () => {
                  const tokenCounter = await hiosNft.getTokenCounter();
                  assert.equal(tokenCounter.toNumber(), 0);
              });
          });
      });
