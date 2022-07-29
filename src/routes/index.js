const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const apiRoute = require("./url");
const redirectRoute = require("./redirect");

/**
 * @param {app} app
 * @param {import('socket.io').Server} io
 * @return {app}
 */
const routes = (app, io) => {
    app.use(express.json());
    app.use(cors());
    app.use(express.urlencoded({ extended: false }));
    app.use(express.static("src/views"));
    app.use((req, res, next) => {
        req.io = io;
        next();
    });
    app.set("view engine", "ejs");
    app.set("views", path.resolve(process.cwd(), "src/views"));

    app.use("/", redirectRoute);
    app.use("/api/url", apiRoute);
    return app;
};

module.exports = routes;
