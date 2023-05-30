const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

// CREATING AUTHENTICATION ****

exports.auth = async (req, res, next) => {
  try {
    //EXTRACT TOKEN

    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorisation").replace("Bearer", "");

    //IF TOKEN IS MISSING THEN RETURN RESPONSE

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }

    //VERIFY THE TOKEN(using secret key)

    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);

      console.log(decode);

      // seding decod in user
      req.user = decode;
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid",
      });
    }

    next();
  } catch (err) {
    console.log("the error coming while validation");
    return res.status(401).json({
      success: false,
      message: "validation failed",
    });
    s;
  }
};

//IS STUDENTS*****

exports.isStudent = async (req, res, next) => {
  try {
    if (req.user.accoutType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "You are not student",
      });
    }
    next();
  } catch (err) {
    console.log("the error is in auth middleware isStudents is :", err);
    res.status(401).json({
      success: false,
      message: "something went wrong",
    });
  }
};

//IS INSTRUCTOR*****

exports.isInstructor = async (req, res, next) => {
  try {
    if (req.user.accoutType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "You are not Instructor",
      });
    }
    next();
  } catch (err) {
    console.log("the error is in isInstructor  middleware is :", err);
    res.status(401).json({
      success: false,
      message: "something went wrong",
    });
  }
};

//IS ADMIN********

exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user.accoutType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "You are not Admin",
      });
    }
    next();
  } catch (err) {
    console.log("the error is in isAdmin middleware is :", err);
    res.status(401).json({
      success: false,
      message: "something went wrong",
    });
  }
};
