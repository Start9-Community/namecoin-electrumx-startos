## Documentation

- [Electrum-NMC](https://www.namecoin.org/docs/electrum-nmc/*) — the Namecoin light wallet that connects to this server
- [ElectrumX protocol methods](https://github.com/namecoin/electrumx/blob/protocol-1.4.3-v1/docs/protocol-methods.rst) — the Electrum protocol this server speaks, including Namecoin's name methods

## What it gives you on StartOS

Your own Electrum server for Namecoin, indexed from your own Namecoin Core node. Wallets and apps that resolve Namecoin names or look up transactions can ask your server instead of someone else's.

It offers two interfaces:

- **Electrum** — for Electrum-protocol wallets such as Electrum-NMC.
- **Electrum WebSocket** — for clients that speak Electrum over WebSocket, such as browser-based apps.

## Getting set up

1. Install Namecoin Core first. ElectrumX needs it to be a full archival node with its transaction index enabled.
2. Open Namecoin Core and run the task ElectrumX added there. It turns pruning off and the transaction index on. If Namecoin Core was pruned, it will rebuild its chain, which takes a long time.
3. Start ElectrumX. It indexes the whole Namecoin blockchain before serving anyone, which takes several hours. **Index Sync** shows how far it has got, and turns green when it is done.
4. Connect a wallet using an address from the **Electrum** interface. Until **Index Sync** is green, connections are refused.

## Connecting a wallet

The **Electrum** interface lists `ssl://` addresses, and the **Electrum WebSocket** interface `wss://` ones. Use the host and port shown — the port may not be the usual 50002 or 50004 if another Electrum server on your StartOS already uses them.

Your server's certificate is issued by your StartOS server, not a public authority, so a wallet must trust your server's root certificate to connect. Over Tor the same applies.

In **Electrum-NMC**, open **Tools → Network**, turn off **Select server automatically**, and enter the host and port with `:s` at the end for SSL.

## Settings and maintenance

- **Configure** — memory used while indexing (raising it speeds up the first sync), the maximum number of connected clients, log detail, and an optional banner and donation address shown to clients. Saving restarts ElectrumX; indexing picks up where it left off.
- **Runtime Information** — how far the index has got compared with Namecoin Core. The index height moves in jumps, and shows `-1` until the first jump.
- **Rebuild Index** — deletes the index and builds it again from Namecoin Core. Use it only if ElectrumX is stuck or reporting errors about its database; the server is unavailable for several hours while it rebuilds.

A restored backup holds your settings, not the index, so ElectrumX rebuilds it after a restore.
