import { customAlphabet } from 'nanoid/async';
import config from './config';

const DIGITS = '0123456789';
const CAPITAL_AND_DIGITS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const digitNanoid = customAlphabet(DIGITS, 6);
const alphaNanoid = customAlphabet(CAPITAL_AND_DIGITS, 16);

export function generate6DigitCode(): Promise<string> {
    return digitNanoid();
}

export function generateAuthCode(): Promise<string> {
    return alphaNanoid();
}

export function getRedisConnection() {
    return {
        host: config.redis.host,
        port: Number(config.redis.port),
    };
}
