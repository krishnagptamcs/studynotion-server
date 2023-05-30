const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
  mongoose
    .connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("DB connection succesfully"))
    .catch((err) => {
      console.log(err);
      console.log("db not connetced ");
      process.exit(1);
    });
};
