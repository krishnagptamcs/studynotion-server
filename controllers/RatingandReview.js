const { default: mongoose } = require("mongoose");
const Course = require("../models/Course");
const ratingAndReviews = require("../models/RatingAndReviews");

const User = require("../models/User");


// CREATE RATING **********

exports.createRating = async (req, res) => {
  try {
    //get user id

    const userId = req.body;

    // fetch data from req. body

    const { rating, review, courseId } = req.body;

    // check if user is enrolled or not

    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: {
        $elemMatch: { $eq: userId },
      },
    });

    if (!courseDetails) {
      return res
        .status(404)
        .json({ 
          success:false,
          message: "User is not enrolled in the course" });
    }
    //check if user already reviwed the course

    const alreadyReviewed = await ratingAndReviews.findOne({
      user: userId,
      course: courseId,
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "User has already reviewed the course",
      });
    }

    //creating rating and review

    const ratingReviews = await ratingAndReviews.create({
      user: userId,
      course: courseId,
      rating,
      review,
    });
    // update the course (add rating and review)

    const updateCourseDetails = await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $push: {
          ratingAndReviews: ratingReviews._id,
        },
      },
      { new: true }
    );

    console.log(updateCourseDetails);

    // return response

    return res.status(200).json({
      success: true,
      message: "rating and review done",
    });
  } catch (error) {
    console.log("the error coming in rating and review", error);

    return res.status(500).json({
      success: false,
      message: "error in rating ",
    });
  }
};

//  GET AVERAGE RATING******

exports.getAverageRating = async (req, res) => {
  try {
    // get course id

    const courseId = req.body.courseId;
    // get average rating using average method

    const result = await ratingAndReviews.aggregate({
      $match: {
        course: new mongoose.Types.ObjectId(courseId),
      },
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
      },
    });

    // return rating response

    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        avgRating: result[0].avgRating,
        message: "average rating and reviews",
      });
    }

    // if no result / review
    return res.status(404).json({
      success: false,
      message: "no rating and reviews given till now",
      avgRating: 0,
    });
  } catch (error) {
    console.log("the error coming in get average rating is ", error);

    return res.status(500).json({
      success: false,
      message: "error in rating ",
    });
  }
};


// GET ALL RATING & REVIEW***********

exports.getAllRatingReview = async (req, res) => {
  try {
    const allReviews = await ratingAndReviews
      .find({})
      .sort({ rating: "desc" })
      .populate({
        path: "user",
        select: "firstName lastName email image",
      })
      .populate({
        path: "course",
        select: "courseName",
      })
      .exec();

      return res.status(200).json({
        success: true,
        message: "all rating and reviews fetch succesfully",
      })
  } catch (error) {
    console.log("the error coming in  getallRating is ", error);

    return res.status(500).json({
      success: false,
      message: "error in getallrating ",
    });
  }
};
