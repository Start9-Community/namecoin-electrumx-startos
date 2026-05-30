import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

/**
 * Wrapper-managed runtime config for electrumx_server. Edited via the
 * Performance / Logging / Banner / Connection actions and read by main.ts
 * to build the ENV passed to the daemon.
 *
 * Stored as JSON under /data/electrumx/start9/electrumx.json. NOT the
 * same as the upstream env-style config — ElectrumX reads its config
 * from environment variables, so we keep our state as a typed JSON and
 * translate at startup.
 */
export const electrumxConfigShape = z
  .object({
    // Connection to namecoind. These come from the dependency action that
    // runs at install / configure time and writes the cookie / rpcauth.
    namecoind: z
      .object({
        rpcUser: z.string().catch('electrumx'),
        rpcPassword: z.string().catch(''),
        rpcHost: z.string().catch('namecoind.startos'),
        rpcPort: z.number().int().min(1).max(65535).catch(8336),
      })
      .catch({
        rpcUser: 'electrumx',
        rpcPassword: '',
        rpcHost: 'namecoind.startos',
        rpcPort: 8336,
      }),

    // Performance tuning
    cacheMb: z.number().int().min(64).max(16384).catch(400),
    maxSessions: z.number().int().min(10).max(10000).catch(1000),

    // Logging
    logLevel: z.enum(['debug', 'info', 'warning', 'error']).catch('info'),

    // Banner shown to connecting Electrum clients
    banner: z.string().catch(''),

    // Donation address advertised over the Electrum protocol
    donationAddress: z.string().catch(''),
  })
  .strip()

export const electrumxConfigFile = FileHelper.json(
  {
    base: sdk.volumes.main,
    subpath: '/start9/electrumx.json',
  },
  electrumxConfigShape,
)
