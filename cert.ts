
import * as selfsigned from 'selfsigned';
import * as fs from "node:fs";
import type {SelfsignedOptions} from "selfsigned";

const notAfterDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

const caOptions: SelfsignedOptions = { notAfterDate };

async function generateTrueChain() {
    console.log('Generation mTLS...');

    const caAttrs = [{ name: 'commonName', value: 'AltVerse' }];
    const ca = await selfsigned.generate(caAttrs, caOptions);
    fs.writeFileSync('root.pem', ca.cert);

    const serverAttrs = [{ name: 'commonName', value: 'localhost' }];
    const serverPems = await selfsigned.generate(serverAttrs, {
        notAfterDate,
        ca: { key: ca.private, cert: ca.cert }
    });
    fs.writeFileSync('server-key.pem', serverPems.private);
    fs.writeFileSync('server.pem', serverPems.cert);

    const clientAttrs = [{ name: 'commonName', value: 'grpc-client' }];
    const clientPems = await selfsigned.generate(clientAttrs, {
        notAfterDate,
        ca: { key: ca.private, cert: ca.cert }
    });
    fs.writeFileSync('client-key.pem', clientPems.private);
    fs.writeFileSync('client.pem', clientPems.cert);

    console.log('Successfully generated certificates!');
}

generateTrueChain();