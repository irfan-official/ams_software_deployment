import mongoose, { Schema } from "mongoose";

const groupSchema = mongoose.Schema(
  {
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supervisor",
      required: true,
    },
    title: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Title",
      required: true,
    },
    groupMembers: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
        },
        designation: {
          type: String,
          enum: ["Design Secretary", "Project Leader", "Developer"],
        },
      },
    ],
    titles: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
        },
        title: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Title",
        },
      },
    ],
    groupTypes: {
      type: String,
      enum: ["Thesis", "IDP"],
      required: true,
    },
    semister: {
      type: String,
      enum: ["1", "2", "3", "4", "5", "6", "7", "8"],
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Group = mongoose.model("Group", groupSchema);
export default Group;
