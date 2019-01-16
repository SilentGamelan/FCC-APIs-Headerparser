// headerParser.js
// handles routing and logic to extract and show header info

const express = require('express');
const router = express.Router();


// your first API endpoint... 
router.get("/api/hello", function (req, res) {
    res.json({greeting: 'hello API'});
  });
  


module.exports = router;