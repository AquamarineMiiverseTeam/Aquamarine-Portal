const express = require('express');
const route = express.Router();
const moment = require('moment');

const db_con = require("../../../../shared_config/database_con")
const country2name = require("../../../code_2_country.json")

route.get("/", async (req, res, next) => {
try {
    const account = (await db_con.account_db("accounts").where({nnid : req.account[0].nnid}))[0];
    if (!account) {res.render("pages/error/error_404"); return;}

        res.render("pages/activity_feed", {
            account : req.account,
        });

        return;
} catch (err) {
    next(err)
}
})

module.exports = route;