const db_con = require('./database_con');

const utility = {
    ui: {
        getCommunities: async function(type, platform, orderBy = 'desc', special, limit = 100, offset = 0) {
            let query = db_con('communities');
            if (type) query.where({ type });
            if (platform) query.where({ platform });
            if (special) query.where({ special_community: special });
            const communities = await query.orderBy('create_time', orderBy).limit(Number(limit)).offset(Number(offset));
            return fillCommunityData(communities);
        },
        getCommunity: async function(community_id) {
            const communities = await db_con('communities').where({ id: community_id });
            return fillCommunityData(communities);
        },
        getPopularCommunities: async function(limit = 10) {
            const communities = await db_con('communities')
                .where({ platform: 'wiiu', type: 'main' })
                .orderBy('create_time', 'desc')
                .limit(Number(limit));
            return fillCommunityData(communities);
        },
        getNewCommunities: async function(limit = 10) {
            const communities = await db_con('communities').orderBy('create_time', 'desc').limit(Number(limit));
            return fillCommunityData(communities);
        },
        getCommunityByDecimalTitleID: async function(tid) {
            return (await db_con('communities').whereLike('title_ids', `%${Number(tid)}%`).where({ type: 'main' }).limit(1))[0];
        },
        getTypedPosts: async function(type, community_id, offset = 0, limit = 20) {
            const q = db_con('posts').where({ community_id }).whereNot({ moderated: 1 });
            if (type === 'played') q.where({ title_owned: 1 });
            if (type === 'ingame') q.whereNotNull('search_key');
            if (type === 'topictag') q.whereNotNull('topic_tag');
            return q.orderBy(type === 'popular' ? 'create_time' : 'create_time', 'desc').limit(Number(limit)).offset(Number(offset));
        },
        getPost: async function(post_id) {
            return (await db_con('posts').where({ id: post_id }))[0];
        }
    },
    notification: {
        createNewNotification: async function(account_id, from_account_id, type, content_id, linkto, post_id) {
            return db_con('notifications').insert({ account_id, from_account_id, type, content_id, linkto, post_id });
        },
        getAccountUnreadNotifications: async function(account) {
            return db_con('notifications').where({ account_id: account[0].id, read: 0 }).orderBy('create_time', 'desc');
        },
        getAccountAllNotifications: async function(account) {
            return db_con('notifications').where({ account_id: account[0].id }).orderBy('create_time', 'desc');
        },
        readAccountNotifications: async function(account) {
            return db_con('notifications').where({ account_id: account[0].id }).update({ read: 1 });
        }
    },
    empathy: {
        getAccountEmpathiesGiven: async function(account) {
            return db_con('empathies').where({ account_id: account[0].id });
        },
        getPostEmpathies: async function(post_id) {
            return db_con('empathies').where({ post_id });
        }
    }
};

async function fillCommunityData(communities) {
    for (const community of communities) {
        community.favorites = await db_con('favorites').where({ community_id: community.id });
        community.sub_communities = await db_con('communities').where({ parent_community_id: community.id });
    }
    return communities;
}

module.exports = utility;
