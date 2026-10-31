const wafRules = [

    {
        ruleId: "SQLI-001",
        attackType: "SQL_INJECTION",
        severity: "HIGH",
        description: "SQL boolean-based injection pattern detected",
        pattern: /(\bor\b|\band\b)\s+\d+\s*=\s*\d+/i
    },

    {
        ruleId: "SQLI-002",
        attackType: "SQL_INJECTION",
        severity: "HIGH",
        description: "UNION SELECT SQL injection pattern detected",
        pattern: /\bunion\s+(all\s+)?select\b/i
    },

    {
        ruleId: "SQLI-003",
        attackType: "SQL_INJECTION",
        severity: "CRITICAL",
        description: "Destructive SQL command detected",
        pattern: /\b(drop|truncate|alter)\s+(table|database|schema)\b/i
    },

    {
        ruleId: "SQLI-004",
        attackType: "SQL_INJECTION",
        severity: "HIGH",
        description: "SQL command chaining detected",
        pattern: /;\s*(select|insert|update|delete|drop|alter|truncate)\b/i
    },

    {
        ruleId: "XSS-001",
        attackType: "XSS",
        severity: "HIGH",
        description: "Script tag detected",
        pattern: /<\s*script\b[^>]*>/i
    },

    {
        ruleId: "XSS-002",
        attackType: "XSS",
        severity: "HIGH",
        description: "JavaScript URI detected",
        pattern: /javascript\s*:/i
    },

    {
        ruleId: "XSS-003",
        attackType: "XSS",
        severity: "HIGH",
        description: "HTML event handler detected",
        pattern: /\bon(load|error|click|mouseover|focus|submit)\s*=/i
    },

    {
        ruleId: "XSS-004",
        attackType: "XSS",
        severity: "HIGH",
        description: "Iframe injection detected",
        pattern: /<\s*iframe\b/i
    },

    {
        ruleId: "PATH-001",
        attackType: "PATH_TRAVERSAL",
        severity: "HIGH",
        description: "Directory traversal detected",
        pattern: /(?:\.\.[\\/])+/i
    },

    {
        ruleId: "PATH-002",
        attackType: "PATH_TRAVERSAL",
        severity: "HIGH",
        description: "Encoded directory traversal detected",
        pattern: /(?:%2e%2e|%252e%252e)(?:%2f|%5c|%252f|%255c)/i
    }

];

module.exports = wafRules;