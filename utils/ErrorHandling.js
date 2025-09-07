import { External } from "./ErrorTypesCode.js";

export default class AppError extends Error {
    constructor(message, statusCode, ErrorTypes = External) {
        super(message);

        if(statusCode > 599){
            statusCode = 400
        }

        if (statusCode > 499 && statusCode < 600) {
            this.OperationalErrorTypes = "Server Side Error"
        } else {
            this.OperationalErrorTypes = "Clint Side Error"
        }
        this.ErrorTypes = ErrorTypes
        this.statusCode = statusCode || 500;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
