import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { timeout, retry, catchError } from 'rxjs/operators';
import { throwError, timer } from 'rxjs';

export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  const cloned = req.clone({
    setHeaders: { 'X-API-KEY': environment.apiKey ?? 'dev-key-123' }
  });

  return next(cloned).pipe(
    timeout(10000),
    retry({
      count: 2,
      delay: (_, i) => timer(400 * (i + 1)), // backoff simples
      resetOnSuccess: true
    }),
    catchError(err => throwError(() => err))
  );
};