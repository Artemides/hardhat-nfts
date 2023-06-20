import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains } from "../hardhat.config.helper";
import { ethers, network } from "hardhat";
import { verify } from "../utils/verify";
const BASE_FEE = ethers.utils.parseEther("0.25");
const GAS_PRICE_LINK = 1e9;

const V3_AGGREGATOR_DECIMAL = 18;
const V3_AGGREGATOR_INITAL_ANSWER = ethers.utils.parseUnits("1724", "ether");

const vrfCoodinatorV2 = async (hre: HardhatRuntimeEnvironment) => {
    const {
        deployments: { deploy, log },
        getNamedAccounts,
    } = hre;
    const args = [BASE_FEE, GAS_PRICE_LINK];
    const { deployer } = await getNamedAccounts();
    if (developmentChains.includes(network.name)) {
        log("Deploying vrf coordinator v2 ....");
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            args,
            waitConfirmations: 1,
            log: true,
        });
        log("vrf coordinator deployed");
        log("Deploying MockV3Aggretator...");
        await deploy("MockV3Aggregator", {
            from: deployer,
            args: [V3_AGGREGATOR_DECIMAL, V3_AGGREGATOR_INITAL_ANSWER],
            log: true,
            waitConfirmations: 1,
        });
    }
};

export default vrfCoodinatorV2;

vrfCoodinatorV2.tags = ["all", "mocks"];
