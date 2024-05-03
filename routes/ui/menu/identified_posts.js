const express = require('express');
const route = express.Router();
const moment = require('moment');

const db_con = require("../../../../shared_config/database_con")

route.get("/", async (req, res, next) => {
    try {

        const posts = await db_con.env_db("posts")
            .select("posts.*", "accounts.mii_name", "accounts.mii_hash", "accounts.nnid", "accounts.admin",
                db_con.env_db.raw("COUNT(empathies.post_id) as empathy_count"),
                db_con.env_db.raw(`CASE WHEN empathies.account_id = ${req.account[0].id} THEN TRUE ELSE FALSE END AS empathied_by_user`))
            .where({"accounts.admin" : 1})
            .whereNot({moderated : 1})
            .groupBy("posts.id")
            .groupBy("accounts.id")
            .innerJoin("account.accounts", "accounts.id", "=", "posts.account_id")
            .leftJoin("empathies", "posts.id", "=", "empathies.post_id")

        res.render("pages/identified_user_posts", {
            account: req.account,
            posts : posts,
            moment : moment
        });

        return;
    } catch (err) {
        next(err)
    }
})

module.exports = route;