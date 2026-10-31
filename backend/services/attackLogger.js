const AttackLog = require("../models/AttackLog");


function getClientIp(req) {
    return req.ip ||
        req.socket.remoteAddress ||
        "unknown";
}


function createPayloadPreview(
    requestData,
    matchedField
) {
    const matchedItem = requestData.find(
        (item) => item.field === matchedField
    );

    if (!matchedItem) {
        return "";
    }

    return matchedItem.value.substring(0, 200);
}


async function logAttack(
    req,
    detectionResult,
    requestData
) {

    const attackLog = new AttackLog({

        requestId: req.requestId,

        attackType: detectionResult.attackType,

        ruleId: detectionResult.ruleId,

        severity: detectionResult.severity,

        method: req.method,

        endpoint: req.originalUrl,

        sourceIp: getClientIp(req),

        userAgent:
            req.get("user-agent") || "unknown",

        matchedField:
            detectionResult.matchedField,

        payloadPreview:
            createPayloadPreview(
                requestData,
                detectionResult.matchedField
            ),

        blocked: true,

        statusCode: 403,

        detectionSource: "signature"
    });


    return await attackLog.save();
}


module.exports = {
    logAttack
};