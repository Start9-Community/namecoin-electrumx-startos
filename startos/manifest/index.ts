import { setupManifest } from '@start9labs/start-sdk'
import { long, namecoindDescription, short } from './i18n'

export const manifest = setupManifest({
  id: 'namecoin-electrumx',
  title: 'Namecoin ElectrumX',
  license: 'MIT',
  donationUrl: 'https://www.namecoin.org/donate/',
  packageRepo:
    'https://github.com/mstrofnone/namecoin-electrumx-startos-start9',
  upstreamRepo: 'https://github.com/namecoin/electrumx',
  marketingUrl: 'https://www.namecoin.org/',
  description: { short, long },
  volumes: ['main'],
  images: {
    'namecoin-electrumx': {
      source: {
        dockerBuild: {
          buildArgs: {
            // mstrofnone/electrumx@fix/pin-websockets — carries the
            // websockets<11 pin needed to keep WS/WSS transport working.
            // Track upstream namecoin/electrumx#<pr> for the eventual
            // fix landing on protocol-1.4.3-v1.
            NMC_ELECTRUMX_REMOTE: 'https://github.com/mstrofnone/electrumx.git',
            NMC_ELECTRUMX_BRANCH: 'fix/pin-websockets',
          },
        },
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {
    namecoind: {
      description: namecoindDescription,
      // Hard dependency: ElectrumX cannot run without namecoind.
      optional: false,
      metadata: {
        title: 'Namecoin Core',
        icon: 'https://raw.githubusercontent.com/Start9-Community/namecoin-core-startos/main/icon.svg',
      },
    },
  },
})
