import { T } from '@start9labs/start-sdk'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import {
  ElectrumxGetInfo,
  electrumxMounts,
  electrumxRpcArgs,
  normalizeGetInfo,
} from '../utils'

/**
 * Runtime Information action.
 *
 * Pattern lifted from namecoin-core-startos PR #7 (runtimeInfo flatten):
 * the StartOS action-result modal collapses every nested `group`, so a
 * deeply nested tree shows up as a wall of collapsed accordions and the
 * key numbers get cut off. Keep this tree FLAT — every top-level member
 * is a `single` so the user sees connections / heights / sync % at a
 * glance with no clicking.
 */
export const runtimeInfo = sdk.Action.withoutInput(
  'runtime-info',
  async () => ({
    name: i18n('Runtime Information'),
    description: i18n('Network and sync status of this ElectrumX server.'),
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),
  async ({ effects }) => {
    const res = await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'namecoin-electrumx' },
      electrumxMounts,
      'runtime-info',
      async (subc) => subc.exec(electrumxRpcArgs('getinfo')),
    )

    if (res.exitCode !== 0 || typeof res.stdout !== 'string') {
      return {
        version: '1' as const,
        title: i18n('ElectrumX Runtime'),
        message: i18n('ElectrumX is not ready'),
        result: null,
      }
    }

    let info: ElectrumxGetInfo
    try {
      info = normalizeGetInfo(JSON.parse(res.stdout))
    } catch {
      return {
        version: '1' as const,
        title: i18n('ElectrumX Runtime'),
        message: i18n('ElectrumX is not ready'),
        result: null,
      }
    }

    const daemonHeight = info.daemon_height ?? 0
    const dbHeight = info.db_height ?? 0
    const syncPct =
      daemonHeight > 0
        ? `${((dbHeight / daemonHeight) * 100).toFixed(2)}%`
        : 'N/A'

    const single = (
      name: string,
      value: string,
      description: string | null = null,
    ): T.ActionResultMember => ({
      type: 'single',
      name,
      description,
      value,
      copyable: false,
      masked: false,
      qr: false,
    })

    // Flat layout — no nested groups. See header comment for why.
    const members: T.ActionResultMember[] = [
      single(
        i18n('ElectrumX Version'),
        String(info.version ?? 'unknown'),
      ),
      single(
        i18n('Daemon URL'),
        String(info.daemon ?? 'unknown'),
        i18n('The Namecoin Core daemon ElectrumX is talking to.'),
      ),
      single(
        i18n('Index Height'),
        String(dbHeight),
        i18n('Highest block written to the ElectrumX index.'),
      ),
      single(
        i18n('Daemon Height'),
        String(daemonHeight),
        i18n('Highest block known to Namecoin Core.'),
      ),
      single(
        i18n('Sync Progress'),
        syncPct,
        i18n('Index synchronization progress as a percentage.'),
      ),
      single(
        i18n('Daemon Synchronized'),
        String(info.daemon_synchronized ?? false),
        i18n('Whether Namecoin Core itself is fully synced.'),
      ),
      single(
        i18n('Active Sessions'),
        String(info.sessions ?? 0),
        i18n('Number of currently connected Electrum clients.'),
      ),
    ]

    if (typeof info.request_count === 'number') {
      members.push(
        single(
          i18n('Request Count'),
          String(info.request_count),
          i18n('Total client requests served since last start.'),
        ),
      )
    }

    return {
      version: '1' as const,
      title: i18n('ElectrumX Runtime'),
      message: null,
      result: { type: 'group', value: members },
    }
  },
)
