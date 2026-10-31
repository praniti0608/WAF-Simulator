const express = require("express");
const mongoose = require("mongoose");

const AttackLog =
    require("../models/AttackLog");

const router = express.Router();


/*
    GET /api/dashboard/stats
*/
router.get(
    "/stats",
    async (req, res, next) => {

        try {

            const [

                total,

                blocked,

                sqlInjection,

                xss,

                pathTraversal,

                critical,

                high

            ] = await Promise.all([

                AttackLog.countDocuments(),

                AttackLog.countDocuments({
                    blocked: true
                }),

                AttackLog.countDocuments({
                    attackType: "SQL_INJECTION"
                }),

                AttackLog.countDocuments({
                    attackType: "XSS"
                }),

                AttackLog.countDocuments({
                    attackType: "PATH_TRAVERSAL"
                }),

                AttackLog.countDocuments({
                    severity: "CRITICAL"
                }),

                AttackLog.countDocuments({
                    severity: "HIGH"
                })

            ]);


            res.json({

                success: true,

                stats: {

                    total,

                    blocked,

                    sqlInjection,

                    xss,

                    pathTraversal,

                    critical,

                    high

                }

            });

        } catch (error) {

            next(error);

        }

    }
);


/*
    GET /api/dashboard/attacks
*/
router.get(
    "/attacks",
    async (req, res, next) => {

        try {

            let limit =
                Number.parseInt(
                    req.query.limit,
                    10
                );


            if (
                Number.isNaN(limit) ||
                limit < 1
            ) {
                limit = 20;
            }


            limit = Math.min(
                limit,
                100
            );


            const attacks =
                await AttackLog
                    .find()
                    .sort({
                        timestamp: -1
                    })
                    .limit(limit)
                    .lean();


            res.json({

                success: true,

                count: attacks.length,

                attacks

            });

        } catch (error) {

            next(error);

        }

    }
);


/*
    GET /api/dashboard/attacks/:id
*/
router.get(
    "/attacks/:id",
    async (req, res, next) => {

        try {

            const { id } =
                req.params;


            if (
                !mongoose.isValidObjectId(id)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid attack log ID"

                });

            }


            const attack =
                await AttackLog.findById(id);


            if (!attack) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Attack log not found"

                });

            }


            res.json({

                success: true,

                attack

            });

        } catch (error) {

            next(error);

        }

    }
);


/*
    GET /api/dashboard/rules
*/
router.get(
    "/rules",
    (req, res) => {

        res.json({

            success: true,

            rules: [

                {
                    ruleId: "SQLI-001",
                    type: "SQL_INJECTION",
                    severity: "HIGH",
                    status: "ACTIVE"
                },

                {
                    ruleId: "SQLI-002",
                    type: "SQL_INJECTION",
                    severity: "HIGH",
                    status: "ACTIVE"
                },

                {
                    ruleId: "SQLI-003",
                    type: "SQL_INJECTION",
                    severity: "CRITICAL",
                    status: "ACTIVE"
                },

                {
                    ruleId: "SQLI-004",
                    type: "SQL_INJECTION",
                    severity: "HIGH",
                    status: "ACTIVE"
                },

                {
                    ruleId: "XSS-001",
                    type: "XSS",
                    severity: "HIGH",
                    status: "ACTIVE"
                },

                {
                    ruleId: "XSS-002",
                    type: "XSS",
                    severity: "HIGH",
                    status: "ACTIVE"
                },

                {
                    ruleId: "XSS-003",
                    type: "XSS",
                    severity: "HIGH",
                    status: "ACTIVE"
                },

                {
                    ruleId: "XSS-004",
                    type: "XSS",
                    severity: "HIGH",
                    status: "ACTIVE"
                },

                {
                    ruleId: "PATH-001",
                    type: "PATH_TRAVERSAL",
                    severity: "HIGH",
                    status: "ACTIVE"
                },

                {
                    ruleId: "PATH-002",
                    type: "PATH_TRAVERSAL",
                    severity: "HIGH",
                    status: "ACTIVE"
                }

            ]

        });

    }
);


module.exports = router;