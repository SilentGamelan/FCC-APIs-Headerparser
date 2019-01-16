// headerParser.js
// handles routing and logic to extract and show header info

const express = require('express');
const router = express.Router();


// your first API endpoint... 
router.get("/api/hello", function (req, res) {
    res.json({greeting: 'hello API'});
  });
  
router.get("/api/whoami", (req, res) => {
    // use req.get() to access header of known name
    // req.headers to access the array containing all headers
    let parsedHeader = {
        "ipaddress": req.ip,
        "language": req.get("accept-language"),
        "software": req.get("user-agent")
    }
    console.log(req.headers);
    res.json(parsedHeader);
});

module.exports = router;