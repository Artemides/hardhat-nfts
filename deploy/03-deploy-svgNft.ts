import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains } from "../hardhat.config.helper";
import { ethers, network } from "hardhat";

const svgHiosToken = async (hre: HardhatRuntimeEnvironment) => {
    const {
        getNamedAccounts,
        deployments: { deploy, log },
    } = hre;

    //build args
    if (developmentChains.includes(network.name)) {
        //deploy mock
        const mockV3Aggregator = await ethers.getContract("MockV3Aggregator");
    } else {
        //get testnet args
    }
};
