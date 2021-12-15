const mongoose = require("mongoose");

const URLSchema = new mongoose.Schema({
    urlCode: {
        type: String,
        required: true,
    },
    longUrl: {
        type: String,
        required: true,
    },
    shortUrl: {
        type: String,
        required: true,
    },
    clicks: {
        type: Number,
        required: true,
        default: 0,
    },
    date: { type: String, default: Date.now },
});

module.exports = mongoose.model("Url", URLSchema);
