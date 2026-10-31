const mongoose = require("mongoose");

const attackLogSchema = new mongoose.Schema(
    {
        requestId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        timestamp: {
            type: Date,
            default: Date.now,
            index: true
        },

        attackType: {
            type: String,
            required: true,
            enum: [
                "SQL_INJECTION",
                "XSS",
                "PATH_TRAVERSAL"
            ],
            index: true
        },

        ruleId: {
            type: String,
            required: true
        },

        severity: {
            type: String,
            required: true,
            enum: [
                "LOW",
                "MEDIUM",
                "HIGH",
                "CRITICAL"
            ],
            index: true
        },

        method: {
            type: String,
            required: true
        },

        endpoint: {
            type: String,
            required: true
        },

        sourceIp: {
            type: String,
            default: "unknown"
        },

        userAgent: {
            type: String,
            default: "unknown"
        },

        matchedField: {
            type: String,
            default: "unknown"
        },

        payloadPreview: {
            type: String,
            maxlength: 200,
            default: ""
        },

        blocked: {
            type: Boolean,
            default: true,
            index: true
        },

        statusCode: {
            type: Number,
            default: 403
        },

        detectionSource: {
            type: String,
            default: "signature"
        }
    },
    {
        timestamps: true
    }
);


attackLogSchema.index({
    attackType: 1,
    timestamp: -1
});

attackLogSchema.index({
    severity: 1,
    timestamp: -1
});


module.exports = mongoose.model(
    "AttackLog",
    attackLogSchema
);