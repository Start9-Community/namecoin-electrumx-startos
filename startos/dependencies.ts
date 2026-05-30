import { sdk } from './sdk'

/**
 * ElectrumX requires a running, fully-synced Namecoin Core node with the
 * transaction index enabled. The Namecoin Core package on StartOS exposes
 * `txindex` under its "Other Settings" action; we don't currently inspect
 * its config from here — we just require the package to be installed and
 * running, and let its own `sync-progress` health check gate readiness.
 */
export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  return {
    namecoind: {
      kind: 'running',
      versionRange: '>=30.2.0.3:0',
      healthChecks: [],
    },
  }
})
