import pino from 'pino';
import config from './config.js';

const DEFAULT_LOG_LEVEL = config.isProduction ? 'info' : 'debug';
const LOG_LEVEL = process.env.LOG_LEVEL || DEFAULT_LOG_LEVEL;

export const logger = pino.default({
    level: LOG_LEVEL,
    enabled: true,
    transport:
        !config.isProduction
            ? {
                targets: [
                    {
                        level: LOG_LEVEL,
                        target: 'pino-opentelemetry-transport',
                        options: {
                            timeStamp: false,
                        }
                    },
                    {
                        level: LOG_LEVEL,
                        target: 'pino-pretty',
                        options: {
                            colorize: true,
                            translateTime: 'yyyy-mm-dd HH:MM:ssp',
                            ignore: 'pid,hostname',
                        }
                    },
                ]
            }
            : {
                targets: [
                    {
                        level: LOG_LEVEL,
                        target: 'pino-opentelemetry-transport',
                        options: {
                            timeStamp: false,
                        }
                    },
                    {
                        target: 'pino/file',
                        level: LOG_LEVEL,
                    }
                ]
            },
});

export default logger;
