import { run } from "hardhat";

export const verify = async (contractAddress: string, constructorArguments: any[]) => {
    console.log("verifying contract on etherscan...");
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments,
        });
    } catch (e: any) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!");
        } else {
            console.log(e);
        }
    }
};
