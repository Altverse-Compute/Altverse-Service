import * as fs from "node:fs";
import { Env } from "./env.ts";

interface Certificates {
    caCert: Buffer;
    serviceKey: Buffer;
    serviceCert: Buffer;
}

export default function loadCertificate(): Certificates {
    return {
        caCert: fs.readFileSync(Env.caCert),
        serviceKey: fs.readFileSync(Env.serviceKey),
        serviceCert: fs.readFileSync(Env.serviceCert),
    };
}
