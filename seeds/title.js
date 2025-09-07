
import Title from "../models/title.model.js";
import Supervisor from "../models/supervisor.models.js";
import Student from "../models/student.models.js";
import CustomError from "../utils/ErrorHandling.js"
import { Internal } from "../utils/ErrorTypesCode.js";

export default async function (name, id) {
    try {

        let supervisor = await Supervisor.findOne({
            name: "irfanmaster",
        })

        let student = await Student.findOne({
            studentID: id
        })

        const createdTitle = await Title.create({
            title: name,
            groupTypes: "Thesis",
            studentID: [student._id],
            supervisor: supervisor._id
        })
    } catch (error) {
        console.log(error.message)
    }
}


