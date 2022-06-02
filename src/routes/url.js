const express = require("express");
const router = express.Router();
const isUrl = require("is-url");
const Url = require("../models/Url");
const { createId, generateId } = require("../utils/functions");

router.post("/shorten", async (req, res) => {
    let longUrl, shorturl;
    if (req.body.longUrl) longUrl = req.body.longUrl;
    else longUrl = req.query.longUrl;
    if (req.body.shorturl) shorturl = req.body.shorturl;
    else shorturl = req.query.shorturl;

    if (!longUrl) return res.send({ error: "Please enter a URL" });

    let urlCode = shorturl ? shorturl : await chooseKey((key) => key);

    if (isUrl(longUrl)) {
        try {
            if (shorturl && shorturl.length) {
                if (shorturl.length > 30 || shorturl.length < 5) {
                    return res.send({ error: "Custom short URLs must be between 5 and 30 characters long." });
                }
                var shorturlregex = /^[a-zA-Z0-9_-]+$/;
                let test = shorturl.search(shorturlregex);
                if (test == -1) {
                    return res.send({
                        error: "Custom short URLs can only contain alphanumeric characters and underscores.",
                    });
                }
            }
            let custom_slug = shorturl ? true : false;
            let existed = custom_slug && (await Url.exists({ urlCode }));
            let url = await Url.findOne({ longUrl });

            if (existed) {
                return res
                    .status(406)
                    .json({ error: "The shortened URL you selected is already taken. Try something more unusual." });
            }
            if (custom_slug && !url) {
                await new Url({ longUrl, urlCode: await chooseKey((s) => s), date: new Date(), custom_slug: false }).save();
                url = new Url({ longUrl, urlCode, date: new Date(), custom_slug: true });
                await url.save();
                return res.json(url);
            } else if (custom_slug && url) {
                url = new Url({ longUrl, urlCode, date: new Date(), custom_slug });
                await url.save();
                return res.json(url);
            } else if (url) {
                url = await Url.findOne({ longUrl, custom_slug: false });
                if (!url) {
                    url = new Url({ longUrl, urlCode: await chooseKey((s) => s), date: new Date(), custom_slug: false });
                    await url.save();
                }
                return res.json(url);
            } else {
                url = new Url({ longUrl, urlCode, date: new Date(), custom_slug });
                await url.save();
                return res.json(url);
            }
        } catch (err) {
            res.status(500).send({ error: "Server error" });
        }
    } else return res.status(401).send({ error: "Invalid longUrl" });
});

/**
 * @param {()=>{}} cb
 */
async function chooseKey(cb) {
    let shortURLs = await Url.find();
    let key = generateId(shortURLs.length);
    let isExisted = await Url.exists({ urlCode: key });
    return isExisted ? chooseKey(cb) : cb(key);
}

module.exports = router;
