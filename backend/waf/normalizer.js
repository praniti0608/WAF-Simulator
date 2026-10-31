function normalizeValue(value) {
    if (value === null || value === undefined) {
        return "";
    }

    let normalized = String(value);

    try {
        normalized = decodeURIComponent(normalized);
    } catch (error) {
        // Keep original value if decoding fails
    }

    normalized = normalized.toLowerCase();

    normalized = normalized.replace(/\s+/g, " ");

    return normalized.trim();
}


function flattenObject(value, prefix = "") {
    const result = [];

    if (value === null || value === undefined) {
        return result;
    }

    if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
    ) {
        result.push({
            field: prefix || "value",
            value: String(value)
        });

        return result;
    }

    if (Array.isArray(value)) {
        value.forEach((item, index) => {
            result.push(
                ...flattenObject(item, `${prefix}[${index}]`)
            );
        });

        return result;
    }

    if (typeof value === "object") {
        Object.entries(value).forEach(([key, item]) => {
            const fieldName = prefix
                ? `${prefix}.${key}`
                : key;

            result.push(
                ...flattenObject(item, fieldName)
            );
        });
    }

    return result;
}


function buildRequestData(req) {
    const requestData = [];

    requestData.push({
        field: "url",
        value: req.originalUrl || req.url || ""
    });

    requestData.push(
        ...flattenObject(req.query, "query")
    );

    requestData.push(
        ...flattenObject(req.params, "params")
    );

    requestData.push(
        ...flattenObject(req.body, "body")
    );

    return requestData.map((item) => ({
        field: item.field,
        value: normalizeValue(item.value)
    }));
}


module.exports = {
    normalizeValue,
    flattenObject,
    buildRequestData
};