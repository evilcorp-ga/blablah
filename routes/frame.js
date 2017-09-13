// Require all external lib
const express = require('express');
const session = require('../lib/session');

// Get instance to router
var router = express.Router();

/**
 * List all messages and render them
 */
router.get("/chat/:id",(req,res,next)=>{
    var sess_id = new session("irc.evilcorp.ga",6667);
    sess_id
        .get_logs(req.params.id)
        .then((conn) => {
            res.render("frames/chat",{"logs":conn.logs,"users":conn.users});
        })
        .catch((err) => {
            res.status(400).send(err.message);
        });
});

/**
 * Post new message
 */
router.post("/message/:id",(req,res,next)=>{
    var cmd = req.body.command;
    var sess_id = new session("irc.evilcorp.ga",6667);
    sess_id
        .send_message(req.params.id,cmd)
        .then((resp) => {
            res.render("frames/message",{'id': req.params.id});
        })
        .catch((err) => {
            res.render("frames/message",{'err':err.message,'id': req.params.id});
        });
});

/**
 * Form to post new message
 */
router.get("/message/:id",(req,res,next)=>{
    res.render("frames/message",{"id": req.params.id});
});

/**
 * Not sure what this is yet
 * and i don't care xD
 */
router.get("/controls/:id",(req,res,next)=>{
    res.render("frames/controls",{});
});


module.exports = router;
