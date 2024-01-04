const express = require('express');
const route = express.Router();
const xmlbuilder = require('xmlbuilder');
const moment = require('moment');

const util = require('util')

const con = require('../../../../database_con');
const query = util.promisify(con.query).bind(con)

function error(req, res, next) {

    //If the image, css, or javascript file doesn't exist.
    if (req.path.includes("img") || req.path.includes("js") || req.path.includes("css")) {
        res.status(404).send({file : req.originalUrl, error : "File does not exist."});
        return;
    }


    //If no community exists for the given community ID.
    if (req.path.includes("communities")) {
        res.status(404).render('pages/error', {
            account : req.account[0],
            error_name : "Community Not Found",
            error_description : "Sorry, this community doesn't exist yet!",
            req : req
        });

        return;
    } 

    //If that page just doesn't exist.
    res.status(200).render('pages/error', {
        account : req.account[0],
        error_name : "Page not found",
        error_description : "Sorry! This page doesn't exist yet.",
        req : req
    });
}

module.exports = error;