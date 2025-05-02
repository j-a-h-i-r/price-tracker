import config from '../core/config.js';
import { FastifyInstance, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { sendAuthLinkEmail } from '../services/email.service.js';
import { storeUser } from '../services/user.service.js';

interface NewAuthBody {
    email: string;
}

interface VerifyAuthBody {
    token: string;
}

export default async function routes(fastify: FastifyInstance, options: any) {
    fastify.post('/new', async (req: FastifyRequest<{Body: NewAuthBody }>, res) => {
        const expiryMinutes = 10;
        const { email } = req.body;
        const payload = jwt.sign(
            { email },
            config.jwtSecret,
            { expiresIn: `${expiryMinutes}m` }
        );
        const authLink = `${config.baseUrl}/accounts/verify?token=${payload}`;
        await sendAuthLinkEmail(email, authLink, expiryMinutes);
        return true;
    });

    fastify.post('/logout', async (req, res) => {
        res.clearCookie('auth');
        return true;
    });

    fastify.post('/verify', async (req: FastifyRequest<{Body: VerifyAuthBody }>, res) => {
        const { token } = req.body;
        const payload = jwt.verify(token, config.jwtSecret) as { email: string };
        const { email } = payload;
        if (!email) {
            res.status(400).send({ error: 'Invalid token' });
            return false;
        }
        // Here you would typically create a session or JWT for the user
        // For this example, we'll just return the email
        // Store the email in the database or session
        const newToken = jwt.sign({ email }, config.jwtSecret, { expiresIn: '30d' });
        await storeUser(email);
        res
        .setCookie('auth', newToken, {
            httpOnly: true,
            secure: true,
            path: '/',
            // sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
        });

        res
        .send({ email, isAdmin: req.isAdmin });
    });
}
