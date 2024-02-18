const express = require('express');
const route = express.Router();
const moment = require('moment');
const common = require('../../../../Aquamarine-Utils/common')

const db_con = require("../../../../Aquamarine-Utils/database_con")

route.get('/', async (req, res, next) => {
    try {
        const notifications = await db_con("notifications")
        .select("notifications.*", "accounts.mii_hash", "accounts.nnid", "accounts.mii_name", "accounts.admin", "posts.body as post_body", "posts.painting as post_painting")
        .where({"notifications.account_id" : req.account[0].id})
        .innerJoin("accounts", "accounts.id", "=", "notifications.from_account_id")
        .innerJoin("posts", "posts.id", "=", "notifications.post_id")
        .orderBy("notifications.create_time", "desc")

        //Reading notifications
        await db_con("notifications")
        .where({account_id : req.account[0].id})
        .update({read : 1})

        res.render('pages/notifications', {
            account: req.account,
            notifications : notifications,
            moment : moment
        });
    } catch (err) {
        next(err)
    }
})

route.get("/friend_requests", async (req, res, next) => {
    try {
        //Friend requests arn't implemented yet, so this is stubbed for now.
        const friend_requests = []

        res.render('pages/friend_requests', {
            account: req.account,
            friend_requests : friend_requests,
            moment : moment
        });
    } catch (err) {
        next(err)
    }
})

module.exports = route;