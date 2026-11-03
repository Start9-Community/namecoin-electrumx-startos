import { VersionInfo } from '@start9labs/start-sdk'

export const v_1_4_3_1 = VersionInfo.of({
  version: '1.4.3.1:2',
  releaseNotes: {
    en_US:
      'Moves the package to start-sdk 3.1.1, matching the current Namecoin Core package: the namecoind dependency is now declared through the SDK 3.x dependency API, and the build/CI plumbing follows the upstream package conventions (SDK-provided s9pk.mk, start-technologies workflows, no signing key on PR builds). No functional change to ElectrumX itself.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
