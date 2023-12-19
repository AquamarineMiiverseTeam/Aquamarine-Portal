//DO NOT REMOVE COLORS

const moment = require('moment');
const colors = require('colors');

function log(req, res, next) {
    switch (req.method) {
        case "GET":
            console.log(`[${req.method}] (${moment().format("HH:mm:ss")}) ${req.url}`.green);
            break;
        
        case "DELETE":
            console.log(`[${req.method}] (${moment().format("HH:mm:ss")}) ${req.url}`.red);
            break;
        
        case "POST":
            console.log(`[${req.method}] (${moment().format("HH:mm:ss")}) ${req.url}`.yellow);
            break;

        case "PUT":
            console.log(`[${req.method}] (${moment().format("HH:mm:ss")}) ${req.url}`.magenta);
            break;

        case "PATCH":
            console.log(`[${req.method}] (${moment().format("HH:mm:ss")}) ${req.url}`.cyan);
            break;

        case "OPTIONS":
            console.log(`[${req.method}] (${moment().format("HH:mm:ss")}) ${req.url}`.blue);
            break;
        default:
            break;
    }

    next();
}

module.exports = log;