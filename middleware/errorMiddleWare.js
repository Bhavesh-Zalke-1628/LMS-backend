
const errorMiddleWare = (err, req, res, next) => {
    err.status = err.status || 500;
    err.message = err.message || "Something went wronge";

    return res.status(err.status).json({
        success: false,
        message: err.message,
        stack: err.stack
    })
}

export default errorMiddleWare;