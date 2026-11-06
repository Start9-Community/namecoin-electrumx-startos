<p align="center">
  <img src="icon.svg" alt="Namecoin ElectrumX Logo" width="21%">
</p>

# Namecoin ElectrumX on StartOS

> **Upstream repo:** <https://github.com/namecoin/electrumx>
> **Wrapper origin:** <https://github.com/mstrofnone/namecoin-electrumx-startos> (v0.3.5 YAML wrapper, end-of-life)

[Namecoin ElectrumX](https://github.com/namecoin/electrumx) is an Electrum-protocol server for the Namecoin blockchain. It indexes the chain and serves data to lightweight `Electrum-NMC` wallet clients, enabling them to look up `.bit` / `d/` / `id/` names and verify transactions without running a full node themselves. This package runs ElectrumX on StartOS v0.4 as a daemon backed by your own Namecoin Core node.

The v0.3.5 YAML wrapper at `mstrofnone/namecoin-electrumx-startos` is no longer maintainable — StartOS v0.4 replaced the YAML manifest + `compat` image with a TypeScript SDK and removed the `compat` container entirely. This repo is the v0.4 port, mirroring the same migration path that `Start9-Community/namecoin-core-startos` took for `mstrofnone/namecoin-core-startos-start9` → Start9 Community Registry.

## Getting Started

To learn how to build and package a StartOS service, see the [Packaging Guide](https://docs.start9.com/packaging).

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions (StartOS UI)](#actions-startos-ui)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

| Property      | Value                                                                                |
| ------------- | ------------------------------------------------------------------------------------ |
| Image         | Built from source by `Dockerfile` (python:3.11-slim + ElectrumX + system libs)       |
| Upstream      | `github.com/mstrofnone/electrumx`, branch `fix/pin-websockets`                       |
| Daemon        | `python3 -m electrumx_server`                                                        |
| Architectures | x86_64, aarch64                                                                      |

### Why the `fix/pin-websockets` fork

ElectrumX's WS/WSS transport broke with `websockets >= 11` (the library's API changed in a way that aiorpcx + the ElectrumX server adapter haven't caught up to). The Namecoin fork at `github.com/namecoin/electrumx` (branch `protocol-1.4.3-v1`) hasn't shipped the pin yet either, so we build from [`mstrofnone/electrumx@fix/pin-websockets`](https://github.com/mstrofnone/electrumx/tree/fix/pin-websockets), which carries a single one-line change in `setup.py`:

```diff
-    'websockets',
+    'websockets<11',
```

The `Dockerfile` has a build-time guard that fails the build if that pin disappears (so a future rebase loses the fix loudly, not silently). Once upstream lands the same change we'll flip the build-args back to `namecoin/electrumx@protocol-1.4.3-v1` and remove the guard. See [`UPDATING.md`](./UPDATING.md).

---

## Volume and Data Layout

| Volume | Mount Point         | Purpose                                                  |
| ------ | ------------------- | -------------------------------------------------------- |
| `main` | `/data/electrumx`   | LevelDB index, SSL cert, wrapper state, custom banner    |

Layout under `/data/electrumx`:

- `db/` — the ElectrumX LevelDB index (rebuildable from Namecoin Core; excluded from backups)
- `ssl/server.crt` + `ssl/server.key` — self-signed certificate for the SSL + WSS transports (regenerable via action; excluded from backups)
- `start9/store.json` — wrapper flags (reindex pending, fully-synced)
- `start9/electrumx.json` — wrapper-managed config (cache, sessions, log level, banner, RPC creds)
- `banner.txt` — written from `electrumx.json.banner` when set

The ElectrumX daemon does **not** mount the Namecoin Core data volume. Dependency init uses a temporary read-only mount only to verify that the generated RPC user is registered; the daemon itself talks to namecoind over JSON-RPC (see [Dependencies](#dependencies)).

---

## Installation and First-Run Flow

1. Install Namecoin Core 32.1 or newer. ElectrumX is a hard dependency on `namecoind` ≥ `32.1:0`.
2. Wait for Namecoin Core to fully sync (it can take days on a fresh node, especially while [namecoin/namecoin-core#593](https://github.com/namecoin/namecoin-core/pull/593) — the missing DNS-seed regression — is unresolved upstream).
3. Install Namecoin ElectrumX. Two critical tasks appear on Namecoin Core: **Other Settings** (archival mode + `txindex`) and **Create RPC Credentials**. Run both. ElectrumX generates and stores the credential pair; no password copying is needed.
4. If Core was previously pruned, restart it after **Other Settings** and allow the required archival reindex to finish. The settings action schedules that reindex explicitly.
5. Start ElectrumX. It builds its index from the Namecoin chain via RPC, which takes several hours on commodity hardware; progress is reported phase-by-phase in the health check (see [Health Checks](#health-checks)).

---

## Configuration Management

Configuration lives in `/data/electrumx/start9/electrumx.json` and is edited via Actions, not a single config screen:

- **Namecoin Core Connection** — RPC user, password, host, port. Generated during dependency setup and registered by the Core credential task; the action stays enabled for debugging or custom connections.
- **Performance Settings** — `CACHE_MB` (default 400) and `MAX_SESSIONS` (default 1000).
- **Logging Settings** — `LOG_LEVEL` (debug / info / warning / error).
- **Server Banner** — optional banner text + donation address advertised to connecting Electrum clients.

The wrapper translates the JSON to `ENV` at startup (`DAEMON_URL`, `CACHE_MB`, `MAX_SESSIONS`, `LOG_LEVEL`, `BANNER_FILE`, `SERVICES`, …) — ElectrumX is configured purely by environment variables, no in-container config file.

---

## Network Access and Interfaces

| Interface              | Internal Port | Protocol                          |
| ---------------------- | ------------- | --------------------------------- |
| `electrum-tcp`         | 50001         | Electrum line protocol (TCP)      |
| `electrum-ssl`         | 50002         | Electrum line protocol over TLS   |
| `electrum-ws`          | 50003         | Electrum protocol over WebSocket  |
| `electrum-wss`         | 50004         | Electrum protocol over Secure WS  |

The local ElectrumX admin RPC (`rpc://0.0.0.0:8000`) is bound inside the container but **not** exported to a StartOS interface — it's used internally by the sync-progress health check, the Runtime Information action, and the Name Lookup action.

---

## Actions (StartOS UI)

| Action                          | Group         | Purpose                                                                          |
| ------------------------------- | ------------- | -------------------------------------------------------------------------------- |
| Namecoin Core Connection        | Configuration | Manually override the namecoind RPC credentials / host / port                    |
| Performance Settings            | Configuration | `cacheMb`, `maxSessions`                                                         |
| Logging Settings                | Configuration | `logLevel`                                                                       |
| Server Banner                   | Configuration | Banner text + donation address                                                   |
| Rebuild Index                   | Maintenance   | Schedule a reindex; ElectrumX restarts and rewrites the LevelDB from scratch     |
| Regenerate SSL Certificate      | Maintenance   | Delete + regenerate the self-signed SSL/WSS cert                                 |
| Name Lookup                     | Maintenance   | Resolve a Namecoin name (`d/wikileaks`, `id/alice`, …) via this server's TCP port |
| Runtime Information             | (top-level)   | Flat `ActionResult` of version / heights / sync % / sessions / request count     |
| Configure ElectrumX → Namecoin… | *(hidden)*    | Legacy credential setter retained for compatibility; current init writes credentials directly |

The **Runtime Information** action is deliberately flat (no nested groups). Rationale lifted from [namecoin-core-startos PR #7](https://github.com/Start9-Community/namecoin-core-startos/pull/7): the StartOS action-result modal collapses every nested `group`, so a deep tree hides the key numbers behind multiple closed accordions.

---

## Backups and Restore

The `Backups.ofVolumes('main')` config excludes `db/`, `ssl/`, journal files, and the `.reindex` flag. What survives a backup/restore round-trip is the wrapper config (`electrumx.json`) and the wrapper state (`store.json`). The index itself is rebuilt from Namecoin Core after restore.

---

## Health Checks

A single `sync-progress` health check polls the ElectrumX admin RPC every 30 s (5 s during `starting`/`failure`) and reports one of four phases — the same pattern applied to namecoin-core-startos PR #6, generalized for ElectrumX's two-tier sync (daemon height + DB height):

| Phase                                           | `result`   | Message                                              |
| ----------------------------------------------- | ---------- | ---------------------------------------------------- |
| `daemon_height == 0` (no namecoind tip yet)     | `loading`  | `Connecting to peers…`                               |
| `db_height == 0`, `daemon_height > 0`           | `loading`  | `Downloading block headers… <N> headers`             |
| `0 < db_height < daemon_height`                 | `loading`  | `Indexing blocks… <db> / <daemon> (<percentage>%)`   |
| `db_height >= daemon_height`                    | `success`  | `Index fully synced`                                 |

Why split it: a single percentage that sits at `0.00%` for hours is indistinguishable from a stalled node, especially during the headers / metadata phase before any block actually lands in the index.

The Electrum protocol port (TCP 50001) is also probed by the daemon-readiness check — that's what tells StartOS the service is "running" vs. "starting".

---

## Dependencies

- **`namecoind` ≥ 32.1:0** (hard dependency), with its `namecoind` and `sync-progress` health checks required. ElectrumX needs a fully synced, non-pruned node with `txindex` enabled.

Two dependency init handlers create critical tasks on Core. The **Other Settings** task accepts only `prune=0` and `txindex=true`, and Core's action schedules a reindex when pruning is disabled. The **Create RPC Credentials** task is prefilled with a random username/password generated and stored by ElectrumX. A temporary read-only mount checks Core's `namecoin.conf`; the task is cleared only when that username is actually registered. The visible **Namecoin Core Connection** action remains available for credential recovery or a custom connection.

---

## Limitations and Differences

- **Forked daemon.** The image is built from the [`mstrofnone/electrumx@fix/pin-websockets`](https://github.com/mstrofnone/electrumx/tree/fix/pin-websockets) branch, not upstream `namecoin/electrumx`. The only patch is `websockets<11` in `setup.py`. See [`UPDATING.md`](./UPDATING.md) for tracking.
- **Self-signed SSL.** The cert at `/data/electrumx/ssl/server.crt` is self-signed (`CN=namecoin-electrumx`). Wallets that strictly verify TLS will need to import it or be told to ignore it.
- **No standalone Tor onion-config for ElectrumX peer discovery.** The Electrum service interfaces inherit StartOS's normal Tor / LAN address publishing; we don't run a separate `tor_proxy=` knob for ElectrumX's own peer-discovery loop.

## What Is Unchanged from Upstream

- Coin definitions, name-script indexing, AuxPoW header truncation, Protocol v1.4.3 wire format — all come from the Namecoin ElectrumX fork. No patches.
- Default `CACHE_MB`, `MAX_SESSIONS`, `REQUEST_TIMEOUT`, `INITIAL_CONCURRENT` come from the v0.3.5 wrapper that ran in production on StartOS 0.3.5.

---

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md), [`UPDATING.md`](./UPDATING.md), and the per-skill docs in [`AGENTS.md`](./AGENTS.md). Updating the ElectrumX revision is a one-line change to `startos/manifest/index.ts` (`NMC_ELECTRUMX_BRANCH`) plus a CI rebuild.

---

## Quick Reference for AI Consumers

- Wrapper repo (this): `mstrofnone/namecoin-electrumx-startos-start9`. Future home: `Start9-Community/namecoin-electrumx-startos` (mirroring the `namecoin-core-startos` migration).
- Daemon source: `mstrofnone/electrumx@fix/pin-websockets`.
- Hard dependency: `namecoind` (the Start9-Community Namecoin Core package), version range `>=32.1:0`.
- All wrapper state lives in `/data/electrumx/start9/{store.json,electrumx.json}`. Config edits go through Actions; do not edit those files by hand inside the container.
- Health-check polling cadence: 30 s steady state, 5 s during `starting`/`failure`.
- Reindex is **destructive of the LevelDB but lossless of NMC funds** (ElectrumX doesn't hold keys).
