const express = require('express');
const route = express.Router();
const moment = require('moment');

const db_con = require("../../../../Aquamarine-Utils/database_con")
const country2name = require("../../../../Aquamarine-Utils/code_2_country.json")

route.get("/:nnid", async (req, res, next) => {
    try {
        const nnid = (req.params.nnid === "@me") ? req.account[0].nnid : req.params.nnid

        const account = (await db_con("accounts").where({nnid : nnid}))[0]
        //If the account doesn't exist, render a 404.
        if (!account) { res.render("pages/error/error_404"); return;}

        account.favorited_communities = await db_con("favorites").where({account_id : account.id})
        account.yeahs_recieved = (await db_con("posts")
        .select("posts.id").where({"posts.account_id" : account.id})
        .innerJoin("empathies", "empathies.post_id", "=", "posts.id")).length
        account.posts = await db_con("posts").where({account_id : account.id})
        account.country_name = country2name[account.country]

        //If the account page is being visited by the same user, send a @me
        if (req.account[0].nnid == account.nnid) {
            res.render("pages/users_@me", {
                account : req.account,
                view_account : account
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