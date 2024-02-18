const express = require('express');
const path = require('path');

const auth = require('../Aquamarine-Utils/middleware/auth_middleware');
const adm = require('../Aquamarine-Utils/middleware/account_data_middleware')
const pjax = require("express-pjax")

const app = express();
app.set('view engine', 'ejs');

const config_http = require('./config/http.json');

//Grab index of all routes and set them in our express app
const routes = require('./routes/index');

//Grab logger middleware and use it. (Logs all incoming HTTP/HTTPS requests)
const logger = require('./middleware/log');

logger.log("Using middleware.")

app.use(logger.http_log);

app.use(auth);
app.use(adm);
app.use(function pjax(req, res, next) {
    if (req.header('X-PJAX')) {
        req.pjax = true;
        res.locals.pjax = true;
    } else {
        req.pjax = false;
        res.locals.pjax = false;
    }
    next();
})
app.use(express.static(path.join(__dirname, "../CDN_Files/")));
app.use(express.static(path.join(__dirname, "./static")));

logger.log("Creating all portal routes.");

for (const route of routes) {
    app.use(route.path, route.route)
}

logger.log("Creating 503 error handler.");

app.use((err, req, res, next) => {
    //If an error occured with rendering the page, then load a 503
    res.render("pages/error/error_503", {
        err: err
    });
});

logger.log("Creating 404 error handler.");

app.use((req, res, next) => {
    //If the requested file isn't avaliable, then return a JSON containing the error.
    if (req.path.includes("js") || req.path.includes("css") || req.path.includes("img") || req.path.includes("lang")) { res.send({ error: "The requested file could not be found", file: req.path }); return; }

    //If the page just couldn't be found altogether, return a 404 error page.
    res.render("pages/error/error_404");

    return;
});

//Set our app to listen on the config port
app.listen(config_http.port, () => {
    console.log("[INFO] Listening on port %d".green, config_http.port);
})
