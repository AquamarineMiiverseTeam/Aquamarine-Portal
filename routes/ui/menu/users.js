const express = require('express');
const route = express.Router();
const xmlbuilder = require('xmlbuilder');
const moment = require('moment');

const util = require('util')

const database_query = require('../../../../Aquamarine-Utils/database_query');
const common = require('../../../../Aquamarine-Utils/common')

route.get("/:nnid", async (req, res, next) => {
    try {
        var account;
        if (req.params.nnid == "@me") {
            account = await common.account.getAccountByNNID(req.account[0].nnid);
        } else {
            account = await common.account.getAccountByNNID(req.params.nnid);
        }
        
        //If the account doesn't exist, render a 404.
        if (!account[0]) { res.render("pages/error/error_404"); return;}

        //If the account page is being visited by the same user, send a @me
        if (req.account[0].nnid == account[0].nnid) {
            res.render("pages/users_@me", {
                account : req.account,
                view_account : account[0]
            });

            return;
        }


        res.render("pages/users_visitor", {
            account : account
        })
    } catch (err) {
        next(err)
    }
})

module.exports = route;