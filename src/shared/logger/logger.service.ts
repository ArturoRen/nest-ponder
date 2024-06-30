import { ConsoleLogger, ConsoleLoggerOptions, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { config, createLogger, format, transports } from 'winston'
import type { Logger as WinstonLogger } from 'winston'
import 'winston-daily-rotate-file'

import { ConfigKeyPaths } from '~/config'

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

@Injectable()
export class LoggerService extends ConsoleLogger {
  private winstonLogger: WinstonLogger

/**
 * 构造函数初始化日志记录器。
 * 
 * @param context - 日志上下文，用于标识日志来源或相关性。
 * @param options - 控制台日志记录器的选项，定义了日志的格式和行为。
 * @param configService - 配置服务实例，用于获取配置信息。配置服务是私有的，说明它仅在这个类内部使用。
 */
constructor(
  context: string,
  options: ConsoleLoggerOptions,
  private configService: ConfigService<ConfigKeyPaths>
) {
  super(context, options)
  this.initWinston()
}

/**
 * 获取日志级别。
 * 
 * 通过配置服务获取应用程序日志级别的值。如果配置中未明确指定日志级别，
 * 则根据配置文件中其他相关设置推断其值。此方法确保日志级别可以根据
 * 应用程序的运行环境或需求进行灵活配置，而无需直接修改代码。
 * 
 * @returns {LogLevel} 当前的日志级别。
 */
protected get level(): LogLevel {
  return this.configService.get('app.logger.level', { infer: true }) as LogLevel
}

/**
 * 获取日志文件的最大数量。
 * 
 * 通过配置服务获取应用程序日志的最大文件数量。如果配置中未明确指定，
 * 则会尝试根据上下文推断这个值。
 * 
 * @returns {number} 返回日志文件的最大数量。
 */
protected get maxFiles(): number {
  return this.configService.get('app.logger.maxFiles', { infer: true })
}

/**
 * 初始化Winston日志系统。
 * 
 * 此函数配置了Winston日志库，以实现日志的分类、格式化和存储。
 * 它创建了两个日志传输实例：一个用于一般日志，一个用于错误日志。
 * 日志文件按日期滚动，以保持日志文件的大小和数量在可管理范围内。
 * 
 * 配置中使用的级别和格式化器根据项目配置文件（config.npm.levels）进行设置。
 * 使用了Winston提供的格式化器，包括显示错误堆栈、添加时间戳和以JSON格式输出日志。
 */
initWinston() {
  this.winstonLogger = createLogger({
    levels: config.npm.levels,
    format: format.combine(
      format.errors({ stack: true }),
      format.timestamp(),
      format.json()
    ),
    transports: [
      new transports.DailyRotateFile({
        level: this.level,
        filename: 'logs/app.%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxFiles: this.maxFiles,
        format: format.combine(format.timestamp(), format.json()),
        auditFile: 'logs/.audit/app.json'
      }),
      new transports.DailyRotateFile({
        level: LogLevel.ERROR,
        filename: 'logs/app-error.%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxFiles: this.maxFiles,
        format: format.combine(format.timestamp(), format.json()),
        auditFile: 'logs/.audit/app-error.json'
      })
    ]
  })
}

/**
 * 输出详细信息日志。
 * 
 * 此方法继承自父类的verbose方法，并扩展了使用winston日志库进行日志记录的功能。
 * 它允许记录消息以及可选的上下文信息，提高了日志的详细性和可追踪性。
 * 
 * @param message 要记录的消息字符串。
 * @param context 可选的上下文字符串，为消息提供额外的背景信息。
 */
verbose(message: string, context?: string): void {
  // 调用父类的verbose方法，应用继承的日志行为。
  super.verbose.apply(this, [message, context])

  // 使用winstonLogger实例以详细级别记录日志，包括消息和上下文信息。
  this.winstonLogger.log(LogLevel.VERBOSE, message, { context })
}

  debug(message: string, context?: string): void {
    super.debug.apply(this, [message, context])

    this.winstonLogger.log(LogLevel.DEBUG, message, { context })
  }

  log(message: string, context?: string): void {
    super.log.apply(this, [message, context])

    this.winstonLogger.log(LogLevel.INFO, message, { context })
  }

  warn(message: string, context?: string): void {
    super.warn.apply(this, [message, context])

    this.winstonLogger.log(LogLevel.WARN, message)
  }

  error(message: string, stack?: string, context?: string): void {
    super.error.apply(this, [message, stack, context])

    const hasStack = !!context
    this.winstonLogger.log(LogLevel.ERROR, {
      context: hasStack ? context : stack,
      message: hasStack ? new Error(message) : message
    })
  }
}
