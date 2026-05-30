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
