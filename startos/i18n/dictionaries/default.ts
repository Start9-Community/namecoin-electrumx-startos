export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  ElectrumX: 1,
  'ElectrumX is ready and accepting connections': 2,
  'ElectrumX is starting…': 3,
  'ElectrumX is not ready': 4,
  'The Namecoin Core dependency is not running or not synced': 5,
  'Blockchain Sync': 6,

  // sync-progress phases (informed by namecoin-core-startos PR #6:
  // surface separate phases instead of one opaque percentage).
  'Connecting to peers…': 10,
  'Downloading block headers… ${headers} headers': 11,
  'Indexing blocks… ${db_height} / ${daemon_height} (${percentage}%)': 12,
  'Catching up final blocks… ${db_height} / ${daemon_height}': 13,
  'Index fully synced': 14,

  // interfaces.ts
  'Electrum TCP Interface': 100,
  'Plaintext Electrum protocol for wallet connections': 101,
  'Electrum SSL Interface': 102,
  'SSL-encrypted Electrum protocol for wallet connections': 103,
  'Electrum WebSocket Interface': 104,
  'Electrum protocol over WebSocket (ws://)': 105,
  'Electrum Secure WebSocket Interface': 106,
  'Electrum protocol over secure WebSocket (wss://)': 107,
  'ElectrumX Admin RPC Interface': 108,
  'Local admin RPC for electrumx_rpc commands': 109,

  // actions/performanceConfig.ts
  'Performance Settings': 200,
  'Tune ElectrumX cache size and session limits': 201,
  'Cache Size (MB)': 202,
  'Amount of memory to use for caching during sync. Larger values speed up the initial index but consume more RAM. Do not set above 60% of available RAM.': 203,
  MB: 204,
  'Max Sessions': 205,
  'Maximum number of concurrent Electrum client connections.': 206,

  // actions/loggingConfig.ts
  'Logging Settings': 300,
  'Set the ElectrumX log verbosity': 301,
  'Log Level': 302,
  'Verbosity of log output. Use debug for troubleshooting; info for normal operation.': 303,
  Debug: 304,
  Info: 305,
  Warning: 306,
  ErrorLevel: 307,

  // actions/bannerConfig.ts
  'Server Banner': 400,
  'Custom text shown to clients on connect': 401,
  Banner: 402,
  'Free-form text served to Electrum clients on connect. Leave empty to disable.': 403,
  'Donation Address': 404,
  'Optional NMC address advertised over the Electrum protocol so clients can tip the operator. Leave empty to disable.': 405,

  // actions/connectionConfig.ts
  'Namecoin Core Connection': 500,
  'RPC credentials and host used to connect to namecoind. Auto-populated by the dependency configurator; only edit manually if you know what you are doing.': 501,
  'RPC Username': 502,
  'The RPC username configured on the Namecoin Core service for this ElectrumX instance.': 503,
  'RPC Password': 504,
  'The plaintext RPC password matching the rpcauth entry on the Namecoin Core service.': 505,
  'RPC Host': 506,
  'Hostname of the Namecoin Core service. Usually auto-configured by StartOS.': 507,
  'RPC Port': 508,
  'JSON-RPC port of Namecoin Core. The default is 8336.': 509,

  // actions/configureDependent.ts (called by namecoind)
  'Configure ElectrumX → Namecoin Core': 600,
  'Set the RPC credentials and host that this ElectrumX instance will use to connect to Namecoin Core. Invoked by the Namecoin Core dependency wiring; cannot be edited manually.': 601,
  'These fields were provided by a task and cannot be edited': 602,

  // actions/reindex.ts
  Reindex: 700,
  'Rebuild Index': 701,
  'Delete the ElectrumX index and rebuild it from Namecoin Core': 702,
  'This will delete the ElectrumX index database and rebuild it from the Namecoin Core node. The reindex process can take several hours. ElectrumX will be unavailable to clients during this process.': 703,
  'Reindex scheduled. Restart ElectrumX to begin rebuilding the index.': 704,
  'Restarting ElectrumX to rebuild the index. This may take several hours.': 705,

  // actions/regenerateSsl.ts
  'Regenerate SSL Certificate': 800,
  'Delete and regenerate the self-signed SSL/WSS certificate used by the SSL and WSS interfaces. ElectrumX must be restarted for clients to pick up the new certificate.': 801,
  'Existing certificate deleted. A new one will be generated on next start.': 802,

  // actions/runtimeInfo.ts (flatten model — informed by namecoin-core-startos
  // PR #7: keep ActionResult depth shallow so the dialog renders the key
  // values without nested collapsed accordions).
  'Runtime Information': 900,
  'Network and sync status of this ElectrumX server.': 901,
  'ElectrumX Runtime': 902,
  'ElectrumX Version': 903,
  'Daemon URL': 904,
  'The Namecoin Core daemon ElectrumX is talking to.': 905,
  'Index Height': 906,
  'Highest block written to the ElectrumX index.': 907,
  'Daemon Height': 908,
  'Highest block known to Namecoin Core.': 909,
  'Sync Progress': 910,
  'Index synchronization progress as a percentage.': 911,
  'Active Sessions': 912,
  'Number of currently connected Electrum clients.': 913,
  'Request Count': 914,
  'Total client requests served since last start.': 915,
  'Database Size': 916,
  'Disk space used by the ElectrumX index.': 917,
  'Daemon Synchronized': 918,
  'Whether Namecoin Core itself is fully synced.': 919,

  // actions/nameLookup.ts (mirrors namecoin-core-startos PR #3:
  // resolve a Namecoin name directly from the StartOS UI. ElectrumX
  // exposes name resolution over its own Electrum protocol method, so
  // this is independent of the Namecoin Core action.)
  'Name Lookup': 1000,
  'Resolve a Namecoin name via this ElectrumX server. Equivalent to the Electrum-protocol method `blockchain.name.get_value`.': 1001,
  'Name to Look Up': 1002,
  'A Namecoin name in namespace/name form. Examples: d/wikileaks (domain), id/alice (identity), dd/testls (DNS sub-namespace).': 1003,
  'Must be namespace/name (lowercase namespace, alphanumerics/dot/underscore/dash in the name).': 1004,
  'Name Lookup Result': 1005,
  'Found: ${name}': 1006,
  Value: 1007,
  'Name Lookup Failed': 1008,
  'Lookup of ${name} failed.': 1009,
  Error: 1010,

  // Common
  Configuration: 1100,
  Success: 1101,
  Failure: 1102,

  // Groups
  Performance: 1200,
  Logging: 1201,
  Display: 1202,
  Maintenance: 1203,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
