const express = require("express");
const router = express.Router();
const isUrl = require("is-url");
const { customAlphabet } = require("nanoid");
const Url = require("../models/Url");
const { randomRange } = require("../utils/functions");
// const baseUrl = process.env.DOMAIN || "https://shorten.aytea14.repl.co";

router.post("/shorten", async (req, res) => {
    let longUrl, shorturl;
    if (req.body.longUrl) longUrl = req.body.longUrl;
    else longUrl = req.query.longUrl;
    if (req.body.shorturl) shorturl = req.body.shorturl;
    else shorturl = req.query.shorturl;

    if (!longUrl) return res.send({ error: "Please enter a URL" });

    try {
        longUrl = new URL(`${longUrl}`);
    } catch (error) {
        if (error.code === "ERR_INVALID_URL") return res.status(401).send({ error: "Invalid longUrl" });
    }

    const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", randomRange(6, 8));
    const urlCode = shorturl ? shorturl : nanoid();

    if (isUrl(longUrl.href)) {
        try {
            if (shorturl && shorturl.length) {
                if (shorturl.length > 30 || shorturl.length < 5) {
                    return res.send({ error: "Custom short URLs must be between 5 and 30 characters long." });
                }
                var shorturlregex = /^[a-zA-Z0-9_]+$/;
                let test = shorturl.search(shorturlregex);
                if (test == -1) {
                    return res.send({
                        error: "Custom short URLs can only contain alphanumeric characters and underscores.",
                    });
                }
            }
            let custom_slug = shorturl ? true : false;
            let existed = await Url.exists({ urlCode });
            let url = await Url.findOne({ longUrl });
            if (existed)
                return res
                    .status(406)
                    .json({ error: "The shortened URL you selected is already taken. Try something more unusual." });
            if (custom_slug && !url) {
                await new Url({ longUrl, urlCode: nanoid(), date: new Date().toISOString(), custom_slug: false }).save();
                url = new Url({ longUrl, urlCode, date: new Date().toISOString(), custom_slug });
                await url.save();
                return res.json(url);
            } else if (custom_slug && url) {
                url = new Url({ longUrl, urlCode, date: new Date().toISOString(), custom_slug });
                await url.save();
                return res.json(url);
            } else if (url) {
                return res.json(url);
            } else {
                url = new Url({ longUrl, urlCode, date: new Date().toISOString(), custom_slug });
                await url.save();
                return res.json(url);
            }
        } catch (err) {
            res.status(500).send({ error: "Server error" });
        }
    } else return res.status(401).send({ error: "Invalid longUrl" });
});

module.exports = router;
