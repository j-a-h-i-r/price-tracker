import config from '../core/config.ts';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { sendAuthLinkEmail } from '../services/email.service.ts';
import { storeUser } from '../services/user.service.ts';
import { z } from 'zod';
import { logger } from '../core/logger.ts';

const NewAuthBodySchema = z.object({
    email: z.string().email(),
}).strict();
type NewAuthBody = z.infer<typeof NewAuthBodySchema>;

const VerifyAuthBodySchema = z.object({
    token: z.string(),
}).strict();
type VerifyAuthBody = z.infer<typeof VerifyAuthBodySchema>;

export default async function routes(fastify: FastifyInstance) {
    fastify.post('/new', async (req: FastifyRequest<{Body: NewAuthBody }>) => {
        const expiryMinutes = config.authLinkExpiryMinutes;
        const { email } = NewAuthBodySchema.parse(req.body);
        const payload = jwt.sign(
            { email },
            config.jwtSecret,
            { expiresIn: `${expiryMinutes}m` }
        );
        const authLink = `${config.baseUrl}/accounts/verify?token=${payload}`;
        try {
            await sendAuthLinkEmail(email, authLink, expiryMinutes);
            return true;
        } catch (error) {
            logger.error(error, 'Error sending email');
            return false;
        }
    });

    fastify.post('/logout', async (req, res) => {
        res.clearCookie('auth');
        return true;
    });

    fastify.post('/verify', async (req: FastifyRequest<{Body: VerifyAuthBody }>, res) => {
        const { token } = VerifyAuthBodySchema.parse(req.body);
        const payload = jwt.verify(token, config.jwtSecret) as { email: string };
        const { email } = payload;
        if (!email) {
            res.status(400).send({ error: 'Invalid token' });
            return false;
        }

        const authToken = jwt.sign({ email }, config.jwtSecret, { expiresIn: '30d' });

        try {
            await storeUser(email);
            res
            .setCookie('auth', authToken, {
                httpOnly: true,
                secure: true,
                path: '/',
                // sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
            });
    
            res
            .send({ email, isAdmin: req.isAdmin });
        } catch (error) {
            logger.error(error, 'Error storing user');
            res.status(500).send({ error: 'Internal server error' });
        }
    });
}
