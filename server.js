require("dotenv").config();
const express = require("express");
const connectDB = require("./config/connectDB");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const onError = require("./middleware/error");
const authRoutes = require("./routes/authRoutes");
const urlRoutes = require("./routes/urlRoutes");
const PORT = process.env.PORT || 8000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/url", urlRoutes);

connectDB();
app.use(onError);

app.listen(PORT, () => {
  console.log(`${PORT} started`);
});
