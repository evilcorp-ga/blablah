// Require all external lib
const express = require('express');

// Get instance to router
var router = express.Router();

/**
 * Pretty useless route just to check
 * on server status
 */
router.get("/",(req,res,next)=>{
    res.send("<!DOCTYPE html><html><head><title>blablah chat</title></head><body>\n\n");
});


module.exports = router;
