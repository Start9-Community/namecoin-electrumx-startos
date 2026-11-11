import { FileHelper, IMPOSSIBLE, VersionInfo, z } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

const legacyShape = z.looseObject({
  cacheMb: z.number().int().min(64).max(16384).optional(),
  maxSessions: z.number().int().min(10).max(10000).optional(),
  logLevel: z.enum(['debug', 'info', 'warning', 'error']).optional(),
  banner: z.string().optional(),
  donationAddress: z.string().optional(),
  reindex: z.boolean().optional(),
})

// Published 1.4.3.3:0 keeps its settings here. Older layouts kept settings
// and the reindex flag separately under start9/.
const legacyV2Store = FileHelper.json(
  { base: sdk.volumes.main, subpath: '/store.json' },
  legacyShape,
)
const legacyConfig = FileHelper.json(
  { base: sdk.volumes.main, subpath: '/start9/electrumx.json' },
  legacyShape,
)
const legacyStore = FileHelper.json(
  { base: sdk.volumes.main, subpath: '/start9/store.json' },
  legacyShape,
)

const retiredHostIds = [
  'electrum-tcp',
  'electrum-ssl',
  'electrum-ws',
  'electrum-wss',
] as const

export const current = VersionInfo.of({
  version: '1.16.0:1',
  releaseNotes: {
    en_US:
      'Fix upgrades and restores by initializing the settings store and preserving legacy settings. Restart ElectrumX when Namecoin Core stops or rotates its RPC cookie. Legacy Electrum hosts are retired; custom addresses on them must be configured again on the main host.',
    es_ES:
      'Corrige actualizaciones y restauraciones inicializando la configuración y conservando los ajustes anteriores. Reinicia ElectrumX cuando Namecoin Core se detiene o cambia su cookie RPC. Los hosts Electrum anteriores se retiran; vuelva a configurar sus direcciones personalizadas en main.',
    de_DE:
      'Behebt Upgrades und Wiederherstellungen durch Initialisierung und Übernahme bisheriger Einstellungen. Startet ElectrumX neu, wenn Namecoin Core stoppt oder sein RPC-Cookie wechselt. Alte Electrum-Hosts werden entfernt; eigene Adressen müssen auf main neu konfiguriert werden.',
    pl_PL:
      'Naprawia aktualizacje i przywracanie przez inicjalizację magazynu i zachowanie poprzednich ustawień. Ponownie uruchamia ElectrumX po zatrzymaniu Namecoin Core lub zmianie jego cookie RPC. Stare hosty Electrum są usuwane; skonfiguruj ponownie ich własne adresy na main.',
    fr_FR:
      'Corrige les mises à niveau et restaurations en initialisant le stockage et en conservant les anciens réglages. Redémarre ElectrumX quand Namecoin Core s’arrête ou change son cookie RPC. Les anciens hôtes Electrum sont retirés ; reconfigurez leurs adresses personnalisées sur main.',
  },
  migrations: {
    up: async ({ effects }) => {
      if (!(await storeJson.read().once())) {
        const [v2Store, oldConfig, oldStore] = await Promise.all([
          legacyV2Store.read().once(),
          legacyConfig.read().once(),
          legacyStore.read().once(),
        ])

        await storeJson.merge(effects, {
          cacheMb: v2Store?.cacheMb ?? oldConfig?.cacheMb ?? 400,
          maxSessions: v2Store?.maxSessions ?? oldConfig?.maxSessions ?? 1000,
          logLevel: oldConfig?.logLevel ?? 'info',
          banner: oldConfig?.banner ?? '',
          donationAddress: oldConfig?.donationAddress ?? '',
          reindex: oldStore?.reindex ?? false,
        })
      }

      // Release legacy external-port claims before setupInterfaces declares
      // the consolidated main host. Current main-host addresses are untouched.
      for (const hostId of retiredHostIds) {
        await sdk.MultiHost.of(effects, hostId).retire()
      }
    },
    down: IMPOSSIBLE,
  },
})
