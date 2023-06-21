import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy";
import "solidity-coverage";
import "dotenv/config";

const localhostRpcUrl = process.env.LOCALHOST_RPC_URL || "";
const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL || "";
const metamaskAccountAddress = process.env.METAMASK_PRIVATE_KEY || "";
const etherscanApiKey = process.env.ETHERSCAN_API_KEY || "";
const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
        },
        localhost: {
            url: localhostRpcUrl,
            chainId: 31337,
        },
        sepolia: {
            url: sepoliaRpcUrl,
            chainId: 11155111,
            accounts: [metamaskAccountAddress],
        },
    },
    etherscan: {
        apiKey: etherscanApiKey,
    },
    solidity: {
        compilers: [
            {
                version: "0.8.0",
            },
            {
                version: "0.8.8",
            },
        ],
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
};

export default config;
