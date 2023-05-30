const Section = require("../models/Section");
const Course = require("../models/Course");

// CREATE SECTIONS *****

exports.createSection = async (req, res) => {
  try {
    // data fetch

    const { sectionName, courseId } = req.body;

    // validate fetch data

    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Please add section name and course id",
      });
    }
    //create section

    const newSection = await Section.create({ sectionName });
    //update the created section in course

    const updatedCourseDetails = await Course.findByIdAndUpdate(
      courseId ,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    ).populate({
      path: "courseContent",
      populate: {
        path: "subSection",
      },
    })
    .exec();

    // populate section and subsection

    // return response

    return res.status(201).json({
      success: true,
      message: "Section created successfully",
      updatedCourseDetails,
    });

    // return response
  } catch (error) {
    console.log("the error coming while section create is", error);
    return res.status(500).json({
      success: false,
      message: "Server Error- section not created",
    });
  }
};

// UPDATE SECTION *****

exports.updateSection = async (req, res) => {
  try {
    // data input
    const { sectionName, sectionId } = req.body;
    //data validation

    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "Please provide section name and section id",
      });
    }
    //update data

    const section = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    );
    //returm res

    return res.status(200).json({
      success: true,
      message: "Section updated successfully",
    });
  } catch (error) {
    console.log("the error coming while updtaing the section is", error);
    return res.status(500).json({
      success: false,
      message: "Server Error- section not updated",
    });
  }
};

// DELET SECTION********

exports.deleteSection = async (req, res) => {
  try {
    //get id, we are seending in params

    const { sectionId } = req.params;

    //use find by id and delete

    const section = await Section.findByIdAndDelete({ sectionId });

    // todo: deleting form course schema 
    // return resposne

    return res.status(200).json({
      success: true,
      message: "Section deleted successfully",
    });
  } catch (error) {
    console.log("the error coming while updtaing the section is", error);
    return res.status(500).json({
      success: false,
      message: "Server Error- section not updated",
    });
  }
};
