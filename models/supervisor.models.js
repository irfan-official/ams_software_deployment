import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Internal, External } from "../utils/ErrorTypesCode.js";
import CustomError from "../utils/ErrorHandling.js";
import {
  default_genderMale_supervisor_image,
  default_genderFemale_supervisor_image,
  default_genderOthers_supervisor_image,
  default_genderInitial_all_image,
} from "../utils/imagesChoise.js";

const supervisorSchema = new mongoose.Schema(
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
      default: "initial",
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
  { timestamps: true } // fixed typo
);

// Pre-save hook
supervisorSchema.pre("save", async function (next) {
  try {
    // Assign default image if missing
    if (!this.image) {
      if (this.gender === "male")
        this.image = default_genderMale_supervisor_image;
      else if (this.gender === "female")
        this.image = default_genderFemale_supervisor_image;
      else if (this.gender === "others")
        this.image = default_genderOthers_supervisor_image;
      else this.image = default_genderInitial_all_image;
    }

    // Hash password only if modified
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);

    next();
  } catch (err) {
    next(
      new CustomError("Internal server error during pre-save", 500, Internal)
    );
  }
});

// Compare password method
supervisorSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    throw new CustomError("Password comparison failed", 400, Internal);
  }
};

const Supervisor = mongoose.model("Supervisor", supervisorSchema);
export default Supervisor;
