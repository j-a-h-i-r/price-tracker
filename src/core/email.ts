import Email from 'email-templates';
import config from './config.js';

const emailer = new Email({
    message: {
        from: config.mail.from,
    },
    send: config.isProduction,
    transport: config.isProduction
    ? {
        host: config.mail.host,
        port: config.mail.port,
            auth: {
                user: config.mail.auth.user,
                pass: config.mail.auth.pass,
            }
    }
    : {
        jsonTransport: true,
    }
});

export default emailer;
