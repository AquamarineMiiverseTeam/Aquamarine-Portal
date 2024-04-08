const express = require('express');
const route = express.Router();
const moment = require('moment');

const common = require('../../../../shared_config/common')
const db_con = require("../../../../shared_config/database_con")

route.get('/:community_id', async (req, res, next) => {
    try {
        const community_id = req.params.community_id;
        const community = (await db_con.env_db("communities").select("communities.*",
            db_con.env_db.raw(`CASE WHEN favorites.account_id = ${req.account[0].id} THEN TRUE ELSE FALSE END AS is_favorited`),
        ).where({ "communities.id": community_id })
        .leftJoin("favorites", "favorites.community_id", "=", "communities.id")
        .groupBy("communities.id"))[0]

        community.sub_communities = await db_con.env_db("communities").where({ parent_community_id: community.id, type: "sub" })

        //If no community is found, then let error.js handle the error
        if (!community) { next(); return; }

        //Grabbing all querys for specific types of posts
        const offset = (req.query['offset']) ? req.query['offset'] : 0;

        const posts_query = db_con.env_db("posts")
            .select("posts.*",
                "accounts.mii_hash",
                "accounts.mii_name",
                "accounts.admin",
                "accounts.nnid",
                db_con.env_db.raw("COUNT(empathies.post_id) as empathy_count"),
                db_con.env_db.raw(`CASE WHEN empathies.account_id = ${req.account[0].id} THEN TRUE ELSE FALSE END AS empathied_by_user`))

            .where({ community_id: community_id }).whereNot({ moderated: 1 }).where(function () {
                switch (req.query['type']) {
                    case "played":
                        this.where({ title_owned: 1 })
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
            }).groupBy("posts.id")

        if (req.query['type'] == "popular") {
            posts_query.orderBy("empathy_count", "desc")
        } else {
            posts_query.orderBy("posts.create_time", "desc")
        }

        posts_query.limit(8).offset(Number(offset))
            .innerJoin("account.accounts", "accounts.id", "=", "posts.account_id")
            .leftJoin("empathies", "posts.id", "=", "empathies.post_id")

        const posts = await posts_query;

        if (req.get("x-embedded-dom")) {
            if (posts.length == 0) { res.sendStatus(204); return; }
            res.render("partials/posts.ejs", {
                posts: posts,
                moment: moment,
                account: req.account
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
        const community = (await db_con.env_db("communities").where({ id: community_id }))[0]
        community.sub_communities = await db_con.env_db("communities").where({ parent_community_id: community_id })

        community.favorites = await db_con.env_db("favorites").where({ community_id: community.id })
        for (let i = 0; i < community.sub_communities.length; i++) {
            community.sub_communities[i].favorites = await db_con.env_db("favorites").where({ community_id: community.sub_communities[i].id })
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