#! node

// Import all environment variables
require('dotenv').config();

// Import all external dependency
const express = require('express');
const parser  = require('body-parser');
const morgan  = require('morgan');
const loader  = require('require-dir');
const chalk   = require('chalk');

// Initialize expressjs webserver
var app = express();

// Middleware initialization
app.use(parser.json());
app.use(parser.urlencoded({ extended: false }));
app.use(morgan('combined'));
app.set('view engine', 'pug')
app.use(express.static('public'));

// Load all routes in express
var routes = loader('../routes');
Object.keys(routes).forEach((route) => {
    var message = "Loading route : "+route;
    message = chalk.green(message);
    console.log(message);
    app.use("/"+route,routes[route]);
});

// Load index page for application
app.get("/",(req,res,next) => {
    res.render('base',{});
});

// Page not found handle
/*app.use("*",(req,res,next) => {*/
    //res
        //.status(404)
        //.send("Route not found");
//});

//default channel

var channel = process.env.channel;

// Get port to listen on
var http_port = process.env.http_port;
http_port     = parseInt(http_port,10);

// Initiate http server
app.listen(http_port,() => {
    var message = "Server on port : "+http_port;
    message = chalk.red.bold(message);
    console.log(message);
});

// Export app for running tests
module.exports = app;
