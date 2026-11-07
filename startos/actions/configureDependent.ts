import { electrumxConfigFile } from '../fileModels/electrumxConfig'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
const { InputSpec, Value } = sdk

/**
 * Hidden action invoked by the namecoind dependency wiring at install /
 * configure time. Receives RPC credentials minted by namecoind's
 * `generate-rpc-dependent` action and writes them into our local
 * electrumx.json. The user never sees this action directly — same
 * pattern as namecoin-core-startos / bitcoind autoconfig.
 */
export const inputSpec = InputSpec.of({
  rpcUser: Value.dynamicText(async () => ({
    name: i18n('RPC Username'),
    description: i18n(
      'The RPC username configured on the Namecoin Core service for this ElectrumX instance.',
    ),
    disabled: i18n('These fields were provided by a task and cannot be edited'),
    required: true,
    default: null,
    patterns: [
      {
        regex: '^[a-zA-Z0-9_]+$',
        description: 'Must be alphanumeric (can contain underscore).',
      },
    ],
  })),
  rpcPassword: Value.dynamicText(async () => ({
    name: i18n('RPC Password'),
    description: i18n(
      'The plaintext RPC password matching the rpcauth entry on the Namecoin Core service.',
    ),
    disabled: i18n('These fields were provided by a task and cannot be edited'),
    required: true,
    default: null,
    masked: true,
  })),
})

export const configureDependent = sdk.Action.withInput(
  'configure-dependent',
  async () => ({
    name: i18n('Configure ElectrumX → Namecoin Core'),
    description: i18n(
      'Set the RPC credentials and host that this ElectrumX instance will use to connect to Namecoin Core. Invoked by the Namecoin Core dependency wiring; cannot be edited manually.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'hidden',
  }),
  inputSpec,
  async ({ effects }) => {
    const cfg = await electrumxConfigFile.read().once()
    return cfg
      ? {
          rpcUser: cfg.namecoind.rpcUser,
          rpcPassword: cfg.namecoind.rpcPassword,
        }
      : { rpcUser: 'electrumx', rpcPassword: '' }
  },
  async ({ effects, input }) => {
    await electrumxConfigFile.merge(effects, {
      namecoind: {
        rpcUser: input.rpcUser!,
        rpcPassword: input.rpcPassword!,
        rpcHost: 'namecoind.startos',
        rpcPort: 8336,
      },
    })
  },
)
