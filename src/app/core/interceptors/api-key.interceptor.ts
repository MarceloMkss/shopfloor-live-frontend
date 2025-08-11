import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environments';

export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  // En real, lee de environment
  const apiKey = environment.apiKey;
  const cloned = req.clone({ setHeaders: { 'X-API-KEY': apiKey } });
  return next(cloned);
};
