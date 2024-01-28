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
        path: "/account",
        route: require("./ui/account.js")
    }
]