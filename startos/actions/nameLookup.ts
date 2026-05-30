import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { electrumTcpPort, electrumxMounts } from '../utils'
const { InputSpec, Value } = sdk

/**
 * Name Lookup action.
 *
 * Mirrors the Namecoin Core "Name Lookup" action (namecoin-core-startos
 * PR #3), but takes the path-of-least-privilege through THIS server:
 * we open a TCP socket to our own electrum port and issue the
 * Electrum-protocol method `blockchain.name.get_value`. That's what
 * Electrum-NMC and other light wallets use, so verifying it from the UI
 * is also a good end-to-end sanity check of the public-facing protocol.
 *
 * Implementation notes:
 *   - We run the probe inside a temp SubContainer so we get a clean
 *     network namespace + the busybox `nc` already installed in the
 *     image. We talk to 127.0.0.1:50001 — i.e. our own daemon — rather
 *     than going back out through the dependency.
 *   - `name_show` (the namecoind RPC verb) and `blockchain.name.get_value`
 *     (the Electrum verb) return roughly the same shape; the latter is
 *     value-only. We surface the JSON verbatim so users can copy it.
 *   - If the daemon isn't running the action is disabled (`only-running`).
 */
export const inputSpec = InputSpec.of({
  name: Value.text({
    name: i18n('Name to Look Up'),
    description: i18n(
      'A Namecoin name in namespace/name form. Examples: d/wikileaks (domain), id/alice (identity), dd/testls (DNS sub-namespace).',
    ),
    required: true,
    default: 'd/wikileaks',
    patterns: [
      {
        regex: '^[a-z]+/[A-Za-z0-9._-]+$',
        description: i18n(
          'Must be namespace/name (lowercase namespace, alphanumerics/dot/underscore/dash in the name).',
        ),
      },
    ],
  }),
})

export const nameLookup = sdk.Action.withInput(
  'name-lookup',
  async () => ({
    name: i18n('Name Lookup'),
    description: i18n(
      'Resolve a Namecoin name via this ElectrumX server. Equivalent to the Electrum-protocol method `blockchain.name.get_value`.',
    ),
    warning: null,
    allowedStatuses: 'only-running',
    group: i18n('Maintenance'),
    visibility: 'enabled',
  }),
  inputSpec,
  async () => {},
  async ({ effects, input }) => {
    const name = input.name.trim()

    // JSON-RPC over the line-protocol TCP socket. ElectrumX expects
    // newline-terminated frames.
    const request =
      JSON.stringify({
        id: 0,
        method: 'blockchain.name.get_value',
        params: [name],
      }) + '\n'

    const result = await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'namecoin-electrumx' },
      electrumxMounts,
      'name-lookup',
      async (subc) =>
        subc.exec([
          'sh',
          '-c',
          `printf '%s' ${JSON.stringify(request)} | nc -w 10 127.0.0.1 ${electrumTcpPort} | head -1`,
        ]),
    )

    const stdout = (result.stdout as string) || ''
    const stderr = (result.stderr as string) || ''
    const exitCode = (result as { exitCode?: number }).exitCode ?? 0

    if (exitCode === 0 && stdout) {
      // Try to extract the .result field for a cleaner display.
      let display = stdout.trim()
      try {
        const parsed = JSON.parse(display)
        if (parsed && typeof parsed === 'object') {
          if (parsed.error) {
            return {
              version: '1' as const,
              title: i18n('Name Lookup Failed'),
              message: i18n('Lookup of ${name} failed.', { name }),
              result: {
                type: 'single',
                name: i18n('Error'),
                description: null,
                value: JSON.stringify(parsed.error, null, 2),
                copyable: true,
                qr: false,
                masked: false,
              },
            }
          }
          if ('result' in parsed) {
            display = JSON.stringify(parsed.result, null, 2)
          }
        }
      } catch {
        // not JSON; surface raw stdout as-is
      }

      return {
        version: '1' as const,
        title: i18n('Name Lookup Result'),
        message: i18n('Found: ${name}', { name }),
        result: {
          type: 'single',
          name: i18n('Value'),
          description: null,
          value: display,
          copyable: true,
          qr: false,
          masked: false,
        },
      }
    }

    const errText = stderr.trim() || stdout.trim() || `exit ${exitCode}`
    return {
      version: '1' as const,
      title: i18n('Name Lookup Failed'),
      message: i18n('Lookup of ${name} failed.', { name }),
      result: {
        type: 'single',
        name: i18n('Error'),
        description: null,
        value: errText,
        copyable: true,
        qr: false,
        masked: false,
      },
    }
  },
)
