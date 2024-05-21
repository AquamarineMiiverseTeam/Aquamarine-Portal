const express = require("express");
const route = express.Router();
const moment = require("moment");

const common = require("../../../../shared_config/common");
const db_con = require("../../../../shared_config/database_con");

route.get("/:community_id", async (req, res, next) => {
    try {
        const community_id = req.params.community_id;

        // Fetch community details
        const community = await db_con
            .env_db("communities")
            .select("communities.*")
            .select(
                db_con.env_db.raw(
                    `
                EXISTS (
                    SELECT 1
                    FROM favorites
                    WHERE favorites.account_id = ?
                    AND favorites.community_id = communities.id
                ) AS is_favorited
            `,
                    [req.account[0].id]
                )
            )
            .select(
                db_con.env_db.raw(
                    "(SELECT COUNT(*) FROM favorites WHERE favorites.community_id = communities.id) as favorite_count"
                )
            )
            .where({ id: community_id })
            .first();

        // Fetch sub communities
        community.sub_communities = await db_con
            .env_db("communities")
            .where({ parent_community_id: community.id, type: "sub" });

        // If no community is found, then let error.js handle the error
        if (!community) {
            next();
            return;
        }

        // Main query to select posts and join with aggregated empathies count
        const post_query = db_con.env_db
            .select(
                "posts.*",
                "accounts.mii_name",
                "accounts.admin",
                "accounts.nnid",
                "accounts.mii_hash",
                db_con.env_db.raw("COUNT(empathies.post_id) AS empathy_count"),
                db_con.env_db.raw(
                    `CASE WHEN empathies.account_id = ? THEN TRUE ELSE FALSE END AS empathied_by_user`,
                    [req.account[0].id]
                )
            )
            .from("posts")
            .innerJoin(
                "account.accounts",
                "accounts.id",
                "=",
                "posts.account_id"
            )
            .leftJoin("empathies", "empathies.post_id", "=", "posts.id")
            .groupBy("posts.id")
            .where({ "posts.community_id": Number(community_id) });

        // Additional sorting based on query type
        switch (req.query["type"]) {
            case "popular": // Sort by empathy_count for popular query
                if (req.query["time"]) {

                }
                post_query.orderBy("empathy_count", "desc");
                break;
            case "newest":
                post_query.orderBy("posts.create_time", "desc");
                break;
            case "played":
                post_query
                    .where({ title_owned: 1 })
                    .orderBy("posts.create_time", "desc");
                break;
            case "topictag":
                post_query
                    .whereNotNull("topic_tag")
                    .orderBy("posts.create_time", "desc");
                break;
            default:
                post_query.orderBy("posts.create_time", "desc");
        }

        post_query.limit(10).offset(req.query["offset"] || 0);

        console.log(post_query.toQuery());

        // Execute the query
        const posts = await post_query;

        // Render response based on request header
        if (req.get("x-embedded-dom")) {
            if (posts.length === 0) {
                res.sendStatus(204);
                return;
            }
            res.render("partials/posts.ejs", {
                posts: posts,
                moment: moment,
                account: req.account,
            });
        } else {
            posts.query = req.query["type"];
            res.render("pages/community", {
                account: req.account,
                community: community,
                posts: posts,
                req: req,
                moment: moment,
            });
        }
    } catch (err) {
        next(err);
    }
});

route.get("/:community_id/other", async (req, res, next) => {
    try {
        const community_id = req.params.community_id;
        const community = (
            await db_con.env_db("communities").where({ id: community_id })
        )[0];
        community.sub_communities = await db_con
            .env_db("communities")
            .select(
                "communities.*",
                db_con.env_db.raw(
                    `CASE WHEN favorites.account_id = ${req.account[0].id} THEN TRUE ELSE FALSE END AS is_favorited`
                ),
                db_con.env_db.raw(
                    "COUNT(favorites.community_id) AS favorite_count"
                )
            )
            .where({ parent_community_id: community_id })
            .leftJoin(
                "favorites",
                "favorites.community_id",
                "=",
                "communities.id"
            );

        community.favorites = await db_con
            .env_db("favorites")
            .where({ community_id: community.id });
        for (let i = 0; i < community.sub_communities.length; i++) {
            community.sub_communities[i].favorites = await db_con
                .env_db("favorites")
                .where({ community_id: community.sub_communities[i].id });
        }

        //If no community is found, then let error.js handle the error
        if (!community) {
            next();
            return;
        }

        res.render("pages/sub_communities", {
            account: req.account,
            main_community: community,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = route;
