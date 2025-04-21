export default {
    OTLP_SERVICE_NAME: 'price-tracker',
    OTLP_SERVICE_VERSION: '1.0',
};

export const AUTH_ERRORS = {
    MISSING_TOKEN: 'Authorization header is required',
    INVALID_TOKEN: 'Invalid authorization token',
    UNAUTHORIZED: 'Unauthorized access',
} as const;