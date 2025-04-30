import emailer from '../core/email.js';

export async function sendAuthLinkEmail(email: string, authLink: string, expiryMinutes: number) {
    return emailer.send({
        template: 'auth-link',
        message: {
            to: email,
        },
        locals: {
            authLink,
            expiryMinutes,
        }
    });
}
