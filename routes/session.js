// Require all external lib
const express = require('express');
const session = require('../lib/session');

// Get instance to router
var router = express.Router();

/**
 * Create new session connection
 */
router.post("/new",(req,res,next)=>{
    var sess_id = new session("irc.evilcorp.ga",6667);
    sess_id
        .create_new()
        .then(() => sess_id.commit_connection() )
        .then(() => sess_id.attach_handle() )
        .then(() => sess_id.set_user(req.body.username) )
        .then(() => {
            res.send("Connected ...");
        })
        .catch((err)=> {
            res.status(400).send(err.message);
        });
});


module.exports = router;
