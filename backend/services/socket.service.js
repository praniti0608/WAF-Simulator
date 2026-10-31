let io = null;


function initializeSocket(
    httpServer,
    corsOrigin
) {

    const { Server } = require("socket.io");

    io = new Server(httpServer, {

        cors: {
            origin: corsOrigin,
            methods: ["GET", "POST"]
        }

    });


    io.on("connection", (socket) => {

        console.log(
            `Dashboard connected: ${socket.id}`
        );


        socket.on("disconnect", () => {

            console.log(
                `Dashboard disconnected: ${socket.id}`
            );

        });

    });


    return io;
}


function emitAttackBlocked(attackLog) {

    if (!io) {
        return;
    }


    io.emit("attack:blocked", {

        requestId: attackLog.requestId,

        timestamp: attackLog.timestamp,

        attackType: attackLog.attackType,

        ruleId: attackLog.ruleId,

        severity: attackLog.severity,

        method: attackLog.method,

        endpoint: attackLog.endpoint,

        matchedField: attackLog.matchedField,

        blocked: attackLog.blocked

    });
}


module.exports = {
    initializeSocket,
    emitAttackBlocked
};