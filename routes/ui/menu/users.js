const express = require('express');
const route = express.Router();
const moment = require('moment');

const db_con = require("../../../../shared_config/database_con")
const country2name = require("../../../code_2_country.json")

route.get("/:nnid", async (req, res, next) => {
    try {
        const nnid = (req.params.nnid === "@me") ? req.account[0].nnid : req.params.nnid

        const account = (await db_con.account_db("accounts").where({nnid : nnid}))[0]
        //If the account doesn't exist, render a 404.
        if (!account) { res.render("pages/error/error_404"); return;}

        account.favorited_communities = await db_con.env_db("favorites").where({account_id : account.id}).orderBy("create_time", "desc")
        account.yeahs_recieved = (await db_con.env_db("posts")
        .select("posts.id").where({"posts.account_id" : account.id})
        .innerJoin("empathies", "empathies.post_id", "=", "posts.id")).length
        account.posts = await db_con.env_db("posts").where({account_id : account.id})
        account.country_name = country2name[account.country]

        //If the account page is being visited by the same user, send a @me
        if (req.account[0].nnid == account.nnid) {
            res.render("pages/user/users_@me", {
                account : req.account,
                view_account : account
            });

            return;
        }

        res.render("pages/user/users_visitor", {
            account : account
        })
    } catch (err) {
        next(err)
    }
})

module.exports = route;