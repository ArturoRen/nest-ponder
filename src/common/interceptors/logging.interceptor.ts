import { CallHandler, ExecutionContext, Logger, NestInterceptor } from '@nestjs/common'
import { Observable, tap } from 'rxjs'

export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger(LoggingInterceptor.name, { timestamp: false })

  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>
  ): Observable<unknown> {
    const call$ = next.handle()
    const request = context.switchToHttp().getRequest()
    const content = `${request.method} -> ${request.url}`
    const now = Date.now()
    return call$.pipe(
      tap(() => {
        this.logger.debug(`--- 响应：${content}${` +${Date.now() - now}ms`}`)
      }
      )
    )
  }
}
