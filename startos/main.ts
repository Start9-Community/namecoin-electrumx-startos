import { FileHelper } from '@start9labs/start-sdk'
import type { manifest as namecoindManifest } from 'namecoin-core-startos/startos/manifest'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  adminRpcPort,
  bannerFile,
  dataDir,
  dbDir,
  electrumPort,
  getInfo,
  namecoindDir,
  namecoindRpc,
  wsPort,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Namecoin ElectrumX!'))

  const store = await storeJson.read().const(effects)
  if (!store) throw new Error('No store.json')

  if (store.reindex) {
    await rm(dbDir, { recursive: true, force: true })
    await storeJson.merge(effects, { reindex: false })
  }
  await mkdir(dbDir, { recursive: true })

  if (store.banner) await writeFile(bannerFile, store.banner + '\n')
  else await rm(bannerFile, { force: true })

  const sub = sdk.SubContainer.of(
    effects,
    { imageId: 'namecoin-electrumx' },
    sdk.Mounts.of()
      .mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: dataDir,
        readonly: false,
      })
      .mountDependency<typeof namecoindManifest>({
        dependencyId: 'namecoind',
        volumeId: 'main',
        subpath: null,
        mountpoint: namecoindDir,
        readonly: true,
      }),
    'electrumx',
  )

  const waitForNamecoind = () =>
    sdk.Daemons.of(effects).addHealthCheck('namecoind', {
      ready: {
        display: i18n('Namecoin Core'),
        fn: () => ({
          result: 'starting',
          waiting: true,
          message: i18n('Waiting for Namecoin Core to start'),
        }),
      },
      requires: [],
    })

  const rpc = await namecoindRpc(effects)
  if (!rpc) return waitForNamecoind()

  // Namecoin Core rewrites its cookie on every start; an absent one means it is down.
  const cookie = await FileHelper.string(
    `${await sub.rootfs}${namecoindDir}/.cookie`,
  )
    .read((c) => c.trim())
    .const(effects)

  if (!cookie) return waitForNamecoind()

  return sdk.Daemons.of(effects)
    .addDaemon('electrumx', {
      subcontainer: sub,
      exec: {
        command: ['electrumx_server'],
        env: {
          COIN: 'Namecoin',
          NET: 'mainnet',
          DB_DIRECTORY: `${dataDir}/db`,
          DAEMON_URL: `http://${cookie}@${rpc}/`,
          SERVICES: `tcp://:${electrumPort},ws://:${wsPort},rpc://127.0.0.1:${adminRpcPort}`,
          ALLOW_ROOT: '1',
          CACHE_MB: String(store.cacheMb),
          MAX_SESSIONS: String(store.maxSessions),
          LOG_LEVEL: store.logLevel,
          ...(store.banner ? { BANNER_FILE: `${dataDir}/banner.txt` } : {}),
          ...(store.donationAddress
            ? { DONATION_ADDRESS: store.donationAddress }
            : {}),
        },
        sigtermTimeout: 300_000,
      },
      ready: {
        display: i18n('ElectrumX'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, adminRpcPort, {
            successMessage: i18n('ElectrumX is running'),
            errorMessage: i18n('ElectrumX is starting'),
          }),
      },
      requires: [],
    })
    .addHealthCheck('sync', {
      ready: {
        display: i18n('Index Sync'),
        fn: async () => {
          const info = await getInfo().catch(() => null)
          if (!info) {
            return {
              result: 'starting',
              message: i18n('ElectrumX is starting'),
            }
          }
          const daemonHeight = info['daemon height']
          const dbHeight = info['db height']
          if (daemonHeight > 0 && dbHeight >= daemonHeight) {
            const serving = await sdk.healthCheck.checkPortListening(
              effects,
              electrumPort,
              {
                successMessage: i18n('Synced and serving Electrum clients'),
                errorMessage: i18n(
                  'Index synced; starting the Electrum server',
                ),
              },
            )
            return serving.result === 'success'
              ? serving
              : { result: 'loading', message: serving.message! }
          }
          if (dbHeight < 0) {
            return { result: 'loading', message: i18n('Building the index') }
          }
          return {
            result: 'loading',
            message: i18n('Indexing block ${db} of ${daemon}', {
              db: dbHeight,
              daemon: daemonHeight,
            }),
          }
        },
      },
      requires: ['electrumx'],
    })
})
