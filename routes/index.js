module.exports = [
    {
        path: "/titles",
        route: require("./ui/menu/titles.js")
    },
    {
        path: "/messages",
        route: require("./ui/menu/messages.js")
    },
    {
        path: "/communities",
        route: require("./ui/menu/communities.js")
    },
    {
        path: "/notifications",
        route: require("./ui/menu/notifications.js")
    },
    {
        path: "/activity_feed",
        route: require("./ui/menu/activity.js")
    },
    {
        path: "/posts",
        route: require("./ui/menu/posts.js")
    },
    {
        path: "/users",
        route: require("./ui/menu/users.js")
    },
    {
        path: "/identified_user_posts",
        route: require("./ui/menu/identified_posts.js")
    },
    {
        path: "/account",
        route: require("./ui/account.js")
    }
]