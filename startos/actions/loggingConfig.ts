import { electrumxConfigFile } from '../fileModels/electrumxConfig'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  logLevel: Value.select({
    name: i18n('Log Level'),
    description: i18n(
      'Verbosity of log output. Use debug for troubleshooting; info for normal operation.',
    ),
    default: 'info',
    values: {
      debug: i18n('Debug'),
      info: i18n('Info'),
      warning: i18n('Warning'),
      error: i18n('ErrorLevel'),
    },
  }),
})

export const loggingConfig = sdk.Action.withInput(
  'logging-config',
  async () => ({
    name: i18n('Logging Settings'),
    description: i18n('Set the ElectrumX log verbosity'),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Configuration'),
    visibility: 'enabled',
  }),
  inputSpec,
  async ({ effects }) => {
    const cfg = await electrumxConfigFile.read().once()
    return cfg ? { logLevel: cfg.logLevel } : { logLevel: 'info' as const }
  },
  async ({ effects, input }) => {
    await electrumxConfigFile.merge(effects, { logLevel: input.logLevel })
  },
)
