import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  cacheMb: Value.number({
    name: i18n('Cache Size'),
    description: i18n(
      'Memory used to cache the index while syncing. Larger values speed up the initial sync but use more RAM.',
    ),
    required: true,
    default: 400,
    min: 64,
    max: 16384,
    integer: true,
    units: 'MB',
  }),
  maxSessions: Value.number({
    name: i18n('Max Sessions'),
    description: i18n(
      'Maximum number of concurrent Electrum client connections.',
    ),
    required: true,
    default: 1000,
    min: 10,
    max: 10000,
    integer: true,
  }),
  logLevel: Value.select({
    name: i18n('Log Level'),
    description: i18n('Verbosity of the ElectrumX log.'),
    default: 'info',
    values: {
      debug: i18n('Debug'),
      info: i18n('Info'),
      warning: i18n('Warning'),
      error: i18n('Error'),
    },
  }),
  banner: Value.textarea({
    name: i18n('Banner'),
    description: i18n('Text shown to Electrum clients when they connect.'),
    required: false,
    default: null,
    maxLength: 2048,
  }),
  donationAddress: Value.text({
    name: i18n('Donation Address'),
    description: i18n(
      'A Namecoin address advertised to clients for tipping the server operator.',
    ),
    required: false,
    default: null,
  }),
})

export const configure = sdk.Action.withInput(
  'configure',
  async () => ({
    name: i18n('Configure'),
    description: i18n('Performance, logging and the banner shown to clients'),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),
  inputSpec,
  async () => {
    const store = await storeJson.read().once()
    return (
      store && {
        cacheMb: store.cacheMb,
        maxSessions: store.maxSessions,
        logLevel: store.logLevel,
        banner: store.banner || null,
        donationAddress: store.donationAddress || null,
      }
    )
  },
  async ({ effects, input }) => {
    await storeJson.merge(effects, {
      ...input,
      banner: input.banner ?? '',
      donationAddress: input.donationAddress ?? '',
    })
  },
)
