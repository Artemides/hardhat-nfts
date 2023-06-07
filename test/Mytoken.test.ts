import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { developmentChains } from "../hardhat.config.helper";
import { HiosNft } from "../typechain-types";
import { assert, expect } from "chai";

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
              it("Initializes the correctly the NFT name and Symbol", async () => {
                  const nftName = await hiosNft.name();
                  const nftSymbol = await hiosNft.symbol();

                  assert.equal(nftName, "Helios");
                  assert.equal(nftSymbol, "HIOS");
              });
              it("Starts the nft's Id at 0", async () => {
                  const tokenCounter = await hiosNft.getTokenCounter();
                  assert.equal(tokenCounter.toNumber(), 0);
              });
          });

          describe("Mint Hios Nft", () => {
              it("Increases balances into 1 and sets the correctly the owner", async () => {
                  const initialOwnerBalance = await hiosNft.balanceOf(deployer);
                  await hiosNft.mint();
                  const onwer = await hiosNft.ownerOf(0);
                  const endOwnerBalance = await hiosNft.balanceOf(deployer);

                  assert.equal(endOwnerBalance.toString(), initialOwnerBalance.add(1).toString());
                  assert.equal(deployer, onwer);
              });
              it("emits transfer event when a token gets minted", async () => {
                  expect(await hiosNft.mint()).to.emit("HiosNft", "Transfer");
              });
              it("Increases the token counter as it mints", async () => {
                  const tokenCounter = await hiosNft.getTokenCounter();
                  await hiosNft.mint();
                  const afterMintTokenCounter = await hiosNft.getTokenCounter();
                  assert.equal(afterMintTokenCounter.toString(), tokenCounter.add(1).toString());
              });
          });
      });
