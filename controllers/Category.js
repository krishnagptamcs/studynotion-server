const Category = require("../models/Category");

// CREATE CATEGORY********

exports.createCategory = async (req, res) => {
  try {
    // fethcing data from req. body
    const { name, description } = req.body;

    //  validating the fetch data

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide the Tag Name and description ** fieds are require ",
      });
    }

    // after reciving name and description we make entry in db

    const categoryDetails = await Category.create({
      name: name,
      description: description,
    });

    console.log(categoryDetails);

    return res.status(200).json({
      success: true,
      message: "category Created Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// SHOW ALL CATEGORY*****

exports.showAllCategories = async (req, res) => {
  try {
    const allCategory = await Category.find({}, { name: true, description: true });

    return res.status(200).json({
      success: true,
      message: "All category List obtained",
    });
  } catch (error) {
    console.log("the error coming in show all category is ,", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// CATEGORY PAGE DETAILS**** (to show difrent category of course)

exports.categoryPageDetails = async (req, res) => {
  try {
    // get category id
    const { categoryId } = req.body;

    // getspecifc course for sepcific course id

    const selectCategory = await Category.findById(categoryId)
      .populate("course")
      .exec();
    // validation

    if (!selectCategory) {
      return res.status(404).json({
        success: false,
        message: "No Category Found",
      });
    }
    // get course for diffrent category

    const diffrenCategories = await Category.find({
      //** ne= not equal we are finding category which is not eqal to current courseid */
      _id: { $ne: categoryId },
    })
      .populate("courses")
      .exec();

    // logic for top selling course
    ///HW

    // return response

    return res.status(200).json({
      success: true,
      message: "All Categories List obtained",
      data:{
        diffrenCategories,
        selectCategory
      }
    });
  } catch (error) {
    console.log("the error coming in showing diffent catefory is ,", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
