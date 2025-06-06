import { FastifyInstance, FastifyRequest } from 'fastify';
import { getManufacturerStats, listInternalManufacturers, mergeManufacturers } from '../services/manufacturers.service.js';
import { IdParam } from './types.js';
import { z } from 'zod';

const MergeIdParam = z.object({
    mergeid: z.string().transform(Number),
});
export type MergeIdParam = z.infer<typeof MergeIdParam>;

const MfgMergeBody = z.object({
    manufacturer_ids: z.array(z.number({coerce: true}).min(1)),
}).strict();
type MfgMergeBody = z.infer<typeof MfgMergeBody>;

export default async function routes(fastify: FastifyInstance) {
    fastify.get('/', async () => {
        return listInternalManufacturers();
    });

    fastify.get('/:id/stats', async (req: FastifyRequest<{ Params: IdParam }>, res) => {
        const { id: mfgId } = IdParam.parse(req.params);
        if (!mfgId) {
            return res.status(400).send({ message: `Category id (${mfgId}) is not valid` });
        }
        return getManufacturerStats(mfgId);
    });

    fastify.put('/:id/merge', async (req: FastifyRequest<{ Params: IdParam, Body: MfgMergeBody }>, res) => {
        if (!req.isAdmin) {
            return res.status(403).send({ message: 'Unauthorized' });
        }

        const { id: mfgId } = IdParam.parse(req.params);
        if (!mfgId) {
            return res.status(400).send({ message: `Manufacturer id (${mfgId}) is not valid` });
        }

        const { manufacturer_ids } = MfgMergeBody.parse(req.body);
        
        await mergeManufacturers(mfgId, manufacturer_ids);
        return true;
    });
}
