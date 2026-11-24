import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.20.1:2',
  releaseNotes: {
    en_US:
      'ElectrumX can no longer read Namecoin Core’s data directory or wallet; it now sees only Core’s RPC cookie. Requires Namecoin Core 32.1:3 or later. ElectrumX no longer discovers or connects to other Electrum servers.',
    es_ES:
      'ElectrumX ya no puede leer el directorio de datos ni la billetera de Namecoin Core; ahora solo ve la cookie RPC de Core. Requiere Namecoin Core 32.1:3 o posterior. ElectrumX ya no descubre otros servidores Electrum ni se conecta a ellos.',
    de_DE:
      'ElectrumX kann das Datenverzeichnis und die Wallet von Namecoin Core nicht mehr lesen; es sieht nur noch das RPC-Cookie von Core. Erfordert Namecoin Core 32.1:3 oder neuer. ElectrumX sucht keine anderen Electrum-Server mehr und verbindet sich nicht mehr mit ihnen.',
    pl_PL:
      'ElectrumX nie może już odczytać katalogu danych ani portfela Namecoin Core; widzi tylko cookie RPC Core. Wymaga Namecoin Core 32.1:3 lub nowszego. ElectrumX nie wyszukuje już innych serwerów Electrum i nie łączy się z nimi.',
    fr_FR:
      'ElectrumX ne peut plus lire le répertoire de données ni le portefeuille de Namecoin Core ; il ne voit plus que le cookie RPC de Core. Nécessite Namecoin Core 32.1:3 ou ultérieur. ElectrumX ne découvre plus d’autres serveurs Electrum et ne s’y connecte plus.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
