const express = require('express');
const route = express.Router();
const xmlbuilder = require('xmlbuilder');
const moment = require('moment');

route.get('/show', (req, res) => {
    res.render('pages/show', {
        account : req.account[0]
    })
})

module.exports = route;