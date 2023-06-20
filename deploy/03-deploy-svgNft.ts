import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, networkConfig } from "../hardhat.config.helper";
import { ethers, network } from "hardhat";
import fs from "fs";
import { verify } from "../utils/verify";
const svgHiosToken = async (hre: HardhatRuntimeEnvironment) => {
    const {
        getNamedAccounts,
        deployments: { deploy, log },
    } = hre;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId ?? "";
    let sadTokenSvg = fs.readFileSync("./images/svg/sad.svg", { encoding: "utf8" });
    let happyTokenSvg = fs.readFileSync("./images/svg/happy.svg", { encoding: "utf8" });
    let pricefeedAddress;
    let args = [];

    if (developmentChains.includes(network.name)) {
        //deploy mock
        const mockV3Aggregator = await ethers.getContract("MockV3Aggregator");
        pricefeedAddress = mockV3Aggregator.address;
    } else {
        pricefeedAddress = networkConfig[chainId].priceFeedAddress;
    }

    args = [pricefeedAddress, sadTokenSvg, happyTokenSvg];

    const svgHiosToken = await deploy("SvgHiosToken", {
        from: deployer,
        args,
        log: true,
        waitConfirmations: 1,
    });

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("verifying svgHiosToken...");
        await verify(svgHiosToken.address, args);
        log("svgHiosToken verified");
    }
};

export default svgHiosToken;

svgHiosToken.tags = ["all", "mocks", "svgNft"];
