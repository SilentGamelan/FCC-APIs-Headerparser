// node-server.js
//
// Basic webserver created with vanilla node.js
// Recreates functionality found in server.js without using express
//
// 

// Setup Options
const http = require('http');
const URL = require('url'); 
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 3000;
const OK = 200;
const CLIENTERROR = 400
const NOTFOUND = 404
const SERVERERROR = 500

// Media content-types
const MIMETYPE = {
   '.html':  'text/html',
   '.css':   'text/css',
    ".js":    'text/js',
    '.jpg':  'img/jpeg',
    '.jpeg': 'img/jpeg',
    '.bmp':  'img/bmp',
    '.gif':  'img/gif',
    '.ico':  'img/x-icon'
};

// Configurable path names
const publicPath = "./public/";
const viewsPath = "./views/";

// Set expected file locations by type
const STATICPATH = {
    '.html':  viewsPath,
    '.css':   publicPath,
     ".js":   publicPath,
     '.jpg':  publicPath,
     '.jpeg': publicPath,
     '.bmp':  publicPath,
     '.gif':  publicPath,
     '.ico':  publicPath,
     '.ico':  publicPath
};
  

   
// Status code 200 = standard HTTP success response (OK)
// Content type = Message Body Information Header
// res.end() = end HTTP response, can send optional text only message

const server = http.createServer((req, res) => {
    // destructuring syntax -> { x, y } = obj 
    const { headers, method } = req;
    

    req.on('error', (err) => {
        console.error(err, err.name, err.message);
        res.statusCode = CLIENTERROR;
        console.error(err, err.name, err.message);
        res.end('Error: ' + CLIENTERROR);
    });

    // parses path from request and so will strip HTTP query strings
    // if required, remember to assign and pass them after this line
    let reqPath = URL.parse(req.url, true).pathname;  

    // Add more routes if required here
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


// Returns parsed header information as per FCC project requirements
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


// Attempt to render requested page based on URL given
// Will automatically handle pathing for files based upon extension using dictionary objects
// declared in main function
// 
// Will convert any incomplete or 'folder' request (ie; no extension given) by substituting in
// an .html request based on the last section of the URL path

function renderStaticPage(reqPath, req, res) {
    // Extracts requested file name from URL, if just a path given, reqFile will be falsey (returns {'',''})
    // Handles URLs ending in '/' or alphanumeric without extension, eg; 'main/about/aboutus' & 'main/about/aboutus/'
    //
    // Then extracts the file extension, if any, used to select correct MIME type and static path
    // if no extension, append html as default 
    //
    // Regex ensures ext only captured if file also present (xxx/.css won't be accepted)  
    
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

// IP info can appear in different places in header, checks likely locations
function getIP(headers, req) {
    return headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null);
}

