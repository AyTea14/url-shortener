const express = require("express");

const routes = (app) => {
    app.use(
        express.json({
            extended: false,
        })
    );
    app.use(express.static("public"));

    app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));
    app.use("/r", require("./redirect"));
    app.use("/api/url", require("./url"));
};

module.exports = routes;
