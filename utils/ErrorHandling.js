// utils/ErrorHandling.js
export default class CustomError extends Error {
  constructor(message, statusCode = 500, ErrorTypes = Internal) {
    super(message);
    this.statusCode = statusCode;
    this.ErrorTypes = ErrorTypes;
  }
}
