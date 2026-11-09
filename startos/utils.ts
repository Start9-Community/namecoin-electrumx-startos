import { T } from '@start9labs/start-sdk'
import { rpcHostId, rpcPort } from 'namecoin-core-startos/startos/utils'
import { connect } from 'node:net'
import { sdk } from './sdk'

export const mainHostId = 'main'
export const electrumPort = 50001
export const electrumSslPort = 50002
export const wsPort = 50003
export const wssPort = 50004
export const adminRpcPort = 8000

export const dataDir = '/data'
export const namecoindDir = '/mnt/namecoind'
export const dbDir = sdk.volumes.main.subpath('db')
export const bannerFile = sdk.volumes.main.subpath('banner.txt')

export const namecoindRpc = (effects: T.Effects) =>
  sdk.host
    .getBridgeAddress(effects, {
      packageId: 'namecoind',
      hostId: rpcHostId,
      internalPort: rpcPort,
      ssl: false,
    })
    .const()

export type GetInfo = {
  'daemon height': number
  'db height': number
}

export const getInfo = () =>
  new Promise<GetInfo>((resolve, reject) => {
    const socket = connect(adminRpcPort, '127.0.0.1')
    let buffer = ''
    socket.setTimeout(10_000, () => socket.destroy(new Error('timed out')))
    socket.on('error', reject)
    socket.on('connect', () =>
      socket.write(
        JSON.stringify({ id: 0, method: 'getinfo', params: [] }) + '\n',
      ),
    )
    socket.on('data', (chunk) => {
      buffer += chunk
      if (!buffer.includes('\n')) return
      socket.end()
      resolve(JSON.parse(buffer).result)
    })
  })
