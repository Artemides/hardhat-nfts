import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains } from "../hardhat.config.helper";
import { network } from "hardhat";
import { verify } from "../utils/verify";

const etherscanApiKey = process.env.ETHERSCAN_API_KEY || "";

const HiosNft = async (hre: HardhatRuntimeEnvironment) => {
    const {
        getNamedAccounts,
        deployments: { log, deploy },
    } = hre;

    const deployer = (await getNamedAccounts()).deployer;

    log("deploying nft");
    const hiosNft = await deploy("HiosNft", {
        from: deployer,
        args: [],
        log: true,
    });

    if (!developmentChains.includes(network.name) && etherscanApiKey) {
        await verify(hiosNft.address, []);
        log("Contract verified.");
    }
    log("Hios Token deployed");
};

export default HiosNft;
HiosNft.tags = ["all", "token"];
