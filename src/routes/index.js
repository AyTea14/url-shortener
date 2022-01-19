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
        let clicks = 0;
        shortURLs.forEach(({ clicks: click }) => (clicks += click));

        res.render("index", { shortURLs, clicks });
    });
    app.use("/", redirectRoute);
    app.use("/api/url", apiRoute);
};

module.exports = routes;
