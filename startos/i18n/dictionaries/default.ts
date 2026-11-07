export const DEFAULT_LANG = 'en_US'

const dict = {
  'Starting Namecoin ElectrumX!': 0,
  'Namecoin Core': 1,
  'Waiting for Namecoin Core to start': 2,
  ElectrumX: 3,
  'ElectrumX is running': 4,
  'ElectrumX is starting': 5,
  'Index Sync': 6,
  'Synced and serving Electrum clients': 7,
  'Index synced; starting the Electrum server': 8,
  'Indexing block ${db} of ${daemon}': 9,
  Electrum: 10,
  'The Electrum protocol endpoint for Namecoin wallets': 11,
  'Electrum WebSocket': 12,
  'The Electrum protocol over WebSocket, for browser-based clients': 13,
  'ElectrumX requires an archival Namecoin Core node with the transaction index enabled. Disabling pruning may require a full blockchain reindex.': 14,
  Configure: 15,
  'Performance, logging and the banner shown to clients': 16,
  'Cache Size': 17,
  'Memory used to cache the index while syncing. Larger values speed up the initial sync but use more RAM.': 18,
  'Max Sessions': 19,
  'Maximum number of concurrent Electrum client connections.': 20,
  'Log Level': 21,
  'Verbosity of the ElectrumX log.': 22,
  Debug: 23,
  Info: 24,
  Warning: 25,
  Error: 26,
  Banner: 27,
  'Text shown to Electrum clients when they connect.': 28,
  'Donation Address': 29,
  'A Namecoin address advertised to clients for tipping the server operator.': 30,
  'Rebuild Index': 31,
  'Delete the ElectrumX index and rebuild it from Namecoin Core': 32,
  'Rebuilding takes several hours, and ElectrumX serves no clients until it finishes.': 33,
  'Runtime Information': 34,
  'Index and Namecoin Core block heights': 35,
  'Index Height': 36,
  'Namecoin Core Height': 37,
  'Building the index': 38,
  Success: 39,
  'Restarting ElectrumX to rebuild the index': 40,
  'ElectrumX will rebuild its index the next time it starts': 41,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
