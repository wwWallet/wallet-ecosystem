import { createServer } from 'http';
import { parse } from 'url';
import { getResolver as w3cDidKeyResolver } from 'key-did-resolver';
import { Resolver } from 'did-resolver';
import { getResolver as ebsiDidKeyResolver } from "@cef-ebsi/key-did-resolver";

const keyDidResolver = ebsiDidKeyResolver();
const didResolver = new Resolver(keyDidResolver);


const handler = async ({ req, res }) => {
    const parsedUrl = parse(req.url, true);

    const did = parsedUrl.pathname.split('/')[parsedUrl.pathname.split('/').length-1]; // Extract the string from the URL

    didResolver.resolve(did).then((didDocument) => {
        const jsonResponse = JSON.stringify(didDocument, null, 2);
        // Respond with the received string

        res.writeHead(200, { 'Content-Type': 'application/json' });

        // Send the JSON response
        res.end(jsonResponse);
    })
}


const server = createServer((req, res) => {
    // Parse the URL to extract the parameter
    handler({req, res});

});


const port = 4555;

server.listen(port, () => {
  console.log(`Server is listening at http://did-resolver-service:${port}`);
});