const express = require("express");

const router = express.Router();


router.get(
    "/search",
    (req, res) => {

        const query =
            req.query.q || "";


        res.status(200).json({

            success: true,

            message:
                "Demo search request reached the application",

            queryLength:
                String(query).length,

            requestId:
                req.requestId

        });

    }
);


router.post(
    "/comment",
    (req, res) => {

        const comment =
            req.body?.comment || "";


        res.status(200).json({

            success: true,

            message:
                "Demo comment request reached the application",

            commentLength:
                String(comment).length,

            requestId:
                req.requestId

        });

    }
);


router.get(
    "/file",
    (req, res) => {

        const fileName =
            req.query.name || "";


        res.status(200).json({

            success: true,

            message:
                "Demo file request reached the application",

            fileNameLength:
                String(fileName).length,

            requestId:
                req.requestId

        });

    }
);


module.exports = router;