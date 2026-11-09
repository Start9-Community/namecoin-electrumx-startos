<p align="center">
  <img src="icon.svg" alt="Namecoin ElectrumX Logo" width="21%">
</p>

# Namecoin ElectrumX on StartOS

> Everything not listed in this document should behave the same as upstream
> Namecoin ElectrumX. If a feature, setting, or behavior is not mentioned here,
> the upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[Namecoin ElectrumX](https://github.com/namecoin/electrumx) is Namecoin's fork of ElectrumX, an Electrum-protocol server that indexes a Namecoin Core node — names included — and serves it to light wallets. This package runs it against the Namecoin Core service on the same server.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

The image is built from source: the `electrumx/` git submodule (Namecoin's `protocol-1.4.3-v1` line) is installed with pip onto `python:3.11-slim-bookworm`, with the patches in `patches/` applied first.

| Property      | Value                                                   |
| ------------- | ------------------------------------------------------- |
| Image         | Custom `Dockerfile` building the `electrumx/` submodule |
| Architectures | x86_64, aarch64                                         |
| Entrypoint    | `electrumx_server`, configured entirely by environment  |
| Subcontainer  | `electrumx` — the server process                        |

The one carried patch pins `websockets` below 14; [`patches/README.md`](patches/README.md) says what retires it.

## Volume and Data Layout

The package has two volumes: the ElectrumX data, and a StartOS-only volume holding its settings.

| Volume    | Mount point | Contents                                                       |
| --------- | ----------- | -------------------------------------------------------------- |
| `main`    | `/data`     | `db/` (the LevelDB index), `banner.txt` (when a banner is set) |
| `startos` | none        | `store.json` — the package's settings                          |

Namecoin Core's `main` volume is mounted read-only at `/mnt/namecoind`, for its RPC cookie.

## File Models

ElectrumX reads no configuration file; the package passes everything as environment variables, rebuilt on every start from `store.json`.

`store.json` (on `startos`) holds the cache size, session limit, log level, banner and donation address, all set by the **Configure** action, plus a `reindex` flag the **Rebuild Index** action sets and the next start clears. It is seeded with defaults at install. A hand edit takes effect on the next start, since nothing else rewrites it.

`banner.txt` on `main` is rewritten from `store.json` on every start, and removed when the banner is empty, so a hand edit is lost.

The environment is `COIN=Namecoin`, `NET=mainnet`, `DB_DIRECTORY`, `DAEMON_URL` (Namecoin Core's bridge address with its cookie credentials), `SERVICES`, `ALLOW_ROOT`, `CACHE_MB`, `MAX_SESSIONS`, `LOG_LEVEL`, and `BANNER_FILE` / `DONATION_ADDRESS` when set.

## Dependencies

ElectrumX needs one other service.

| Dependency    | Required | Health checks | Mounted volume                        | Why                                        |
| ------------- | -------- | ------------- | ------------------------------------- | ------------------------------------------ |
| Namecoin Core | yes      | `namecoind`   | `main` at `/mnt/namecoind`, read-only | the chain ElectrumX indexes, over JSON-RPC |

ElectrumX authenticates with Core's RPC cookie, so it registers no RPC user. Core writes a new cookie on every start, and ElectrumX restarts to pick it up. Core must be archival with `txindex` on (see [Tasks](#tasks)).

## Network Access and Interfaces

Both interfaces share one host, `main`. Each binding serves plaintext on the internal bridge only; everywhere else StartOS terminates TLS with the server's certificate.

| Interface   | Type  | Internal port | TLS port | Protocol                               |
| ----------- | ----- | ------------- | -------- | -------------------------------------- |
| `electrum`  | `api` | 50001         | 50002    | Electrum (`tcp` / `ssl`)               |
| `websocket` | `api` | 50003         | 50004    | Electrum over WebSocket (`ws` / `wss`) |

The external ports are requests: when another Electrum server on the box already holds 50001/50002, StartOS assigns different ones, and the interface page shows the real ones.

ElectrumX opens these ports only once its index has caught up with Namecoin Core. Until then a client gets connection refused. Its admin RPC listens on `127.0.0.1:8000` and is not exposed.

## Installation and First-Run Flow

Install raises a critical task on Namecoin Core. Until it is run, ElectrumX cannot start. Once Core runs, ElectrumX indexes the whole chain from genesis, which takes hours, and opens its client ports when it reaches Core's tip.

If ElectrumX starts while Core is stopped, it shows a single **Namecoin Core** check waiting on Core, then restarts into the server once Core's cookie appears.

## Actions

Three actions, all user-facing.

**Configure** — sets the cache size, session limit, log level, banner and donation address. Saving restarts ElectrumX, which flushes its cache first; nothing is lost and indexing resumes where it stopped. Raising the cache speeds up the initial sync. Safe to repeat.

**Runtime Information** — shows the index height and Namecoin Core's height. Read-only. The index height advances in jumps, whenever ElectrumX flushes its cache, and reads `-1` until the first flush.

**Rebuild Index** — for a corrupt or wedged index. Deletes `db/` on the next start (immediately, when running) and re-indexes from genesis: hours, during which no client is served. Running it again restarts the rebuild from scratch.

## Tasks

One task, on another service's page.

| Task                         | Where                                     | Severity | Raised when                                   | Cleared when                                   |
| ---------------------------- | ----------------------------------------- | -------- | --------------------------------------------- | ---------------------------------------------- |
| Archival node with `txindex` | Namecoin Core → **Other Settings** action | critical | Core's `prune` is not `0` or `txindex` is off | Core is saved with `prune: 0`, `txindex: true` |

It returns whenever Core's settings drift off those values. Turning pruning off makes Core reindex its own chain on its next start.

## Health Checks

Two checks, while ElectrumX runs.

**ElectrumX** probes the admin RPC port. It is green as soon as the process is up, and starting while ElectrumX opens its database. A failure that persists means the process is exiting — read the log; a `DAEMON_URL` or database error there is the cause.

**Index Sync** asks the admin RPC for the index and daemon heights. It is loading while indexing — "Building the index" before the first cache flush, then "Indexing block N of M". It goes green once the index reaches Core's tip and the Electrum port is open. A height that stops advancing for a long time while Core is synced points at the log; **Rebuild Index** is the remedy for a corrupt index.

When Core is stopped, the only check is **Namecoin Core**, waiting.

## Backups and Restore

Both volumes are copied wholesale, with `db/` excluded: the index rebuilds from Namecoin Core, so a backup holds only the settings and the banner. A restored ElectrumX re-indexes from genesis before it serves clients, which takes hours, and needs Namecoin Core installed.

## Limitations and Differences

1. Mainnet only.
2. Plaintext Electrum and WebSocket are reachable only from other services on the server; clients elsewhere use the TLS ports, which carry the StartOS certificate.
3. ElectrumX's own `ssl://` and `wss://` listeners and certificate are not used; StartOS provides TLS.
4. The server does not announce itself to the Electrum peer network (`REPORT_SERVICES` is unset); it still discovers peers.
5. ElectrumX runs as root in its container (`ALLOW_ROOT`).

---

## Quick Reference for AI Consumers

```yaml
package_id: namecoin-electrumx
image: built from the electrumx/ submodule (namecoin/electrumx)
architectures: [x86_64, aarch64]
subcontainers: [electrumx]
volumes:
  main: /data
  startos: (not mounted)
file_models:
  - store.json (startos volume)
startos_managed_env_vars:
  - COIN
  - NET
  - DB_DIRECTORY
  - DAEMON_URL
  - SERVICES
  - ALLOW_ROOT
  - CACHE_MB
  - MAX_SESSIONS
  - LOG_LEVEL
  - BANNER_FILE
  - DONATION_ADDRESS
dependencies: [namecoind]
interfaces:
  electrum: { type: api, port: 50001 }
  websocket: { type: api, port: 50003 }
actions:
  - configure
  - runtime-info
  - reindex
tasks:
  - { action: namecoind/other-config, severity: critical }
health_checks:
  - electrumx
  - sync
  - namecoind
```
