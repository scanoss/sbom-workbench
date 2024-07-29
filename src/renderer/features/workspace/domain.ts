import { z } from 'zod';

export enum ProxyMode {
  Automatic = 'automatic',
  Manual = 'manual',
}

const isValidPortNumber = (port: number) => port >= 1 && port <= 65535;

const hostValidationSchema = z.string().url();
const portValidationSchema = z.string().transform((value, ctx) => {
  if (!value) return undefined;

  const parsedValue = parseInt(value, 10);

  if (Number.isNaN(parsedValue)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid port number',
      path: ctx.path,
    });
  }

  if (!isValidPortNumber(parsedValue)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Port number must be between 1 and 65535',
      path: ctx.path,
    });
  }

  return value;
});

export const proxyConfigSchema = z
  .object({
    automaticProxyUrl: hostValidationSchema.optional(),
    httpHost: hostValidationSchema.optional(),
    httpPort: portValidationSchema.optional(),
    httpsHost: hostValidationSchema.optional(),
    httpsPort: portValidationSchema.optional(),
    mode: z.enum([ProxyMode.Automatic, ProxyMode.Manual]),
    sameConfigAsHttp: z.boolean().optional(),
    whitelistedHosts: z.array(hostValidationSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === ProxyMode.Automatic && !data.automaticProxyUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'You must provide a proxy URL',
        path: ['automaticProxyUrl'],
      });
    } else if (data.mode === ProxyMode.Manual) {
      if (!data.httpHost) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'You must provide a host url',
          path: ['httpHost'],
        });
      }
      if (!data.httpPort) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'You must provide a port',
          path: ['httpPort'],
        });
      }
    }
  });

export const apiSchema = z.object({
  URL: z.string().optional().nullable(),
  API_KEY: z.string().optional().nullable(),
  new: z.boolean().optional().nullable(),
});

export const globalSettingsFormSchema = z.object({
  apis: z.array(apiSchema).optional().nullable(),
  apiKey: z.string().optional().nullable(),
  apiUrl: z.string().optional().nullable(),
  language: z.string().optional().nullable(),
  sbomLedgerToken: z.string().optional().nullable(),
  // proxyConfig: proxyConfigSchema,
});

export type GlobalSettingsFormValues = z.infer<typeof globalSettingsFormSchema>;
export type ApiFormValues = z.infer<typeof apiSchema>;
