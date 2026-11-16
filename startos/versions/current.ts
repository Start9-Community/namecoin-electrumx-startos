import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.20.1:0',
  releaseNotes: {
    en_US:
      'Update ElectrumX to 1.20.1, retaining Namecoin name-index and name-proof support and including a fix for disconnected sessions during IP grouping. [Full upstream changes](https://github.com/mstrofnone/electrumx/compare/714058794a69ec56563009509a1d6df54ff482f2...04e725e42e8df2d002935e613e679399f3e4f3bf).',
    es_ES:
      'Actualiza ElectrumX a 1.20.1, conservando la compatibilidad con índices y pruebas de nombres de Namecoin e incluyendo una corrección para sesiones desconectadas durante la agrupación por IP. [Todos los cambios de upstream](https://github.com/mstrofnone/electrumx/compare/714058794a69ec56563009509a1d6df54ff482f2...04e725e42e8df2d002935e613e679399f3e4f3bf).',
    de_DE:
      'Aktualisiert ElectrumX auf 1.20.1, behält Namecoin-Namensindizes und -nachweise bei und behebt ein Problem mit getrennten Sitzungen bei der IP-Gruppierung. [Alle Upstream-Änderungen](https://github.com/mstrofnone/electrumx/compare/714058794a69ec56563009509a1d6df54ff482f2...04e725e42e8df2d002935e613e679399f3e4f3bf).',
    pl_PL:
      'Aktualizuje ElectrumX do wersji 1.20.1, zachowując obsługę indeksów i dowodów nazw Namecoin oraz poprawiając obsługę rozłączonych sesji podczas grupowania według adresów IP. [Wszystkie zmiany upstream](https://github.com/mstrofnone/electrumx/compare/714058794a69ec56563009509a1d6df54ff482f2...04e725e42e8df2d002935e613e679399f3e4f3bf).',
    fr_FR:
      'Met à jour ElectrumX vers 1.20.1, conserve la prise en charge des index et preuves de noms Namecoin et corrige la gestion des sessions déconnectées lors du regroupement par IP. [Tous les changements en amont](https://github.com/mstrofnone/electrumx/compare/714058794a69ec56563009509a1d6df54ff482f2...04e725e42e8df2d002935e613e679399f3e4f3bf).',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
