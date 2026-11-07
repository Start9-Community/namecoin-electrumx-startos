import { FileHelper, IMPOSSIBLE, VersionInfo, z } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'
import { mainHostId } from '../utils'

const legacyConfigJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: '/start9/electrumx.json' },
  z.looseObject({
    cacheMb: z.number().int().min(64).max(16384).catch(400),
    maxSessions: z.number().int().min(10).max(10000).catch(1000),
    logLevel: z.enum(['debug', 'info', 'warning', 'error']).catch('info'),
    banner: z.string().catch(''),
    donationAddress: z.string().catch(''),
  }),
)

const legacyStoreJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: '/start9/store.json' },
  z.looseObject({ reindex: z.boolean().catch(false) }),
)

const retiredHostIds = [
  'electrum-tcp',
  'electrum-ssl',
  'electrum-ws',
  'electrum-wss',
  // :0 could bind this host to random ports while the legacy claims remained.
  // Recreate it after releasing those claims so canonical ports are recovered.
  mainHostId,
] as const

export const current = VersionInfo.of({
  version: '1.16.0:1',
  releaseNotes: {
    en_US:
      'Fixes upgrades and backup restores, preserves legacy settings, restores Electrum TCP/SSL/WS/WSS ports 50001-50004, and restarts ElectrumX when its configuration or Namecoin Core connection changes. Upgrade note: retires electrum-tcp, electrum-ssl, electrum-ws and electrum-wss and recreates main to release stale port claims; custom addresses and domains on these hosts must be configured again.',
    es_ES:
      'Corrige actualizaciones y restauraciones, conserva la configuración anterior, recupera los puertos 50001-50004 y reinicia ElectrumX cuando cambian su configuración o Namecoin Core. Nota: retira electrum-tcp, electrum-ssl, electrum-ws y electrum-wss y recrea main; vuelva a configurar sus direcciones y dominios personalizados.',
    de_DE:
      'Behebt Upgrades und Wiederherstellungen, übernimmt bisherige Einstellungen, stellt die Ports 50001-50004 wieder her und startet ElectrumX nach Konfigurations- oder Namecoin-Core-Änderungen neu. Hinweis: electrum-tcp, electrum-ssl, electrum-ws und electrum-wss werden entfernt und main neu erstellt; eigene Adressen und Domains müssen neu konfiguriert werden.',
    pl_PL:
      'Naprawia aktualizacje i przywracanie, zachowuje poprzednie ustawienia i porty 50001-50004 oraz ponownie uruchamia ElectrumX po zmianach konfiguracji lub Namecoin Core. Uwaga: usuwa electrum-tcp, electrum-ssl, electrum-ws i electrum-wss oraz ponownie tworzy main; skonfiguruj ponownie własne adresy i domeny.',
    fr_FR:
      'Corrige les mises à niveau et restaurations, conserve les anciens réglages et les ports 50001-50004, puis redémarre ElectrumX après les changements de configuration ou de Namecoin Core. Attention : electrum-tcp, electrum-ssl, electrum-ws et electrum-wss sont retirés et main est recréé ; reconfigurez leurs adresses et domaines personnalisés.',
  },
  migrations: {
    up: async ({ effects }) => {
      // Do not overwrite a store from a newer backup or an earlier :0 attempt.
      if (!(await storeJson.read().once())) {
        const [legacyConfig, legacyStore] = await Promise.all([
          legacyConfigJson.read().once(),
          legacyStoreJson.read().once(),
        ])

        await storeJson.merge(effects, {
          ...(legacyConfig
            ? {
                cacheMb: legacyConfig.cacheMb,
                maxSessions: legacyConfig.maxSessions,
                logLevel: legacyConfig.logLevel,
                banner: legacyConfig.banner,
                donationAddress: legacyConfig.donationAddress,
              }
            : {}),
          reindex: legacyStore?.reindex ?? false,
        })
      }

      // setupInterfaces only disables omitted bindings; retire releases their
      // external-port claims before the consolidated interfaces are declared.
      for (const hostId of retiredHostIds) {
        await sdk.MultiHost.of(effects, hostId).retire()
      }
    },
    down: IMPOSSIBLE,
  },
})
