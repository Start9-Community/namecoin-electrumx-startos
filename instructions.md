# Namecoin ElectrumX

Namecoin ElectrumX is an Electrum-protocol server for the Namecoin blockchain. It indexes the chain and serves `.bit` / `d/` / `id/` name lookups and transaction proofs to lightweight Electrum-NMC wallet clients — no full node needed on the wallet's device.

## Requirements

- **Namecoin Core 32.1 or newer** must be installed, fully synced, and **not pruned** before ElectrumX can finish its own initial index. The transaction index (`txindex`) must also be enabled. ElectrumX creates critical tasks on Namecoin Core for both settings and for its generated RPC credentials; run those tasks before starting ElectrumX.
- At least **1 GB of free RAM** during the initial index. After that, the `Cache Size` setting (default 400 MB) controls steady-state memory use.
- About **5–10 GB of free disk** for the ElectrumX index (separate from Namecoin Core's chain data).

## Initial Sync

After installation, open the two critical tasks on **Namecoin Core** and run **Other Settings** and **Create RPC Credentials**. ElectrumX generates and stores the password automatically; there is nothing to copy. If Core was pruned, restart it after saving Other Settings and wait for its archival reindex to complete.

On first start, ElectrumX downloads every block from your Namecoin Core node over JSON-RPC and rebuilds its own LevelDB index. This takes several hours on commodity hardware. The status card shows one of:

- **Connecting to peers…** — Namecoin Core hasn't reported a tip yet.
- **Downloading block headers… N headers** — Namecoin Core knows the tip; ElectrumX hasn't written any blocks yet.
- **Indexing blocks… M / N (X%)** — actively indexing. The percentage moves slowly during the first ~100k blocks but the absolute counter (`M`) keeps ticking so you can see real progress.
- **Index fully synced** — caught up to Namecoin Core. Wallets can now resolve names and verify transactions.

ElectrumX deliberately refuses to open client listeners (TCP / SSL / WS / WSS) until its initial synchronization to tip completes — it won't serve stale data. The four `electrum-*` Service Interfaces will not respond to wallet connections before then. The **Blockchain Sync** healthcheck polls separately, so its _Index fully synced_ display can lag the listeners slightly. This is normal.

## Connecting wallets

### Amethyst (Android, primary example)

[Amethyst](https://github.com/vitorpamplona/amethyst) is a Nostr client for Android that uses ElectrumX to resolve `.bit` / `d/` / `id/` Namecoin names for NIP-05 verification, follow-import, and search. From the app's _Namecoin_ settings screen you can point it directly at _this_ server.

1. In Amethyst go to **Settings → Namecoin**.
2. Set **Resolution backend** to **ElectrumX (light client)**.
3. (Optional) Toggle **Fall back to default public ElectrumX servers** off if you want lookups to fail closed when your own server is unreachable, rather than leaking to third-party operators.
4. Under **Add ElectrumX server**, paste the TCP or SSL onion address copied from **Service Interfaces** on this StartOS service:

   | Interface    | Port  | Suffix to add                 |
   | ------------ | ----- | ----------------------------- |
   | Electrum TCP | 50001 | `:50001:tcp`                  |
   | Electrum SSL | 50002 | `:50002` (TLS is the default) |

   Example: `xxxxxxxxxx.onion:50001:tcp` for the plain-TCP onion.

   ⚠️ **Use a supported protocol.** Amethyst accepts `host:port` for TLS and `host:port:tcp` for plaintext TCP. It does not support WebSocket (`:ws`) or Secure WebSocket (`:wss`) endpoints; ports 50003 and 50004 are for clients with WS/WSS support. Do not omit `:tcp` on port 50001, or Amethyst will attempt TLS on the plaintext port.

5. Tap **+ Add** then **Test Connection**. A green ✓ with a millisecond latency confirms the server is reachable.

Onion lookups require Tor and the **Nostr Address Verification** option (**Force Tor when verifying NIP-05 addresses**) to be enabled; ElectrumX sockets follow Amethyst's NIP-05 Tor policy. With Amethyst's built-in Tor (Arti), no manual proxy configuration is needed.

### Electrum-NMC (desktop)

1. **Tools → Network → Server**.
2. Uncheck _Select server automatically_.
3. Enter the server address and port from **Service Interfaces**:
   - **Electrum TCP Interface** — port `50001`, plaintext. Use this for `.onion` / local connections.
   - **Electrum SSL Interface** — port `50002`, TLS. Use this from the open internet.
   - **Electrum WebSocket / Secure WebSocket** — ports `50003` / `50004`. Useful for in-browser wallets.
4. Click **Close**.

### Other Electrum-protocol clients

Any wallet or tool that speaks Electrum and supports Namecoin can connect on any of the four ports above. The SSL/WSS cert is self-signed — clients that strictly verify TLS will need to import `/data/electrumx/ssl/server.crt` from the package volume, or trust the cert on first use.

## Quirks & Known Issues

- **Self-signed SSL cert.** Ports 50002 (SSL) and 50004 (WSS) present a self-signed certificate by default. Use **Actions → Maintenance → Regenerate SSL Certificate** to rotate it; wallets that pinned the previous cert will need to re-trust the new one.
- **ElectrumX hides until synced.** All four client listeners stay closed during initial sync. The `ready` healthcheck only tests whether the TCP listener is accepting connections; sync progress is published on the separate `sync-progress` healthcheck (LocalRPC port 8000), which works from the moment ElectrumX starts.
- **WS / WSS used to be unreachable over Tor in early v0.4 builds.** The wrapper used to declare WS/WSS as `protocol: 'http'`, which triggered StartOS's auto-`addSsl` wrapping and prevented the lxcbr0 NAT from exposing the upstream ports to sibling containers (notably `tor`). Fixed from **1.4.3.1:5** onwards — bindings now use explicit `secure: { ssl: false | true }` so the upstream port is exposed directly. If you're on an older build and only `:50001/:50002` work over Tor, upgrade.
- **Stale port-forward after package upgrade on older StartOS versions.** StartOS could leave one or more of `50001–50004` pinned to the previous container's IP after a package upgrade, causing connection timeouts or `I/O error: Socket is closed`. This was fixed upstream by [Start9Labs/start-technologies#3285](https://github.com/Start9Labs/start-technologies/pull/3285), merged June 2, 2026. Upgrade to a StartOS release containing that fix. On an affected older installation, run **start-cli server.restart** from the StartOS console to clear stale forwards. Not specific to this package — it affected any package whose container IP changed across upgrades.

## Configuration

All settings are edited under **Actions** (grouped under _Configuration_) — there is no single config screen.

- **Performance Settings** — `Cache Size (MB)` and `Max Sessions`. The default 400 MB cache works well for steady-state operation; bump it to 1024–2048 MB to speed up the initial index if you have spare RAM. Do not exceed 60% of physical RAM.
- **Logging Settings** — `debug` for troubleshooting; `info` for normal operation.
- **Server Banner** — optional free-form text shown to Electrum clients on connect, plus an optional NMC donation address advertised over the protocol.
- **Namecoin Core Connection** — the RPC username, password, and host used to reach Namecoin Core. **Automatically generated** during dependency setup and registered by Core's credential task; only edit this for credential recovery or a custom connection.

## Actions

### Rebuild Index

If ElectrumX gets into a bad state (corrupt LevelDB, stuck at the wrong tip, unexplained disagreement with namecoind), use **Maintenance → Rebuild Index**. It schedules a reindex flag, restarts the service, deletes `/data/electrumx/db/`, and starts indexing from genesis. Allow several hours for it to catch back up. **No NMC funds are at risk** — ElectrumX doesn't hold keys.

### Regenerate SSL Certificate

Wipes and regenerates the self-signed certificate used by the SSL and WSS transports. Run this if the cert expired (10-year default) or if you accidentally exposed the private key. Wallets that pinned the old cert will need to re-trust the new one.

### Name Lookup

Resolves a Namecoin name (`d/wikileaks`, `id/alice`, `dd/testls`, …) by talking the Electrum line protocol to _this_ server — equivalent to a client calling `blockchain.name.get_value`. Useful as a sanity check that the public-facing protocol works, separate from `namecoin-cli name_show` (which goes through Namecoin Core's own JSON-RPC).

### Runtime Information

A single click shows ElectrumX version, the daemon URL, index height vs daemon height, sync %, active sessions, and request count — all on one screen, no nested accordions to expand.

## Health Check

The **Blockchain Sync** health check reports the four phases above with a 30-second refresh (5 seconds while starting / failing). It's wired to the same ElectrumX admin RPC the _Runtime Information_ action uses.

## Backups

Backups exclude the LevelDB index, the SSL certificate, and journal files. They preserve your wrapper config (`electrumx.json`) and wrapper state (`store.json`). **The index is rebuilt from Namecoin Core after restore — allow several hours before ElectrumX is usable again post-restore.**

No NMC keys are held by ElectrumX, so restoring without a backup is also safe — it just costs you the reindex time.

## Support

- [Namecoin Forum](https://forum.namecoin.org/)
- [Namecoin ElectrumX GitHub](https://github.com/namecoin/electrumx/issues)
- [Namecoin Chat](https://www.namecoin.org/resources/chat/)
