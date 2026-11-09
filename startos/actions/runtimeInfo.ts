import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { getInfo } from '../utils'

export const runtimeInfo = sdk.Action.withoutInput(
  'runtime-info',
  async () => ({
    name: i18n('Runtime Information'),
    description: i18n('Index and Namecoin Core block heights'),
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),
  async () => {
    const info = await getInfo()
    const single = (name: string, value: number) => ({
      type: 'single' as const,
      name,
      description: null,
      value: String(value),
      copyable: false,
      qr: false,
      masked: false,
      launchable: false,
    })
    return {
      version: '1',
      title: i18n('Runtime Information'),
      message: null,
      result: {
        type: 'group',
        value: [
          single(i18n('Index Height'), info['db height']),
          single(i18n('Namecoin Core Height'), info['daemon height']),
        ],
      },
    }
  },
)
