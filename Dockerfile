# Build stage: install Namecoin ElectrumX and its Python dependencies.
#
# Source: the Namecoin fork of ElectrumX, branch `protocol-1.4.3-v1`
# (https://github.com/namecoin/electrumx). This fork carries name-script
# indexing, AuxPoW (merged mining) support with checkpointed truncation,
# and Protocol v1.4.3 with 1-block name-update confirmation via scriptSig
# chaining.
#
# Build override: NMC_ELECTRUMX_REMOTE / NMC_ELECTRUMX_BRANCH let us point
# at mstrofnone/electrumx@fix/pin-websockets, which pins websockets<11 to
# keep ws/wss transport working until upstream lands the same fix. See
# UPDATING.md for the upstream-vs-fork tracking notes.
FROM python:3.11-slim-bookworm AS builder

ARG NMC_ELECTRUMX_REMOTE=https://github.com/mstrofnone/electrumx.git
ARG NMC_ELECTRUMX_BRANCH=fix/pin-websockets

RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        ca-certificates \
        git \
        libleveldb-dev \
        libssl-dev \
        && rm -rf /var/lib/apt/lists/*

WORKDIR /build

RUN git clone --depth 1 --branch ${NMC_ELECTRUMX_BRANCH} ${NMC_ELECTRUMX_REMOTE} src

WORKDIR /build/src

# Verify the websockets pin is present in the cloned tree. mstrofnone's
# fix/pin-websockets branch carries `'websockets>=6.0,<11'` in setup.py;
# if a later rebase loses that upper bound the WS/WSS transport breaks
# silently. Match the upper bound regardless of any preceding `>=N.N,`
# fragment, so we tolerate upstream tweaking the lower bound.
RUN python3 - <<'PY'
import re, sys
try:
    src = open('setup.py').read()
except FileNotFoundError:
    print('PATCH CHECK: setup.py missing'); sys.exit(1)
m = re.search(r"['\"]websockets([^'\"]*)['\"]", src)
if not m:
    print('PATCH CHECK: no websockets requirement found in setup.py'); sys.exit(1)
spec = m.group(1)
if not re.search(r'<\s*11\b', spec):
    print(f'PATCH MISSING: websockets requirement {m.group(0)!r} has no <11 upper bound'); sys.exit(1)
print(f'PATCH OK: websockets requirement = {m.group(0)}')
PY

# Runtime Python deps. Versions match the v0.3 wrapper that's been in
# production on StartOS 0.3.5; bump in lockstep with upstream ElectrumX.
RUN pip install --no-cache-dir --prefix=/install \
        'aiorpcx>=0.18.1,<0.23' \
        'aiohttp>=3.3' \
        attrs \
        plyvel \
        pylru \
        uvloop

# Install ElectrumX itself (carries the websockets<11 pin via setup.py).
RUN pip install --no-cache-dir --prefix=/install .

# ===========================================================================
# Final runtime image.
# ===========================================================================
FROM python:3.11-slim-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        jq \
        libleveldb1d \
        libssl3 \
        netcat-openbsd \
        openssl \
        tini \
        && rm -rf /var/lib/apt/lists/*

# Copy installed Python packages + ElectrumX source (kept for coin defs).
COPY --from=builder /install /usr/local
COPY --from=builder /build/src /opt/electrumx

ENV ELECTRUMX_PREFIX=/opt/electrumx
ENV PATH=/usr/local/bin:$PATH

# Smoke-test the install: ElectrumX must import cleanly.
RUN python3 -c "import electrumx; print('electrumx OK')"

# Standard Electrum protocol ports + RPC + WS/WSS.
EXPOSE 50001 50002 50003 50004 8000

ENTRYPOINT ["tini", "--"]
