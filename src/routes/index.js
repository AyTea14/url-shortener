const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const shortenURLs = require("../models/Url");
const apiRoute = require("./url");
const redirectRoute = require("./redirect");

/**
 * @param {app} app
 */
const routes = (app) => {
    app.use(bodyParser.json());
    app.use(cors());
    app.use(express.urlencoded({ extended: false }));
    // app.use(express.static("src/public"));
    app.use(express.static("src/views"));
    app.set("view engine", "ejs");
    app.set("views", path.join(process.cwd(), "src/views"));

    // app.get("/", async (req, res) => res.sendFile(path.join(`${__dirname}/../public/index.html`)));
    app.get("/", async (req, res) => {
        let shortURLs = await shortenURLs.find();
        let clicks = shortURLs.reduce((previous, current) => previous + current.clicks, 0);

        res.render("index", { shortURLs, clicks });
    });
    app.get("/:code/info", async (req, res) => {
        let shortURL = await shortenURLs.findOne({ urlCode: req.params.code });
        if (!shortURL) return res.render("error");
        let longURL = `${shortURL.longUrl}`;
        shortURL = `https://shrt.ml/${shortURL.urlCode}`;

        res.render("info", { shortURL, longURL });
    });
    app.get("/:code/stats", async (req, res) => {
        let shortURL = await shortenURLs.findOne({ urlCode: req.params.code });
        if (!shortURL) return res.render("error");
        let longURL = `${shortURL.longUrl}`;
        let short = `https://shrt.ml/${shortURL.urlCode}`;
        let createdAt = new Date(shortURL.date).toUTCString();

        res.render("stats", { shortURL: short, clicked: shortURL.clicks, longURL, createdAt });
    });
    app.use("/", redirectRoute);
    app.use("/api/url", apiRoute);
};

module.exports = routes;
