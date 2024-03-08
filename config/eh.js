export const errorHand = (err, req,res,next) => {
    const error = new Error();
    error.message = err.message;
    error.statusCode = err.statusCode;
    error.status = err.status;
    res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
    });
}