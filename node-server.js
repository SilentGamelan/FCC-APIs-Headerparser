// node-server.js
//
// Basic webserver created with vanilla node.js
// Recreates functionality found in server.js without using express

const http = require('http');
const URL = require('url'); 
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 3000;
const OK = 200;
const CLIENTERROR = 400
const NOTFOUND = 404
const SERVERERROR = 500
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
    

    req.on('error', (err) => {
        console.error(err, err.name, err.message);
        res.statusCode = CLIENTERROR;
        console.error(err, err.name, err.message);
        res.end('Error: Please contact the administrator');
    });

    let path = URL.parse(url, true).pathname;

    if(method === 'GET') {
        switch(path) {
            case '/':
                renderStaticPage("index.html", req, res);
                break;
            case ('/api/whoami'):
                parseHeader(headers, req, res);
                break;
            default:
                renderStaticPage(path, req, res);
                break;
        }
    }
        // !TODO
        // Read https://stackoverflow.com/questions/5823722/how-to-serve-an-image-using-nodejs
        // and
        //      https://stackoverflow.com/a/26354478
        // add ELSE to IF(method)
        // - delete node-router.js
        // - rewrite extension and path construction to use a dictionary of MIME types to remove need for case structure
        // - Fix 404 logic -> no PAGENAME variable, and think can be de-spaghettified
        /*
                extensions = {
            ".html" : "text/html",
            ".css" : "text/css",
            ".js" : "application/javascript",
            ".png" : "image/png",
            ".gif" : "image/gif",
            ".jpg" : "image/jpeg"
        };
        */
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});


function parseHeader(headers, req, res) {

    let ip = getIP(headers, req);

    res.writeHead(OK, { 'content-type': 'application/json'});
    let parsedHeader = {
        "ipaddress": ip,
        "language": headers["accept-language"],
        "software": headers["user-agent"]
    }
    res.write(JSON.stringify(parsedHeader));
    res.end();
}
   
function renderStaticPage(path, req, res) {
    
    const publicPath = "./public/";
    const viewsPath = "./views/";
    let contentType = "text/html";
    
    // extract the file extension, if any
    let ext = path.match(/\.([a-zA-Z]{1,4})$/);
   
    if(ext) {
        switch(ext[1]){
            case 'css':
                path = publicPath + path;
                contentType = 'text/css'
                break;
            case 'js': 
                path = publicPath + path;
                contentType = 'text/js';
                break;
            case 'html':
                path = viewsPath + path;
                contentType = 'text/html';
                break;
            case 'jpg':
            case 'jpeg':
                path = viewsPath + path;
                contentType = 'image/jpeg'
                break;
            case 'bmp':
                path = viewsPath + path;
                contentType = 'image/bmp'
            case 'gif':
            case 'ico':
                path = viewsPath + path;
                contentType = 'image/x-icon';
        }
    } 

    try {    
        fs.readFile(path, (err, data) => {
        
            let myErr = null;
            if(err) {myErr = err.code};
            
            switch(myErr) {
                case null:
                    res.writeHead(OK, {'content-type': contentType});
                    res.write(data);
                    res.end();
                    break;   
                case 'ENOENT':
                    if(pageName !== NOTFOUND+".html") {
                        renderStaticPage(NOTFOUND, req, res);
                    } else {
                        console.error("This is embarressing - our 404 page has gone missing...")
                        console.error(data, err.code, err.message);
                        res.writeHead(NOTFOUND);
                        res.write("404 - File not found");
                        res.end();
                    }
                case 'EACCES':
                    console.error("Problem reading from file");
                    console.error(data, err.code, err.message);
                    res.writeHead(SERVERERROR);
                    res.write("Cannot Access File: [" + SERVERERROR + "]");
                    res.end();
                default: 
                    console.error("Server Error: please contact the administrator");
                    console.error(data, err.code, err.message);
                }
            });
        } catch(e) {
            console.error("Unexpected Error encountered in file handler: \n", e.code, e.message);
    }
}


function getIP(headers, req) {
    return headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null);
}
