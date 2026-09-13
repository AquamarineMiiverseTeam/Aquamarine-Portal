const express = require('express');
const route = express.Router();
const moment = require('moment');

const db_con = require('../../../../shared_config/database_con');

route.get('/:community_id', async (req, res, next) => {
    try {
        const community_id = req.params.community_id;
        const account = req.account && req.account[0];
        if (!account) return res.redirect('/account/create_account');

        const community = (await db_con.env_db('communities')
            .select(
                'communities.*',
                db_con.env_db.raw(
                    'CASE WHEN favorites.account_id = ? THEN TRUE ELSE FALSE END AS is_favorited',
                    [account.id]
                )
            )
            .where({ 'communities.id': community_id })
            .leftJoin('favorites', 'favorites.community_id', '=', 'communities.id')
            .groupBy('communities.id'))[0];

        if (!community) return next();

        community.sub_communities = await db_con.env_db('communities')
            .where({ parent_community_id: community.id, type: 'sub' });

        const offset = Math.max(0, Number.parseInt(req.query.offset, 10) || 0);

        const posts_query = db_con.env_db('posts')
            .select(
                'posts.*',
                'accounts.mii_hash',
                'accounts.mii_name',
                'accounts.admin',
                'accounts.nnid',
                db_con.env_db.raw('COUNT(empathies.post_id) as empathy_count'),
                db_con.env_db.raw(
                    'CASE WHEN empathies.account_id = ? THEN TRUE ELSE FALSE END AS empathied_by_user',
                    [account.id]
                )
            )
            .where({ 'posts.community_id': community_id })
            .whereNot({ 'posts.moderated': 1 })
            .where(function () {
                switch (req.query.type) {
                    case 'played':
                        this.where({ 'posts.title_owned': 1 });
                        break;
                    case 'ingame':
                        this.whereNotNull('posts.search_key');
                        break;
                    case 'topictag':
                        this.whereNotNull('posts.topic_tag');
                        break;
                }
            })
            .innerJoin('account.accounts', 'accounts.id', '=', 'posts.account_id')
            .leftJoin('empathies', 'posts.id', '=', 'empathies.post_id')
            .groupBy('posts.id');

        if (req.query.type === 'popular') {
            posts_query.orderBy('empathy_count', 'desc');
        } else {
            posts_query.orderBy('posts.create_time', 'desc');
        }

        const posts = await posts_query.limit(8).offset(offset);

        if (req.get('x-embedded-dom')) {
            if (!posts.length) return res.sendStatus(204);
            return res.render('partials/posts.ejs', {
                posts,
                moment,
                account: req.account
            });
        }

        posts.query = req.query.type;
        return res.render('pages/community', {
            account: req.account,
            community,
            posts,
            req,
            moment
        });
    } catch (err) {
        next(err);
    }
});

route.get('/:community_id/other', async (req, res, next) => {
    try {
        const community_id = req.params.community_id;
        const community = (await db_con.env_db('communities').where({ id: community_id }))[0];
        if (!community) return next();

        community.sub_communities = await db_con.env_db('communities')
            .where({ parent_community_id: community_id });
        community.favorites = await db_con.env_db('favorites')
            .where({ community_id: community.id });

        for (const sub of community.sub_communities) {
            sub.favorites = await db_con.env_db('favorites')
                .where({ community_id: sub.id });
        }

        return res.render('pages/sub_communities', {
            account: req.account,
            main_community: community
        });
    } catch (err) {
        next(err);
    }
});

module.exports = route;
