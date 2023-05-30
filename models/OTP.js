const mongoose = require("mongoose");
const   { mailSender }  = require("../utils/mailSender");
const emailTemplate =  require("../templates/emailVerificationTemplate")

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },

  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 60*5,
  },
});

//DEFING A FUCNTION TO SEND OTP

async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Mail from StudyNotion",
      emailTemplate(otp),
     
    );

    console.log("Email sent succesfully:  ", mailResponse.response);
  } catch (err) {
    console.log("error message in otp  model is ", err);
  }
}

/// Define a pre-save hook to send email before the document has been saved

otpSchema.pre("save", async function (next) {
  // await sendVerificationEmail(this.email, this.otp);
  // next();

  	// Only send an email when a new document is created
	if (this.isNew) {
		await sendVerificationEmail(this.email, this.otp);
	}
	next();
  
});

// TO DEFINE IN ANOTHER PARTS OF THIS MODEL WE HAVE TO EXPORTS AS MODULE

module.exports = mongoose.model("OTP", otpSchema);
