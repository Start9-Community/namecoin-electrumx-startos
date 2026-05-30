import { electrumxConfigFile } from '../fileModels/electrumxConfig'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  cacheMb: Value.number({
    name: i18n('Cache Size (MB)'),
    description: i18n(
      'Amount of memory to use for caching during sync. Larger values speed up the initial index but consume more RAM. Do not set above 60% of available RAM.',
    ),
    required: true,
    default: 400,
    min: 64,
    max: 16384,
    integer: true,
    units: i18n('MB'),
    step: 1,
  }),
  maxSessions: Value.number({
    name: i18n('Max Sessions'),
    description: i18n('Maximum number of concurrent Electrum client connections.'),
    required: true,
    default: 1000,
    min: 10,
    max: 10000,
    integer: true,
    step: 1,
  }),
})

export const performanceConfig = sdk.Action.withInput(
  'performance-config',
  async () => ({
    name: i18n('Performance Settings'),
    description: i18n('Tune ElectrumX cache size and session limits'),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Configuration'),
    visibility: 'enabled',
  }),
  inputSpec,
  async ({ effects }) => {
    const cfg = await electrumxConfigFile.read().once()
    return cfg
      ? { cacheMb: cfg.cacheMb, maxSessions: cfg.maxSessions }
      : { cacheMb: 400, maxSessions: 1000 }
  },
  async ({ effects, input }) => {
    await electrumxConfigFile.merge(effects, {
      cacheMb: input.cacheMb,
      maxSessions: input.maxSessions,
    })
  },
)
