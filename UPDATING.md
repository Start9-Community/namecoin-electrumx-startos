# Updating the upstream version

ElectrumX is built from source via the `electrumx/` git submodule (see `.gitmodules`), which tracks Namecoin's `protocol-1.4.3-v1` branch of `namecoin/electrumx`. The submodule commit is the version pin; the version itself is `version` in `electrumx/setup.py`.

## Determining the upstream version

- **electrumx** (`namecoin/electrumx`, https://github.com/namecoin/electrumx)
  ```bash
  git ls-remote https://github.com/namecoin/electrumx.git refs/heads/protocol-1.4.3-v1
  ```
  Compare against the commit checked out in the submodule:
  ```bash
  git -C electrumx rev-parse HEAD
  ```

## Applying the bump

- **electrumx** — advance the submodule and stage the gitlink:
  ```bash
  git -C electrumx fetch origin protocol-1.4.3-v1
  git -C electrumx checkout FETCH_HEAD
  git add electrumx
  ```
  The package version follows `version` in `electrumx/setup.py`.
- **Carried patches** — re-check each patch's **Retire when** condition in [patches/README.md](patches/README.md). Delete a patch upstream has absorbed, with its README section. The Dockerfile applies the rest with `patch -p1 --fuzz=0`, so one whose context moved fails the build; re-derive it rather than loosening `--fuzz`.
