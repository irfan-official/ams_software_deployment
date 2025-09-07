import mongoose from "mongoose"

const remarksSchema = mongoose.Schema({
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
    },
    report: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Report",
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    },
    supervisor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supervisor"
    },
    remarks: {
        type: String,
        trim: true,
        default: "",
    }
}, { timestamps: true })

const Remarks = mongoose.model("Remarks", remarksSchema)

export default Remarks;