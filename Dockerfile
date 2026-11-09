FROM python:3.11-slim-bookworm AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        libleveldb-dev \
        patch \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build
COPY ./electrumx .
COPY ./patches ./patches
RUN set -e; for p in ./patches/*.patch; do patch -p1 --fuzz=0 <"$p"; done
RUN pip install --no-cache-dir --prefix=/install '.[uvloop]'

FROM python:3.11-slim-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
        libleveldb1d \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /install /usr/local
