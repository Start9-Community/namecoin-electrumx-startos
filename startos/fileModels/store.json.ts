import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

export const shape = z.looseObject({
  cacheMb: z.number().int().min(64).max(16384).catch(400),
  maxSessions: z.number().int().min(10).max(10000).catch(1000),
  logLevel: z.enum(['debug', 'info', 'warning', 'error']).catch('info'),
  banner: z.string().catch(''),
  donationAddress: z.string().catch(''),
  reindex: z.boolean().catch(false),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.startos, subpath: 'store.json' },
  shape,
)
