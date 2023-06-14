import { ethers, network } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, networkConfig } from "../hardhat.config.helper";
import { VRFCoordinatorV2Mock } from "../typechain-types";

export const randomNFT = async (hre: HardhatRuntimeEnvironment) => {
    const {
        deployments: { deploy, log },
        getNamedAccounts,
    } = hre;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId ?? "";
    let vrfCoordinatorV2Address: string;
    let subscriptionId: string;
    const gasLane = networkConfig[chainId].gasLane;
    const callbackGasLimit = networkConfig[chainId].callbackGasLimit;

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock: VRFCoordinatorV2Mock = await ethers.getContract(
            "VRFCoordinatorV2Mock"
        );
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
        const tx = await vrfCoordinatorV2Mock.createSubscription();
        const { events } = await tx.wait(1);
        subscriptionId = events ? events[0].args?.subId : "";
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2!;
        subscriptionId = networkConfig[chainId].subscriptionId!;
    }
    const args = [vrfCoordinatorV2Address, subscriptionId, gasLane, callbackGasLimit];

    await deploy("RandomNft", {
        from: deployer,
        args,
        log: true,
        waitConfirmations: 1,
    });
};
