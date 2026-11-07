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
    return null
  },
)
