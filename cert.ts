
import * as selfsigned from 'selfsigned';
import * as fs from "node:fs";
import * as forge from 'node-forge'
import type {SelfsignedOptions} from "selfsigned";

const notAfterDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);


const caOptions: SelfsignedOptions = { notAfterDate,
    extensions: [
        // List of extensions @ https://github.com/digitalbazaar/forge/blob/main/lib/x509.js#L1515
        { name: 'basicConstraints', cA: true },
        {
            name: 'keyUsage',
            keyCertSign: true,
            digitalSignature: true,
            nonRepudiation: true,
            keyEncipherment: true,
            dataEncipherment: true
        },

        {
            // Alt name types @ https://github.com/digitalbazaar/forge/blob/main/lib/x509.js#L1453
            // https://github.com/digitalbazaar/forge/blob/main/lib/oids.js
            // https://www.entrust.com/blog/2019/03/what-is-a-san-and-how-is-it-used/
            name: 'subjectAltName',
            altNames: [{
                type: 2,
                value: 'localhost'
            }, {
                type: 7,
                value: '127.0.0.1'
            }, {
                type: 7,
                value: '0.0.0.0'
            }]
        }]
};

async function generateTrueChain() {
    console.log('Generation mTLS...');

    const caAttrs = [
        { name: 'commonName', value: 'AltVerse' }, {
            name: 'countryName',
            value: 'UK'
        }];
    const ca = await selfsigned.generate(caAttrs, caOptions);
    fs.writeFileSync('private.pem', ca.private);
    fs.writeFileSync('cert.pem', ca.cert);

    console.log('Successfully generated certificates!');
}

generateTrueChain();