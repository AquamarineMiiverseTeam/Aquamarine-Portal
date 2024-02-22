const express = require('express');
const route = express.Router();
const xmlbuilder = require('xmlbuilder');
const moment = require('moment');

const db_con = require("../../../../Aquamarine-Utils/database_con")
const common = require('../../../../Aquamarine-Utils/common')

route.get('/show', async (req, res, next) => {
    try {
        //If the user opens the Miiverse applet on HBM when they're in a game with a community, we can redirect them to the community page
        if (req.query['src'] == "menu") {
            const game_community = (await common.ui.getCommunityByDecimalTitleID(req.param_pack.title_id))
            if (game_community) {res.redirect(`/communities/${game_community.id}`); return;}
        }

        const newest_communities = await common.ui.getCommunities("main", null, "desc", false, 3);
        const special_communities = await common.ui.getCommunities(null, null, "desc", true, 3)
        const popular_communities = await common.ui.getPopularCommunities(3);

        res.render('pages/titles/show', {
            account: req.account,
            newest_communities: newest_communities,
            special_communities: special_communities,
            popular_communities: popular_communities,
        })
    } catch (err) {
        next(err)
    }

})

route.get('/communities', async (req, res, next) => {
    try {
        const offset = req.query['offset'];
        const communities = await common.ui.getCommunities(null, null, "desc", false, 15, offset);
    
        if (req.get("x-embedded-dom")) {
            if (communities.length == 0) {res.sendStatus(204); return;}

            res.render('partials/communities', {
                communities: communities,
                account: req.account
            })
    
            return;
        }
    
        res.render('pages/titles/all_communities', {
            account: req.account,
            communities: communities
        })
    } catch(err) {
        next(err)
    }
    
})

route.get('/favorites', async (req, res, next) => {
    try {
        const offset = req.query['offset'];
        const communities = await db_con("communities").select("communities.*", "favorites.community_id as fav_community_id")
        .innerJoin("favorites", "favorites.community_id", "=", "communities.id")
        .where({"favorites.account_id" : req.account[0].id})
        .offset(Number(offset))
        .limit(15)
        .orderBy("favorites.create_time", "desc")

        for (let i = 0; i < communities.length; i++) {
            communities[i].favorites = await db_con("favorites").where({community_id : communities[i].id})
        }
    
        if (req.get("x-embedded-dom")) {
            if (communities.length == 0) {res.sendStatus(204); return;}

            res.render('partials/communities', {
                communities: communities
            })
    
            return;
        }
    
        res.render('pages/titles/favorited_communities', {
            account: req.account,
            communities: communities
        })
    } catch(err) {
        next(err)
    }
})

module.exports = route;