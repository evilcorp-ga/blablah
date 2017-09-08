// Require all external lib
const express = require('express');

// Get instance to router
var router = express.Router();

/**
 * Pretty useless route just to check
 * on server status
 */
router.get("/chat",(req,res,next)=>{
    res.render("frames/chat",{});
});

router.get("/controls",(req,res,next)=>{
    res.render("frames/controls",{});
});


module.exports = router;
