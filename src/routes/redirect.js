const express = require("express");
const router = express.Router();
const Url = require("../models/Url");
const { default: request } = require("@aytea/request");

// const client = require("..");
// console.log(client);

router.get("/:code", async (req, res) => {
    try {
        const url = await Url.findOne({ urlCode: req.params.code });
        if (!url) return res.status(404).render("error");

        url.clicks++;
        url.save();

        const data = await request(`http://${req.get("host")}/api/url/stats`).json();
        req.io.emit("new_shortURLs_data", data);

        return res.redirect(url.longUrl);
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

router.get("/", async (req, res) => {
    // await Url.updateMany({ increment: { $exists: true } }, { $unset: { increment: 1 } })
    try {
        let shortURLs = await Url.find();
        let clicks = shortURLs.reduce((previous, current) => previous + current.clicks, 0);

        res.render("index", { shortURLs: shortURLs.length, clicks });
    } catch (error) {}
});

router.get("/:code/info", async (req, res) => {
    let shortURL = await Url.findOne({ urlCode: req.params.code });
    if (!shortURL) return res.render("error");
    let longURL = `${shortURL.longUrl}`;
    shortURL = `${req.headers["x-forwarded-proto"] ? "https" : "http"}://${req.get("host")}/${shortURL.urlCode}`;

    res.render("info", { shortURL, longURL });
});

router.get("/:code/stats", async (req, res) => {
    let shortURL = await Url.findOne({ urlCode: req.params.code });
    if (!shortURL) return res.render("error");
    let longURL = `${shortURL.longUrl}`;
    let short = `${req.headers["x-forwarded-proto"] ? "https" : "http"}://${req.get("host")}/${shortURL.urlCode}`;
    let date = new Date(shortURL.date);
    let createdAt = new Date(date).toLocaleString("en-GB", {
        dateStyle: "full",
        timeStyle: "long",
        timeZone: "UTC",
    });

    res.render("stats", { shortURL: short, clicked: shortURL.clicks, longURL, createdAt });
});

module.exports = router;
