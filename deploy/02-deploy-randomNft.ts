import { ethers, network } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, networkConfig } from "../hardhat.config.helper";
import { VRFCoordinatorV2Mock } from "../typechain-types";
import { uploadFilesToIPFS, uploadJsonToIpfs } from "../utils/uploadIPFS";
import { verify } from "../utils/verify";

const tokenMetadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [{ trait_types: "rarity", value: 100 }],
};

const FUND_LINK_AMOUNT = ethers.utils.parseUnits("10");
let nftUris: string[] = [
    "ipfs://QmdG1pW9pQNZQo9HxupQkQAo6E9FphJLxx45TQDsHAaZPn",
    "ipfs://QmTKDLnaJAKQCvR5F64Grav2WPkbkvvVvV5mwu7SgdEz96",
    "ipfs://Qmdu9QT6KX6z3LTFfW9KR1HFGJAw91F9CAmaam4irLM9Lh",
    "ipfs://Qmangrbqwsy3aGHfgwqDcy1LiYzrC1jfqh93XAfbSokD4B",
];

const randomNFT = async (hre: HardhatRuntimeEnvironment) => {
    const {
        deployments: { deploy, log },
        getNamedAccounts,
    } = hre;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId ?? "";
    let vrfCoordinatorV2Address: string;
    let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock | undefined = undefined;
    let subscriptionId: string;
    const gasLane = networkConfig[chainId].gasLane;
    const callbackGasLimit = networkConfig[chainId].callbackGasLimit;
    const mintFee = networkConfig[chainId].mintFee;

    if (process.env.DEPLOY_IPFS === "true") {
        nftUris = await handleNftUris();
    }

    if (developmentChains.includes(network.name)) {
        vrfCoordinatorV2Mock = (await ethers.getContract(
            "VRFCoordinatorV2Mock"
        )) as VRFCoordinatorV2Mock;
        if (!vrfCoordinatorV2Mock) return;
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
        const tx = await vrfCoordinatorV2Mock.createSubscription();
        const { events } = await tx.wait(1);
        subscriptionId = events ? events[0].args?.subId : "";

        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_LINK_AMOUNT);
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2!;
        subscriptionId = networkConfig[chainId].subscriptionId!;
    }

    const args = [
        vrfCoordinatorV2Address,
        subscriptionId,
        gasLane,
        callbackGasLimit,
        nftUris,
        mintFee,
    ];

    const randomNFT = await deploy("RandomNft", {
        from: deployer,
        args,
        log: true,
        waitConfirmations: 1,
    });

    if (vrfCoordinatorV2Mock) {
        vrfCoordinatorV2Mock.addConsumer(subscriptionId, randomNFT.address);
    }
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(randomNFT.address, args);
    }
};

//handle nft uris => uris
// deplioy images
// deploy token uris

async function handleNftUris() {
    const dirPath = "./images";
    const { responses: fileResponse, files } = await uploadFilesToIPFS(dirPath);
    const nftUris: string[] = [];
    await Promise.all(
        fileResponse.map(async (response, responseIdx) => {
            const metadata = {
                ...tokenMetadataTemplate,
                name: files[responseIdx].replace(".jpg", ""),
                description: "Incredible helios doggy nft",
                image: `ipfs://${response.IpfsHash}`,
            };
            console.log(`working on ${metadata.name}...`);
            const jsonResponse = await uploadJsonToIpfs(metadata);
            if (!jsonResponse) return;
            const { IpfsHash } = jsonResponse;
            nftUris.push(IpfsHash);
        })
    );
    console.log({ nftUris });
    return nftUris;
}
export default randomNFT;
randomNFT.tags = ["all", "nftipfs", "main"];
