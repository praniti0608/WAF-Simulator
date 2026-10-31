function errorMiddleware(
    err,
    req,
    res,
    next
) {

    console.error(
        "Server error:",
        err
    );


    if (res.headersSent) {
        return next(err);
    }


    res.status(500).json({

        success: false,

        message: "Internal server error",

        requestId:
            req.requestId || null

    });
}


module.exports = errorMiddleware;