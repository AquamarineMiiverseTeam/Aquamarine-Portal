const express = require('express');
const route = express.Router();
const xmlbuilder = require('xmlbuilder');
const moment = require('moment');

const util = require('util')

const database_query = require('../../../../Aquamarine-Utils/database_query');
const common = require('../../../../Aquamarine-Utils/common')

route.get('/', async (req, res, next) => {
    try {
        const notifications = await common.notification.getAccountAllNotifications(req.account);
        await common.notification.readAccountNotifications(req.account)

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