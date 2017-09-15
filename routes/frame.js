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
    if( req.query.channel === undefined || req.query.channel === "")
        req.query.channel = "#lobby";
    sess_id
        .get_users(req.params.id, req.query.channel)
        .then(()=> sess_id.get_logs(req.params.id))
        .then((conn) => {
            res.render("frames/chat",{"id": req.params.id, "logs":conn.logs,"users":conn.users});
        })
        .catch((err) => {
            res.status(400).render("frames/controls",{
                "id": req.params.id,
                "error": "Invalid or expired session"
            });
        });
});

/**
 * Post new message
 */
router.post("/message/:id",(req,res,next)=>{
    if( req.query.channel === undefined || req.query.channel === "") 
        req.query.channel = "#lobby";
    var cmd = req.body.command;
    var channel = req.query.channel;
    var sess_id = new session("irc.evilcorp.ga",6667);
    if( req.query.channel === undefined || req.query.channel === null) 
        req.query.channel = "#lobby";
    sess_id
        .send_message(req.params.id,cmd,channel)
        .then((resp) => {
            res.render("frames/message",{
                'id': req.params.id,
                'channel': req.query.channel
            });
        })
        .catch((err) => {
            res.render("frames/message",{
                'err':err.message,
                'id': req.params.id,
                'channel': req.query.channel
            });
        });
});

/**
 * Form to post new message
 */
router.get("/message/:id",(req,res,next)=>{
    if( req.query.channel === undefined || req.query.channel === null) 
        req.query.channel = "#lobby";
    res.render("frames/message",{
        "id": req.params.id,
        "channel": req.query.channel
    });
});

router.get("/controls/:id",(req,res,next)=>{
    res.render("frames/controls",{"id":req.params.id});
});

router.post("/controls/:id",(req,res,next)=>{
    var sess_id = new session("irc.evilcorp.ga",6667);
    sess_id
        .logout(req.params.id)
        .then(()=> {
            res.redirect("/");
        })
        .catch((err)=> {
            res.send(err.message);
        });
});

module.exports = router;
