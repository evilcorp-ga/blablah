// Require all external lib
const express = require('express');

// Get instance to router
var router = express.Router();

/**
 * Pretty useless route just to check
 * on server status
 */
router.get("/:id",(req,res,next)=>{
    res.render("chat",{"id": req.params.id});
});


module.exports = router;
