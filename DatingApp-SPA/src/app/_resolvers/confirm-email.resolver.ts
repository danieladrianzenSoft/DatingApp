import { Injectable } from '@angular/core';
import { User } from '../_models/user';
import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';
import { Observable, of } from 'rxjs';
import { catchError, tap, flatMap, map, filter, switchMap } from 'rxjs/operators';

@Injectable()
export class ConfirmEmailResolver implements Resolve<any> {
    userId: string;
    token: string;
    isVerified: boolean;

    constructor(private authService: AuthService, private router: Router,
                private alertify: AlertifyService) {}

    resolve(route: ActivatedRouteSnapshot): Observable<boolean> {

        this.userId = route.queryParamMap.get('userId');
        this.token = route.queryParamMap.get('token');

        if (this.userId === null || this.token === null){
                this.alertify.error('Action Failed');
                this.router.navigate(['/home']);
                return of(null);
        }

        return this.authService.confirmEmail(this.userId, this.token).pipe(
            // tap((isVerified: boolean) => {
            //     this.isVerified = isVerified;
            //     if (this.isVerified === true){
            //         this.alertify.message('This account is already verified');
            //         this.router.navigate(['/home']);
            //         return of(null);
            //     }
            // }),
            // map(data => ),
            catchError(error => {
                    this.alertify.error(error);
                    this.router.navigate(['/home']);
                    return of(null);
                })
            );
    }
}
