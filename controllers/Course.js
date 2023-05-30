const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");

const { uploadImageToCloudinary } = require("../utils/imageUploader");

// create course*************

exports.createCourse = async (req, res) => {
  try {
    //fetch all data

    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag,
      category,
    } = req.body;

    // get thumbnail

    const thumbnail = req.file.thumbnailImages;

    //validation

    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag ||
      !thumbnail
    ) {
      res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    // check for the insturctor

    const userId = req.user.id;

    const instructorDetails = await User.findById(userId, {
      accountType: "Instructor",
    });
    console.log("instructor details are", instructorDetails);

    if (!instructorDetails) {
      return res.status(400).json({
        success: false,
        message: "Please add instructor first",
      });
    }

    // checking tag validation

    const categoryDetails = await Category.findById(category);

    if (!categoryDetails) {
      return res.status(400).json({
        success: false,
        message: "Please add tag first , tag details not found",
      });
    }

    // upload to cloudinary

    const thumbnailImages = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    console.log("cloudinary image upload details is , ", thumbnailImages);

    // CREATE AN ENTRY FOR NEW COURSE

    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn: whatYouWillLearn,
      price,
      tag: tagDetails._id,
      category: categoryDetails._id,
      thumbnail: thumbnailImages.secure_url,
    });

    // add the new course to the user schema of instructor

    await User.findByIdAndUpdate(
      { id: instructorDetails._id },

      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );

    // add the new course to the cateogry

    await Category.findByIdAndUpdate(
      { id: category },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );

    // return response

    return res.status(200).json({
      success: true,
      message: "Course created  successfully",
    });
  } catch (error) {
    console.log("error in courseadd handler", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }s
};

// get all courses*************

exports.getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      {},
      {
        courseName: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnrolled: true,
      }
    ).populate("instructor");
    exec();

    return res.status(200).json({
      success: true,
      data: allCourses,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      success: false,
      message: `Can't Fetch Course Data`,
      error: error.message,
    });
  }
};

// get all course details***************

exports.getCourseDetails = async (req, res) => {
  try {
    // get id

    const { courseId } = req.body;

    // finding course details

    const courseDetails = await Course.find({ _id: courseId })
      .populate({
        path: "instructor",
        populate: {
          path: "additionDetails",
        },
      })
      .populate("category")
      .populate("ratingAndreviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      });

    exec();

    // validation

    if (!courseDetails) {
      return res.status(400).json({
        success: "false",
        message:`Could not find the course with ${courseId}`
      });
    }

    // return return for all okay

    return res.status(200).json({
      error: "Course found",
      success: "true",
      data: courseDetails,
    });
  } catch (error) {
    console.log("the error coming while get all course is ", error);

    return res.status(400).json({
      error: "error ocured while getting all course",
      success: "true",
    });
  }
};
