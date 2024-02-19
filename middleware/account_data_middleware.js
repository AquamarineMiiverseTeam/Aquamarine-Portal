const colors = require(process.cwd() + '/node_modules/colors');
const moment = require(process.cwd() + '/node_modules/moment');

const common = require("../../Aquamarine-Utils/common")
const db_con = require("../../Aquamarine-Utils/database_con")

const language = {
    "en" : require("../static/languages/en.json"),
    "es" : require("../static/languages/es.json")
}

function local(args, string) {
    for (let i = 0; i < args.length; i++) {
        string = string.replace(args[i].rpl, args[i].str)
    }

    return string
}

async function getAccountData(req, res, next) {
    //This middleware is meant for getting all extra account data that may be used in places such as
    //the navbar, and other UI elements
    if (req.path.includes("img") || req.path.includes("css") || req.path.includes("js") || req.path.includes("favicon")) { next(); return; }
    if (!req.account) { next(); return; }

    req.account.all_notifications = await common.notification.getAccountAllNotifications(req.account);
    req.account.unread_notifications = await common.notification.getAccountUnreadNotifications(req.account);
    req.account.empathies_given = await common.empathy.getAccountEmpathiesGiven(req.account);
    req.account.favorites = await db_con("favorites").where({account_id : req.account[0].id});

    //localization
    if (language[req.account[0].language]) {
        res.locals.language = language[req.account[0].language]
    } else {
        res.locals.language = language["en"]
    }

    res.locals.local = local;

    next();
}

module.exports = getAccountData