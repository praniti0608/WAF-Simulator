const wafRules = require("./patterns");

function detectAttack(requestData) {

    for (const item of requestData) {

        for (const rule of wafRules) {

            if (rule.pattern.test(item.value)) {

                return {
                    detected: true,
                    attackType: rule.attackType,
                    ruleId: rule.ruleId,
                    severity: rule.severity,
                    description: rule.description,
                    matchedField: item.field
                };
            }
        }
    }

    return {
        detected: false
    };
}

module.exports = detectAttack;