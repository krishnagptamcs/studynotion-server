const { instance } = require("../config/razorpay");

const User = require("../models/User");

const Course = require("../models/Course");

const mailSender = require("../utils/mailSender");
const { courseEnrollmentEmail } = require("../templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");

//CAPTURE PAYMENTS AND INITIALISE THE ORDER****

exports.capturePayment = async (req, res) => {
  try {
    // get courrse id

    const { course_id } = req.body;

    const userId = req.user.id;

    //validation courseid

    if (!course_id) {
      return res.status(400).json({
        success: false,
        message: "Course id is required",
      });
    }
    // validate course detail

    let course;
    try {
      course = await Course.findById(course_id);
      if (!course) {
        return res.status(200).json({
          success: false,
          message: "Course not found",
        });
      }

      // user already pay for the same course

      // coberting one type to another type

      const uid = new mongoose.Types.ObjectId(userId);

      if (course.studentsEnrolled.includes(uid)) {
        return res.status(200).json({
          success: false,
          message: "User already enrolled in the course",
        });
      }
    } catch (error) {
      console.log("the error coming while course validation is", error);
      return res.status(500).json({
        success:false,
        message:error.message,
    });

    }

    // order create

    const amount = course.price;
    const currency = "INR";


    const options = {
      amount: amount * 100,
      currency,
      recipt: Math.random(Date.now()).toString(),
      notes: {
        course_id: course_id,
        userId,
      },
    };

    try {
      // initate the payment using razorpay

      const paymentResponse = await instance.orders.create(options);
      console.log(paymentResponse);

      // return response

      return res.status(200).json({
        success: true,
        message: "Payment initiated successfully",
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        thumbnail: course.thumbnail,
        orderId: paymentResponse.id,
        currency: paymentResponse.currency,
        amount: paymentResponse.amount,
      });
    } catch (err) {
      console.log("the error while crrwating payment", err);

      res.status(400).json({
        success: false,
        message: "Payment Failed",
      });
    }
  } catch (error) {
    console.log("the error mesaage come in payment handler,", error);

    res.status(400).json({
      success: false,
      message: "Payment Failed , could not initiate order",
    });
  }
};

// VERIFY SIGNATURE OF RAZOR PAY AND SERVER 

exports.verifySignature = async (req, res) => {
  try {
    const webhookSecret = "12345678";

    const signature = req.header["x-razorpay-signature"];

    const shasum = crypto.createHmac("shah256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (signature === digest) {
      console.log("payment is authorised");

      // after succesful authentication , we have to enroll the students(user) in course array, so we have to fetching the course id and user id

      const { userId, courseId } = req.body.payload.payment.entity.notes;

      try {
        // fulfill the action-----  find the course and enroll the students in it

        const enrolledCourse = await Course.findOneAndUpdate(
          { _id: courseId },
          {
            $push: {
              studentsEnrolled: userId,
            },
          },
          { new: true }
        );

        
        if (!enrolledCourse) {
          return res.status(500).json({
            success: false,
            message:
              "Could not enroll the student in the course course not found",
          });
        }

        console.log(enrolledCourse);

        // find the students and add the course to their enrolled course me

        const enrolledStudents = await User.findOneAndUpdate(
          { _id: userId },
          {
            $push: { courses: courseId },
          },
          { new: true }
        );

        console.log(enrolledStudents);

        // sending the confirmation mail to the enrolled students

        const emailResponse = await mailSender(
          enrolledStudents.email,
          "Congratulation from study notion",
          "Congratulation , you are onboarded into new Codehelp course "
        );

        console.log(emailResponse);

        return res.status(200).json({
          success: true,
          message: "Student enrolled in the course successfully",
        });
      } catch (error) {
        console.log(
          "error occure at the time of course adding to the user ",
          error
        );

        res.status(400).json({
          success: false,
          message: "Could not enroll the student in the course",
        });
      }
    } else {
      return res.json({
        success: false,
        message: "signature not matched",
      });
    }
  } catch (err) {
    console.log("error occure while verifying the signature ", err);
    return res.status(400).json({
      success: false,
      message: "Could not enroll the student in the course",
    });
  }
};
