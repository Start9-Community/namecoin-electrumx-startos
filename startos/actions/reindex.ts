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
      'This will delete the ElectrumX index database and rebuild it from the Namecoin Core node. The reindex process can take several hours. ElectrumX will be unavailable to clients during this process.',
    ),
    allowedStatuses: 'any',
    group: i18n('Maintenance'),
    visibility: 'enabled',
  }),
  async ({ effects }) => {
    await storeJson.merge(effects, { reindex: true, fullySynced: false })

    const status = await sdk
      .getStatus(effects, { packageId: 'namecoin-electrumx' })
      .once()

    if (status?.desired.main === 'running') {
      await sdk.restart(effects)
      return {
        version: '1',
        title: i18n('Success'),
        message: i18n(
          'Restarting ElectrumX to rebuild the index. This may take several hours.',
        ),
        result: null,
      }
    }

    return {
      version: '1',
      title: i18n('Success'),
      message: i18n(
        'Reindex scheduled. Restart ElectrumX to begin rebuilding the index.',
      ),
      result: null,
    }
  },
)
