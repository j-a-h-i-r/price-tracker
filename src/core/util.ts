import { customAlphabet } from 'nanoid';

const DIGITS = '0123456789';
const CAPITAL_AND_DIGITS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const digitNanoid = customAlphabet(DIGITS, 6);
const alphaNanoid = customAlphabet(CAPITAL_AND_DIGITS, 16);

export function generate6DigitCode(): string {
    return digitNanoid();
}

export function generateAuthCode(): string {
    return alphaNanoid();
}
