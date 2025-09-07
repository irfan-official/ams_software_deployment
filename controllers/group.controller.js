import Group from "../models/group.models.js";
import CustomError from "../utils/ErrorHandling.js";
import { Internal, External } from "../utils/ErrorTypesCode.js";
import Report from "../models/report.models.js";
import Title from "../models/title.model.js";
import Student from "../models/student.models.js";
import Signature from "../models/signature.model.js";
import Supervisor from "../models/supervisor.models.js";
import Comment from "../models/comment.model.js";
import Remarks from "../models/remarks.models.js";


export const allStudents = async (req, res, next) => {
  try {
    const { userID } = req.userID;

    if (!userID) {
      throw new CustomError("Please Login ", 401, Internal);
    }

    const AllStudentsData = await Student.find().select("-signature -associateGroups").lean();

    return res.status(200).json({
      success: true,
      message: "",
      responseData: AllStudentsData || [],
    })

  } catch (error) {
    next(error);
  }
}

export const allSupervisors = async (req, res, next) => {
  try {

    const { userID } = req.userID;

    if (!userID) {
      throw new CustomError("Please Login ", 401, Internal);
    }

    const AllSupervisorsData = await Supervisor.find().select("-password -groups").lean();

    return res.status(200).json({
      success: true,
      message: "",
      responseData: AllSupervisorsData || [],
    })

  } catch (error) {
    next(error);
  }
}

export const allGroup = async (req, res, next) => {
  try {
    const { userID } = req.userID;

    if (!userID) {
      throw new CustomError("Please Login ", 401, Internal);
    }

    const groups = await Group.find({ supervisor: userID }).populate([
      {
        path: "title",
        select: "name",
      },
      {
        path: "supervisor",
        select: "name",
      },
      {
        path: "title.student",
        select: "name studentID",
      },
      {
        path: "title.title",
        select: "name",
      },
      {
        path: "groupMembers.student",
        select: "studentID name semister department",
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "",
      responseData: groups || [],
      userID: userID,
    });
  } catch (error) {
    next(error);
  }
};

export const createGroup = async (req, res, next) => {
  try {
    const { groupName, groupTypes, groupMembers, semister } = req.user;
    const { userID } = req.userID;

    const titleOfGroup = await Title.create({
      name: groupName,
      groupTypes: groupTypes,
      supervisor: userID,
    });

    const createdGroup = await Group.create({
      supervisor: userID,
      title: titleOfGroup._id,
      groupTypes: groupTypes,
      semister: semister,
    });

    res.status(201).json({
      success: true,
      message: `Group ${groupName} created Successfully`,
      responseData: createdGroup || [],
    });

    (async () => {
      try {
        let _IDArray = [];
        let TitleArray = [];
        let GroupMembers = [];

        for (let { designation, student } of groupMembers) {
          let checkStudent = await Student.findOne({
            studentID: student.studentID,
          });

          if (!checkStudent) {
            checkStudent = await Student.create({
              studentID: student.studentID,
              name: student.name,
              semister: student.semister,
              department: student.department,
            });

            const signature = await Signature.create({
              student: checkStudent._id,
              signature: "",
            });
            checkStudent.signature = signature._id;
            await checkStudent.save();
          }

          _IDArray.push(checkStudent._id);

          GroupMembers.push({
            student: checkStudent._id,
            designation: designation,
          });
        }

        for (let { student: _id } of GroupMembers) {
          TitleArray.push({ student: _id, title: titleOfGroup._id });
        }

        createdGroup.groupMembers = GroupMembers;
        createdGroup.titles = TitleArray;
        await createdGroup.save();

        titleOfGroup.connectedGroup = createdGroup._id;
        titleOfGroup.students = _IDArray;
        await titleOfGroup.save();

        await Supervisor.findByIdAndUpdate(
          userID,
          { $push: { groups: createdGroup._id } },
          { new: true }
        );

        for (let sID of _IDArray) {
          await Student.findByIdAndUpdate(
            sID,
            {
              $push: {
                associateGroups: createdGroup._id,
              },
            },
            { new: true }
          );
        }
      } catch (bgErr) {
        console.error("Background group creation error:", bgErr);
      }
    })();
  } catch (error) {
    next(error);
  }
};

export const updateGroup = async (req, res, next) => {
  try {
    const {
      groupID,
      groupName,
      groupTypes,
      groupMembers,
      updateTypes,
      semister,
    } = req.user;

    const { userID } = req.userID;

    const group = await Group.findOne({ _id: groupID }).populate({
      path: "title",
      select: "name",
    });

    if (!group) {
      throw new CustomError("Invalid group", 401, External);
    }

    let title = await Title.findOne({
      connectedGroup: group._id,
    });

    if (group.title.name != groupName) {
      title.name = groupName;
      await title.save();
    }

    if (group.groupTypes != groupTypes) {
      group.groupTypes = groupTypes;
      await group.save();
    }

    if (group.semister != semister) {
      group.semister = semister;
      await group.save();
    }

    let modifiedGroupMembers = [];
    let modifiedTitles = [];
    let newStudents = [];

    for (let { student, designation } of groupMembers) {
      let checkStudent = await Student.findOne({
        studentID: student.studentID,
      });

      let studentID = checkStudent?._id || "";
      let newTitle = title?._id || "";

      if (checkStudent) {
        if (checkStudent.name != student.name) {
          checkStudent.name = student.name;
          await checkStudent.save();
        }
        if (checkStudent.semister != student.semister) {
          checkStudent.semister = student.semister;
          await checkStudent.save();
        }
        if (checkStudent.department != student.department) {
          checkStudent.department = student.department;
          await checkStudent.save();
        }

        let titleObj = group.titles.filter((item, index) => {
          return String(item.student) === String(studentID);
        });

        newTitle = titleObj[0]?.title || group.title._id; ////////////////////////////////////////

        newStudents.push(checkStudent._id);
      }

      if (!checkStudent) {
        let newStudent = await Student.create({
          studentID: student.studentID,
          name: student.name,
          semister: student.semister,
          department: student.department,
        });

        let signature = await Signature.create({
          student: newStudent._id,
          signature: "",
        });

        newStudent.signature = signature._id;
        newStudent.associate = [
          {
            group: group._id,
          },
        ];
        await newStudent.save();

        const updatedTitle = await Title.findOneAndUpdate(
          { connectedGroup: groupID },
          { $addToSet: { students: newStudent._id } },
          { new: true }
        );

        newTitle = updatedTitle._id;

        studentID = newStudent._id;
        newStudents.push(newStudent._id);
      }
      /////////////////////////////////////////////////////////////////////////////////////////
      modifiedTitles.push({
        student: studentID,
        title: newTitle,
      });

      modifiedGroupMembers.push({
        student: studentID,
        designation: designation,
      });
    }

    ////////////////////////////////////////////////////////////////////////////////////////////

    group.groupMembers = modifiedGroupMembers;

    group.titles = modifiedTitles;

    await group.save();

    res.status(200).json({
      success: true,
      message: "Group update successfully",
    });

    if (updateTypes === "Change only from current report") {
      return;
    }

    let report = await Report.find({ group: groupID });

    if (report.length >= 1) {
      for (let instance of report) {
        let newPresent = [];
        let newSupervisorComments = [];
        let newRemarks = [];
        let newStudentSignature = [];

        for (let _ID of newStudents) {
          let signature = await Signature.find({
            student: _ID,
          });

          if (Boolean(signature[0] || "")) {
            newStudentSignature.push({
              student: _ID,
              signature: signature._id,
            });
          } else {
            let createdSignature = await Signature.create({
              student: _ID,
              signature: "",
            });
            newStudentSignature.push({
              student: _ID,
              signature: createdSignature._id,
            });
          }

          let present = instance.present.filter(
            (item, index) => String(item.student) === String(_ID)
          );

          newPresent.push({
            student: _ID,
            presentStatus: present[0]?.presentStatus || false,
          });

          let supervisorComments = instance.supervisorComments.filter(
            (item, index) => String(item.student) === String(_ID)
          );

          if (Boolean(supervisorComments[0] || "")) {
            newSupervisorComments.push({
              student: _ID,
              comment: supervisorComments[0]?.comment,
            });
          } else {
            let newSupComment = await Comment.create({
              group: groupID,
              report: instance._id,
              student: _ID,
              supervisor: userID,
              comment: "",
            });
            newSupervisorComments.push({
              student: _ID,
              comment: newSupComment._id,
            });
          }

          let remarks = instance.remarks.filter(
            (item, index) => String(item.student) === String(_ID)
          );
          if (Boolean(remarks[0] || "")) {
            newRemarks.push({
              student: _ID,
              remarks: remarks[0]?.remarks,
            });
          } else {
            let createNewRemarks = await Remarks.create({
              group: groupID,
              report: instance._id,
              student: _ID,
              supervisor: userID,
              remarks: "",
            });
            newRemarks.push({
              student: _ID,
              remarks: createNewRemarks._id,
            });
          }
        }

        instance.students = newStudents;
        instance.studentSignature = newStudentSignature;
        instance.titles = modifiedTitles;
        instance.present = newPresent;
        instance.supervisorComments = newSupervisorComments;
        instance.remarks = newRemarks;

        await instance.save();
      }
    }
  } catch (error) {
    next(error);
  }
};

export const deleteGroup = async (req, res, next) => {
  try {
    const { groupID } = req.body;

    const { userID } = req.userID;

    const group = await Group.findOne({ _id: groupID }).populate({
      path: "title",
      select: "name",
    });

    await Report.deleteMany({ group: groupID });

    await Title.findByIdAndDelete(group.title._id);

    await Comment.deleteMany({ group: groupID });

    await Remarks.deleteMany({ group: groupID });

    const updatedSupervisor = await Supervisor.findOneAndUpdate(
      { _id: userID },
      {
        $pull: {
          groups: groupID,
        },
      },
      { new: true } // return the updated document
    );

    await Group.findByIdAndDelete(groupID);

    for (let { student } of group.groupMembers) {
      await Student.findByIdAndUpdate(student, {
        $pull: {
          associateGroups: group._id,
        },
      });
    }

    const groups = await Group.find({ supervisor: userID }).populate([
      {
        path: "title",
        select: "name",
      },
      {
        path: "supervisor",
        select: "name",
      },
      {
        path: "titles.student",
        select: "name studentID",
      },
      {
        path: "titles.title",
        select: "name",
      },
      {
        path: "groupMembers.student",
        select: "studentID name semister department",
      },
    ]);

    return res.status(200).json({
      success: true,
      responseData: groups,
      message: `${group?.title?.name || "Group"} deleted`,
    });
  } catch (error) {
    next(error);
  }
};

async function findReport(userID, groupID) {
  let obj = await Report.find({ supervisor: userID, group: groupID }).populate([
    {
      path: "group",
      select: "title",
      populate: {
        path: "title",
        select: "name groupTypes",
      },
    },
    {
      path: "supervisor",
      select: "name",
    },
    {
      path: "students",
      select: "studentID",
    },
    {
      path: "studentSignature.student",
      select: "studentID name",
    },
    {
      path: "studentSignature.signature",
      select: "student signature",
    },
    {
      path: "titles.student",
      select: "studentID name",
    },
    {
      path: "titles.title",
      select: "name courseType",
    },
    {
      path: "present.student",
      select: "studentID name",
    },
    {
      path: "supervisorComments.student",
      select: "studentID name",
    },
    {
      path: "supervisorComments.comment",
      select: "comment",
    },
    {
      path: "remarks.student",
      select: "studentID name",
    },
    {
      path: "remarks.remarks",
      select: "remarks",
    },
  ]);
  return obj;
}

export const groupReport = async (req, res, next) => {
  try {
    const { groupID } = req.body;

    const { userID } = req.userID;

    if (!groupID) {
      throw new CustomError("Invalid Group", 404, Internal);
    }

    if (!userID) {
      throw new CustomError("Please Login ", 401, Internal);
    }

    const group = await Group.findOne({ _id: groupID }).populate([
      {
        path: "titles.student",
        select: "studentID name",
      },
      {
        path: "titles.title",
        select: "name groupTypes connectedGroup",
      },
      {
        path: "title",
        select: "name",
      },
    ]);

    const report = await findReport(userID, groupID);

    let responseData2 = [];

    for (let { student, title } of group.titles) {
      responseData2.push({
        student_ObjID: student._id,
        title_ObjID: title._id,
        studentID: student.studentID,
        studentName: student.name,
        courseType: group.groupTypes, //
        title: title.name,
        main_group_ObjectID: group._id,
      });
    }

    if (!report) {
      throw new CustomError("No group exist", 404, Internal);
    }

    return res.status(200).json({
      success: true,
      message: "",
      responseData1: report || [],
      responseData2: responseData2 || [],
    });
  } catch (error) {
    next(error);
  }
};

function parseDate(str) {
  const [day, month, year] = str.split("/").map(Number);
  return new Date(year, month - 1, day);
}

function getWeekStart(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - (day === 6 ? 0 : day + 1); // Adjust to Saturday
  return new Date(date.getFullYear(), date.getMonth(), diff).toDateString();
}

function isSameYearMonthWeek(dateStr1, dateStr2) {
  const date1 = parseDate(dateStr1);
  const date2 = parseDate(dateStr2);

  if (date1.getFullYear() !== date2.getFullYear()) return false;
  if (date1.getMonth() !== date2.getMonth()) return false;

  return getWeekStart(date1) === getWeekStart(date2);
}

function weekFinder(lastReportWeekNumber = "", oldDate = "", newDate) {
  if (!lastReportWeekNumber) {
    return 1;
  }

  let inSameWeek = isSameYearMonthWeek(oldDate, newDate);

  return inSameWeek ? lastReportWeekNumber : lastReportWeekNumber + 1;
}

export const createReport = async (req, res, next) => {
  try {
    const { groupID } = req.body;

    const { userID } = req.userID;

    const group = await Group.findOne({ _id: groupID }).populate([
      {
        path: "titles.student",
      },
      {
        path: "titles.title",
      },
    ]);

    let report = await Report.find({ group: groupID });

    let studentIDArray = [];
    let studentSignatureArray = [];
    let titleArray = [];
    let presentArray = [];
    let supervisorCommentsArray = [];
    let remarksArray = [];

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////

    for (let { student, title } of group.titles) {
      const comment = await Comment.create({
        group: group._id,
        student: student._id,
        supervisor: userID,
        comment: "", //report should be create last
      });

      let remarks = await Remarks.create({
        group: groupID,
        student: student._id,
        supervisor: userID,
        remarks: "", //report should be create last
      });

      const findSignature = await Signature.findOne({
        student: student._id,
      });

      studentSignatureArray.push({
        student: student._id,
        signature: findSignature._id,
      });

      studentIDArray.push(student._id);

      titleArray.push({
        student: student._id,
        title: title._id,
      });

      presentArray.push({
        student: student._id,
        presentStatus: true,
      });

      supervisorCommentsArray.push({
        student: student._id,
        comment: comment._id,
      });

      remarksArray.push({
        student: student._id,
        remarks: remarks._id,
      });
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const newDate = new Date().toLocaleDateString("en-GB");

    const createdReport = await Report.create({
      group: groupID,
      supervisor: userID,
      week: weekFinder(
        report[report.length - 1]?.week || "",
        report[report.length - 1]?.date || "",
        newDate
      ),

      date: newDate,
      students: studentIDArray,
      studentSignature: studentSignatureArray,
      titles: titleArray,
      present: presentArray,
      supervisorComments: supervisorCommentsArray,
      remarks: remarksArray,
    });

    const allReport = await findReport(userID, groupID);

    res.status(201).json({
      success: true,
      message: "Report created successfully",
      responseData: allReport,
    });

    // update comment and remarks

    for (let { comment } of supervisorCommentsArray) {
      let Supcomment = await Comment.findById(comment);
      Supcomment.report = createdReport._id;
      await Supcomment.save();
    }

    for (let { remarks } of remarksArray) {
      let studentRemarks = await Remarks.findById(remarks);
      studentRemarks.report = createdReport._id;
      await studentRemarks.save();
    }
  } catch (error) {
    next(error);
  }
};

export const deleteReport = async (req, res, next) => {
  try {
    const { reportID } = req.body;

    const { userID } = req.userID;

    res.status(200).json({
      success: true,
      reportID: reportID,
      message: "Deleted successfully",
    });

    await Report.findByIdAndDelete({ _id: reportID });
    await Comment.deleteMany({ report: reportID });
    await Remarks.deleteMany({ report: reportID });
  } catch (error) {
    next(error);
  }
};

// edit Details route

export const updateReport = async (req, res, next) => {
  try {
    let { groupID, reportID, studentID, fieldName, inputValue } = req.body;

    const { userID } = req.userID;

    if (!reportID || !fieldName) {
      return res.status(400).json({ error: "Missing reportID or fieldName" });
    }

    let report = await Report.findById(reportID);

    if (fieldName === "week") {
      report.week = inputValue;
      await report.save();
    }

    if (fieldName === "date") {
      const isValidDateFormat = /^\d{2}\/\d{2}\/\d{4}$/.test(inputValue);
      if (!isValidDateFormat) {
        return res
          .status(400)
          .json({ error: "Date must be in format DD/MM/YYYY (en-GB)" });
      }

      report.date = inputValue;
      await report.save();
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    if (fieldName === "present") {
      let report = await Report.findById(reportID);

      let newPresentArray = report.present.map((obj, index) => {
        return String(obj.student) === String(studentID._id)
          ? { ...obj, presentStatus: Boolean(inputValue) }
          : obj;
      });
      report.present = newPresentArray;
      await report.save();
    }

    if (fieldName === "supervisorComments") {
      let comment = await Comment.findOne({
        report: reportID,
        student: studentID._id,
      });

      comment.comment = inputValue;

      await comment.save();
    }

    if (fieldName === "remarks") {
      let remarks = await Remarks.findOne({
        report: reportID,
        student: studentID._id,
      });

      remarks.remarks = inputValue;

      await remarks.save();
    }

    const newReportDoc = await Report.findById(reportID).populate([
      {
        path: "group",
        select: "title",
        populate: {
          path: "title",
          select: "name groupTypes",
        },
      },
      {
        path: "supervisor",
        select: "name",
      },
      {
        path: "students",
        select: "studentID",
      },
      {
        path: "studentSignature.student",
        select: "studentID name",
      },
      {
        path: "studentSignature.signature",
        select: "student signature",
      },
      {
        path: "titles.student",
        select: "studentID name",
      },
      {
        path: "titles.title",
        select: "name courseType",
      },
      {
        path: "present.student",
        select: "studentID name",
      },
      {
        path: "supervisorComments.student",
        select: "studentID name",
      },
      {
        path: "supervisorComments.comment",
        select: "comment",
      },
      {
        path: "remarks.student",
        select: "studentID name",
      },
      {
        path: "remarks.remarks",
        select: "remarks",
      },
    ]);

    return res.status(400).json({
      success: true,
      responseData: newReportDoc,
      message: "Document update successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const updateTitle = async (req, res, next) => {
  try {
    const {
      title_ObjID,
      student_ObjID,
      main_group_ObjectID,
      inputValue,
      nameArray,
    } = req.body;

    const { userID } = req.userID;

    const title = await Title.findById(title_ObjID);

    let group = await Group.findById(main_group_ObjectID);
    let reports = await Group.find({
      group: group._id,
      supervisor: userID,
    });

    let groupTitle = await Title.findById(group.title);

    if (!title) {
      throw new CustomError("title not exist", 401, Internal);
    }

    const findTitle = await Title.findOne({
      name: inputValue,
      connectedGroup: group._id,
    });

    let currentTitleID = findTitle?._id || "";

    if (!findTitle) {
      let createTitle = await Title.create({
        name: inputValue,
        connectedGroup: group._id,
        groupTypes: group.groupTypes,
        supervisor: userID,
        students: [student_ObjID],
      });

      currentTitleID = createTitle._id;
    }

    res.status(201).json({
      success: true,
      message: "Name updated successfully",
    });

    // Avoid deleting the groupTitle.name
    await Title.deleteMany({
      connectedGroup: main_group_ObjectID,
      name: { $nin: [...nameArray, groupTitle.name] }, // Add groupTitle.name to the exclusion list
    });

    let newGroupTitles = [];

    for (let { student, title } of group.titles) {
      if (String(student) === String(student_ObjID)) {
        newGroupTitles.push({
          student: student,
          title: currentTitleID,
        });
        continue;
      }
      newGroupTitles.push({
        student: student,
        title: title,
      });
    }

    group.titles = newGroupTitles;
    await group.save();

    for (let instance of reports) {
      instance.titles = newGroupTitles;
      await instance.save();
    }
  } catch (error) {
    next(error);
  }
};

export const checkUser = async (req, res, next) => {
  const { studentID } = req.body;

  let checkStudent = await Student.findOne({
    studentID: studentID,
  });

  if (Boolean(checkStudent?.studentID || "")) {
    let obj = {
      studentID: checkStudent.studentID,
      name: checkStudent.name,
      semister: checkStudent.semister,
      department: checkStudent.department,
    };

    return res.status(200).json({
      success: true,
      responseData: obj,
    });
  }
  return res.status(404).json({
    success: false,
  });
};

export const checkStudentSearchData = async (req, res, next) => {
  try {
   let {inputValue} = req.query;
   
   let bucket = inputValue.split(" ");

   let resultBucket = [];

   for(let value of bucket){ 

    let convertionType = Number(value);

    if(typeof(convertionType) === "number"){
        if(value.length <= 2 && value.length > 0){
          // then its a semister
          let val = Student.find({
            semister: value
          })

        }else if(value.length > 0){
          //then its a ID
            let val = Student.find({
            studentID: value
          })
        }
    }
   }

   
   console.log("inputValue: ->", bucket)
  }
  catch (error) {
    next(error);
  }
}

export const checkSupervisorSearchData = async (req, res, next) => {
  try {
   
  }
  catch (error) {
    next(error);
  }
}

