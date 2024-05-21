const express = require("express");
const route = express.Router();
const xmlbuilder = require("xmlbuilder");
const moment = require("moment");

const db_con = require("../../../../shared_config/database_con");
const common = require("../../../../shared_config/common");

route.get("/show", async (req, res, next) => {
    try {
        // If the user opens the Miiverse applet on HBM when they're in a game with a community, we can redirect them to the community page
        if (req.query["src"] == "menu") {
            const game_community = (
                await db_con
                    .env_db("communities")
                    .whereLike(
                        "title_ids",
                        `%${Number(req.param_pack.title_id)}%`
                    )
                    .where({ type: "main" })
                    .limit(1)
            )[0];

            if (game_community && game_community.id != 0) {
                res.redirect(`/communities/${game_community.id}`);
                return;
            } else {
                //redirect to Activity Feed
                res.redirect(`/activity_feed`);
                return;
            }
        }

        const newest_communities = await db_con
            .env_db("communities")
            .select(
                "communities.*",
                db_con.env_db.raw(
                    "(SELECT COUNT(*) FROM favorites WHERE favorites.community_id = communities.id) as favorite_count"
                ),
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
            .groupBy("communities.id")
            .leftJoin(
                "favorites",
                "favorites.community_id",
                "=",
                "communities.id"
            )
            .where({ type: "main" })
            .orderBy("create_time", "desc")
            .limit(4);

        const special_communities = await db_con
            .env_db("communities")
            .select(
                "communities.*",
                db_con.env_db.raw(
                    "(SELECT COUNT(*) FROM favorites WHERE favorites.community_id = communities.id) as favorite_count"
                ),
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
            .groupBy("communities.id")
            .leftJoin(
                "favorites",
                "favorites.community_id",
                "=",
                "communities.id"
            )
            .where({ special_community: 1 })
            .orderBy("create_time", "desc")
            .limit(4);

        const popular_communities = await db_con
            .env_db("communities")
            .select(
                "communities.*",
                db_con.env_db.raw(
                    "(SELECT COUNT(*) FROM favorites WHERE favorites.community_id = communities.id) as favorite_count"
                ),
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
            .where({ platform: "wiiu", type: "main" })
            .orderBy(function () {
                this.count("*")
                    .from("posts")
                    .whereRaw("posts.community_id = communities.id")
                    .whereBetween("create_time", [
                        moment()
                            .subtract(5, "days")
                            .format("YYYY-MM-DD HH:mm:ss"),
                        moment().add(1, "day").format("YYYY-MM-DD HH:mm:ss"),
                    ]);
            }, "desc")
            .groupBy("communities.id")
            .leftJoin(
                "favorites",
                "favorites.community_id",
                "=",
                "communities.id"
            )
            .limit(4);

        res.render("pages/titles/show", {
            account: req.account,
            newest_communities: newest_communities,
            special_communities: special_communities,
            popular_communities: popular_communities,
        });
    } catch (err) {
        next(err);
    }
});

route.get("/communities", async (req, res, next) => {
    try {
        const offset = req.query["offset"];
        const communities = await db_con
            .env_db("communities")
            .select(
                "communities.*",
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
                ),
                db_con.env_db.raw(
                    "COUNT(favorites.community_id) as favorite_count"
                )
            )
            .groupBy("communities.id")
            .leftJoin(
                "favorites",
                "favorites.community_id",
                "=",
                "communities.id"
            )
            .where({ type: "main" })
            .orderBy("create_time", "desc")
            .offset(offset)
            .limit(15);

        if (req.get("x-embedded-dom")) {
            if (communities.length == 0) {
                res.sendStatus(204);
                return;
            }

            res.render("partials/communities", {
                communities: communities,
                account: req.account,
            });

            return;
        }

        res.render("pages/titles/all_communities", {
            account: req.account,
            communities: communities,
        });
    } catch (err) {
        next(err);
    }
});

route.get("/favorites", async (req, res, next) => {
    try {
        const offset = req.query["offset"];
        const communities = await db_con
            .env_db("communities")
            .select(
                "communities.*",
                db_con.env_db.raw(
                    "(SELECT COUNT(*) FROM favorites WHERE favorites.community_id = communities.id) as favorite_count"
                ),
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
            .innerJoin(
                "favorites",
                "favorites.community_id",
                "=",
                "communities.id"
            )
            .where("favorites.account_id", "=", req.account[0].id)
            .groupBy("communities.id")
            .offset(offset)
            .limit(15);

        if (req.get("x-embedded-dom")) {
            if (communities.length == 0) {
                res.sendStatus(204);
                return;
            }

            res.render("partials/communities", {
                communities: communities,
                account: req.account,
            });

            return;
        }

        res.render("pages/titles/favorited_communities", {
            account: req.account,
            communities: communities,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = route;
