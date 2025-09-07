import { Internal } from "../utils/ErrorTypesCode.js";
import CustomError from "../utils/ErrorHandling.js";
import Report from "../models/report.models.js";
import Student from "../models/student.models.js";
import Group from "../models/group.models.js";
import Title from "../models/title.model.js";

function checkValidGroupMembers(groupMembers = []) {
  if (!groupMembers) {
    throw new CustomError("Enter a valid groupMembers", 400, Internal);
  }
  let validSemister = ["1", "2", "3", "4", "5", "6", "7", "8"];
  let validDepartment = ["CSE", "EEE", "ICE", "ME", "BBA", "ENG", "LAW"];
  let validDesignation = ["Design Secretary", "Project Leader", "Developer"];

  let index = 0;

  for (let { student, designation } of groupMembers) {
    if (!designation) {
      throw new CustomError(
        `Enter a valid designation for S-${index + 1}`,
        400,
        Internal
      );
    }

    if (!student) {
      throw new CustomError(
        `Enter a valid student info for S-${index + 1}`,
        400,
        Internal
      );
    }

    if (!validDesignation.includes(designation)) {
      throw new CustomError(
        `Enter a valid designation for S-${index + 1}`,
        400,
        Internal
      );
    }
    let { name = "", semister = "", department = "", studentID = "" } = student;

    if (!name || !semister || !department || !studentID) {
      throw new CustomError(
        `Enter a valid student info for S-${index + 1}`,
        400,
        Internal
      );
    }

    if (!validSemister.includes(semister)) {
      throw new CustomError(
        `Enter a valid semister for S-${index + 1}`,
        400,
        Internal
      );
    }
    if (!validDepartment.includes(department)) {
      throw new CustomError(
        `Enter a valid department for S-${index + 1}`,
        400,
        Internal
      );
    }

    index++;
  }

  return true;
}

export const createGroupMiddleware = (req, res, next) => {
  try {
    let {
      groupName = "",
      groupTypes = "",
      groupMembers = [],
      semister = "",
    } = req.body;

    groupName = groupName.trim();
    groupTypes = groupTypes.trim();
    semister = semister.trim();

    if (!groupName || !groupTypes || !semister || groupMembers.length < 1) {
      throw new CustomError("All fields are required", 400, Internal);
    }

    const validGroupTypes = ["Thesis", "IDP"];

    const validSemister = ["1", "2", "3", "4", "5", "6", "7", "8"];

    if (!validSemister.includes(semister)) {
      throw new CustomError("Enter a valid semister", 400, Internal);
    }

    if (!validGroupTypes.includes(groupTypes)) {
      throw new CustomError("Enter a valid groupTypes", 400, Internal);
    }

    let checkResrult = checkValidGroupMembers(groupMembers);

    if (!checkResrult) {
      throw new CustomError("Enter a valid groupMembers ", 400, Internal);
    }

    req.user = { groupName, groupTypes, groupMembers, semister };

    next();
  } catch (error) {
    next(error);
  }
};

function weekFinder(length) {
  let week = length;

  if (length === 0) {
    week += 1;
  }
  return week;
}

export const createReportMiddleware = async (req, res, next) => {
  console.log(req.body);

  try {
    let { groupID = "", studentID = [] } = req.body;

    if (studentID.length < 1) {
      throw new CustomError("All fields are required", 401, Internal);
    }

    if (!groupID) {
      throw new CustomError("All fields are required", 401, Internal);
    }

    let report = await Report.find({ group: groupID }).lean();

    const preevWeek = weekFinder(report.length);

    let group = await Group.findOne({ _id: groupID }).lean();

    let studentIdArray = [];

    for (let sID of studentID) {
      try {
        let student = await Student.findOne({ studentID: sID });

        studentIdArray.push(student._id);

        if (!student) {
          throw new CustomError(
            "Invalid Student, please insert the correct student ID",
            401,
            Internal
          );
        }
      } catch (error) {
        next(error);
      }
    }

    req.user = {
      groupID,
      preevWeek,
      studentID: studentIdArray,
      title: group.group,
    };

    console.log("Test 1 passed");

    next();
  } catch (error) {
    next(error);
  }
};

export const updateGroupMiddleware = (req, res, next) => {
  let {
    groupID = "",
    groupName = "",
    groupTypes = "",
    groupMembers = [],
    updateTypes,
    semister = "",
  } = req.body;

  groupID = groupID.trim();
  groupName = groupName.trim();
  groupTypes = groupTypes.trim();
  semister = semister.trim();

  const validUpdateTypes = [
    "Change entire exist report",
    "Change only from current report",
  ];

  if (!validUpdateTypes.includes(updateTypes)) {
    throw new CustomError("Invalid updateTypes", 401, Internal);
  }

  if (
    !groupID ||
    !groupName ||
    !groupTypes ||
    !semister ||
    groupMembers.length < 1
  ) {
    throw new CustomError("All fields are required", 400, Internal);
  }

  const validGroupTypes = ["Thesis", "IDP"];

  const validSemister = ["1", "2", "3", "4", "5", "6", "7", "8"];

  if (!validSemister.includes(semister)) {
    throw new CustomError("Enter a valid semister", 400, Internal);
  }

  if (!validGroupTypes.includes(groupTypes)) {
    throw new CustomError("Enter a valid groupTypes", 400, Internal);
  }

  let checkResrult = checkValidGroupMembers(groupMembers);

  if (!checkResrult) {
    throw new CustomError("Enter a valid groupMembers", 400, Internal);
  }

  req.user = {
    groupID,
    groupName,
    groupTypes,
    groupMembers,
    updateTypes,
    semister,
  };

  next();
};
