import { electrumxConfigFile } from './fileModels/electrumxConfig'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  ElectrumxGetInfo,
  dbDir,
  electrumProtocolProbe,
  electrumSslPort,
  electrumTcpPort,
  electrumWsPort,
  electrumWssPort,
  electrumxMounts,
  electrumxRpcArgs,
  rootDir,
  rpcPort,
  sslCert,
  sslDir,
  sslKey,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.log('Starting Namecoin ElectrumX!')

  /**
   * ======================== Setup ========================
   */
  const store = await storeJson.read().once()
  if (!store) throw new Error('No store.json')

  const cfg = await electrumxConfigFile.read().const(effects)
  if (!cfg) throw new Error('No electrumx.json')

  // SubContainer for the long-running daemon. Mounts the package's main
  // volume at /data/electrumx (db, ssl, start9/).
  const sub = await sdk.SubContainer.of(
    effects,
    { imageId: 'namecoin-electrumx' },
    electrumxMounts,
    'electrumx-sub',
  )

  // Honour the Reindex action: wipe the on-disk LevelDB BEFORE the daemon
  // starts so it rebuilds from genesis. Done as a oneshot so failures are
  // surfaced in the StartOS UI instead of silently swallowed by the daemon.
  const reindexPending = store.reindex

  const base = sdk.Daemons.of(effects)
    .addOneshot('ensure-dirs', {
      subcontainer: sub,
      exec: {
        command: ['sh', '-c', `mkdir -p ${dbDir} ${sslDir}`],
      },
      requires: [],
    })
    .addOneshot('apply-reindex', {
      subcontainer: sub,
      exec: {
        command: [
          'sh',
          '-c',
          reindexPending
            ? `rm -rf ${dbDir} && mkdir -p ${dbDir}`
            : 'true',
        ],
      },
      requires: ['ensure-dirs'],
    })
    .addOneshot('clear-reindex-flag', {
      subcontainer: null,
      exec: {
        fn: async () => {
          if (reindexPending) {
            await storeJson.merge(effects, { reindex: false, fullySynced: false })
          }
          return null
        },
      },
      requires: ['apply-reindex'],
    })
    .addOneshot('ensure-ssl', {
      subcontainer: sub,
      exec: {
        command: [
          'sh',
          '-c',
          // Self-signed cert for the SSL + WSS transports. Regenerated
          // by the "Regenerate SSL Certificate" action via file removal +
          // restart.
          `[ -f ${sslCert} ] && [ -f ${sslKey} ] && exit 0; ` +
            `openssl req -x509 -newkey rsa:2048 ` +
            `-keyout ${sslKey} -out ${sslCert} ` +
            `-days 3650 -nodes -subj "/CN=namecoin-electrumx"`,
        ],
      },
      requires: ['ensure-dirs'],
    })

  // Build the SERVICES list. WS/WSS are conditional on the websockets<11
  // pin actually being present (verified at image build), so we list them
  // unconditionally here — the daemon will fail loudly if they don't bind.
  const services = [
    `tcp://0.0.0.0:${electrumTcpPort}`,
    `ssl://0.0.0.0:${electrumSslPort}`,
    `ws://0.0.0.0:${electrumWsPort}`,
    `wss://0.0.0.0:${electrumWssPort}`,
    `rpc://0.0.0.0:${rpcPort}`,
  ].join(',')

  const daemonUrl =
    `http://${cfg.namecoind.rpcUser}:${cfg.namecoind.rpcPassword}` +
    `@${cfg.namecoind.rpcHost}:${cfg.namecoind.rpcPort}/`

  const env: Record<string, string> = {
    COIN: 'Namecoin',
    NET: 'mainnet',
    DB_DIRECTORY: dbDir,
    DAEMON_URL: daemonUrl,
    SERVICES: services,
    SSL_CERTFILE: sslCert,
    SSL_KEYFILE: sslKey,
    ALLOW_ROOT: '1',
    CACHE_MB: String(cfg.cacheMb),
    MAX_SESSIONS: String(cfg.maxSessions),
    LOG_LEVEL: cfg.logLevel,
    DB_ENGINE: 'leveldb',
    REQUEST_TIMEOUT: '30',
    INITIAL_CONCURRENT: '20',
  }

  if (cfg.banner) env.BANNER_FILE = '/dev/stdin' // see banner-file write below
  if (cfg.donationAddress) env.DONATION_ADDRESS = cfg.donationAddress

  // Inline-write the banner.txt if configured (cheap: just an echo into
  // the volume). The daemon reads it on every connect.
  const bannerPath = `${rootDir}/banner.txt`
  if (cfg.banner) env.BANNER_FILE = bannerPath

  const withBanner = base.addOneshot('write-banner', {
    subcontainer: sub,
    exec: {
      command: cfg.banner
        ? ['sh', '-c', `cat > ${bannerPath} <<'__EOF__'\n${cfg.banner}\n__EOF__`]
        : ['sh', '-c', `rm -f ${bannerPath}`],
    },
    requires: ['ensure-dirs'],
  })

  const withDaemon = withBanner.addDaemon('electrumx', {
    subcontainer: sub,
    exec: {
      command: ['python3', '-m', 'electrumx_server'],
      env,
      sigtermTimeout: 300_000, // ElectrumX needs time to flush LevelDB
    },
    ready: {
      display: i18n('ElectrumX'),
      fn: async () => {
        // Probe the Electrum protocol port. server.version is the cheapest
        // round-trip that confirms the daemon is actually serving.
        return sdk.healthCheck.checkPortListening(effects, electrumTcpPort, {
          successMessage: i18n('ElectrumX is ready and accepting connections'),
          errorMessage: i18n('ElectrumX is not ready'),
        })
      },
    },
    requires: ['ensure-dirs', 'apply-reindex', 'ensure-ssl', 'write-banner'],
  })

  /**
   * ======================== Sync Progress Health Check ========================
   *
   * Three-phase reporting (informed by namecoin-core-startos PR #6 — same
   * UX problem applies here: a single percentage that sits at 0% for a
   * long time is indistinguishable from a stalled node).
   *
   * Phase 1: No peers / RPC not answering → "Connecting to peers…"
   * Phase 2: db_height == 0, daemon_height > 0 → "Downloading headers…"
   * Phase 3: 0 < db_height < daemon_height → "Indexing blocks N/M (X%)"
   * Phase 4: db_height >= daemon_height → "Index fully synced"
   */
  const withSyncProgress = withDaemon.addHealthCheck('sync-progress', {
    ready: {
      display: i18n('Blockchain Sync'),
      trigger: sdk.trigger.statusTrigger(30_000, {
        starting: 5_000,
        failure: 5_000,
      }),
      fn: async () => {
        const res = await sub.exec(electrumxRpcArgs('getinfo'))
        if (res.exitCode !== 0 || typeof res.stdout !== 'string') {
          return {
            result: 'starting',
            message: i18n('ElectrumX is starting…'),
          }
        }

        let info: ElectrumxGetInfo
        try {
          info = JSON.parse(res.stdout)
        } catch {
          return {
            result: 'starting',
            message: i18n('ElectrumX is starting…'),
          }
        }

        const daemonHeight = info.daemon_height ?? 0
        const dbHeight = info.db_height ?? 0

        // Phase 1: daemon isn't even reporting a tip yet.
        if (daemonHeight === 0) {
          return {
            result: 'loading',
            message: i18n('Connecting to peers…'),
          }
        }

        // Phase 2: dependency is healthy and reporting a tip, but the
        // ElectrumX index hasn't written anything yet (still bootstrapping
        // headers / coin metadata).
        if (dbHeight === 0) {
          return {
            result: 'loading',
            message: i18n('Downloading block headers… ${headers} headers', {
              headers: String(daemonHeight),
            }),
          }
        }

        // Phase 4: caught up.
        if (dbHeight >= daemonHeight) {
          if (!store.fullySynced) {
            await storeJson.merge(effects, { fullySynced: true })
          }
          return {
            result: 'success',
            message: i18n('Index fully synced'),
          }
        }

        // Phase 3: actively indexing blocks. Include absolute counts so
        // users see real progress even when the percentage moves slowly.
        const pct = ((dbHeight / daemonHeight) * 100).toFixed(2)
        return {
          result: 'loading',
          message: i18n(
            'Indexing blocks… ${db_height} / ${daemon_height} (${percentage}%)',
            {
              db_height: String(dbHeight),
              daemon_height: String(daemonHeight),
              percentage: pct,
            },
          ),
        }
      },
    },
    requires: ['electrumx'],
  })

  return withSyncProgress
})

// Re-export for the runtime-info action.
export { ElectrumxGetInfo }
