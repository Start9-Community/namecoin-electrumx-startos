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
  version: '1.20.1:0',
  releaseNotes: {
    en_US:
      'Update ElectrumX to 1.20.1, retaining Namecoin name-index and name-proof support and including a fix for disconnected sessions during IP grouping.',
    es_ES:
      'Actualiza ElectrumX a 1.20.1, conservando la compatibilidad con índices y pruebas de nombres de Namecoin e incluyendo una corrección para sesiones desconectadas durante la agrupación por IP.',
    de_DE:
      'Aktualisiert ElectrumX auf 1.20.1, behält Namecoin-Namensindizes und -nachweise bei und behebt ein Problem mit getrennten Sitzungen bei der IP-Gruppierung.',
    pl_PL:
      'Aktualizuje ElectrumX do wersji 1.20.1, zachowując obsługę indeksów i dowodów nazw Namecoin oraz poprawiając obsługę rozłączonych sesji podczas grupowania według adresów IP.',
    fr_FR:
      'Met à jour ElectrumX vers 1.20.1, conserve la prise en charge des index et preuves de noms Namecoin et corrige la gestion des sessions déconnectées lors du regroupement par IP.',
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
