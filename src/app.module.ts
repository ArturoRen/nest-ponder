import { Module } from '@nestjs/common'

import { ConfigModule } from '@nestjs/config'

import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule, seconds } from '@nestjs/throttler'

import { AppController } from '~/app.controller'
import { AppService } from '~/app.service'
import config from '~/config'
import { SharedModule } from '~/shared/shared.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // 指定多个 env 文件时，第一个优先级最高
      envFilePath: ['.env', `.env.${process.env.NODE_ENV}`],
      load: [...Object.values(config)]
    }),
    // 避免暴力请求，限制同一个接口 10 秒内不能超过 7 次请求
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        errorMessage: '当前操作过于频繁，请稍后再试！',
        throttlers: [
          { ttl: seconds(10), limit: 5 }
        ]
      })
    }),
    ///引入其他model
    SharedModule
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }]
})
export class AppModule { }
