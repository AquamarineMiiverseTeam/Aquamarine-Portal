const express = require('express');
const route = express.Router();
const xmlbuilder = require('xmlbuilder');
const moment = require('moment');

const util = require('util')

const con = require('../../../../database_con');
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

    const posts = (await query("SELECT * FROM posts WHERE community_id=?", community_id));

    for (let i = 0; i < posts.length; i++) {
        const account = (await query("SELECT * FROM accounts WHERE id=?", posts[i].account_id))[0];
        var mii_face;

        switch (posts[i].feeling_id) {
            case 0:
                mii_face = "normal_face";
                break;
            case 1:
                mii_face = "happy_face";
                break;
            case 2:
                mii_face = "like_face";
                break;
            case 3:
                mii_face = "surprised_face";
                break;
            case 4:
                mii_face = "frustrated_face";
                break;
            case 5:
                mii_face = "puzzled_face";
                break;
            default:
                mii_face = "normal_face";
                break;
        }

        posts[i].mii_image = `http://mii-images.account.nintendo.net/${account.mii_hash}_${mii_face}.png`;
        posts[i].mii_name = account.mii_name;

        posts[i].is_empathied_by_user = (await query("SELECT * FROM empathies WHERE post_id=? AND account_id=?", [posts[i].id, req.account[0].id])).length;
        posts[i].empathy_count = (await query("SELECT * FROM empathies WHERE post_id=?", posts[i].id)).length;
    }

    res.render('pages/community', {
        account : req.account[0],
        community : community,
        posts : posts
    })
})

module.exports = route;