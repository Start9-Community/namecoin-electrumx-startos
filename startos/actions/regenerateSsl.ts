import * as fs from 'fs/promises'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { electrumxMounts, sslCert, sslKey } from '../utils'

export const regenerateSsl = sdk.Action.withoutInput(
  'regenerate-ssl',
  async () => ({
    name: i18n('Regenerate SSL Certificate'),
    description: i18n(
      'Delete and regenerate the self-signed SSL/WSS certificate used by the SSL and WSS interfaces. ElectrumX must be restarted for clients to pick up the new certificate.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Maintenance'),
    visibility: 'enabled',
  }),
  async ({ effects }) => {
    await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'namecoin-electrumx' },
      electrumxMounts,
      'regenerate-ssl',
      async (subc) => {
        await fs.rm(`${subc.rootfs}${sslCert}`, { force: true })
        await fs.rm(`${subc.rootfs}${sslKey}`, { force: true })
      },
    )

    const status = await sdk
      .getStatus(effects, { packageId: 'namecoin-electrumx' })
      .once()

    if (status?.desired.main === 'running') {
      await sdk.restart(effects)
    }

    return {
      version: '1',
      title: i18n('Success'),
      message: i18n('Existing certificate deleted. A new one will be generated on next start.'),
      result: null,
    }
  },
)
