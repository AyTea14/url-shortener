const express = require("express");
const path = require("path");

const routes = (app) => {
    app.use(express.json({ extended: false }));
    app.use(express.static("src/public"));

    app.get("/", (req, res) => res.sendFile(path.join(`${__dirname}/../public/index.html`)));
    app.use("/", require("./redirect"));
    app.use("/api/url", require("./url"));
};

module.exports = routes;
