require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const routes = require("./routes/index");
routes(app);

app.use(bodyParser.json());
app.use(cors());

// Database config
const connection = require("./config/db.config");
connection.once("open", () => console.log("DB Connected"));
connection.on("error", () => console.log("DB Error"));

//Listen for incoming requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server started, listening PORT ${PORT}`));
