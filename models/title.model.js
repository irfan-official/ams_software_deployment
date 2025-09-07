import mongoose, { connect } from "mongoose";

const titleSchema = mongoose.Schema(
  {
    name: {
      type: "String",
      required: true,
      trim: true,
    },
    connectedGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    groupTypes: {
      type: "String",
      eum: ["Thesis", "IDP"],
      required: true,
      trim: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supervisor",
      required: true,
    },
  },
  { timestamps: true }
);

const Title = mongoose.model("Title", titleSchema);
export default Title;
