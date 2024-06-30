import { AppConfig, IAppConfig, appRegToken } from '~/config/app.config'
import { ISwaggerConfig, SwaggerConfig, swaggerRegToken } from '~/config/swagger.config'

export interface AllConfigType {
  [appRegToken]: IAppConfig
  [swaggerRegToken]: ISwaggerConfig
}

export type ConfigKeyPaths = RecordNamePaths<AllConfigType>

export default {
  AppConfig,
  SwaggerConfig
}
