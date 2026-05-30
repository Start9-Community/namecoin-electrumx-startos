import { electrumxConfigFile } from '../fileModels/electrumxConfig'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (!kind) return

  // install / update / restore — make sure both files exist.
  await storeJson.merge(effects, {})
  await electrumxConfigFile.merge(effects, {})
})
