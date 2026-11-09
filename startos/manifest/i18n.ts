export const short = {
  en_US:
    'Electrum protocol server for Namecoin — lets light wallets resolve names and verify transactions',
  es_ES:
    'Servidor Electrum para Namecoin — permite a carteras ligeras resolver nombres y verificar transacciones',
  de_DE:
    'Electrum-Server für Namecoin — Light-Wallets lösen Namen auf und verifizieren Transaktionen',
  pl_PL:
    'Serwer protokołu Electrum dla Namecoina — pozwala lekkim portfelom rozwiązywać nazwy i weryfikować transakcje',
  fr_FR:
    'Serveur Electrum pour Namecoin — permet aux portefeuilles légers de résoudre des noms et vérifier des transactions',
}

export const long = {
  en_US:
    'Namecoin ElectrumX is the Namecoin fork of ElectrumX, an Electrum-protocol server. It indexes your Namecoin Core node so Electrum-NMC wallets and other light clients can resolve names and verify transactions without a full node of their own, over TCP, SSL and WebSocket.',
  es_ES:
    'Namecoin ElectrumX es la bifurcación de ElectrumX de Namecoin, un servidor del protocolo Electrum. Indexa tu nodo Namecoin Core para que las carteras Electrum-NMC y otros clientes ligeros puedan resolver nombres y verificar transacciones sin un nodo completo propio, mediante TCP, SSL y WebSocket.',
  de_DE:
    'Namecoin ElectrumX ist der Namecoin-Fork von ElectrumX, einem Server für das Electrum-Protokoll. Er indiziert deinen Namecoin-Core-Node, damit Electrum-NMC-Wallets und andere Light-Clients Namen auflösen und Transaktionen verifizieren können, ohne selbst einen Full Node zu betreiben – über TCP, SSL und WebSocket.',
  pl_PL:
    'Namecoin ElectrumX to fork ElectrumX od Namecoina, serwer protokołu Electrum. Indeksuje Twój węzeł Namecoin Core, dzięki czemu portfele Electrum-NMC i inni lekcy klienci mogą rozwiązywać nazwy i weryfikować transakcje bez własnego pełnego węzła, przez TCP, SSL i WebSocket.',
  fr_FR:
    "Namecoin ElectrumX est le fork Namecoin d'ElectrumX, un serveur du protocole Electrum. Il indexe votre nœud Namecoin Core afin que les portefeuilles Electrum-NMC et d'autres clients légers puissent résoudre des noms et vérifier des transactions sans nœud complet, via TCP, SSL et WebSocket.",
}

export const namecoindDescription = {
  en_US:
    'ElectrumX requires a fully synced, non-pruned Namecoin Core node with txindex enabled. It connects to namecoind via JSON-RPC to read the chain and indexes it into its own LevelDB.',
  es_ES:
    'ElectrumX requiere un nodo Namecoin Core completamente sincronizado, no podado, con txindex habilitado. Se conecta a namecoind por JSON-RPC para leer la cadena y la indexa en su propio LevelDB.',
  de_DE:
    'ElectrumX benötigt einen voll synchronisierten, nicht beschnittenen Namecoin-Core-Node mit aktiviertem txindex. Er verbindet sich per JSON-RPC zu namecoind, liest die Kette und indiziert sie in seine eigene LevelDB.',
  pl_PL:
    'ElectrumX wymaga w pełni zsynchronizowanego, nieprzyciętego węzła Namecoin Core z włączonym txindex. Łączy się z namecoind przez JSON-RPC, odczytuje łańcuch i indeksuje go we własnym LevelDB.',
  fr_FR:
    "ElectrumX nécessite un nœud Namecoin Core entièrement synchronisé et non élagué avec txindex activé. Il se connecte à namecoind par JSON-RPC pour lire la chaîne et l'indexe dans son propre LevelDB.",
}
