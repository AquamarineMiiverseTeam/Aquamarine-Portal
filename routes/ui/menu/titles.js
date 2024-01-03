const express = require('express');
const route = express.Router();
const xmlbuilder = require('xmlbuilder');
const moment = require('moment');

const util = require('util')

const database_query = require('../../../database_query');

route.get('/show', async (req, res) => {

    //TODO : hopefully adding in popular communities??
    const newest_communities = await database_query.getCommunities("desc", 1000, 'all');
    
    res.render('pages/show', {
        account : req.account[0],
        newest_communities : newest_communities,
        req : req
    })
})

module.exports = route;