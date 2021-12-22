import Email from "email-templates";
import config from "./config";

const emailer = new Email({
    message: {
        from: config.mail.from,
    },
    send: true,
    transport: {
        host: config.mail.host,
        port: config.mail.port,
            auth: {
                user: config.mail.auth.user,
                pass: config.mail.auth.pass,
            }
    }
})

export default emailer;
