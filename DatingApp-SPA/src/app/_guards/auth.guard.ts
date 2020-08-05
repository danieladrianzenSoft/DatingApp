import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private alertify: AlertifyService) {}

  canActivate(next: ActivatedRouteSnapshot): boolean {

    const roles = next.firstChild.data.roles as Array<string>;

    // check if there are any roles, and if so, if they match with the
    // authorized roles we pass in from the routes.ts.
    if (roles) {
      const match = this.authService.roleMatch(roles);
      if (match){
        return true;
      } else {
        this.router.navigate(['members']);
        this.alertify.error('You are not authorized to access this area');
      }
    }

    if (this.authService.loggedIn()){
      return true;
    }
    this.alertify.error('Not authorized, please log in');
    this.router.navigate(['/home']);

    return false;
  }

}
