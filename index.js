const express = require('express');
const path = require('path');

const auth = require('../shared_config/middleware/auth_middleware');
const adm = require('./middleware/account_data_middleware')

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
app.use(function(req, res, next) {
    res.setHeader("X-Nintendo-WhiteList", "1|http,.aquamarine.lol,,2|1|https,.aquamarine.lol,,2|1|http,.cloudinary.com,,2|1|https,.cloudinary.com,,2|1|https,kaeru.b-cdn.net,,2|1|https,cdn.jsdelivr.net,,2|1|http,kt-imogen.b-cdn.net,,2|1|http,youtube.com,,2|http,portal.cdn.pretendo.cc,,2|https,portal.cdn.pretendo.cc,,2|http,pretendo-cdn.b-cdn.net,,2|https,pretendo-cdn.b-cdn.net,,2|https,youtube.com,,2|http,.youtube.com,,2|https,.youtube.com,,2|http,.ytimg.com,,2|https,.ytimg.com,,2|http,.googlevideo.com,,2|https,.googlevideo.com,,2|https,youtube.com,/embed/,6|https,youtube.com,/e/,6|https,youtube.com,/v/,6|https,www.youtube.com,/embed/,6|https,www.youtube.com,/e/,6|https,www.youtube.com,/v/,6|https,youtube.googleapis.com,/e/,6|https,youtube.googleapis.com,/v/,6|http,maps.googleapis.com,/maps/api/streetview,2|https,maps.googleapis.com,/maps/api/streetview,2|http,cbk0.google.com,/cbk,2|https,cbk0.google.com,/cbk,2|http,cbk1.google.com,/cbk,2|https,cbk1.google.com,/cbk,2|http,cbk2.google.com,/cbk,2|https,cbk2.google.com,/cbk,2|http,cbk3.google.com,/cbk,2|https,cbk3.google.com,/cbk,2|https,.cloudfront.net,,2|https,www.google-analytics.com,/,2|https,stats.g.doubleclick.net,,2|https,www.google.com,/ads/,2|https,ssl.google-analytics.com,,2|http,fonts.googleapis.com,,2|fonts.googleapis.com,,2|https,www.googletagmanager.com,,2|http,miiverse.cc,,2|https,miiverse.cc,,2")
    next()
})
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
    res.render("pages/error/error_404", {
        account : req.account
    });

    return;
});

//Set our app to listen on the config port
app.listen(process.env.PORT, () => {
    console.log("[INFO] Current Environment: %s. Listening on port %d".green, JSON.parse(process.env.ENVIRONMENT)['ENV_NAME'], process.env.PORT);
})
