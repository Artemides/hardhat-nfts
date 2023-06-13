import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains } from "../hardhat.config.helper";
import { ethers, network } from "hardhat";
const BASE_FEE = ethers.utils.parseEther("0.25");
const GAS_PRICE_LINK = 1e9;

export const vrfCoodinatorV2 = async (hre: HardhatRuntimeEnvironment) => {
    const {
        deployments: { deploy, log },
        getNamedAccounts,
    } = hre;
    const args = [BASE_FEE, GAS_PRICE_LINK];
    const { deployer } = await getNamedAccounts();
    if (developmentChains.includes(network.name)) {
        log("Deploying vrf coordinator v2 ....");
        const vrfCoordinatorV2 = await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            args,
            waitConfirmations: 1,
            log: true,
        });
        log("vrf coordinator deployed");
    }
};

vrfCoodinatorV2.tags = ["all", "mocks"];
