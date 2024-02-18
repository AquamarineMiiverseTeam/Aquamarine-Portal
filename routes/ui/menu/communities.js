const express = require('express');
const route = express.Router();
const moment = require('moment');

const common = require('../../../../Aquamarine-Utils/common')
const db_con = require("../../../../Aquamarine-Utils/database_con")

route.get('/:community_id', async (req, res, next) => {
    try {
        const community_id = req.params.community_id;
        const community = (await common.ui.getCommunity(community_id))[0];

        //If no community is found, then let error.js handle the error
        if (!community) { next(); return; }

        //Grabbing all querys for specific types of posts
        const offset = (req.query['offset']) ? req.query['offset'] : 0;

        const posts = await db_con("posts")
        .select("posts.*", "accounts.mii_hash", "accounts.mii_name", "accounts.admin")
        .where({community_id : community_id}).whereNot({moderated : 1}).where(function() {
            switch (req.query['type']) {
                case "played":
                    this.where({title_owned : 1})
                    break;
                case "ingame":
                    this.whereNotNull("search_key")
                    break;
                case "topictag":
                    this.whereNotNull("topic_tag")
                    break;
                default:
                    break;
            }
        }).orderBy("posts.create_time", "desc").offset(Number(offset))
        .limit(8)
        .leftOuterJoin("accounts", "accounts.id", "=", "posts.account_id")

        for (let i = 0; i < posts.length; i++) {
            posts[i].empathies = await db_con("empathies").where({post_id : posts[i].id})
        }

        //const posts = await common.ui.getTypedPosts(req.query['type'], community_id, offset, 12, req)

        if (req.get("x-embedded-dom")) {
            if (posts.length == 0) { res.sendStatus(204); return; }
            res.render("partials/posts.ejs", {
                posts : posts,
                moment : moment,
                account : req.account
            });

            return;
        }

        posts.query = req.query['type']

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
        const community = (await db_con("communities").where({id : community_id}))[0]
        community.sub_communities = await db_con("communities").where({parent_community_id : community_id})
        
        community.favorites = await db_con("favorites").where({community_id : community.id})
        for (let i = 0; i < community.sub_communities.length; i++) {
            community.sub_communities[i].favorites = await db_con("favorites").where({community_id : community.sub_communities[i].id})
        }

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