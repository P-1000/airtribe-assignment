export const createError = (status, message) => {
    const error = new Error(message);
    error.status = status || 500;
    error.message = message || "Internal server error";
    error.statusCode = status || 500;
    error.stack = "";
    return error;
}
