import { sdk } from './sdk'
import { i18n } from './i18n'
import {
  electrumSslInterfaceId,
  electrumSslPort,
  electrumTcpInterfaceId,
  electrumTcpPort,
  electrumWsInterfaceId,
  electrumWsPort,
  electrumWssInterfaceId,
  electrumWssPort,
} from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  // ---- TCP (plaintext electrum) ----
  const tcpMulti = sdk.MultiHost.of(effects, 'electrum-tcp')
  const tcpOrigin = await tcpMulti.bindPort(electrumTcpPort, {
    protocol: null,
    preferredExternalPort: electrumTcpPort,
    addSsl: null,
    secure: { ssl: false },
  })
  const tcp = sdk.createInterface(effects, {
    name: i18n('Electrum TCP Interface'),
    id: electrumTcpInterfaceId,
    description: i18n('Plaintext Electrum protocol for wallet connections'),
    type: 'p2p',
    masked: false,
    schemeOverride: { ssl: null, noSsl: null },
    username: null,
    path: '',
    query: {},
  })
  const tcpReceipt = await tcpOrigin.export([tcp])

  // ---- SSL (electrum over TLS) ----
  const sslMulti = sdk.MultiHost.of(effects, 'electrum-ssl')
  const sslOrigin = await sslMulti.bindPort(electrumSslPort, {
    protocol: null,
    preferredExternalPort: electrumSslPort,
    addSsl: null,
    secure: { ssl: true },
  })
  const ssl = sdk.createInterface(effects, {
    name: i18n('Electrum SSL Interface'),
    id: electrumSslInterfaceId,
    description: i18n('SSL-encrypted Electrum protocol for wallet connections'),
    type: 'p2p',
    masked: false,
    schemeOverride: { ssl: null, noSsl: null },
    username: null,
    path: '',
    query: {},
  })
  const sslReceipt = await sslOrigin.export([ssl])

  // ---- WS (Electrum over WebSocket — needs websockets<11 pin) ----
  const wsMulti = sdk.MultiHost.of(effects, 'electrum-ws')
  const wsOrigin = await wsMulti.bindPort(electrumWsPort, {
    protocol: 'http',
    preferredExternalPort: electrumWsPort,
  })
  const ws = sdk.createInterface(effects, {
    name: i18n('Electrum WebSocket Interface'),
    id: electrumWsInterfaceId,
    description: i18n('Electrum protocol over WebSocket (ws://)'),
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })
  const wsReceipt = await wsOrigin.export([ws])

  // ---- WSS (Electrum over secure WebSocket) ----
  const wssMulti = sdk.MultiHost.of(effects, 'electrum-wss')
  const wssOrigin = await wssMulti.bindPort(electrumWssPort, {
    protocol: 'http',
    preferredExternalPort: electrumWssPort,
  })
  const wss = sdk.createInterface(effects, {
    name: i18n('Electrum Secure WebSocket Interface'),
    id: electrumWssInterfaceId,
    description: i18n('Electrum protocol over secure WebSocket (wss://)'),
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })
  const wssReceipt = await wssOrigin.export([wss])

  return [tcpReceipt, sslReceipt, wsReceipt, wssReceipt]
})
