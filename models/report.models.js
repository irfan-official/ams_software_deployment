import mongoose, { startSession } from "mongoose";

const reportModel = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group", // reffer to the groupName
      required: true,
    },

    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supervisor", // reffer to the groupName
      required: true,
    },

    week: {
      type: Number,
      default: 1,
      trim: true,
    },

    date: {
      type: String,
      default: (new Date()).toLocaleDateString('en-GB'),
      required: true,
      trim: true,
    },

    students: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student", //reffer to the Student studentID
      required: true,
    }],

    studentSignature: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
        },

        signature: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Signature",
        }
      },
    ],

    titles: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },

        title: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Title",
          required: true,
        }
      }
    ],

    present: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },       
       presentStatus: {
          type: Boolean,
          default: false,
        },
      }
    ],

    supervisorComments: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },
        comment: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Comment",
          required: true,
        },
      },
    ],
    remarks: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },

        remarks: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Remarks",
          required: true,
        }
      },
    ],
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportModel);

export default Report
