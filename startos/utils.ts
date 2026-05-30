import { sdk } from './sdk'

/** ===========================================================================
 * Interface IDs
 * ===========================================================================
 */
export const electrumTcpInterfaceId = 'electrum-tcp'
export const electrumSslInterfaceId = 'electrum-ssl'
export const electrumWsInterfaceId = 'electrum-ws'
export const electrumWssInterfaceId = 'electrum-wss'
export const rpcInterfaceId = 'rpc'

/** ===========================================================================
 * Ports
 * ===========================================================================
 *
 * ElectrumX listens on the canonical Electrum protocol ports plus the
 * less-common ws/wss transports (re-enabled by the websockets<11 pin in
 * mstrofnone/electrumx@fix/pin-websockets).
 *
 * RPC is the local ElectrumX admin RPC — used by sync-progress, the
 * runtime-info action, and the name-lookup action.
 */
export const electrumTcpPort = 50001
export const electrumSslPort = 50002
export const electrumWsPort = 50003
export const electrumWssPort = 50004
export const rpcPort = 8000

/** ===========================================================================
 * Layout
 * ===========================================================================
 *
 * `main` is the package data volume:
 *   /data/electrumx/db   — LevelDB index
 *   /data/electrumx/ssl  — self-signed SSL/WSS cert + key
 *   /data/electrumx/start9/store.json  — wrapper state
 */
export const rootDir = '/data/electrumx'
export const dbDir = `${rootDir}/db`
export const sslDir = `${rootDir}/ssl`
export const sslCert = `${sslDir}/server.crt`
export const sslKey = `${sslDir}/server.key`

export const namecoindDir = '/namecoind'
export const namecoindCookie = `${namecoindDir}/.cookie`

export const electrumxMounts = sdk.Mounts.of()
  .mountVolume({
    volumeId: 'main',
    subpath: null,
    mountpoint: rootDir,
    readonly: false,
  })

/** ===========================================================================
 * ElectrumX RPC types (from `electrumx_rpc getinfo`).
 * ===========================================================================
 *
 * Wire format gotcha: `electrumx_rpc getinfo` returns keys with SPACES
 * (e.g. "daemon height", "db height", "request total") and the
 * `sessions`/`peers` fields are NESTED OBJECTS, not numbers. Older
 * versions of this wrapper read `info.daemon_height` / `info.db_height`
 * straight off the JSON and got `undefined`, which the healthcheck
 * coerced to 0 — making the "Blockchain Sync" status stick on
 * "Connecting to peers…" forever even while the indexer was happily
 * churning, and the runtime-info action render "[object Object]" for
 * Active Sessions. Always go through `normalizeGetInfo()`.
 *
 * Reference: https://electrumx.readthedocs.io/en/latest/rpc-interface.html#getinfo
 */
export type ElectrumxGetInfo = {
  version?: string
  daemon?: string
  db_height?: number
  daemon_height?: number
  daemon_synchronized?: boolean
  sessions?: number
  /** Some forks expose `peers` instead. */
  peers?: number
  /** Convenience: count of peer entries from `peers` RPC. */
  peer_count?: number
  request_count?: number
  closing?: number
  errors?: number
  logged?: number
  paused?: number
  pid?: number
  request_total?: number
  groups?: number
}

/**
 * Map the on-the-wire shape (spaces + nested objects) to the camelCase
 * shape used by main.ts and the runtime-info action. Keys with spaces
 * win over their underscore equivalents when both happen to exist
 * (defensive: future fork could emit either).
 */
export function normalizeGetInfo(raw: any): ElectrumxGetInfo {
  if (!raw || typeof raw !== 'object') return {}
  const num = (v: unknown): number | undefined => {
    if (typeof v === 'number') return v
    if (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v)))
      return Number(v)
    return undefined
  }
  const sessions = raw['sessions']
  const sessionCount =
    typeof sessions === 'object' && sessions !== null
      ? num((sessions as any)['count'])
      : num(sessions)
  const peers = raw['peers']
  const peerCount =
    typeof peers === 'object' && peers !== null
      ? num((peers as any)['total']) ??
        num((peers as any)['good']) ??
        num((peers as any)['count'])
      : num(peers)
  return {
    version: typeof raw['version'] === 'string' ? raw['version'] : undefined,
    daemon: typeof raw['daemon'] === 'string' ? raw['daemon'] : undefined,
    db_height: num(raw['db height']) ?? num(raw['db_height']),
    daemon_height:
      num(raw['daemon height']) ?? num(raw['daemon_height']),
    daemon_synchronized:
      typeof raw['daemon synchronized'] === 'boolean'
        ? raw['daemon synchronized']
        : typeof raw['daemon_synchronized'] === 'boolean'
          ? raw['daemon_synchronized']
          : undefined,
    sessions: sessionCount,
    peers: peerCount,
    peer_count: peerCount,
    request_count: num(raw['request count']) ?? num(raw['request_count']),
    request_total: num(raw['request total']) ?? num(raw['request_total']),
    closing: num(raw['closing']),
    errors: num(raw['errors']),
    logged: num(raw['logged']),
    paused: num(raw['paused']),
    pid: num(raw['pid']),
    groups: num(raw['groups']),
  }
}

/** Build the ElectrumX admin RPC argv. Targets the local rpc:// listener. */
export function electrumxRpcArgs(method: string, ...params: string[]): string[] {
  return ['electrumx_rpc', '-p', String(rpcPort), method, ...params]
}

/**
 * Speak the Electrum line-protocol over the local TCP port. Used by the
 * name-lookup action and the Electrum-protocol probe in the health check.
 */
export function electrumProtocolProbe(method: string, params: unknown[]) {
  return JSON.stringify({ jsonrpc: '2.0', method, id: 0, params })
}
