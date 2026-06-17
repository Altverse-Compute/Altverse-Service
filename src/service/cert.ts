import * as fs from "node:fs";
import { Env } from "./env.ts";

interface Certificates {
    cert: Buffer;
    private: Buffer;
}

export default function loadCertificate(): Certificates {
    return {
        cert: fs.readFileSync(Env.certFileName),
        private: fs.readFileSync(Env.privateFileName),
    };
}
