# Updating the upstream version

ElectrumX is built from source via the `electrumx/` git submodule (see `.gitmodules`), pinned to a release tag of `spesmilo/electrumx` on its 1.x line, the `v1.x` branch; upstream's `master` carries 2.x. The submodule commit is the version pin; the version itself is `__version__` in `electrumx/src/electrumx/__init__.py`.

## Determining the upstream version

- **electrumx** (`spesmilo/electrumx`, https://github.com/spesmilo/electrumx) — upstream publishes tags, not GitHub releases:
  ```bash
  git ls-remote --tags --sort=-v:refname https://github.com/spesmilo/electrumx.git 'refs/tags/1.*'
  ```
  Compare against the tag checked out in the submodule:
  ```bash
  git -C electrumx describe --tags --exact-match HEAD
  ```

## Applying the bump

- **electrumx** — advance the submodule to the new tag and stage the gitlink:
  ```bash
  git submodule sync -- electrumx
  git -C electrumx fetch --tags origin
  git -C electrumx checkout <new tag>
  git add electrumx
  ```
  The package version follows `__version__` in `electrumx/src/electrumx/__init__.py`.
- **Namecoin support** — confirm the new revision retains `NameIndexAuxPoWMixin`, the `Namecoin` coin class, and the `blockchain.name.get_value_proof` session handler before publishing it. Check variable-length header batches at nonzero heights, both with and without checkpoints.
- **Carried patches** — re-check each patch's **Retire when** condition in [patches/README.md](patches/README.md). Delete a patch upstream has absorbed, with its README section. The Dockerfile applies the rest with `patch -p1 --fuzz=0`, so one whose context moved fails the build; re-derive it rather than loosening `--fuzz`.
- **Dependencies** — review `pyproject.toml` when bumping. The former `websockets<14` patch was retired with ElectrumX 1.20.1's move to aiorpcX 0.25 and pyproject-based packaging.
