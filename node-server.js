// node-server.js
//
// Basic webserver created with vanilla node.js
// Recreates functionality found in server.js without using express

const http = require('http');
const URL = require('url'); 
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 3000;

/*
// Status code 200 = standard HTTP success response (OK)
// Content type = Message Body Information Header
// res.end() = end HTTP response, can send optional text only message

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World\n');
});
*/

const server = http.createServer((req, res) => {
    // destructuring syntax -> { x, y } = obj 
    const { headers, method, url } = req;
    const OK = 200;

    req.on('error', (err) => {
        console.error(err);
        res.statusCode = 400;
        res.end('Error: Please contact the administrator');
    });

    res.on('error', (err) => {
        console.log(err);
    })

    let path = URL.parse(url, true).pathname;
    let ip = headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            (req.connection.socket ? req.connection.socket.remoteAddress : null);
    
      
    if(method === 'GET') {
        switch(path) {
            case '/':
                break;
            case ('/api/whoami'):
                res.writeHead(OK, { 'content-type': 'application/json'});
                let parsedHeader = {
                    "ipaddress": ip,
                    "language": headers["accept-language"],
                    "software": headers["user-agent"]
                }
                res.write(JSON.stringify(parsedHeader));
                // res.end()?
            default:
                
        }
    }
        // TODO
        // - encapsulate routing into functions to simplify switch 
        // - serve static page with css for main
        // - have a 404 response as default
        // - delete node-router.js
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});