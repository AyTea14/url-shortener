const express = require("express");
const router = express.Router();
const isUrl = require("is-url");
const { customAlphabet } = require("nanoid");

const Url = require("../models/Url");

//@route    POST /api/url/shorten
//@desc     Create short URL

const baseUrl = "https://shortener.aytea14.repl.co";
router.post("/shorten", async (req, res) => {
    let longUrl;
    if (req.body.longUrl) longUrl = req.body.longUrl;
    else longUrl = req.query.longUrl;

    if (longUrl) {
        if (!longUrl.startsWith("http")) longUrl = `https://${longUrl.split(/\/\/(.+)/)[1]}`;
    }

    if (!isUrl(baseUrl)) {
        return res.status(401).send("Invalid base URL");
    }

    const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", 9);
    const urlCode = nanoid();

    if (isUrl(longUrl)) {
        try {
            let url = await Url.findOne({ longUrl });
            if (url) {
                res.json(url);
            } else {
                const shortUrl = baseUrl + "/r/" + urlCode;
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
            res.status(500).send("Server Error");
        }
    } else {
        res.status(401).send("Invalid longUrl");
    }
});

module.exports = router;
