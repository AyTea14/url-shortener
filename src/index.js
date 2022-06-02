require("dotenv").config();
const express = require("express");
const app = express();
const routes = require("./routes/index");
const uglify = require("uglify-js");
const { readdirSync, readFileSync, writeFileSync } = require("fs");

let list = readdirSync("./src/views");
for (let j = 0; j < list.length; j++) {
    let item = list[j];
    if (item.indexOf(".js") === item.length - 3 && item.indexOf(".min.js") === -1) {
        let dest = item.substring(0, item.length - 3) + ".min" + item.substring(item.length - 3);
        let orig_code = readFileSync(`./src/views/${item}`, "utf8");

        writeFileSync(`./src/views/${dest}`, uglify.minify(orig_code).code, "utf8");
        console.log(`"compressed ${item} into ${dest}`);
    }
}

routes(app);

// Database config
const connection = require("./config/db.config");
connection.once("open", () => console.log("DB Connected"));
connection.on("error", () => console.log("DB Error"));

//Listen for incoming requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server started, listening PORT ${PORT}`));
