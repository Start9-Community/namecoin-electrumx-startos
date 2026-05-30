import { VersionInfo } from '@start9labs/start-sdk'

export const v_1_4_3_1 = VersionInfo.of({
  version: '1.4.3.1:0',
  releaseNotes: {
    en_US:
      'Initial StartOS v0.4.x release of Namecoin ElectrumX. Ported from the v0.3.5 YAML/compat wrapper to the TypeScript SDK (start-sdk 1.5.3). Builds the daemon from mstrofnone/electrumx@fix/pin-websockets so the WS/WSS transport keeps working (carries the upstream-pending `websockets<11` pin). Targets the Start9-Community Namecoin Core package as a hard dependency.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
