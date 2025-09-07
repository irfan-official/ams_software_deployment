import CustomError from "../utils/ErrorHandling.js"
import { Internal, External } from "../utils/ErrorTypesCode.js";
import Supervisor from "../models/supervisor.models.js";

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

export const RegisterMiddleware = async (req, res, next) => {

    try {
        let { name, dept, email, password, gender } = req.body;

        name = name?.trim();
        dept = dept?.trim();
        email = email?.trim();
        password = password?.trim();
        gender = gender?.trim();

        if (!name || !dept || !email || !password || !gender) {
            throw new CustomError("All Fields are required", 400, Internal)
        }

        if (!isValidEmail(email)) {
            throw new CustomError("Enter Valid Email Address", 400, Internal)
        }

        let validDept = ["CSE", "EEE", "ICE", "ME", "BBA", "LAW", "ENG"];

        if (!validDept.includes(dept)) {
            throw new CustomError("Only CSE, EEE, ICE, ME, BBA, LAW, ENG is allowed for dept"
                , 400, Internal)
        }

       const checkUser = await Supervisor.findOne({email: email})

       if(checkUser){
        throw new CustomError("User Already exist", 401, Internal)
       }

        req.user = { name, dept, email, password, gender }

        next();
    } catch (error) {
        return next(error)
    }

}

export const LoginMiddleware = (req, res, next) => {

    try {
        let { email, password } = req.body;

        email = email?.trim();
        password = password?.trim();

    
        if (!email || !password) {
            throw new CustomError("All Fields are required", 400, Internal)
        }


        if (!isValidEmail(email)) {
            throw new CustomError("Enter Valid Email Address", 400, Internal)
        }

        req.user = { email, password }

        next();
    } catch (error) {
       return next(error)
    }

}