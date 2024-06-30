import { Global, Module } from "@nestjs/common"
import { LoggerModule } from "~/shared/logger/logger.module"

@Global()
@Module({
  imports: [
    // logger
    LoggerModule.forRoot()

  ],
  exports: []
})
export class SharedModule {}