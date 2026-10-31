require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");

const wafMiddleware = require("./middleware/waf.middleware");
const errorMiddleware = require("./middleware/error.middleware");

const demoRoutes = require("./routes/demo.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const {
    initializeSocket
} = require("./services/socket.service");


const app = express();

const PORT = process.env.PORT || 5000;

const FRONTEND_URL =
    process.env.FRONTEND_URL ||
    "http://localhost:5173";


/*
    Database
*/
connectDB().catch((error) => {
    console.error("Startup aborted:", error.message);
    process.exit(1);
});


/*
    HTTP Server
*/
const httpServer = http.createServer(app);


/*
    Socket.IO
*/
initializeSocket(
    httpServer,
    FRONTEND_URL
);


/*
    Security Headers
*/
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));


/*
    CORS
*/
app.use(
    cors({
        origin: FRONTEND_URL,
        methods: ["GET", "POST"],
        credentials: true
    })
);


/*
    Body Parser
*/
app.use(
    express.json({
        limit: "100kb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "100kb"
    })
);


/*
    Rate Limiting
*/
const apiLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    limit: 200,

    standardHeaders: "draft-8",

    legacyHeaders: false,

    message: {
        success: false,
        message:
            "Too many requests. Please try again later."
    }

});


app.use(
    "/api",
    apiLimiter
);


/*
    Health Check
*/
app.get(
    "/api/health",
    (req, res) => {

        res.json({

            success: true,

            message:
                "WAF Backend is running",

            service:
                "Web Application Firewall Simulator",

            timestamp:
                new Date()

        });

    }
);


/*
    WAF Middleware
*/
app.use(
    wafMiddleware()
);


/*
    Demo Application Routes
*/
app.use(
    "/api/demo",
    demoRoutes
);


/*
    Dashboard Routes
*/
app.use(
    "/api/dashboard",
    dashboardRoutes
);


/*
    404 Handler
*/
app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "Route not found",

            requestId:
                req.requestId || null

        });

    }
);


/*
    Error Handler
*/
app.use(
    errorMiddleware
);


/*
    Start Server
*/
httpServer.listen(
    PORT,
    () => {

        console.log(
            "----------------------------------------"
        );

        console.log(
            " WAF SIMULATOR BACKEND"
        );

        console.log(
            "----------------------------------------"
        );

        console.log(
            ` Server: http://localhost:${PORT}`
        );

        console.log(
            ` Health: http://localhost:${PORT}/api/health`
        );

        console.log(
            ` Environment: ${process.env.NODE_ENV}`
        );

        console.log(
            "----------------------------------------"
        );

    }
);