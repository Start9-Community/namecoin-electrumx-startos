export const short = {
  en_US:
    'Electrum protocol server for Namecoin — lets light wallets resolve names and verify transactions',
  es_ES:
    'Servidor Electrum para Namecoin — permite a carteras ligeras resolver nombres y verificar transacciones',
  de_DE:
    'Electrum-Protokoll-Server für Namecoin — ermöglicht es Light-Wallets, Namen aufzulösen und Transaktionen zu verifizieren',
  pl_PL:
    'Serwer protokołu Electrum dla Namecoina — pozwala lekkim portfelom rozwiązywać nazwy i weryfikować transakcje',
  fr_FR:
    'Serveur Electrum pour Namecoin — permet aux portefeuilles légers de résoudre des noms et vérifier des transactions',
}

/**
 * Long description. Sourced from the Namecoin fork's README and from
 * namecoin.org wording (the same refresh applied to namecoin-core-startos
 * PR #5 — keep the en_US copy aligned with the project's public framing).
 */
export const long = {
  en_US:
    'Namecoin ElectrumX is an Electrum-protocol server for the Namecoin blockchain. It indexes the chain and serves data to lightweight Electrum-NMC wallet clients, enabling them to look up names and verify transactions without running a full node themselves.\n\nThis is the Namecoin fork of ElectrumX. It adds:\n\n- Name-script indexing for .bit / d/ / id/ lookups\n- AuxPoW (merged mining) support with checkpointed header truncation\n- Protocol v1.4.3 with 1-block name-update confirmation via scriptSig chaining\n- Optimized MAX_SEND defaults for AuxPoW chains\n\nRequires a fully synced, non-pruned Namecoin Core node to function. Once indexed, it serves Electrum-NMC clients over TCP, SSL, and WebSocket (WS/WSS) transports.',
  es_ES:
    'Namecoin ElectrumX es un servidor del protocolo Electrum para la blockchain de Namecoin. Indexa la cadena y sirve datos a clientes Electrum-NMC ligeros, permitiéndoles buscar nombres y verificar transacciones sin tener que ejecutar un nodo completo.\n\nEsta es la bifurcación de ElectrumX de Namecoin, que añade indexación de scripts de nombre, soporte AuxPoW (minería fusionada) con truncamiento de cabecera con checkpoint, el protocolo v1.4.3 con confirmación de actualización de nombre en un bloque mediante encadenamiento de scriptSig, y valores predeterminados optimizados de MAX_SEND para cadenas AuxPoW.\n\nRequiere un nodo de Namecoin Core completamente sincronizado y no podado. Una vez indexado, sirve a los clientes Electrum-NMC sobre transportes TCP, SSL y WebSocket (WS/WSS).',
  de_DE:
    'Namecoin ElectrumX ist ein Electrum-Protokoll-Server für die Namecoin-Blockchain. Er indiziert die Kette und stellt Light-Clients (Electrum-NMC) die nötigen Daten zur Verfügung, damit diese Namen auflösen und Transaktionen verifizieren können, ohne einen Full Node zu betreiben.\n\nDies ist der Namecoin-Fork von ElectrumX. Er fügt hinzu: Name-Script-Indizierung, AuxPoW-Unterstützung (Merged Mining) mit checkpoint-basierter Header-Trunkierung, Protokoll v1.4.3 mit 1-Block-Name-Update-Bestätigung über scriptSig-Verkettung, sowie optimierte MAX_SEND-Defaults für AuxPoW-Ketten.\n\nBenötigt einen voll synchronisierten, nicht beschnittenen Namecoin-Core-Node. Nach der Indizierung bedient er Electrum-NMC-Clients über TCP, SSL und WebSocket (WS/WSS).',
  pl_PL:
    'Namecoin ElectrumX to serwer protokołu Electrum dla blockchaina Namecoina. Indeksuje łańcuch i obsługuje lekkich klientów Electrum-NMC, umożliwiając im wyszukiwanie nazw i weryfikację transakcji bez konieczności uruchamiania pełnego węzła.\n\nTo Namecoinowy fork ElectrumX: dodaje indeksowanie skryptów nazw, obsługę AuxPoW (merged mining) z punktowanym obcięciem nagłówków, protokół v1.4.3 z potwierdzeniem aktualizacji nazwy w jednym bloku przez łańcuchowanie scriptSig oraz zoptymalizowane wartości MAX_SEND dla łańcuchów AuxPoW.\n\nWymaga w pełni zsynchronizowanego, nieprzyciętego węzła Namecoin Core. Po zindeksowaniu obsługuje klientów Electrum-NMC po transporcie TCP, SSL i WebSocket (WS/WSS).',
  fr_FR:
    "Namecoin ElectrumX est un serveur de protocole Electrum pour la blockchain Namecoin. Il indexe la chaîne et sert les données aux portefeuilles légers Electrum-NMC, leur permettant de résoudre des noms et de vérifier des transactions sans exécuter un nœud complet.\n\nC'est le fork Namecoin d'ElectrumX. Il ajoute : indexation des scripts de noms, support AuxPoW (minage fusionné) avec troncature d'en-têtes à point de contrôle, protocole v1.4.3 avec confirmation des mises à jour de noms en 1 bloc via chaînage scriptSig, et valeurs MAX_SEND optimisées pour les chaînes AuxPoW.\n\nNécessite un nœud Namecoin Core entièrement synchronisé et non élagué. Une fois indexé, il dessert les clients Electrum-NMC sur les transports TCP, SSL et WebSocket (WS/WSS).",
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
