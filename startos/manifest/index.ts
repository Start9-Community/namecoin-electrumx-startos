import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'namecoin-electrumx',
  title: 'Namecoin ElectrumX',
  license: 'MIT',
  donationUrl: 'https://www.namecoin.org/donate/',
  packageRepo: 'https://github.com/Start9-Community/namecoin-electrumx-startos',
  upstreamRepo: 'https://github.com/namecoin/electrumx',
  marketingUrl: 'https://www.namecoin.org/',
  description: { short, long },
  volumes: ['main', 'startos'],
  images: {
    'namecoin-electrumx': {
      source: {
        dockerBuild: {
          dockerfile: 'Dockerfile',
          workdir: '.',
        },
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
})
