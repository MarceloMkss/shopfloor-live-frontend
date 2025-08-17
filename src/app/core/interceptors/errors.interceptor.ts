import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const errorsInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastrService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const msg =
        err.status === 0 ? 'Servidor indisponível.' :
        err.status === 401 ? 'Não autorizado (API key inválida).' :
        err.status === 404 ? 'Recurso não encontrado.' :
        err.error?.detail || 'Ocorreu um erro inesperado.';
      toast.error(msg, `Erro ${err.status || ''}`.trim());
      return throwError(() => err);
    })
  );
};
