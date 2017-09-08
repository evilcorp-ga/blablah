// Require all external lib
const express = require('express');

// Get instance to router
var router = express.Router();

/**
 * Pretty useless route just to check
 * on server status
 */
router.get("/",(req,res,next)=>{
    res.status(200).end();
});


module.exports = router;
