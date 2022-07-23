const mongoose = require("mongoose");

const URLSchema = new mongoose.Schema({
    urlCode: { type: mongoose.SchemaTypes.String, required: true },
    longUrl: { type: mongoose.SchemaTypes.String, required: true },
    custom_slug: { type: mongoose.SchemaTypes.Boolean, default: false },
    clicks: { type: mongoose.SchemaTypes.Number, required: true, default: 0 },
    date: { type: mongoose.SchemaTypes.Date, default: Date.now },
});

module.exports = mongoose.model("Url", URLSchema);
