require("dotenv").config();
const express = require("express");
const app = express();
const routes = require("./routes/index");
const uglify = require("uglify-js");
const http = require("http").Server(app);
const { Server } = require("socket.io");
const { readdirSync, readFileSync, writeFileSync } = require("fs");
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

routes(app, io);

// Database config
const connection = require("./config/db.config");
connection.once("open", () => console.log("DB Connected"));
connection.on("error", () => console.log("DB Error"));

io.on("connection", (socket) => {
    socket.on("new_shortURL_data", (shortURLs) => {
        io.emit("new_shortURL_data", shortURLs);
    });
});

//Listen for incoming requests
const PORT = process.env.PORT || 3001;
http.listen(PORT, () => console.log(`Server started, listening on http://127.0.0.1:${PORT}`));
