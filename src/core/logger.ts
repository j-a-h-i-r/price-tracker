import pino from "pino";
import config from "./config";

const DEFAULT_LOG_LEVEL = config.isProduction ? 'info' : 'debug';
const LOG_LEVEL = process.env.LOG_LEVEL || DEFAULT_LOG_LEVEL;

export const logger = pino({
    level: LOG_LEVEL,
    enabled: true,
    prettyPrint: config.isProduction
        ? false
        : {
            levelFirst: true,
            translateTime: true,
        },
});

export default logger;
