class ApiError extends Error {
  constructor(
    statusCode,
    Message = "Something Went Wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this.constructor);
    }
  }
}

export {ApiError}