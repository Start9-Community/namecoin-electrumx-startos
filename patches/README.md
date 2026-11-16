# Carried patches

Deltas applied to the `electrumx` submodule at build time, in filename order, by the
`patch -p1 --fuzz=0` step in the [Dockerfile](../Dockerfile).

## 0001 — correct header batch offsets

**Retire when:** the pinned submodule correctly splits variable-length header batches
starting above height zero, including checkpointed protocol 1.4.1+ requests and protocol 1.6 arrays.

ElectrumX 1.20.1's `block_headers_array()` splits a requested range with absolute offsets
starting at genesis. Namecoin's variable-length AuxPoW headers make those boundaries wrong
for nonzero starting heights, corrupting header responses and preventing clients from validating them.

The patch makes header RPCs and block hashes share `DB.read_headers_array()`, which uses
header lengths at the requested heights. It adds upstream regression cases for genesis
and nonzero starts, ranges reaching past the indexed tip, empty ranges, and protocol 1.4.3
and 1.6 responses with and without checkpoints.
