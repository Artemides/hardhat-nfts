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
    const files = fs.readdirSync(relativePath);
    console.log({ files });
    console.log("Deploying files to pinata...");
    for (const file in files) {
        console.log(`Working on ${file}`);
        try {
            const readStream = fs.createReadStream(file);
            const response = await pinata.pinFileToIPFS(readStream);
            responses.push(response);
        } catch (error) {
            console.error(error);
        }
    }
    return { responses, files };
}
