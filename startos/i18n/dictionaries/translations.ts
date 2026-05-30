import { LangDict } from './default'

/**
 * Non-en_US translations. Kept minimal at v0 — only the high-traffic UI
 * strings are translated. Anything missing falls back to en_US via the
 * SDK's i18n machinery. Add more strings here as community translators
 * pick them up, but don't machine-translate technical copy.
 */
export default {
  es_ES: {
    1: 'ElectrumX',
    2: 'ElectrumX está listo y aceptando conexiones',
    3: 'ElectrumX está iniciando…',
    4: 'ElectrumX no está listo',
    5: 'La dependencia Namecoin Core no está en ejecución o no está sincronizada',
    6: 'Sincronización de la cadena',
    10: 'Conectando a pares…',
    11: 'Descargando cabeceras de bloques… ${headers} cabeceras',
    12: 'Indexando bloques… ${db_height} / ${daemon_height} (${percentage}%)',
    13: 'Alcanzando los últimos bloques… ${db_height} / ${daemon_height}',
    14: 'Índice totalmente sincronizado',
  },
  de_DE: {
    1: 'ElectrumX',
    2: 'ElectrumX ist bereit und nimmt Verbindungen an',
    3: 'ElectrumX startet…',
    4: 'ElectrumX ist nicht bereit',
    5: 'Die Namecoin-Core-Abhängigkeit läuft nicht oder ist nicht synchronisiert',
    6: 'Blockchain-Synchronisierung',
    10: 'Verbinde mit Peers…',
    11: 'Lade Block-Header… ${headers} Header',
    12: 'Indiziere Blöcke… ${db_height} / ${daemon_height} (${percentage}%)',
    13: 'Hole letzte Blöcke ein… ${db_height} / ${daemon_height}',
    14: 'Index vollständig synchronisiert',
  },
  pl_PL: {
    1: 'ElectrumX',
    2: 'ElectrumX jest gotowy i przyjmuje połączenia',
    3: 'ElectrumX uruchamia się…',
    4: 'ElectrumX nie jest gotowy',
    5: 'Zależność Namecoin Core nie działa lub nie jest zsynchronizowana',
    6: 'Synchronizacja blockchaina',
    10: 'Łączenie z węzłami…',
    11: 'Pobieranie nagłówków bloków… ${headers} nagłówków',
    12: 'Indeksowanie bloków… ${db_height} / ${daemon_height} (${percentage}%)',
    13: 'Doganianie ostatnich bloków… ${db_height} / ${daemon_height}',
    14: 'Indeks w pełni zsynchronizowany',
  },
  fr_FR: {
    1: 'ElectrumX',
    2: 'ElectrumX est prêt et accepte les connexions',
    3: 'ElectrumX démarre…',
    4: 'ElectrumX n’est pas prêt',
    5: "La dépendance Namecoin Core n'est pas en cours d'exécution ou n'est pas synchronisée",
    6: 'Synchronisation de la chaîne',
    10: 'Connexion aux pairs…',
    11: 'Téléchargement des en-têtes de blocs… ${headers} en-têtes',
    12: 'Indexation des blocs… ${db_height} / ${daemon_height} (${percentage}%)',
    13: 'Rattrapage des derniers blocs… ${db_height} / ${daemon_height}',
    14: 'Index entièrement synchronisé',
  },
} satisfies Record<string, Partial<LangDict>>
