import { AppI18n } from '@shared/i18n';
import { z } from 'zod';

export enum ProxyMode {
  Automatic = 'automatic',
  Manual = 'manual',
  NoProxy = 'no-proxy',
}

const isValidPortNumber = (port: number) => port >= 1 && port <= 65535;

const PROXY_HOST_URL_REGEX = /^(https?:\/\/)?(([\w\-.%]+(:[\w\-.%]+)?@)?(([a-zA-Z0-9\-.]+\.[a-zA-Z]{2,})|(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}))(:\d+)?)(\/.*)?$/;

const hostValidationSchema = z.string().refine((value) => value === '' || PROXY_HOST_URL_REGEX.test(value), {
  message: AppI18n.getI18n()?.t('Common:InvalidUrl'),
});

const portValidationSchema = z.string().transform((value, ctx) => {
  if (value === '') return value;

  const parsedValue = parseInt(value, 10);

  if (Number.isNaN(parsedValue)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: AppI18n.getI18n()?.t('Common:InvalidPortNumber'),
    });
  }

  if (!isValidPortNumber(parsedValue)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: AppI18n.getI18n()?.t('Common:InvalidPortNumberRange'),
    });
  }

  return value;
});

export const proxyConfigSchema = z
  .object({
    automaticProxyUrl: hostValidationSchema.optional().nullable(),
    caCertificatePath: z.string().optional().nullable(),
    grpcProxyHost: hostValidationSchema.optional().nullable(),
    grpcProxyPort: portValidationSchema.optional().nullable(),
    httpHost: hostValidationSchema.optional().nullable(),
    httpPort: portValidationSchema.optional().nullable(),
    httpsHost: hostValidationSchema.optional().nullable(),
    httpsPort: portValidationSchema.optional().nullable(),
    ignoreCertificateErrors: z.boolean().optional().nullable(),
    mode: z.enum([ProxyMode.Automatic, ProxyMode.Manual, ProxyMode.NoProxy]),
    sameConfigAsHttp: z.boolean().optional().nullable(),
    whitelistedHosts: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === ProxyMode.Automatic && !data.automaticProxyUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: AppI18n.getI18n()?.t('Common:ProxyPacUrlRequired'),
        path: ['automaticProxyUrl'],
      });
    } else if (data.mode === ProxyMode.Manual) {
      if (!data.httpHost) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: AppI18n.getI18n()?.t('Common:ProxyHostUrlRequired'),
          path: ['httpHost'],
        });
      }
      if (!data.httpPort) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: AppI18n.getI18n()?.t('Common:PortRequired'),
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
  proxyConfig: proxyConfigSchema.optional().nullable(),
});

export type GlobalSettingsFormValues = z.infer<typeof globalSettingsFormSchema>;
export type ApiFormValues = z.infer<typeof apiSchema>;
