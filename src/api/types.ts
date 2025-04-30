import { z } from 'zod';

export const IdParam = z.object({
    id: z.string().transform(Number),
});

export type IdParam = z.infer<typeof IdParam>;
