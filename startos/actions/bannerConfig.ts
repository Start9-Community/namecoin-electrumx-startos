import { electrumxConfigFile } from '../fileModels/electrumxConfig'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  banner: Value.textarea({
    name: i18n('Banner'),
    description: i18n(
      'Free-form text served to Electrum clients on connect. Leave empty to disable.',
    ),
    required: false,
    default: null,
    placeholder: null,
    minLength: null,
    maxLength: 2048,
  }),
  donationAddress: Value.text({
    name: i18n('Donation Address'),
    description: i18n(
      'Optional NMC address advertised over the Electrum protocol so clients can tip the operator. Leave empty to disable.',
    ),
    required: false,
    default: null,
    placeholder: null,
    patterns: [],
  }),
})

export const bannerConfig = sdk.Action.withInput(
  'banner-config',
  async () => ({
    name: i18n('Server Banner'),
    description: i18n('Custom text shown to clients on connect'),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Configuration'),
    visibility: 'enabled',
  }),
  inputSpec,
  async ({ effects }) => {
    const cfg = await electrumxConfigFile.read().once()
    return cfg
      ? {
          banner: cfg.banner || null,
          donationAddress: cfg.donationAddress || null,
        }
      : { banner: null, donationAddress: null }
  },
  async ({ effects, input }) => {
    await electrumxConfigFile.merge(effects, {
      banner: input.banner ?? '',
      donationAddress: input.donationAddress ?? '',
    })
  },
)
