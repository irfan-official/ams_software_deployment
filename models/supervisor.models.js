import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Internal, External } from "../utils/ErrorTypesCode.js";
import CustomError from "../utils/ErrorHandling.js";
import { default_genderMale_supervisor_image, default_genderFemale_supervisor_image, default_genderOthers_supervisor_image, defaultault_genderInitial_all_image } from "../utils/imagesChoise.js"

const supervisorSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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

    groups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
      },
    ],
    department: {
      type: String,
      enum: ["CSE", "EEE", "ICE", "ME", "BBA", "LAW", "ENG"],
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { Timestamp: true }
);

supervisorSchema.pre("save", async function (next) {
  try {

    // ----- changes to image field if it is not presence -----

    if (!this.image) {
      if (this.gender === "male") {
        this.image = default_genderMale_supervisor_image;
      } else if (this.gender === "female") {
        this.image = default_genderFemale_supervisor_image;
      } else if(this.gender === "others") {
        this.image = default_genderOthers_supervisor_image;
      }else {
        this.image = defaultault_genderInitial_all_image;
      }
    }

     // ----- changes to password field if it is not modified -----

    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(new CustomError("Internal server Error", 500, External));
  }
});

supervisorSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    throw new CustomError("Password comparison failed", 400, Internal);
  }
};

const Supervisor = mongoose.model("Supervisor", supervisorSchema);

export default Supervisor;
