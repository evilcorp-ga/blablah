// Require all external lib
const express = require('express');
const session = require('../lib/session');

// Get instance to router
var router = express.Router();

/**
 * Pretty useless route just to check
 * on server status
 */
router.get("/chat/:id",(req,res,next)=>{
    var sess_id = new session("irc.evilcorp.ga",6667);
    sess_id
        .get_logs(req.params.id)
        .then((logs) => {
            res.render("frames/chat",{"logs":logs});
        })
        .catch((err) => {
            res.status(400).send(err.message);
        });
});

router.get("/message/:id",(req,res,next)=>{
    res.render("frames/message",{});
});

router.get("/controls/:id",(req,res,next)=>{
    res.render("frames/controls",{});
});


module.exports = router;
