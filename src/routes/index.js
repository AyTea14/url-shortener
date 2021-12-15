const express = require("express");
const path = require("path");
const ShortUrl = require("../models/Url");

const routes = (app) => {
    app.use(express.json({ extended: false }));
    app.use(express.static("src/public"));

    app.get("/", async (req, res) => {
        // const shortUrls = await ShortUrl.find();
        // res.render("index2", { shortUrls: shortUrls.reverse() });
        res.sendFile(path.join(`${__dirname}/../public/index.html`));
    });
    app.use("/", require("./redirect"));
    app.use("/api/url", require("./url"));
};

module.exports = routes;
