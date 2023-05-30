const User = require("../models/User");
const Profile = require("../models/Profile");

// find schedule of a fucntion call ,that the fucntion should not excute at instance

//UPDATE PROIFLE ****

exports.updateProfile = async (req, res) => {
  try {
    // get data

    const { dateofBirth = "", contactNumber = "", gender = "" } = req.body;

    // get userid

    const id = req.user.id;

    // validation

    if (!dateofBirth || !contactNumber || !gender) {
      return res.status(400).json({
        error: "Please add all the details",

        success: false,
      });
    }

    // finding the profile id in user model

    const userDetails = await User.findById(id);

    const profileId = userDetails.additionalDetails;

    const profileDetails = await Profile.findById(profileId);

    // upaditng the profile details

    profileDetails.contactNumber = contactNumber;
    profileDetails.dateOfBirth = dateofBirth;
    profileDetails.gender = gender;

    await profileDetails.save();

    // returning the resoonse

    return res.status(200).json({
      success: true,
      message: "profile updated succeesfully",
      profileDetails,
    });
  } catch (error) {
    console.log("the error occuring while updating the profie is ", error);

    return res.status(400).json({
      success: false,
      message: "error occured whilst updating the profile",
    });
  }
};

// DELET ACCOUNT (PROFILE AS WELL AS USER)

exports.deleteAccount = async (req, res) => {
  try {
    // fetch user id

    const id = req.user.id;

    // validate by finding
    const userDetails = await User.findById(id);

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }

    // delet associate profile with user

    await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

    //we have to effect on enroll course array , that is no of students also get decrease while deletting account

    // delet user

    await User.findByIdAndDelete({ _id: id });
    // return response

    return res.status(200).json({
      success: true,
      message: "account deleted succeesfully",
    });
  } catch (error) {
    console.log("the error occuring whilw deleting the profile is ", error);

    return res.status(400).josn({
      success: false,
      message: "error while deleting aaccount",
    });
  }
};

// GET ALL USER ****

exports.getAllUserDetails = async (req, res) => {
  try {
    const id = req.user.id;

    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();

    console.log(userDetails);

    return res.status(200).json({
      success: true,
      data: userDetails,
      message: "user details fetch succesfully",
    });
  } catch (error) {
    console.log("the error coming while fetchig user details is", error);
    return res.status(500).json({
      success: false,
      message: "error while fetching user details",
    });
  }
};
