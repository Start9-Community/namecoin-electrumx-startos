# Contributing

## Keep these in sync

- **[`README.md`](./README.md)** — what this package is and how it's built (image, volumes, interfaces, daemon-source pin). Technical reference for developers and AI assistants.
- **[`instructions.md`](./instructions.md)** — the user-facing instructions packed into the `.s9pk` and shown on the **Instructions** tab in StartOS.
- **[`UPDATING.md`](./UPDATING.md)** — how to bump the ElectrumX upstream and how to track when the `websockets<11` pin can be dropped.
- **[`TODO.md`](./TODO.md)** — pending work.

**Read all four before starting any work.** Any code change that affects user-visible behavior must update `README.md` and `instructions.md` in the same change; add to `TODO.md` when you defer work, and remove items when complete. Content rules: [Writing READMEs](https://docs.start9.com/packaging/writing-readmes.html), [Writing Instructions](https://docs.start9.com/packaging/writing-instructions.html).

## Environment setup

See [Environment Setup](https://docs.start9.com/packaging/environment-setup.html).

## Building

```bash
npm ci    # install dependencies
make      # build the .s9pk for the supported arches (x86_64, aarch64)
```

The `namecoin-electrumx` image is built from source by `Dockerfile` (clones `mstrofnone/electrumx@fix/pin-websockets`, runs `pip install`), so the first build pulls and compiles the Python deps. Subsequent builds reuse the Docker layer cache.

For a complete list of build options, see [Makefile](https://docs.start9.com/packaging/makefile.html).

## Updating the upstream version

1. Apply the upstream bump per [UPDATING.md](./UPDATING.md).
2. Update `version` and `releaseNotes` in the file under `startos/versions/`, renaming it to the new version string. A *new* version file is only needed when the bump requires a migration, or when you want the old release notes preserved in git history — see [Versions](https://docs.start9.com/packaging/versions.html).

## CI/CD

Five workflows under `.github/workflows/` wrap reusable workflows in [`Start9Labs/start-technologies`](https://github.com/Start9Labs/start-technologies):

- **`build.yml`** — on PR, builds the `.s9pk` and uploads per-arch artifacts for sideload testing. PR builds do not receive `DEV_KEY` — a PR build doesn't publish, so it doesn't need the signing key.
- **`pr-retarget.yml`** — rebuilds when a PR's base branch changes.
- **`release.yml`** — on `v*` tag, builds per arch and publishes to the test registry.
- **`tagAndRelease.yml`** — on push to `main`, tags `v<version>` and runs `release.yml`, skipping if already published.
- **`syncNext.yml`** — carries every change that lands on `main` onto the paired `next` iteration branch (created on first run if absent).

Promotion to `beta` and `prod` is a separate, manual step.

## How to contribute

1. Fork the repository and create a branch from `main`.
2. Make your changes — including the doc updates above.
3. Open a pull request to `main`.
