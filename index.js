const express = require('express');
const path = require('path');

const auth = require('../shared_config/middleware/auth_middleware');
const adm = require('./middleware/account_data_middleware');

const app = express();
app.set('view engine', 'ejs');

const config_http = require('./config/http.json');
const routes = require('./routes/index');
const logger = require('./middleware/log');

logger.log("Using middleware.");
app.use(logger.http_log);
app.use(auth);
app.use(adm);
app.use(function(req, res, next) {
    res.setHeader("X-Nintendo-WhiteList", "1|https,res.cloudinary.com,,2|1|https,res.cloudinary.com,/dpkpng0q9/image/upload/v1712519157/paintings/,6");
    next();
});
app.use(function pjax(req, res, next) {
    req.pjax = !!req.header('X-PJAX');
    res.locals.pjax = req.pjax;
    next();
});
app.use(express.static(path.join(__dirname, "../CDN_Files/")));
app.use(express.static(path.join(__dirname, "./static")));

logger.log("Creating all portal routes.");
for (const route of routes) app.use(route.path, route.route);

logger.log("Creating 503 error handler.");
app.use((err, req, res, next) => {
    res.render("pages/error/error_503", { err });
});

logger.log("Creating 404 error handler.");
app.use((req, res) => {
    if (/js|css|img|lang/.test(req.path)) {
        return res.send({ error: "The requested file could not be found", file: req.path });
    }
    res.render("pages/error/error_404", { account: req.account });
});

const port = Number(process.env.PORT || config_http.port || 8081);
let environment;
try {
    environment = JSON.parse(process.env.ENVIRONMENT || '{"ENV_NAME":"development"}');
} catch {
    environment = { ENV_NAME: 'development' };
}

app.listen(port, () => {
    console.log("[INFO] Current Environment: %s. Listening on port %d".green, environment.ENV_NAME, port);
});
