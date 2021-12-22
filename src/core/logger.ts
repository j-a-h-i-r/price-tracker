import pino from "pino";

const { NODE_ENV } = process.env;
const DEFAULT_LOG_LEVEL = NODE_ENV === 'production' ? 'info' : 'debug';
const LOG_LEVEL = process.env.LOG_LEVEL || DEFAULT_LOG_LEVEL;

export const logger = pino({
    level: LOG_LEVEL,
    enabled: true,
    prettyPrint: NODE_ENV === 'production'
        ? false
        : {
            levelFirst: true,
            translateTime: true,
        },
});

export default logger;
