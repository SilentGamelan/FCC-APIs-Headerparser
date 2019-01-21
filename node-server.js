// node-server.js
//
// Basic webserver created with vanilla node.js
// Recreates functionality found in server.js without using express
//
// 

const http = require('http');
const URL = require('url'); 
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 3000;
const OK = 200;
const CLIENTERROR = 400
const NOTFOUND = 404
const SERVERERROR = 500

const MIMETYPE = {
   '.html':  'text/html',
   '.css':   'text/css',
    ".js":    'text/js',
    '.jpg':  'img/jpeg',
    '.jpeg': 'img/jpeg',
    '.bmp':  'img/bmp',
    '.gif':  'img/gif',
    '.ico':  null
    //'.ico':  'img/x-icon'
};

const publicPath = "./public/";
const viewsPath = "./views/";

const STATICPATH = {
    '.html':  viewsPath,
    '.css':   publicPath,
     ".js":   publicPath,
     '.jpg':  publicPath,
     '.jpeg': publicPath,
     '.bmp':  publicPath,
     '.gif':  publicPath,
     '.ico':  null
     //'.ico':  publicPath
};
  

   
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
    const { headers, method } = req;
    

    req.on('error', (err) => {
        console.error(err, err.name, err.message);
        res.statusCode = CLIENTERROR;
        console.error(err, err.name, err.message);
        res.end('Error: ' + CLIENTERROR);
    });

    
    let reqPath = URL.parse(req.url, true).pathname;  

    if(method === 'GET') {
        switch(reqPath) {
            case '/':
                renderStaticPage("/index.html", req, res);
                break;
            case ('/api/whoami'):
                parseHeader(headers, req, res);
                break;
            default:
                renderStaticPage(reqPath, req, res);
                break;
        }
    } else {
        // TODO
        res.writeHead(500)
        res.write("Method Not Supported Yet")
        res.end();
    }
       
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
   
function renderStaticPage(reqPath, req, res) {
    // Extract requested file, if just a path given, reqFile will be falsey (returns {'',''})
    // (splits the path from the final file if any)
    // Extract the file extension, if any, used to select correct MIME type and static path
    // if no extension, append html as default
    

    // Regex ensures ext only captured if file also present (xxx/.css won't be accepted)  
    // reqFile.match(/\/\w+\.([a-zA-Z]{1,4})$/); -> Wasn't working, made changes to path/file handling
/*
    if(reqFile[1]) {
        var ext = reqFile.match(/\.([a-zA-Z]{1,4})$/)[1];
        reqPath = STATICPATH[ext] + reqFile;
    } else {
        // if no file specified, sub in a {last_node_of_pathname}.html
        // so /cheese/crackers -> /cheese/crackers/crackers.html
        var ext = 'html';
        reqPath = STATICPATH[ext] + reqPath.split('/').pop() + ".html"
    }
*/
    
    let splitPath = reqPath.split("/");

    var reqFile = splitPath.slice(-1).pop();
    if(!reqFile) {
        reqFile = splitPath[splitPath.length - 1];
    } 

    let ext = reqPath.match(/(\.[a-zA-Z]{1,4})$/);

    if(!ext) {
        ext = ".html";
        reqFile = reqFile + ext;
    } else {
        ext = ext.pop();
    }

    
    let contentType = MIMETYPE[ext];
    
    if(!contentType) {
        res.writeHead(SERVERERROR);
        console.error("ERROR: Content Type Not Supported");
        res.write("ERROR: Content Type Not Supported");
        res.end();
        return;
    }
    
    let reqURL = STATICPATH[ext] + reqFile;

    try {    
        fs.readFile(reqURL, (err, data) => {
        
            let myErr = null;
            if(err) {myErr = err.code};
            
            switch(myErr) {
                case null:
                    res.writeHead(OK, {'content-type': contentType});
                    res.write(data);
                    res.end();
                    break;   
                case 'ENOENT':
                    if(reqFile !== NOTFOUND + ".html") {
                        renderStaticPage("/404.html", req, res);
                    } else {
                        console.error("This is embarressing - our 404 page has gone missing...")
                        console.error(data, err.code, err.message);
                        res.writeHead(NOTFOUND);
                        res.write("404 - File not found");
                        res.end();
                    }
                    break;
                case 'EACCES':
                    console.error("Problem reading from file");
                    console.error(data, err.code, err.message);
                    res.writeHead(SERVERERROR);
                    res.write("Cannot Access File: [" + SERVERERROR + "]");
                    res.end();
                default: 
                    console.error("Server Error: please contact the administrator");
                    console.error(data, err.code, err.message);
                    break;
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

