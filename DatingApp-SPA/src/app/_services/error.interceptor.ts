import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest, HttpErrorResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AlertifyService } from './alertify.service';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private alertify: AlertifyService, private router: Router,
                private authService: AuthService){}
    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
            return next.handle(req).pipe(
                catchError(error => {
                    if (error.status === 400){
                        // this.alertify.error(error.error.message);
                        return throwError(error.error.message);
                    }
                    if (error.status === 401) {

                        if (error.error.message === 'Email address not verified'){
                            this.authService.unverifiedAccount.next(true);
                            this.router.navigate(['/login']);

                        }
                        // this.alertify.error(error.message);
                        // this.alertify.error(error.error.message);
                        return throwError(error.error.message);
                    }
                    // if (error.status === 403 && error.error.message === 'Unverified') {
                    //     return throwError(error.error.message);
                    // }
                    if (error.stats === 500){
                        return throwError(error.error.message);
                    }
                    if (error instanceof HttpErrorResponse){
                        const applicationError = error.headers.get('Application-Error');
                        if (applicationError){
                            return throwError(applicationError);
                        }
                        const serverError = error.error;
                        let modalStateErrors = ''; // validation errors
                        if (serverError.errors && typeof serverError.errors === 'object') {
                            for (const key in serverError.errors){
                                if (serverError.errors[key]) {
                                    modalStateErrors += serverError.errors[key] + '\n';
                                    // make array of validation errors separated by new line.
                                }
                            }
                        }
                        return throwError(modalStateErrors || serverError || 'Server Error');
                        // throw all errors accounted for. If error is not accounted for, we don't
                        // know what kind of error it is, so we just return a text that says server
                        // error.
                    }
                })
            );
        }
    }

export const ErrorInterceptorProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: ErrorInterceptor,
    multi: true
};
