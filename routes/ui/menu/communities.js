const express = require('express');
const route = express.Router();
const xmlbuilder = require('xmlbuilder');
const moment = require('moment');

const util = require('util')

const con = require('../../../../Aquamarine-Utils/database_con');
const query = util.promisify(con.query).bind(con);

const database_query = require('../../../../Aquamarine-Utils/database_query');
const ejs = require("ejs");

const common = require('../../../../Aquamarine-Utils/common')

route.get('/:community_id', async (req, res, next) => {
    try {
        const community_id = req.params.community_id;
        const community = await database_query.getCommunity(community_id, req)

        //If no community is found, then let error.js handle the error
        if (!community) { next(); return; }

        //Grabbing all querys for specific types of posts
        var offset = (req.query['offset']) ? req.query['offset'] : 0;

        const posts = await common.ui.getTypedPosts(req.query['type'], community_id, offset, 12, req)

        if (req.get("x-inline-pjax")) {
            if (posts.length == 0) { res.sendStatus(404); return; }
            res.render("partials/posts.ejs", {
                posts : posts,
                moment : moment,
                account : req.account
            });

            return;
        }

        res.render('pages/community', {
            account: req.account,
            community: community,
            posts: posts,
            req: req,
            moment: moment
        });
    } catch (err) {
        next(err)
    }

})

route.get("/:community_id/other", async (req, res, next) => {
    try {
        const community_id = req.params.community_id;
        const community = await database_query.getCommunity(community_id, req)

        //If no community is found, then let error.js handle the error
        if (!community) { next(); return; }

        res.render('pages/sub_communities', {
            account: req.account,
            main_community: community,
        });
    } catch (err) {
        next(err);
    }

})

module.exports = route;