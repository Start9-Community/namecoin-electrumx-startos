import { namecoindDescription } from './manifest/i18n'
import { sdk } from './sdk'

/**
 * ElectrumX requires a running, fully-synced Namecoin Core node with the
 * transaction index enabled. The Namecoin Core package on StartOS exposes
 * `txindex` under its "Other Settings" action; we don't currently inspect
 * its config from here — we just require the package to be installed and
 * running, and let its own `sync-progress` health check gate readiness.
 */
const namecoind = sdk.Dependency.required('namecoind', {
  description: namecoindDescription,
  metadata: {
    title: 'Namecoin Core',
    icon: 'https://raw.githubusercontent.com/Start9-Community/namecoin-core-startos/main/icon.svg',
  },
  kind: 'running',
  versionRange: '>=30.2.0.3:0',
  healthChecks: [],
})

export const dependencies = sdk.Dependencies.of().addDependency(namecoind)
