import { VersionInfo } from '@start9labs/start-sdk'

export const v_1_4_3_1 = VersionInfo.of({
  version: '1.4.3.1:6',
  releaseNotes: {
    en_US:
      'Moves to start-sdk 3.1.1 and the current Namecoin Core build/CI conventions. Requires Namecoin Core 32.1 or newer, checks its RPC and sync health, and adds first-run tasks for archival mode, txindex, and generated RPC credential registration. Also fixes unreadable JavaScript bundles when building with a restrictive umask.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
