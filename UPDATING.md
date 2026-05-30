# Updating the upstream version

The `namecoin-electrumx` image is built locally from `Dockerfile`: it clones a pinned branch from a remote git repo, runs `pip install` against `setup.py`, and copies the installed Python tree + the ElectrumX source (for the coin defs) into a slim Debian runtime.

## Current pin

| Build arg | Default value |
| --------- | ------------- |
| `NMC_ELECTRUMX_REMOTE` | `https://github.com/mstrofnone/electrumx.git` |
| `NMC_ELECTRUMX_BRANCH` | `fix/pin-websockets` |

Both are set under `images['namecoin-electrumx'].source.dockerBuild.buildArgs` in [`startos/manifest/index.ts`](./startos/manifest/index.ts).

## Why a fork and not upstream namecoin/electrumx?

Upstream `namecoin/electrumx@protocol-1.4.3-v1` declares `websockets` in `setup.py` without a version pin. `websockets >= 11` ships a transport-API change that the ElectrumX `ws://` / `wss://` adapter wasn't updated for, so a stock install builds without errors but silently fails to bind those two transports. `mstrofnone/electrumx@fix/pin-websockets` is a single-line `setup.py` patch (`websockets` → `websockets<11`) that restores them.

The Dockerfile has a **build-time guard** (`grep -E "websockets<11" setup.py`) that fails the build if a future rebase loses the pin. If a bump fails there, either:

- the upstream `namecoin/electrumx` finally landed an equivalent fix and we can switch the build args back to `https://github.com/namecoin/electrumx.git` + `protocol-1.4.3-v1`, or
- the upstream `mstrofnone/electrumx` rebased and lost the pin and we need a new commit/branch.

Track upstream landings:

- [Pull requests on `namecoin/electrumx`](https://github.com/namecoin/electrumx/pulls)
- [Branches on `mstrofnone/electrumx`](https://github.com/mstrofnone/electrumx/branches)

## Bumping the upstream

```sh
# Show available branches/tags on either remote:
git ls-remote --refs https://github.com/mstrofnone/electrumx.git | head
git ls-remote --refs https://github.com/namecoin/electrumx.git | head
```

1. Edit `startos/manifest/index.ts` and update `NMC_ELECTRUMX_REMOTE` / `NMC_ELECTRUMX_BRANCH`.
2. **Re-verify the `websockets<11` pin is still present** on the new branch — the Dockerfile guard will refuse to build otherwise. If the upstream landed an equivalent fix (e.g. ported `ws/wss` to `websockets>=11`'s new API), update or remove the guard accordingly.
3. If runtime Python deps changed (`aiorpcx`, `aiohttp`, `plyvel`, `pylru`, `uvloop`), reflect the new constraints in `Dockerfile`'s `pip install --prefix=/install` step.
4. Bump the package version in the file under `startos/versions/`, renaming the file to match (`v_x_y_z_n` const + `version: 'x.y.z.n:0'`). Write release notes in `releaseNotes.en_US`.

## Snapshot of relevant deps

Locked in `Dockerfile`:

- `aiorpcx>=0.18.1,<0.23`
- `aiohttp>=3.3`
- `attrs`
- `plyvel` (LevelDB binding)
- `pylru`
- `uvloop`

LevelDB and OpenSSL system packages come from Debian stable (`libleveldb-dev` at build time, `libleveldb1d` at runtime; `libssl-dev` / `libssl3` likewise).
