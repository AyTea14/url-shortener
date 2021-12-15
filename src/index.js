require("dotenv").config();
const express = require("express");
const app = express();
const routes = require("./routes/index");
routes(app);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-type,Accept,x-access-token,X-Key");
    if (req.method == "OPTIONS") res.status(200).end();
    else next();
});

// Database config
const connection = require("./config/db.config");
connection.once("open", () => console.log("DB Connected"));
connection.on("error", () => console.log("DB Error"));

//Listen for incoming requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server started, listening PORT ${PORT}`));
