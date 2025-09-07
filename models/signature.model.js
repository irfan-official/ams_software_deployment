import mongoose from "mongoose";

const signatureSchema = mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    signature: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Signature = mongoose.model("Signature", signatureSchema);
export default Signature;
