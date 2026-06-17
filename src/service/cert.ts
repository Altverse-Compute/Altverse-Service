import * as fs from "node:fs";
import { Env } from "./env.ts";

interface Certificates {
    server: Buffer;
    serverKey: Buffer;
    root: Buffer;
}

export default function loadCertificate(): Certificates {
    return {
        server: fs.readFileSync(Env.serverCertFileName),
        serverKey: fs.readFileSync(Env.serverKeyCertFileName),
        root: fs.readFileSync(Env.rootCertFileName),
    };
}
