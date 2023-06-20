import { ethers, network } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { HiosNft, RandomNft, SvgHiosToken, VRFCoordinatorV2Mock } from "../typechain-types";
import { BigNumber } from "ethers";
import { developmentChains } from "../hardhat.config.helper";

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

    await new Promise(async (resolve, reject) => {
        randomNFT.once("NftMinted", () => {
            resolve(true);
        });
        const requestRandomNftTx = await randomNFT.requestRandomNFT({ value: mintiRandomNftFee });
        const requestRandomNftReceipt = await requestRandomNftTx.wait(1);
        if (!developmentChains.includes(network.name)) return resolve(true);

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

    const svgNft: SvgHiosToken = await ethers.getContract("SvgHiosToken", deployer);
    const priceThreshold = ethers.utils.parseEther("2500");
    const mintinSvgNftTx = await svgNft.mint(priceThreshold);
    await mintinSvgNftTx.wait(1);

    const svgTokenUri = await svgNft.tokenURI(0);

    console.log({ hiosNftUri, randomNftUri, svgTokenUri });
};

export default mintNfts;
