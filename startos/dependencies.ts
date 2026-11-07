import { randomBytes } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import type { generateRpcUserDependent as coreGenerateRpcUserDependent } from 'namecoin-core-startos/startos/actions/generateRpcUserDependent'
import type { otherConfig as coreOtherConfig } from 'namecoin-core-startos/startos/actions/config/other'
import { electrumxConfigFile } from './fileModels/electrumxConfig'
import { i18n } from './i18n'
import { namecoindDescription } from './manifest/i18n'
import { sdk } from './sdk'

const rpcCredentialsReplayId = 'namecoind-rpc-credentials'

// createTask reads only action.id. Type-only imports retain Core's input types
// without bundling its host-specific diskusage native module into every arch.
const taskAction = <T extends { id: string }>(id: T['id']): T =>
  ({ id }) as unknown as T
const otherConfig = taskAction<typeof coreOtherConfig>('other-config')
const generateRpcUserDependent = taskAction<
  typeof coreGenerateRpcUserDependent
>('generate-rpc-dependent')

const namecoind = sdk.Dependency.required('namecoind', {
  description: namecoindDescription,
  metadata: {
    title: 'Namecoin Core',
    icon: 'https://raw.githubusercontent.com/Start9-Community/namecoin-core-startos/main/icon.svg',
  },
  kind: 'running',
  versionRange: '>=32.1:0',
  healthChecks: ['namecoind', 'sync-progress'],
})
  .withInit(async (effects) => {
    await sdk.action.createTask(effects, 'namecoind', otherConfig, 'critical', {
      input: {
        kind: 'partial',
        accept: [{ prune: 0, txindex: true }],
        set: { prune: 0, txindex: true },
      },
      when: { condition: 'input-not-matches', once: false },
      reason: i18n(
        'ElectrumX requires an archival Namecoin Core node with the transaction index enabled. Disabling pruning may require a full blockchain reindex.',
      ),
    })
  })
  .withInit(async (effects) => {
    const config = await electrumxConfigFile.read().once()
    if (!config) throw new Error('No electrumx.json')

    let connection = config.namecoind
    if (!connection.rpcPassword) {
      connection = {
        ...connection,
        // Avoid colliding with an rpcauth entry left behind when an old
        // ElectrumX installation was removed.
        rpcUser: `electrumx_${randomBytes(6).toString('hex')}`,
        rpcPassword: randomBytes(24).toString('base64url'),
        rpcHost: 'namecoind.startos',
        rpcPort: 8336,
      }
      await electrumxConfigFile.merge(effects, { namecoind: connection })
    }

    const registered = await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'namecoin-electrumx' },
      sdk.Mounts.of().mountDependency({
        dependencyId: 'namecoind',
        volumeId: 'main',
        mountpoint: '/mnt/namecoind',
        subpath: null,
        readonly: true,
      }),
      'read-namecoin-conf',
      async (subcontainer) => {
        const namecoinConf = await readFile(
          `${subcontainer.rootfs}/mnt/namecoind/namecoin.conf`,
          'utf8',
        )
        const rpcUsers = Array.from(
          namecoinConf.matchAll(/^rpcauth=([^:]+):/gm),
          (match) => match[1],
        )
        return rpcUsers.includes(connection.rpcUser)
      },
    )

    if (registered) {
      await sdk.action.clearTask(effects, rpcCredentialsReplayId)
      return
    }

    await sdk.action.createTask(
      effects,
      'namecoind',
      generateRpcUserDependent,
      'critical',
      {
        replayId: rpcCredentialsReplayId,
        input: {
          kind: 'partial',
          accept: [
            { username: connection.rpcUser, password: connection.rpcPassword },
          ],
          set: {
            username: connection.rpcUser,
            password: connection.rpcPassword,
          },
        },
        reason: i18n(
          'Register the generated RPC credentials so ElectrumX can read the Namecoin blockchain. The password is stored in ElectrumX; no copying is needed.',
        ),
      },
    )
  })

export const dependencies = sdk.Dependencies.of().addDependency(namecoind)
