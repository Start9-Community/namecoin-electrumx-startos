import { sdk } from './sdk'

/**
 * The ElectrumX index can be rebuilt from Namecoin Core (multi-hour, but
 * lossless). Skip the LevelDB and SSL cert from backups so the archive
 * doesn't bloat to tens of GB; we keep store.json + electrumx.json (config
 * + wrapper state) so settings survive a restore.
 */
export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.ofVolumes('main').setOptions({
    exclude: ['db/', 'ssl/', '**/*-journal', '.reindex'],
  }),
)
