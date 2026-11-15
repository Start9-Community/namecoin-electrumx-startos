# Updating the upstream version

ElectrumX is built from source via the `electrumx/` git submodule (see `.gitmodules`), which tracks the `master` branch of `mstrofnone/electrumx`. The submodule commit is the version pin; the version itself is `__version__` in `electrumx/src/electrumx/__init__.py`.

## Determining the upstream version

- **electrumx** (`mstrofnone/electrumx`, https://github.com/mstrofnone/electrumx)
  ```bash
  git ls-remote https://github.com/mstrofnone/electrumx.git refs/heads/master
  ```
  Compare against the commit checked out in the submodule:
  ```bash
  git -C electrumx rev-parse HEAD
  ```

## Applying the bump

- **electrumx** — advance the submodule and stage the gitlink:
  ```bash
  git -C electrumx fetch origin master
  git -C electrumx checkout FETCH_HEAD
  git add electrumx
  ```
  The package version follows `__version__` in `electrumx/src/electrumx/__init__.py`.
- **Namecoin support** — confirm the new revision retains `NameIndexAuxPoWMixin`, the `Namecoin` coin class, and the `blockchain.name.get_value_proof` session handler before publishing it.
- **Dependencies** — review `pyproject.toml` when bumping. The former `websockets<14` patch was retired with ElectrumX 1.20.1's move to aiorpcX 0.25 and pyproject-based packaging.
