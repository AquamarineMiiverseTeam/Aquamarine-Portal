const express = require('express');
const route = express.Router();
const xmlbuilder = require('xmlbuilder');
const moment = require('moment');

const util = require('util')

const con = require('../../../../database_con');
const query = util.promisify(con.query).bind(con)

route.get('/show', async (req, res) => {

    //TODO : hopefully adding in popular communities??
    const newest_communities = await query(`SELECT * FROM communities ORDER BY create_time DESC`)

    res.render('pages/show', {
        account : req.account[0],
        newest_communities : newest_communities
    })
})

module.exports = route;