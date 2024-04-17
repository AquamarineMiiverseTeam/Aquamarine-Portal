const express = require('express');
const route = express.Router();
const moment = require('moment');

//I believe this is the correct route for messages, let me know if I'm wrong -NoNameGiven
route.get("/", (req, res, next) => {
    //Eventually we would get the real messages to a user, for now, we will pretend messages actually exist.
    try {
        res.render("pages/messages.ejs", {
            account : req.account
        })
    } catch (err) {
        next(err)
    }
})

module.exports = route