const mongoose = require("mongoose");
require('dotenv').config();
mongoose.connect(process.env.MONGO_DB_KEY)
.then(() => {
    console.log("database connected😊");
}).catch((err) => {
    console.log("database not connected 😒");
    console.log(err.message)
});

module.exports = mongoose;