const express = require("express");

const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");



const database = require("./config/database");
//**NPM PACKAGE */
const cookieParser = require("cookie-parser");

//cross origin resource sharing {to connect frontend and backend server on same machine} //**NPM PACKAGE */
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
//**NPM PACKAGE */
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT || 4000;

// data base connect

database.connect();
// middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    // it shows that req. is coming from front end and we have to connect this req. u=with backend

    origin: "http://localhost:3000",
    credentials: true,
  })
);

// file uploader

app.use(
  fileUpload({
    useTempFiles:true,
    tempFileDir:"/tmp",
  })
);

// cloudinary connect

cloudinaryConnect();
// routes

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);

// default routes

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running",
  });
});

// ACTIVATING THE SERVER
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
