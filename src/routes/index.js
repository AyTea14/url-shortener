const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const apiRoute = require("./url");
const redirectRoute = require("./redirect");

/**
 * @param {app} app
 * @return {app}
 */
const routes = (app) => {
    app.use(express.json());
    app.use(cors());
    app.use(express.urlencoded({ extended: false }));
    app.use(express.static("src/views"));

    app.set("view engine", "ejs");
    app.set("views", path.resolve(process.cwd(), "src/views"));

    app.use("/", redirectRoute);
    app.use("/api/url", apiRoute);
    return app;
};

module.exports = routes;
