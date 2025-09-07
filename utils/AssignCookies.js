import jwt from "jsonwebtoken"

export default function AssignCookies(res, payload, Options) {
    // const payload = { userId: user._id };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: Options.maxAge,
    });

    res.cookie('token', token, Options);
}