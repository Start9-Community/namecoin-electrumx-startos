import { electrumxConfigFile } from '../fileModels/electrumxConfig'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
const { InputSpec, Value } = sdk

/**
 * Manual override for the Namecoin Core RPC connection. Normally the
 * `configure-dependent` hidden action (called via the namecoind dependency
 * wiring) writes these fields. This action is kept enabled so the user can
 * debug an out-of-sync connection by hand, but in normal operation it
 * should not need to be touched.
 */
export const inputSpec = InputSpec.of({
  rpcUser: Value.text({
    name: i18n('RPC Username'),
    description: i18n(
      'The RPC username configured on the Namecoin Core service for this ElectrumX instance.',
    ),
    required: true,
    default: 'electrumx',
    patterns: [
      {
        regex: '^[a-zA-Z0-9_]+$',
        description: 'Must be alphanumeric (can contain underscore).',
      },
    ],
  }),
  rpcPassword: Value.text({
    name: i18n('RPC Password'),
    description: i18n(
      'The plaintext RPC password matching the rpcauth entry on the Namecoin Core service.',
    ),
    required: true,
    default: '',
    masked: true,
  }),
  rpcHost: Value.text({
    name: i18n('RPC Host'),
    description: i18n(
      'Hostname of the Namecoin Core service. Usually auto-configured by StartOS.',
    ),
    required: true,
    default: 'namecoind.startos',
  }),
  rpcPort: Value.number({
    name: i18n('RPC Port'),
    description: i18n('JSON-RPC port of Namecoin Core. The default is 8336.'),
    required: true,
    default: 8336,
    min: 1,
    max: 65535,
    integer: true,
    step: 1,
  }),
})

export const connectionConfig = sdk.Action.withInput(
  'connection-config',
  async () => ({
    name: i18n('Namecoin Core Connection'),
    description: i18n(
      'RPC credentials and host used to connect to namecoind. Auto-populated by the dependency configurator; only edit manually if you know what you are doing.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Configuration'),
    visibility: 'enabled',
  }),
  inputSpec,
  async ({ effects }) => {
    const cfg = await electrumxConfigFile.read().once()
    return cfg ? cfg.namecoind : undefined
  },
  async ({ effects, input }) => {
    await electrumxConfigFile.merge(effects, {
      namecoind: {
        rpcUser: input.rpcUser,
        rpcPassword: input.rpcPassword,
        rpcHost: input.rpcHost,
        rpcPort: input.rpcPort,
      },
    })
  },
)
