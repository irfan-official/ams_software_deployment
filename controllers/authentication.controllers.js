import Supervisor from "../models/supervisor.models.js";
import { Internal } from "../utils/ErrorTypesCode.js";
import CustomError from "../utils/ErrorHandling.js";
import CookieOptions from "../utils/CookieOptions.js";
import AssignCookies from "../utils/AssignCookies.js";

export const RegisterController = async (req, res, next) => {
  try {
    const { name, dept, email, password, gender } = req.user;

    const createdUser = await Supervisor.create({
      name,
      department: dept,
      email,
      password,
      gender
    });

    if (!createdUser) {
      throw new CustomError(
        "Sorry User is not Created for Internal Server Error",
        500,
        Internal
      );
    }

    AssignCookies(
      res,
      { userID: createdUser._id },
      CookieOptions(24 * 60 * 60 * 1000)
    );

    return res.status(201).json({
      success: true,
      message: ` welcome to ams`,
    });
  } catch (error) {
    return next(error);
  }
};

export const LoginController = async (req, res, next) => {
  try {
    const { email, password } = req.user;

    const checkedUser = await Supervisor.findOne({
      email,
    });

    if (!checkedUser) {
      throw new CustomError("User not found !", 404, Internal);
    }

    const isMatch = await checkedUser.comparePassword(password);

    if (!isMatch) throw new CustomError("Invalid Password", 400, Internal);

    AssignCookies(
      res,
      { userID: checkedUser._id },
      CookieOptions(24 * 60 * 60 * 1000)
    );

    return res.status(201).json({
      success: true,
      message: ` welcome to ams`,
    });
  } catch (err) {
    return next(err);
  }
};
