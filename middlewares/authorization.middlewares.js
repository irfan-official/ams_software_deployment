import jwt from 'jsonwebtoken';
import { Internal, External } from "../utils/ErrorTypesCode.js";
import CustomError from "../utils/ErrorHandling.js";
import Supervisor from '../models/supervisor.models.js';

export const AuthorizationMiddleware = async (req, res, next) => {
    try {

        const token = req.cookies.token;

        if (!token) {
            throw new CustomError("Access Denied: No token provided", 401, External);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const checkUser = await Supervisor.findOne({_id: decoded.userID})

        if(!checkUser){
            throw new CustomError("Please Login first", 401, External)
        }

        req.userID = decoded;

        next();

    } catch (error) {

        if (error.name === 'JsonWebTokenError') {
            return next(new CustomError("Invalid token", 401, External));
        } else if (error.name === 'TokenExpiredError') {
            return next(new CustomError("Token expired", 401, External));
        }

        return next(new CustomError("Authorization failed", 500, External));
    }
};
