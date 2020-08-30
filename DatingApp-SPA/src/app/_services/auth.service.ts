import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  baseUrl = environment.apiUrl + 'auth/';
  jwtHelper = new JwtHelperService();
  decodedToken: any;
  currentUser: User;
  currentToken: string;
  unverifiedAccount = new BehaviorSubject<boolean>(false);
  photoUrl = new BehaviorSubject<string>('../../assets/user.png');
  currentPhotoUrl = this.photoUrl.asObservable();


  constructor(private http: HttpClient, private router: Router) { }

  changeMemberPhoto(photoUrl: string): any{
    this.photoUrl.next(photoUrl);
  }

  login(model: any): any {
    return this.http
    .post(this.baseUrl + 'login', model)
    .pipe(
        map((response: any) => {
          const user = response; // user here will be containing token object.
          if (user) {
            // if (user.isVerified === true) {
              this.currentToken = user.token;
              localStorage.setItem('token', user.token);
              localStorage.setItem('user', JSON.stringify(user.user));
              this.decodedToken = this.jwtHelper.decodeToken(user.token);
              this.currentUser = user.user;
              this.changeMemberPhoto(this.currentUser.photoUrl);
            // }
            // this.router.navigate()
          }
        })
      );
  }

  register(user: User): any{
    return this.http.post(this.baseUrl + 'register', user);
  }

  confirmEmail(userId: string, token: string): any{
    return this.http.post(this.baseUrl + 'confirmEmail?userId=' + userId + '&token=' + encodeURIComponent(token), {});
  }

  loggedIn(): any{
    // return true if token is not expired.
    const token = localStorage.getItem('token');
    return !this.jwtHelper.isTokenExpired(token);
  }

  roleMatch(allowedRoles): boolean {
    let isMatch = false;
    const userRoles = this.decodedToken.role as Array<string>;
    allowedRoles.forEach(element => {
      if (userRoles.includes(element)) {
        isMatch = true;
        return;
      }
    });
    return isMatch;
  }

  sendEmailVerification(model: any): any{
    return this.http.post(this.baseUrl + 'sendEmailVerification', model);
  }

  checkEmailExists(email: string): any{
    return this.http.get(this.baseUrl + 'emailexists?email=' + email);
  }

}
