const express = require("express");
const router = express.Router();
const isUrl = require("is-url");
const { customAlphabet } = require("nanoid");
const Url = require("../models/Url");
const { randomRange } = require("../utils/functions");

//@route    POST /api/url/shorten
//@desc     Create short URL

const baseUrl = process.env.DOMAIN || "https://shorten.aytea14.repl.co";

router.post("/shorten", async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    let longUrl;
    if (req.body.longUrl) longUrl = req.body.longUrl;
    else longUrl = req.query.longUrl;

    if (!longUrl) return res.send({ error: "Please enter a URL" });
    else {
        try {
            longUrl = new URL(`${longUrl}`);
        } catch (error) {
            if (error.code === "ERR_INVALID_URL") return res.status(401).send({ error: "Invalid longUrl" });
        }
    }

    if (!isUrl(baseUrl)) return res.status(401).send({ error: "Invalid base URL" });

    const nanoid = customAlphabet("1234567890_abcdefghijklmnopqrstuvwxyz_ABCDEFGHIJKLMNOPQRSTUVWXYZ-", randomRange(6, 8));
    const urlCode = nanoid();

    if (isUrl(longUrl.href)) {
        try {
            let url = await Url.findOne({ longUrl });
            if (url) {
                res.json(url);
            } else {
                const shortUrl = `${baseUrl}/${urlCode}`;
                url = new Url({
                    longUrl,
                    shortUrl,
                    urlCode,
                    date: new Date().toISOString(),
                });
                await url.save();
                res.json(url);
            }
        } catch (err) {
            res.status(500).send({ error: "Server error" });
        }
    } else {
        res.status(401).send({ error: "Invalid longUrl" });
    }
});

module.exports = router;
