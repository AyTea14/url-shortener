const express = require("express");
const router = express.Router();
const Url = require("../models/Url");

router.get("/", async (req, res) => {
    try {
        let shortURLs = await Url.find();
        let clicks = shortURLs.reduce((previous, current) => previous + current.clicks, 0);

        res.render("index", { shortURLs, clicks });
    } catch (error) {}
});
router.get("/:code", async (req, res) => {
    try {
        const url = await Url.findOne({ urlCode: req.params.code });
        if (!url) return res.status(404).render("error");

        url.clicks++;
        url.save();

        return res.redirect(url.longUrl);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});
router.get("/:code/info", async (req, res) => {
    let shortURL = await Url.findOne({ urlCode: req.params.code });
    if (!shortURL) return res.render("error");
    let longURL = `${shortURL.longUrl}`;
    shortURL = `https://shrt.ml/${shortURL.urlCode}`;

    res.render("info", { shortURL, longURL });
});

router.get("/:code/stats", async (req, res) => {
    let shortURL = await Url.findOne({ urlCode: req.params.code });
    if (!shortURL) return res.render("error");
    let longURL = `${shortURL.longUrl}`;
    let short = `https://shrt.ml/${shortURL.urlCode}`;
    let date = new Date(shortURL.date);
    let createdAt = new Date(date).toLocaleString("en-GB", {
        dateStyle: "full",
        timeStyle: "long",
        timeZone: "UTC",
    });

    res.render("stats", { shortURL: short, clicked: shortURL.clicks, longURL, createdAt });
});

module.exports = router;
