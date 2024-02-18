const express = require('express');
const route = express.Router();
const moment = require('moment');

const db_con = require("../../../../Aquamarine-Utils/database_con")
const common = require('../../../../Aquamarine-Utils/common')

route.get("/:post_id", async (req, res, next) => {
    const post = (await db_con("posts")
        .select("posts.*", "accounts.mii_hash", "accounts.nnid", "accounts.mii_name", "accounts.admin", "communities.name as community_name", "communities.type as community_type")
        .where({"posts.id" : req.params.post_id})
        .leftOuterJoin("accounts", "accounts.id", "=", "posts.account_id")
        .leftOuterJoin("communities", "communities.id", "=", "posts.community_id")
    )[0]

    post.empathies = (await db_con("empathies")
        .select("empathies.create_time", "empathies.account_id", "accounts.mii_hash", "accounts.nnid", "accounts.admin")
        .where({post_id : req.params.post_id})
        .orderBy("empathies.create_time", "desc")
        .innerJoin("accounts", "accounts.id", "=", "empathies.account_id")
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