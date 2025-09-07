import CustomError from "../utils/ErrorHandling.js"
import Report from "../models/report.models";
import Student from "../models/student.models.js";
import { Internal } from "../utils/ErrorTypesCode.js";
import Group from "../models/group.models.js";
import Title from "../models/title.model.js";

function weekFinder(report) {
    let week = report.length

    if (report.length === 0) {
        week += 1;
    }
    return week
}

const createdReportMiddleware = async (req, res, next) => {

    try {
        const { groupID = "", studentID = [], titleID = [] } = req.body;
        
        let report = await Report.find({ group: groupID }).lean();

        const {preevWeek = weekFinder(report) } = req.body;

        let group = await Group.findOne({ _id: groupID }).lean();
        let title = await Title.findOne({ _id: titleID }).lean();

        if (!groupID || !preevWeek || !studentID || !title) {
            throw new CustomError("All fields are required", 401, Internal)
        }

        if (!group) {
            throw new CustomError("Invalid group", 401, Internal)
        }

        if (!title) {
            throw new CustomError("Invalid group title", 401, Internal)
        }

        for (sID of studentID) {

            try {
                let student = Student.findOne({ _id: sID })

                if (!student) {
                    throw new CustomError("Invalid Student, please insert the correct student ID", 401, Internal)
                }
            } catch (error) {
                next(error)
            }

        }

        req.user = { groupID, preevWeek, studentID, title };

        next();

    } catch (error) {
        next(error)
    }

}