require("dotenv").config();
const express = require("express");
const app = express();
const routes = require("./routes/index");
const uglify = require("uglify-js");
const http = require("http").Server(app);
const { readdirSync, readFileSync, writeFileSync } = require("fs");
const { Server } = require("socket.io");
const { extname } = require("path");
const io = new Server(http);

let list = readdirSync("./src/views");
for (let j = 0; j < list.length; j++) {
    let item = list[j];
    if (item.indexOf(".js") === item.length - 3 && item.indexOf(".min.js") === -1) {
        let dest = item.replace(extname(item), "") + ".min" + extname(item);
        let orig_code = readFileSync(`./src/views/${item}`, "utf8");

        writeFileSync(`./src/views/${dest}`, uglify.minify(orig_code, { ie8: true }).code, "utf8");
        console.log(`Compressed ${item} into ${dest}`);
    }
}

routes(app);

// Database config
const connection = require("./config/db.config");
const Url = require("./models/Url");
connection.once("open", () => console.log("DB Connected"));
connection.on("error", () => console.log("DB Error"));

setInterval(async () => {
    let shortURLs = await Url.find();
    let clicks = shortURLs.reduce((previous, current) => previous + current.clicks, 0);

    io.emit("shortURLs_data", { shortURLs: shortURLs.length, clicks });
}, 1000);

//Listen for incoming requests
const PORT = process.env.PORT || 3001;
http.listen(PORT, () => console.log(`Server started, listening on http://127.0.0.1:${PORT}`));
