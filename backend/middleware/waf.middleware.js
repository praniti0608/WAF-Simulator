const crypto = require("crypto");

const {
    buildRequestData
} = require("../waf/normalizer");

const detectAttack =
    require("../waf/detector");

const {
    logAttack
} = require("../services/attackLogger");

const {
    emitAttackBlocked
} = require("../services/socket.service");


function wafMiddleware() {

    return async (req, res, next) => {

        req.requestId = crypto.randomUUID();


        try {

            const requestData =
                buildRequestData(req);


            const detectionResult =
                detectAttack(requestData);


            /*
                If no attack is detected,
                allow the request to continue.
            */
            if (!detectionResult.detected) {
                return next();
            }


            /*
                Attack detected.
                Do NOT call next().
            */
            console.log(
                `[WAF BLOCKED] ${detectionResult.attackType} | ` +
                `${req.method} ${req.originalUrl}`
            );


            /*
                Store attack information
                in MongoDB.
            */
            try {

                const attackLog =
                    await logAttack(
                        req,
                        detectionResult,
                        requestData
                    );


                /*
                    Send the blocked attack
                    to the live dashboard.
                */
                emitAttackBlocked(attackLog);

            } catch (loggingError) {

                console.error(
                    "Attack logging failed:",
                    loggingError.message
                );

            }


            /*
                Block the malicious request.
            */
            return res.status(403).json({

                success: false,

                blocked: true,

                message: "Request blocked by WAF",

                attackType:
                    detectionResult.attackType,

                ruleId:
                    detectionResult.ruleId,

                requestId:
                    req.requestId

            });

        } catch (error) {

            return next(error);

        }

    };
}


module.exports = wafMiddleware;