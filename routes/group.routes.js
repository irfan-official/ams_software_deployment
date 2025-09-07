import express from "express";
import { AuthorizationMiddleware } from "../middlewares/authorization.middlewares.js";
import {
  allGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  groupReport,
  createReport,
  updateReport,
  deleteReport,
  updateTitle,
  checkUser,
  allStudents,
  allSupervisors,
  checkStudentSearchData
} from "../controllers/group.controller.js";
import {
  createGroupMiddleware,
  createReportMiddleware,
  updateGroupMiddleware,
} from "../middlewares/group.middleware.js";

const route = express.Router();

route.use(AuthorizationMiddleware);

route.get("/allgroup", allGroup);

route.get("/allStudents", allStudents);

route.get("/allSupervisors", allSupervisors);

route.post("/create-group", createGroupMiddleware, createGroup);

route.patch("/update-group", updateGroupMiddleware, updateGroup);

route.delete("/delete-group", deleteGroup);

route.patch("/update-details", updateTitle);

route.post("/group-report", groupReport);

route.post("/create-report", createReport);

route.patch("/update-report", updateReport);

route.delete("/delete-report", deleteReport);

route.post("/check-user", checkUser);

route.get("/check-student-searchdata", checkStudentSearchData)

export default route;
