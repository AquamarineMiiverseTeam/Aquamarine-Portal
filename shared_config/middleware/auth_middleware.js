const db_con = require('../database_con');

const strictMode = String(process.env.AQUAMARINE_STRICT_MODE || 'false').toLowerCase() === 'true';

function parseParamPack(paramPack) {
    const decoded = Buffer.from(paramPack, 'base64').toString();
    const values = decoded.slice(1, -1).split('\\');
    const result = {};
    for (let i = 0; i + 1 < values.length; i += 2) {
        result[values[i].trim()] = values[i + 1].trim();
    }
    return result;
}

async function auth(req, res, next) {
    if (req.path.includes('img') || req.path.includes('css') || req.path.includes('js') || (req.path.includes('v1') && req.path.includes('users'))) {
        return next();
    }

    const paramPack = req.get('x-nintendo-parampack');
    const serviceTokenHeader = req.get('x-nintendo-servicetoken');

    // The account creation and public people pages must remain reachable without an account.
    if (req.path.includes('/account') || (req.path.includes('/people') && !req.path.includes('/people/update'))) {
        return next();
    }

    if (!serviceTokenHeader || !paramPack || serviceTokenHeader.length < 42) {
        return res.sendStatus(401);
    }

    const serviceToken = serviceTokenHeader.slice(0, 42);
    let paramPackData;
    try {
        paramPackData = parseParamPack(paramPack);
    } catch (err) {
        return res.sendStatus(400);
    }

    req.param_pack = paramPackData;
    req.service_token = serviceToken;

    const platformId = Number(paramPackData.platform_id);
    let account;
    if (platformId === 0) {
        req.platform = '3ds';
        account = await db_con('accounts').where({ '3ds_service_token': serviceToken });
    } else {
        req.platform = 'wiiu';
        account = await db_con('accounts').where({ wiiu_service_token: serviceToken });
    }

    if (!account[0]) {
        return res.redirect('/account/create_account');
    }

    req.account = account;
    req.account.all_notifications = [];
    req.account.unread_notifications = [];
    req.account.empathies_given = [];

    if (strictMode && account[0].tester != 1) {
        if (req.path.includes('v1')) return res.sendStatus(403);
        return res.render('pages/error/error_tester');
    }

    next();
}

module.exports = auth;
