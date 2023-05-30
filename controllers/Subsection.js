const SubSection = require("../models/SubSection");

const Section = require("../models/Section");

const { uploadImageToCloduniary } = require("../utils/imageUploader");

// CREATE SUB-SECTION ******

exports.createSubSection = async (req, res) => {
  try {
    // fetch data from req.body

    const { sectionId, titile, timeduration, description } = req.body;
    //extract file/video

    const video = req.file.videoFiles;

    //validation

    if (!sectionId || !titile || !timeduration || !description || !video) {
      return res.status(400).json({
        error: "Please add all the fields",

        success: false,
      });
    }
    // upload file/video to cloudinary

    const uploadDetails = await uploadImageToCloduniary(
      video,
      process.env.FOLDER_NAME
    );
    //create a sub section

    const subSectionDetails = await SubSection.create({
      titile: titile,
      timeduration: timeduration,
      videoUrl: uploadDetails.secure_url,
      description: description,
    });
    // updated the created subsectio in section

    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $push: {
          subSection: subSectionDetails._id,
        },
      },
      { new: true }
    ).populate("SubSection");

    // return success message

    return res.status(200).json({
      success: true,
      data: updatedSection,
      message: "subsection creted succeffulyy",
    });
  } catch (error) {
    console.log("the error coming while creating the sub setcion us ,", error);
    return res.status(400).json({
      success: false,

      message: "subsection not  created ",
    });
  }
};

//UPDATE SUBSECTION

exports.updateSubSection = async (req, res) => {
  try {
    const { subSectionDetailsId, title } = req.body;

    if (!subSectionDetailsId || !title) {
      return res.status(400).json({
        success: false,
        message: "please provide all the required fields",
      });
    }

    // updateing the subsection

    const updateSubSection = await SubSection.findByIdAndUpdate(
      subSectionDetailsId,
      { title: title },
      { new: true }
    );

    // return response

    return res.status(200).json({
      success: true,
      data: updateSubSection,
      message: "subsection update succesfullly",
    });
  } catch (error) {
    console.log("the eror coming while updating the sub setcion us ,", error);
    return res.status(400).json({
      success: false,
      message: "subsection not  update ",
    });
  }
};

// DELET SUB SECTION ******

exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionDetailsId } = req.body;

    if (!subSectionDetailsId) {
      return res.status(400).json({
        success: false,
        message: "please provide all the required fields",
      });
    }

    // deleting the subsection

    const deletSubSection = await SubSection.findByIdAndDelete(
      subSectionDetailsId
    );

    // return response

    return res.status(200).json({
      success: true,
      data: deletSubSection,
      message: "subsection delet  succesfullly",
    });
  } catch (error) {
    console.log("the eror coming while updating the sub setcion us ,", error);
    return res.status(400).json({
      success: false,
      message: "subsection not delete ",
    });
  }
};
