# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

## This repo

- **Default branch is `main`, not `master`.** The CI workflows name it; leave them.
- **Import Namecoin Core's actions as types, never as values** (`dependencies.ts`). A value import
  bundles Core's native `diskusage` module, built for the host's architecture, into every arch's
  s9pk.
