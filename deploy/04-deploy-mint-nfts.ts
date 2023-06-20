import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { HiosNft, RandomNft, VRFCoordinatorV2Mock } from "../typechain-types";
import { BigNumber } from "ethers";

const mintNfts = async (hre: HardhatRuntimeEnvironment) => {
    const {
        getNamedAccounts,
        deployments: { log, deploy },
    } = hre;
    const { deployer } = await getNamedAccounts();

    const hiosNFT: HiosNft = await ethers.getContract("HiosNft", deployer);
    await hiosNFT.mint();
    const hiosNftUri = await hiosNFT.tokenURI(0);

    const randomNFT: RandomNft = await ethers.getContract("RandomNft", deployer);
    const mintiRandomNftFee = await randomNFT.getMintingFee();
    const requestRandomNftTx = await randomNFT.requestRandomNFT({ value: mintiRandomNftFee });
    const requestRandomNftReceipt = await requestRandomNftTx.wait(1);

    await new Promise(async (resolve, reject) => {
        randomNFT.once("NftMinted", () => {
            resolve(true);
        });

        const events = requestRandomNftReceipt.events;
        if (!events) return reject();

        const eventNftMinted = events.find(({ event }) => event === "NftRequested");
        if (!eventNftMinted || !eventNftMinted.args) return reject();

        const { requestId } = eventNftMinted.args;

        const vrfCoordinatorV2Mock: VRFCoordinatorV2Mock = await ethers.getContract(
            "VRFCoordinatorV2Mock",
            deployer
        );
        vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomNFT.address);
    });

    const randomNftUri = await randomNFT.tokenURI(0);
};
