# Carried patches

Deltas applied to the `electrumx` submodule at build time, in filename order, by the
`patch -p1 --fuzz=0` step in the [Dockerfile](../Dockerfile). `--fuzz=0` makes a patch whose
context a submodule bump changed fail the build rather than apply somewhere wrong.

## 0001 — handle disconnected sessions in IP grouping

**Retire when:** the pinned submodule's `SessionManager._ip_addr_group_name()` handles a session
whose `remote_address()` is `None`.

aiorpcX returns `None` from `remote_address()` for a session that is no longer connected, and
ElectrumX 1.20.1 reads `.host` from it unconditionally, so `add_session()` raises
`AttributeError` for such a session. The patch groups it under `unknown_addr`, as upstream
already does for hosts that are not IP addresses, and adds upstream regression cases. It is
commit `04e725e` of `mstrofnone/electrumx`.

## 0002 — correct header batch offsets

**Retire when:** the pinned submodule correctly splits variable-length header batches
starting above height zero, including checkpointed protocol 1.4.1+ requests and protocol 1.6 arrays.

ElectrumX 1.20.1's `block_headers_array()` splits a requested range with absolute offsets
starting at genesis. Namecoin's variable-length AuxPoW headers make those boundaries wrong
for nonzero starting heights, corrupting header responses and preventing clients from validating them.

The patch makes header RPCs and block hashes share `DB.read_headers_array()`, which uses
header lengths at the requested heights. It adds upstream regression cases for genesis
and nonzero starts, ranges reaching past the indexed tip, empty ranges, and protocol 1.4.3
and 1.6 responses with and without checkpoints. Its test hunks extend the test file 0001 adds.
