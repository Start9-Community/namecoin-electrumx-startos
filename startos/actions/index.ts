import { sdk } from '../sdk'
import { bannerConfig } from './bannerConfig'
import { configureDependent } from './configureDependent'
import { connectionConfig } from './connectionConfig'
import { loggingConfig } from './loggingConfig'
import { nameLookup } from './nameLookup'
import { performanceConfig } from './performanceConfig'
import { regenerateSsl } from './regenerateSsl'
import { reindex } from './reindex'
import { runtimeInfo } from './runtimeInfo'

export const actions = sdk.Actions.of()
  // Visible — Configuration group
  .addAction(connectionConfig)
  .addAction(performanceConfig)
  .addAction(loggingConfig)
  .addAction(bannerConfig)
  // Visible — Maintenance group
  .addAction(reindex)
  .addAction(regenerateSsl)
  .addAction(nameLookup)
  // Visible — ungrouped
  .addAction(runtimeInfo)
  // Hidden — invoked by dependency wiring
  .addAction(configureDependent)
