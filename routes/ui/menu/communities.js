const express = require('express');
const route = express.Router();
const xmlbuilder = require('xmlbuilder');
const moment = require('moment');

const util = require('util')

const con = require('../../../database_con');
const query = util.promisify(con.query).bind(con)

route.get('/:community_id', async (req, res) => {

    const community_id = req.params.community_id;
    const community = (await query("SELECT * FROM communities WHERE id=?", community_id))[0]

    //If no community is found, then send an error screen instead
    if (!community) {
        res.status(404).render('pages/error', {
            account : req.account[0],
            error_name : "Community Not Found",
            error_description : "Sorry, this community doesn't exist yet!"
        });

        return;
    }

    const posts = (await query("SELECT * FROM posts WHERE community_id=?", community_id))

    res.render('pages/community', {
        account : req.account[0],
        community : community,
        posts : posts
    })
})

module.exports = route;