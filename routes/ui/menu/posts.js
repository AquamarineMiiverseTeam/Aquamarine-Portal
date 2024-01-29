const express = require('express');
const route = express.Router();
const xmlbuilder = require('xmlbuilder');
const moment = require('moment');

const util = require('util')

const database_query = require('../../../../Aquamarine-Utils/database_query');
const common = require('../../../../Aquamarine-Utils/common')

route.get("/:post_id/screenshot", async (req, res, next) => {
    const post = await common.ui.getPost(req.params.post_id)
    if (!post.screenshot) { res.render("pages/error/error_no_post.ejs"); return; }

    try {
        res.render("pages/screenshot_viewer")
    } catch(err) {
        next(err)
    }
})

module.exports = route;