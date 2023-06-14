import pinataSDK, { PinataPinResponse } from "@pinata/sdk";
import { resolve } from "path";
import fs from "fs";
import "dotenv/config";

const pinataApiKey = process.env.PINATA_API_KEY;
const pinataApiSecret = process.env.PINATA_API_SECRET;
const pinata = new pinataSDK(pinataApiKey, pinataApiSecret);

export async function uploadFilesToIPFS(dirPath: string) {
    const responses: PinataPinResponse[] = [];
    const relativePath = resolve(dirPath);
    let files = fs.readdirSync(relativePath);
    files = files.filter((file) => file.includes("jpg"));
    console.log("Deploying files to pinata...");
    console.log({ files });
    for (const file of files) {
        console.log(`Working on ${file}...`);
        try {
            const readStream = fs.createReadStream(`${relativePath}/${file}`);
            const response = await pinata.pinFileToIPFS(readStream, {
                pinataMetadata: { name: file },
            });
            responses.push(response);
        } catch (error) {
            console.error(error);
        }
    }
    console.log("Files deployed...");
    return { responses, files };
}

//uplad jsonmetadata to ipfs

export async function uploadJsonToIpfs(metadata: any): Promise<PinataPinResponse | null> {
    try {
        const response = await pinata.pinJSONToIPFS(metadata);
        return response;
    } catch (error) {
        console.error(error);
        return null;
    }
}
