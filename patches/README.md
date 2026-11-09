# Carried patches

Deltas applied to the `electrumx` submodule at build time, in filename order, by the
`patch -p1 --fuzz=0` step in the [Dockerfile](../Dockerfile). `--fuzz=0` makes a patch whose
context a submodule bump changed fail the build rather than apply somewhere wrong.

## 0001 — pin websockets below 14

**Retire when:** the submodule is bumped to a `namecoin/electrumx` commit whose aiorpcX dependency
works with websockets 14 or later, or that pins websockets itself.

`aiorpcX[ws]` 0.22 leaves websockets unbounded, and its WebSocket server closes every connection
with `1011 (internal error)` under the asyncio implementation websockets made the default in 14.0,
so the `ws://` listener this package serves fails without the pin.
