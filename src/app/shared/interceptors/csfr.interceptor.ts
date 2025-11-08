import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Csrf } from '../../services/csrf.service';

export const csrfInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const csrfService = inject(Csrf);
  
  console.log('Interceptor')

  return from(csrfService.ensureToken()).pipe(
    switchMap(token => {
      const modified = req.clone({
        withCredentials:true,
        setHeaders: { 'X-CSRF-Token': token ?? '' }
      });
      console.log('modified')
      console.log(modified)
      return next(modified);
    })
  );
};
