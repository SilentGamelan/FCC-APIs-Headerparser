# API Project: Request Header Parser Microservice for freeCodeCamp - 
## *original version*

Successfully parses and returns the required HTTP header information, using node and express.

`server.js` and `headerParser.js` contain the express version, while `node-server` contains the result of my experiments to rewrite it using only node.

I made an alteration to the original structure, and placed the routing logic the separate `headerParser.js` file.

This glitch is currently set up to run the alternate version as default; please change the package.json to run the express version.

Both will return the same information


## *alternate version*

After completing the original project utilising express to set up the http server and routing behaviour, I was curious to see if I could acheive the same result while only using vanilla node.

It meets the user story succesfully, and is structured to easily allow the addition of other routes to other web-apps. Currently it also supports static pages, and is capable of serving scripts, css, and some image types.

I have implemented some try-catch error checking during the static page serving, and the code will automatically return a 404 page if a resource isn't found.

The directory structure is abstracted away from the URL entered by the user - so although a user might enter a long address, it will still resolve internal from the specified folders for static pages.

This introduces some unwanted behaviour, as its possible to use arbitary URL and all files in the static folders are currently accessible to the user - including scripts.

I intend to extent the server as a side-project at a later date in order to impose a virtual URL/directory structure which should prevent direct access to files without a page link.

NB: I kept the default boilerplate directory names of public and views to avoid any isses with FCC's automatic checks - going forward, I would likley use a more logical `/scripts` `/css` `/images` `/static` scheme.  

### User stories:
1. I can get the IP address, preferred languages (from header `Accept-Language`) and system infos (from header `User-Agent`) for my device.

#### Example usage:
* [base_url]/api/whoami

#### Example output:
* `{"ipaddress":"159.20.14.100","language":"en-US,en;q=0.5","software":"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:50.0) Gecko/20100101 Firefox/50.0"}`
