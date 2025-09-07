import express from "express"
import { LoginMiddleware, RegisterMiddleware } from "../middlewares/authentication.middlewares.js";
import {LoginController, RegisterController} from "../controllers/authentication.controllers.js"
const route = express.Router();

route.post("/supervisor/login", LoginMiddleware ,LoginController)
route.post("/supervisor/register", RegisterMiddleware ,RegisterController)

export default route