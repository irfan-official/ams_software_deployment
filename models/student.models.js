import mongoose from "mongoose";
import { default_genderMale_student_image, default_genderFemale_student_image, default_genderOthers_student_image, defaultault_genderInitial_all_image } from "../utils/imagesChoise.js"
import { Internal, External } from "../utils/ErrorTypesCode.js";

const studentScheam = new mongoose.Schema(
  {
    studentID: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },

    name: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "others", "initial"],
      default: "initial"
    },

    semister: {
      type: String,
      enum: ["1", "2", "3", "4", "5", "6", "7", "8"],
      required: true,
      trim: true,
    },

    department: {
      type: String,
      enum: ["CSE", "EEE", "ICE", "ME", "BBA", "ENG", "LAW"],
      required: true,
    },

    signature: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Signature",
    },
    associateGroups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
      },
    ],
  },
  { timestamps: true }
);

studentScheam.pre("save", async function (next) {
  try {

    // ----- changes to image field if it is not presence -----

    if (!this.image) {

      if (this.gender === "male") {
        this.image = default_genderMale_student_image;
      } else if (this.gender === "female") {
        this.image = default_genderFemale_student_image;
      } else if(this.gender === "others") {
        this.image = default_genderOthers_student_image;
      }else {
        this.image = defaultault_genderInitial_all_image;
      }
    }

    next();

  } catch (err) {
    next(new CustomError("Internal server Error", 500, External));
  }
});

const Student = mongoose.model("Student", studentScheam);

export default Student;
