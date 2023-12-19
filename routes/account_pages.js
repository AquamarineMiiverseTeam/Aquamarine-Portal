const express = require('express');
const route = express.Router();
const xmlbuilder = require('xmlbuilder');
const moment = require('moment');

route.get("/create_account", (req, res) => {
    res.render("account/create_account.ejs");
});

route.get("/account_created", (req, res) => {
    res.render("account/account_created.ejs");
})

module.exports = route;