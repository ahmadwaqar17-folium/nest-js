import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T> {
  status: string;
  message: string;
  data: T;
  code: number;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<StandardResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => ({
        status: statusCode >= 200 && statusCode < 300 ? 'success' : 'fail',
        message: this.getDefaultMessage(statusCode),
        data,
        code: statusCode,
      })),
    );
  }

  private getDefaultMessage(statusCode: number): string {
    switch (statusCode) {
      case HttpStatus.CREATED:
        return 'Created successfully';
      case HttpStatus.OK:
        return 'Request successful';
      case HttpStatus.NO_CONTENT:
        return 'Deleted successfully';
      default:
        return 'Request processed';
    }
  }
}
