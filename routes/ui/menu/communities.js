const express = require('express');
const route = express.Router();
const xmlbuilder = require('xmlbuilder');
const moment = require('moment');

const util = require('util')

const con = require('../../../../Aquamarine-Utils/database_con');
const query = util.promisify(con.query).bind(con);

const database_query = require('../../../../Aquamarine-Utils/database_query');
const ejs = require("ejs");

route.get('/:community_id', async (req, res, next) => {

    const community_id = req.params.community_id;
    const community = await database_query.getCommunity(community_id, req)

    //If no community is found, then let error.js handle the error
    if (!community) { next(); return;}

    //Grabbing all querys for specific types of posts
    var topic_tag = (req.query['topic_tag']) ? req.query.topic_tag : "";
    var offset = (req.query['offset']) ? req.query['offset'] : 0;
    const posts = await database_query.getPosts(community.id, "desc", 8, topic_tag, offset, req);

    if (req.get("x-em")) {
        var html = "";
        for (let i = 0; i < posts.length; i++) {
            html += await ejs.renderFile(__dirname + "/../../../views/partials/post.ejs", {
                moment : moment,
                post : posts[i]
            })
        }

        if (posts.length == 0) { res.sendStatus(404); return;}
        res.send(html);

        return;
    }

    res.render('pages/community', {
        account : req.account[0],
        community : community,
        posts : posts,
        req : req,
        moment : moment
    });
})

module.exports = route;