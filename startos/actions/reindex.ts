import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const reindex = sdk.Action.withoutInput(
  'reindex',
  async () => ({
    name: i18n('Rebuild Index'),
    description: i18n(
      'Delete the ElectrumX index and rebuild it from Namecoin Core',
    ),
    warning: i18n(
      'Rebuilding takes several hours, and ElectrumX serves no clients until it finishes.',
    ),
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),
  async ({ effects }) => {
    await storeJson.merge(effects, { reindex: true })

    // A full service restart stops ElectrumX before main removes its database.
    // If the service is stopped, main consumes the flag on its next start.
    const status = await sdk
      .getStatus(effects, { packageId: 'namecoin-electrumx' })
      .once()
    if (status?.desired.main === 'running') {
      await sdk.restart(effects)
      return {
        version: '1',
        title: i18n('Success'),
        message: i18n('Restarting ElectrumX to rebuild the index'),
        result: null,
      }
    }

    return {
      version: '1',
      title: i18n('Success'),
      message: i18n('ElectrumX will rebuild its index the next time it starts'),
      result: null,
    }
  },
)
