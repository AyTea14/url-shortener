const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

const routes = (app) => {
    app.use(bodyParser.json());
    app.use(cors());
    app.use(express.urlencoded({ extended: false }));
    app.use(express.static("src/public"));
    // app.set("view engine", "ejs");
    // app.set("views", path.join(__dirname, "./views"));

    app.get("/", async (req, res) => res.sendFile(path.join(`${__dirname}/../public/index.html`)));
    app.use("/", require("./redirect"));
    app.use("/api/url", require("./url"));
};

module.exports = routes;
