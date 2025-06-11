import Email from 'email-templates';
import config from './config.ts';

const emailer = new Email({
    preview: false,
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
    },
    views: {
        options: {
            extension: 'hbs',
        },
    }
});

export default emailer;
