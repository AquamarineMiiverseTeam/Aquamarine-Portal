const express = require('express');
const route = express.Router();
const xmlbuilder = require('xmlbuilder');
const moment = require('moment');

const util = require('util')

const con = require('../../../../database_con');
const query = util.promisify(con.query).bind(con);

const database_query = require('../../../utils/database_query');

route.get('/:community_id', async (req, res, next) => {

    const community_id = req.params.community_id;
    const community = await database_query.getCommunity(community_id, req)

    //If no community is found, then let error.js handle the error
    if (!community) { next(); return;}

    //Grabbing all querys for specific types of posts
    var topic_tag = (req.query['topic_tag']) ? req.query.topic_tag : "";
    
    const posts = await database_query.getPosts(community.id, "desc", 999999, topic_tag, req);

    res.render('pages/community', {
        account : req.account[0],
        community : community,
        posts : posts,
        req : req,
        moment : moment
    });
})

module.exports = route;