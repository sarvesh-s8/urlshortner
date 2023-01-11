const mongoose = require("mongoose");
const connectDB = async () => {
  await mongoose.connect(`${process.env.MONGO_URL}`, (err) => {
    if (err) throw err;
    console.log(`Connected Successfully`, process.env.PORT);
  });
};
module.exports = connectDB;
