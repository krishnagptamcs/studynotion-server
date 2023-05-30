const User = require("../models/User");
const OTP = require("../models/OTP");
const Profile = require("../models/Profile");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { mailSender } = require("../utils/mailSender");



// SIGNUP LOGIC*****

exports.signup = async (req, res) => {

  console.log(req.body)
  try {
    // DATA FETCHED FROM BODY

    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      contactNumber,
      accountType,
      otp,
    } = req.body;

    //VALIDTAE KRO

    if (
      !firstName ||
      !lastName ||
      !password ||
      !email ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "Please Fill Up Required Fields",
      });
    }
    //MATCHING PASSWORD

    if (password !== confirmPassword) {
      return res.status(401).json({
        success: false,
        message: "Password and ConfirmPassword Does Not Match",
      });
    }
    //CHECKING UNIQUE EMAIL OR NOT, I.E USER EXIST OR NOT

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(401).json({
        success: false,
        message: "user already exist , pls signup to continue",
      });
    }

    //FIND MOST RECENT OTP STORED FORR THE USER

    //**.sort({createdAt:-1}) sorts the results in descending order by the createdAt property of the OTP document. This means that the most recent OTP document will be the first one in the array.

    //.limit(1) limits the number of results returned to 1, so only the most recent OTP document is returned. */

    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);

    console.log(recentOtp);

    // VALIDATE OTP TO SAVED OTP IN DB

    if (recentOtp.length === 0) {
      return res.status(400).json({
        success: false,
        message: "OTP Does Not Exist",
      });
    } else if (otp !== recentOtp[0].otp) {
      res.status(404).json({
        success: false,
        message: "OTP Does Not Match",
      });
    }

    //HAShING PASSWORD

    const hashedPassword = await bcrypt.hash(password, 10);

    //ENTRY CREATED IN DB

    // Create the Additional Profile For User----

    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}${lastName}`,
    });

    // RETURNING SUCCESFUL RESPONSE

    res.status(200).json({
      success: true,
      user,
      message: "User Successfully Created",
    });
  } catch (error) {
    console.log("the error occure while signup is :", error);
    return res.status(500).json({
      success: false,
      message: "User Creation Failed",
    });
  }
};

// LOGIN LOGIC*******

exports.login = async (req, res) => {
  console.log(req.body)
  try {
    //GET DATA FROM REQ.BODY

    const { email, password } = req.body;

    // VALIDATION OF FETCH DATA

    if (!email || !password) {
      return res.status(401).json({
        success: false,
        message: "Please Enter Email and Password",
      });
    }

    //USER CHECK EXIST OR NOT

    const user = await User.findOne({ email }).populate("additionalDetails");

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "User Not registered , please SIGNUP first",
      });
    }
    // GENERATE JWT , AFTER PASSWORD MATCH

    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
				{ email: user.email, id: user._id, accountType: user.accountType },
				process.env.JWT_SECRET,
				{
					expiresIn: "24h",
				}
			);

      // save token to user document in database
      user.token = token;
      user.password = undefined;

      // Set cookie for token and return success response

      const option = {
        httpOnly: true,
        expiresIn: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      };

      res.cookie("token", token, option).status(200).json({
        success: true,
        message: "Login Success",
        user,
        token,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid Password or Password incorrect",
      });
    }

    // SEND RESPONSE
  } catch (err) {
    console.log("the error occured in login logic and error is :", err);

    res.status(500).json({
      success: false,
      message: "Unable to login , pls try again",
    });
  }
};


// SEND OTP ****

exports.sendOTP = async (req, res) => {
  // console.log("hello ji i am from otp")
  try { 
    const { email } = req.body;

    // CHECK IF USER IS PRESNT OR NOT

    const checkUserPresent = await User.findOne({ email });

    // IF USER PRESNT THEN APPLY THIS LOGIC

    if (checkUserPresent) {
      res.status(401).json({
        success: false,
        message: "User Already Exists",
      });
    }

    //GENERATE OTP

    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    console.log("The generated OTP is :", otp);

    //CHECKING UNIQUE OTP OR NOT

    const result = await OTP.findOne({ otp: otp });

    // WHILE CHECKING WE CREATING ANOTHER OTP AND CHECKING

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });

      result = await OTP.findOne({ otp: otp });
    }

    const otpPayload = { email, otp };

    // CREATING AN ENTRY FOR OTP

    const otpBody = await OTP.create(otpPayload);

    console.log("otp body is ", otpBody);

    // RETURNING RESPONSE SUCCESFUL

    res.status(200).json({
      success: true,
      message: "OTP Generated Successfully",
      otp,
    });
  } catch (err) {
    console.log("error coming in Auth OTP is :", err);
    res.status(404).json({
      success: false,
      message: "Error Occured while sending otp",
    });
  }
};

//CHANGE PASSWORD*******************

exports.changePassword = async (req, res) => {
  try {
    //GET DATA FROM REQ.BODY

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found, pl create account first",
      });
    }

    //GET OLDPASSWORD, NEWPASSWORD, CONFIRMNEWPASSWORD

    const { oldpassword, newpassword, confirmnewpassword } = req.body;

    if (!oldpassword || !newpassword || !confirmnewpassword) {
      res.status(401).json({
        success: false,
        message: "Please enter all the required fields",
      });
    }

    // VALIDATION

    if (oldpassword === newpassword) {
      res.status(401).json({
        success: false,
        message: "New password and old password are not to be samed",
      });
    }

    if (newpassword === confirmnewpassword) {
      res.status(401).json({
        success: false,
        message: "New password and confirm new password are matched",
      });
    }
    //UPDATE PASSWORD IN DB

    const encryptPassword = await bcrypt.hash(newpassword, 10);

    const newUpdate = await User.findOneAndUpdate(
      { email: email },
      { password: encryptPassword },
      { new: true }
    );
    //SEND MAIL-CONFIRMATION OF PASSWROD CANGE

    try {
      const mailSend = await mailSender(
        email,
        "Password Changed",
        "password succesfully changed"
      );

      console.log("mailsend", mailSend);
      //SEND RESPONSE

      res.status(201).json({
        success: true,
        message: "Password Changed Successfully",
      });
    } catch (error) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while sending email:", error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      });
    }

    // returning response

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
    console.error("Error occurred while updating password:", error);
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    });
  }
};
