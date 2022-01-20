const mongoose = require("mongoose");

const URLSchema = new mongoose.Schema({
    urlCode: { type: String, required: true },
    longUrl: { type: String, required: true },
    custom_slug: { type: Boolean, default: false },
    clicks: { type: Number, required: true, default: 0 },
    date: { type: String, default: Date.now },
});

module.exports = mongoose.model("Url", URLSchema);
