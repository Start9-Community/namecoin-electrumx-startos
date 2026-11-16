import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v_1_16_0_1 } from './v1.16.0_1'
import { v_1_20_1_0 } from './v1.20.1_0'

export const versionGraph = VersionGraph.of({
  current,
  other: [v_1_16_0_1, v_1_20_1_0],
})
