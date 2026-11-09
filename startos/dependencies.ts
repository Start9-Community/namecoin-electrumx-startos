import type { otherConfig } from 'namecoin-core-startos/startos/actions/config/other'
import { i18n } from './i18n'
import { namecoindDescription } from './manifest/i18n'
import { sdk } from './sdk'

// A value import of Core's action bundles its native diskusage module; createTask reads only the id.
const otherConfigAction = { id: 'other-config' } as typeof otherConfig

const namecoind = sdk.Dependency.required('namecoind', {
  description: namecoindDescription,
  metadata: {
    title: 'Namecoin Core',
    icon: 'https://raw.githubusercontent.com/Start9-Community/namecoin-core-startos/main/icon.svg',
  },
  kind: 'running',
  versionRange: '>=32.1:0',
  healthChecks: ['namecoind'],
}).withInit(async (effects) => {
  await sdk.action.createTask(
    effects,
    'namecoind',
    otherConfigAction,
    'critical',
    {
      input: {
        kind: 'partial',
        accept: [{ prune: 0, txindex: true }],
        set: { prune: 0, txindex: true },
      },
      when: { condition: 'input-not-matches', once: false },
      reason: i18n(
        'ElectrumX requires an archival Namecoin Core node with the transaction index enabled. Disabling pruning may require a full blockchain reindex.',
      ),
    },
  )
})

export const dependencies = sdk.Dependencies.of().addDependency(namecoind)
