import { actions } from '../actions'
import { restoreInit } from '../backups'
import { dependencies } from '../dependencies'
import { storeJson } from '../fileModels/store.json'
import { setInterfaces } from '../interfaces'
import { sdk } from '../sdk'
import { versionGraph } from '../versions'

const seedStore = sdk.setupOnInit(async (effects, kind) => {
  if (kind === 'install') await storeJson.merge(effects, {})
})

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  seedStore,
  setInterfaces,
  actions,
  dependencies,
)

export const uninit = sdk.setupUninit(versionGraph)
