import { ConfigType, registerAs } from '@nestjs/config'

import { env, envNumber, envString } from '~/global/env'

export const appRegToken = 'app'

export const AppConfig = registerAs(appRegToken, () => ({
  name: env('APP_NAME'),
  port: envNumber('APP_PORT', 3000),
  baseUrl: envString('APP_BASE_URL'),
  globalPrefix: envString('GLOBAL_PREFIX', 'api'),
  locale: envString('APP_LOCALE', 'zh-CN'),

  logger: {
    level: envString('LOGGER_LEVEL'),
    maxFiles: envNumber('LOGGER_MAX_FILES')
  }
}))

export type IAppConfig = ConfigType<typeof AppConfig>
