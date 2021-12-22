import { customAlphabet } from "nanoid/async";

const DIGITS = "0123456789";
const CAPITAL_AND_DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const digitNanoid = customAlphabet(DIGITS, 6);
const alphaNanoid = customAlphabet(CAPITAL_AND_DIGITS, 16);

function generate6DigitCode(): Promise<string> {
    return digitNanoid();
}

function generateAuthCode(): Promise<string> {
    return alphaNanoid();
}

export {
    generate6DigitCode,
    generateAuthCode,
}
