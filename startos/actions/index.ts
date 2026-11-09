import { sdk } from '../sdk'
import { configure } from './configure'
import { reindex } from './reindex'
import { runtimeInfo } from './runtimeInfo'

export const actions = sdk.Actions.of()
  .addAction(configure)
  .addAction(runtimeInfo)
  .addAction(reindex)
