const express = require('express');
const route = express.Router();
const moment = require('moment');

const db_con = require("../../../../shared_config/database_con")

route.get("/:post_id", async (req, res, next) => {
    const post = (await db_con.env_db("posts")
        .select("posts.*", "accounts.mii_hash", "accounts.nnid", "accounts.mii_name", "accounts.admin", "communities.name as community_name", "communities.type as community_type", "parent_community.id as parent_community_id")
        .where({"posts.id" : req.params.post_id})
        .leftOuterJoin("account.accounts", "accounts.id", "=", "posts.account_id")
        .leftOuterJoin("communities", "communities.id", "=", "posts.community_id")
        .leftOuterJoin("communities as parent_community", function() {
            this.on("parent_community.id", "=", "communities.parent_community_id")
        })
    )[0]

    post.empathies = (await db_con.env_db("empathies")
        .select("empathies.create_time", "empathies.account_id", "accounts.mii_hash", "accounts.nnid", "accounts.admin")
        .where({post_id : req.params.post_id})
        .orderBy("empathies.create_time", "desc")
        .innerJoin("account.accounts", "accounts.id", "=", "empathies.account_id")
    )

    try {
        res.render("pages/post_viewer", {
            account : req.account,
            post : post,
            moment : moment
        })
    } catch(err) {
        next(err)
    }
})

module.exports = route;