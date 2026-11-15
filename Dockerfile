FROM python:3.11-slim-bookworm AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        libleveldb-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build
COPY ./electrumx .
RUN pip install --no-cache-dir --prefix=/install '.[uvloop]'

FROM python:3.11-slim-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
        libleveldb1d \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /install /usr/local
