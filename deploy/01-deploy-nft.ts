import { HardhatRuntimeEnvironment } from "hardhat/types";

const HiosNft = async (hre: HardhatRuntimeEnvironment) => {
    const {
        getNamedAccounts,
        deployments: { log, deploy },
    } = hre;

    const deployer = (await getNamedAccounts()).deployer;

    log("deploying nft");
    const hiosNft = await deploy("HiosNft", {
        from: deployer,
        log: true,
    });
    log("Hios Token deployed");
};

export default HiosNft;
HiosNft.tags = ["all", "token"];
