# TODO

- Drop the `mstrofnone/electrumx@fix/pin-websockets` fork as soon as `namecoin/electrumx` lands an equivalent `websockets<11` (or `websockets>=11`-compatible ws/wss adapter) on `protocol-1.4.3-v1`. Track via `git ls-remote --refs https://github.com/namecoin/electrumx.git` and the upstream PR list.
- Verify in practice that the StartOS dependency wiring actually calls our hidden `configure-dependent` action when `namecoind` graduates from install. If not, swap the manual **Namecoin Core Connection** action over to `dynamicText` pre-fill from the namecoind data volume (cookie-auth) the same way `namecoin-core-startos` does internally.
- Optional: expose `tor_proxy` knob if peer-discovery over Tor turns out to be useful for AuxPoW header validation. v0.3 wrapper didn't bother — revisit only if user demand exists.
