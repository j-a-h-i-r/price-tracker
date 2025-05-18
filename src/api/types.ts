import { z } from 'zod';

export const IdParam = z.object({
    id: z.string().transform(Number),
});
export type IdParam = z.infer<typeof IdParam>;

export const ExternalIdParam = z.object({
    externalid: z.string().transform(Number),
});
export type ExternalIdParam = z.infer<typeof ExternalIdParam>;
