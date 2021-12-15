const express = require("express");
const router = express.Router();
const Url = require("../models/Url");

router.get("/:code", async (req, res) => {
    try {
        const url = await Url.findOne({ urlCode: req.params.code });
        if (!url) return res.status(404).send("No URL Found");

        url.clicks++;
        url.save();

        return res.redirect(url.longUrl);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

module.exports = router;
