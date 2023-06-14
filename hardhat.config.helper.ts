import { BigNumber } from "ethers";
import { ethers } from "hardhat";

export type NetworkConfig = {
    [key: string]: {
        name: string;
        vrfCoordinatorV2?: string;
        gasLane: string;
        subscriptionId?: string;
        callbackGasLimit: string;
        mintFee: BigNumber;
    };
};

export const networkConfig: NetworkConfig = {
    11155111: {
        name: "sepolia",
        vrfCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
        subscriptionId: "2400",
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        callbackGasLimit: "500000",
        mintFee: ethers.utils.parseEther("0.01"),
    },
    31337: {
        name: "local",
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        callbackGasLimit: "500000",
        mintFee: ethers.utils.parseEther("0.01"),
    },
};

export const developmentChains = ["local", "hardhat"];
