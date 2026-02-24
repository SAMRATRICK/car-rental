import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  result: boolean;
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data already has result/message structure, return as is
        if (data && typeof data === 'object' && 'result' in data) {
          return data;
        }

        // Otherwise, wrap in standard response format
        return {
          result: true,
          message: 'Success',
          data: data,
        };
      }),
    );
  }
}
