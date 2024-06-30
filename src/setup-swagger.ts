import { INestApplication, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { API_SECURITY_AUTH } from '~/common/decorators/swagger.decorator'
import { ConfigKeyPaths } from '~/config'
import { IAppConfig } from '~/config/app.config'
import { ISwaggerConfig } from '~/config/swagger.config'

/**
 * 配置Swagger文档的设置函数。
 *
 * 本函数用于在NestJS应用程序中设置和配置Swagger文档。它通过读取配置服务中的应用和Swagger配置，
 * 来决定是否启用Swagger，并根据配置信息来构建Swagger文档。
 *
 * @param app NestJS应用程序实例。
 * @param configService 配置服务实例，用于获取配置信息。
 */
export function setupSwagger(
  app: INestApplication,
  configService: ConfigService<ConfigKeyPaths>
): void {
  // 从配置服务中获取应用配置和Swagger配置
  const { name, port } = configService.get<IAppConfig>('app')
  const { enable, path } = configService.get<ISwaggerConfig>('swagger')

  // 如果Swagger配置未启用，则直接返回，不进行后续设置
  if (!enable)
    return

  // 使用DocumentBuilder来构建Swagger文档配置
  const documentBuilder = new DocumentBuilder()
    .setTitle(name)
    .setDescription(`${name} API document`)
    .setVersion('1.0')

  // 添加安全认证配置，这里配置了JWT令牌的认证方式
  // auth security
  documentBuilder.addSecurity(API_SECURITY_AUTH, {
    description: '输入令牌（Enter the token）',
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT'
  })

  // 根据构建的配置生成Swagger文档
  const document = SwaggerModule.createDocument(app, documentBuilder.build(), {
    ignoreGlobalPrefix: false,
    extraModels: []
  })

  // 设置Swagger文档的访问路径，并配置Swagger的选项，如保持认证信息
  SwaggerModule.setup(path, app, document, {
    swaggerOptions: {
      persistAuthorization: true // 保持登录
    }
  })

    // started log
    const logger = new Logger('SwaggerModule')
    logger.log(`Document running on http://127.0.0.1:${port}/${path}`)
}
