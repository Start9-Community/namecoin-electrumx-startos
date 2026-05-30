import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

/**
 * Wrapper state. Persists across container restarts under
 * /data/electrumx/start9/store.json.
 */
export const shape = z
  .object({
    /**
     * Set by the Reindex action; consumed by main.ts on next start, which
     * wipes the DB directory before launching electrumx_server.
     */
    reindex: z.boolean().catch(false),
    /** True once the index has caught up to namecoind's tip at least once. */
    fullySynced: z.boolean().catch(false),
  })
  .strip()

export const storeJson = FileHelper.json(
  {
    base: sdk.volumes.main,
    subpath: '/start9/store.json',
  },
  shape,
)
