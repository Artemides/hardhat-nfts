/* Constructor 
1. Sets starting values correctly
Request NFT
1. fails if payment isn't sent with the request
2. reverts if payment amount is less than the mint fee
3. emits an event and kicks off a random word request

fulfillRandomWords

1. mints NFT after random number is returned

getBreedFromModdedRng
1. should return pug if moddedRng < 10
2. should return shiba-inu if moddedRng is between 10 - 39
3. should return st. bernard if moddedRng is between 40 - 99
4. should revert if moddedRng > 9 
*/

import { deployments, ethers, network } from "hardhat";
import { developmentChains, networkConfig } from "../hardhat.config.helper";
import { RandomNft, VRFCoordinatorV2Mock } from "../typechain-types";
import { assert, expect } from "chai";

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Random IPFS NFT", () => {
          let randomNft: RandomNft;
          let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock;
          let deployer: string;
          let chainId: number;
          beforeEach(async () => {
              deployer = (await ethers.getSigners())[0].address;
              await deployments.fixture(["mocks", "nftipfs"]);
              randomNft = await ethers.getContract("RandomNft");
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
              chainId = network.config.chainId ?? 0;
          });
          describe("Constructor", () => {
              it("Sets starting values correctly", async () => {
                  const _mintinFee = networkConfig[chainId].mintFee;
                  const mintinFee = await randomNft.getMintingFee();
                  assert.equal(_mintinFee.toString(), mintinFee.toString());
              });
              it("Starts the token counter at 0", async () => {
                  const tokenCounter = await randomNft.getTokenCounter();
                  assert.equal(tokenCounter.toString(), "0");
              });
              it("Sets correctly the VRFCoordinatorV2", async () => {
                  const tokenCounter = await randomNft.getTokenCounter();
                  assert.equal(tokenCounter.toString(), "0");
              });
          });

          describe("Request Random NFT", () => {
              beforeEach(async () => {});

              it("Reverts if the payment is not sent", async () => {
                  await expect(randomNft.requestRandomNFT()).to.be.revertedWithCustomError(
                      randomNft,
                      "RandomNft__InvalidMintingFee"
                  );
              });

              it("Reverts if payment is not equal than minting fee", async () => {
                  const mintingFee = await randomNft.getMintingFee();
                  await expect(
                      randomNft.requestRandomNFT({
                          value: mintingFee.sub(ethers.utils.parseEther("0.001")),
                      })
                  ).to.be.revertedWithCustomError(randomNft, "RandomNft__InvalidMintingFee");
                  await expect(
                      randomNft.requestRandomNFT({
                          value: mintingFee.add(ethers.utils.parseEther("0.001")),
                      })
                  ).to.be.revertedWithCustomError(randomNft, "RandomNft__InvalidMintingFee");
              });

              it("Emits an event and kicks off a random nft", async () => {
                  const mintingFee = await randomNft.getMintingFee();
                  await expect(randomNft.requestRandomNFT({ value: mintingFee })).to.emit(
                      randomNft,
                      "NftRequested"
                  );
              });
          });
      });
