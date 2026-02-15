import { z } from 'zod';

export const companySchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio'),
    address: z.string().optional(),
    zip: z.string().optional(),
    town: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    url: z.string().url('URL inválida').optional().or(z.literal('')),
    siren: z.string().optional(), // CIF/NIF
    capital: z.string().optional(),
    socialobject: z.string().optional(),
});

export type CompanyFormData = z.infer<typeof companySchema>;
