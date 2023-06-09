const User = require("../models/User");
const {mailSender} = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

//LOGIC FOR GENERATING MAIL FOR RESET PASSWORD*********

exports.resetPasswordToken = async (req, res) => {
  try {
    //get email from req body

    const email = req.body.email;

    //check user for this email, email validation

    const user = await User.findOne({ email:email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found, email ud not register with us",
      });
    }
    //generate token or random uuid genrate

    const token = crypto.randomBytes(20).toString("hex");

    //update user by adding token and expiration time

    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    );

    console.log("DETAILS", updatedDetails);

    // create url

    const url = `http://localhost:3000/update-password/${token}`;
    //send mail containing the url

    await mailSender(
      email,
			"Password Reset",
			`Your Link for email verification is ${url}. Please click this url to reset your password.`
    );

    // return response

    return res.json({
      success: true,
      message: "Email sent succesfully pls check and enter new password",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//LOGIC FOR RESET PASSWORD*******

exports.resetPassword = async (req, res) => {
  try {
    //data fetch

    const { password, confirmPassword, token } = req.body;
    //validation

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }
    //get userdetails from db using token

    const userDetails = await User.findOne({ token: token });

    //if no entry- invalid token

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "Invalid Token",
      });
    }
    //token time check

    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Token Expired pls regenerate your token",
      });
    }

    // hash passowrd

    const hashedPassword = await bcrypt.hash(password, 10);
    //password update

    await User.findOneAndUpdate(
      { token: token },
      { password: hashedPassword },
      { new: true }
    );
    //return response
    return res.status(200).json({
        success: true,
        message: "Password Changed Successfully"
    })
  } catch (error) {
    console.log("the error message comes in password rset :" , error)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    })
  }
};
  