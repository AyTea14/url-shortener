const express = require("express");

const router = express.Router();

const validUrl = require("valid-url");
const shortid = require("shortid");
const { customAlphabet } = require("nanoid");

const Url = require("../models/Url");

//@route    POST /api/url/shorten
//@desc     Create short URL

const baseUrl = "https://url-shortener.aytea14.repl.co";
router.post("/shorten", async (req, res) => {
    let longUrl;
    if (req.body.longUrl) longUrl = req.body.longUrl;
    else longUrl = req.query.longUrl;

    if (!validUrl.isUri(baseUrl)) {
        return res.status(401).json("Invalid base URL");
    }
    const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", 7);
    const urlCode = nanoid();

    if (validUrl.isUri(longUrl)) {
        try {
            let url = await Url.findOne({ longUrl });
            if (url) {
                res.json(url);
            } else {
                const shortUrl = baseUrl + "/" + urlCode;
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
            console.log(err);
            res.status(500).json("Server Error");
        }
    } else {
        res.status(401).json("Invalid longUrl");
    }
});

module.exports = router;
