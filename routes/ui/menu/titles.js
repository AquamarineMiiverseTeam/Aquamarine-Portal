const express = require('express');
const route = express.Router();
const xmlbuilder = require('xmlbuilder');
const moment = require('moment');

const util = require('util')

const database_query = require('../../../../Aquamarine-Utils/database_query');
const common = require('../../../../Aquamarine-Utils/common')

route.get('/show', async (req, res, next) => {
    try {
        //If the user opens the Miiverse applet on HBM when they're in a game with a community, we can redirect them to the community page
        if (req.query['src'] == "menu") {
            const game_community = (await common.ui.getCommunityByDecimalTitleID(req.param_pack.title_id))[0]
            if (game_community) {res.redirect(`/communities/${game_community.id}`); return;}
        }

        const newest_communities = await database_query.getCommunities("desc", 3, 'main');
        const special_communities = await database_query.getCommunities("desc", 3, 'all', 0, 1);
        const popular_communities = await common.ui.getPopularCommunities(3);

        res.render('pages/show', {
            account: req.account,
            newest_communities: newest_communities,
            special_communities: special_communities,
            popular_communities: popular_communities,
            req: req
        })
    } catch (err) {
        next(err)
    }

})

route.get('/communities', async (req, res, next) => {
    try {
        const offset = req.query['offset'];
        const communities = await database_query.getCommunities("desc", 10, 'all', offset);
    
        if (req.get("x-em")) {
            res.render('partials/communities', {
                communities: communities
            })
    
            return;
        }
    
        res.render('pages/all_communities', {
            account: req.account,
            communities: communities
        })
    } catch(err) {
        next(err)
    }
    
})

module.exports = route;