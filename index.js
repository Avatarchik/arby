require("dotenv").config();

if (process.env.NODE_ENV !== "debug") {
    require("@babel/register");
}

require("./src/app.js");
