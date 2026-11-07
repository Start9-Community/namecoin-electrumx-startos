import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  electrumPort,
  electrumSslPort,
  mainHostId,
  wsPort,
  wssPort,
} from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const multiHost = sdk.MultiHost.of(effects, mainHostId)

  const electrumOrigin = await multiHost.bindPort(electrumPort, {
    protocol: null,
    addSsl: { preferredExternalPort: electrumSslPort, alpn: null },
    preferredExternalPort: electrumPort,
    // Mark the base listener as intentional plaintext; addSsl still exposes TLS.
    secure: { ssl: false },
  })
  const electrum = sdk.createInterface(effects, {
    id: 'electrum',
    name: i18n('Electrum'),
    description: i18n('The Electrum protocol endpoint for Namecoin wallets'),
    type: 'api',
    masked: false,
    schemeOverride: { ssl: 'ssl', noSsl: 'tcp' },
    username: null,
    path: '',
    query: {},
  })

  const wsOrigin = await multiHost.bindPort(wsPort, {
    protocol: null,
    addSsl: { preferredExternalPort: wssPort, alpn: null },
    preferredExternalPort: wsPort,
    // Mark the base listener as intentional plaintext; addSsl still exposes TLS.
    secure: { ssl: false },
  })
  const websocket = sdk.createInterface(effects, {
    id: 'websocket',
    name: i18n('Electrum WebSocket'),
    description: i18n(
      'The Electrum protocol over WebSocket, for browser-based clients',
    ),
    type: 'api',
    masked: false,
    schemeOverride: { ssl: 'wss', noSsl: 'ws' },
    username: null,
    path: '',
    query: {},
  })

  return [
    await electrumOrigin.export([electrum]),
    await wsOrigin.export([websocket]),
  ]
})
