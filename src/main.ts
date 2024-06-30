import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'

import { NestFastifyApplication } from '@nestjs/platform-fastify'
import cluster from 'cluster'

import { AppModule } from '~/app.module'
import fastifyApp from '~/common/adapters/fastify.adapter'
import { LoggingInterceptor } from '~/common/interceptors/logging.interceptor'
import { ConfigKeyPaths } from '~/config'
import { isDev, isMainProcess } from '~/global/env'
import { setupSwagger } from '~/setup-swagger'
import { LoggerService } from '~/shared/logger/logger.service'


// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const module: any

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, fastifyApp, {
    bufferLogs: true,
    snapshot: true
    // forceCloseConnections: true,
  })
  const configService = app.get(ConfigService<ConfigKeyPaths>)
  const { port, globalPrefix } = configService.get('app', { infer: true })
  /// URL版本控制,看需求启用
  // app.enableVersioning({
  //   type: VersioningType.URI,
  //   defaultVersion: '1'
  // })
  app.setGlobalPrefix(globalPrefix)

  if (isDev) {
    app.useGlobalInterceptors(new LoggingInterceptor())
  }

  setupSwagger(app, configService)
  await app.listen(port, '0.0.0.0', async () => {
    app.useLogger(app.get(LoggerService))
    const url = await app.getUrl()
    const { pid } = process
    const env = cluster.isPrimary
    const prefix = env ? 'P' : 'W'

    if (!isMainProcess)
      return

    const logger = new Logger('NestApplication')
    logger.log(`[${prefix + pid}] Server running on ${url}`)

    if (isDev)
      logger.log(`[${prefix + pid}] OpenAPI: ${url}/api-docs`)
  })

  if (module.hot) {
    module.hot.accept()
    module.hot.dispose(() => app.close())
  }
}
bootstrap()
