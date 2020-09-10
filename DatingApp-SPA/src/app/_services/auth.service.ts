import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';
import { Router } from '@angular/router';
import { ChatService } from './chat.service';
import { AlertifyService } from './alertify.service';

const logoutTime = 15 * 60 * 1000; // if the user has been inactive for > 15 minutes, log out automatically.

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  baseUrl = environment.apiUrl + 'auth/';
  jwtHelper = new JwtHelperService();
  decodedToken: any;
  currentUser: User;
  // private userSubject: BehaviorSubject<User>;
  currentToken: string;
  unverifiedAccount = new BehaviorSubject<boolean>(false);
  photoUrl = new BehaviorSubject<string>('../../assets/user.png');
  currentPhotoUrl = this.photoUrl.asObservable();
  refreshTokenTimeout: any;

  constructor(private http: HttpClient, private router: Router,
              private chat: ChatService, private alertify: AlertifyService) {}

  changeMemberPhoto(photoUrl: string): any{
    this.photoUrl.next(photoUrl);
  }

  login(model: any): any {
    return this.http
    .post(this.baseUrl + 'login', model, {withCredentials: true})
    .pipe(
        map((response: any) => {
          const user = response; // user here will be containing token object.
          // console.log(response);
          if (user) {
            // if (user.isVerified === true) {
              this.currentToken = user.token;
              this.currentUser = user.user;
              this.decodedToken = this.jwtHelper.decodeToken(user.token);
              // this.userSubject.next(this.currentUser);
              this.setToken(this.currentUser, this.currentToken);
              this.startRefreshTokenTimer(this.currentUser);
              this.changeMemberPhoto(this.currentUser.photoUrl);
              this.chat.createHubConnection(this.decodedToken.nameid);
              // this.chat.startConnection(this.authService.decodedToken.nameid);
            // }
            // this.router.navigate()
          }
        })
      );
  }

  setToken(user: User, token: string): any{
    localStorage.setItem('token', token);
    // localStorage.setItem('user', JSON.stringify(user));
  }

  register(user: User): any{
    return this.http.post(this.baseUrl + 'register', user);
  }

  confirmEmail(userId: string, token: string): any{
    return this.http.post(this.baseUrl + 'confirmEmail?userId=' + userId + '&token=' + encodeURIComponent(token), {});
  }

  sendForgotPasswordLink(model: any): any{
    return this.http.post(this.baseUrl + 'forgotPassword', model);
  }

  resetPassword(model: any): any{
    return this.http.post(this.baseUrl + 'resetPassword', model);
  }

  loggedIn(): any{
    // return true if token is not expired.
    const token = localStorage.getItem('token');
    // console.log(token);
    if (token === null){
      return false;
    }
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

  refreshToken(): any{
    // if (this.loggedIn()){
      return this.http.post(this.baseUrl + 'refreshToken', {}, {withCredentials: true})
        .pipe(map((response: any) => {
        const user = response; // user here will be containing token object.
        if (user) {
          // if (user.isVerified === true) {

            this.currentToken = user.token;
            this.currentUser = user.user;
            this.decodedToken = this.jwtHelper.decodeToken(user.token);
            // this.userSubject.next(this.currentUser);
            this.setToken(this.currentUser, this.currentToken);
            this.startRefreshTokenTimer(this.currentUser);
            this.changeMemberPhoto(this.currentUser.photoUrl);
          // }
          // this.router.navigate()
          }
        // else {
        //   this.logout();
        // }
        })
      );
    // }
  }

  logout(): any{
    this.stopRefreshTokenTimer();
    this.http.post(this.baseUrl + 'revokeToken', {}, {withCredentials: true})
      .subscribe(() => {
        }, error => {
          console.error(error);
        });
    this.chat.stopHubConnection(this.currentUser.id);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.decodedToken = null;
    this.currentUser = null;
    this.router.navigate(['/login']);
  }

  // refreshToken(): any{
  //   // if (this.loggedIn()){
  //     this.stopRefreshTokenTimer();
  //     this.authService.refreshToken().subscribe(data => {
  //       this.authService.setToken(data.user, data.token);
  //       this.startRefreshTokenTimer(data.user);
  //     }, error => {
  //       console.error(error);
  //     });
  //   // }
  // }

  private checkInactivityTime(user: User): any{
    const lastActiveTime = Date.now() - new Date(user.lastActive).getTime();
    // console.log(lastActiveTime);
    if (lastActiveTime >= logoutTime ){
      this.alertify.message('For your security, we have logged you out due to inactivity');
      this.logout();
    }
  }

  private startRefreshTokenTimer(user: User): any{
    const expires = new Date(this.decodedToken.exp * 1000 );
    const timeout = expires.getTime() - Date.now() - (60 * 1000);
    // this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
    // this.refreshTokenTimeout = setTimeout(this.refreshToken, timeout);
    this.refreshTokenTimeout = setTimeout(() =>
      this.refreshToken().subscribe(data => {
        this.checkInactivityTime(this.currentUser);
        // console.log(this.currentToken);
      }, error => {
          console.error(error);
          this.router.navigate(['/login']);
      }), timeout);
  }

  private stopRefreshTokenTimer(): any{
    clearTimeout(this.refreshTokenTimeout);
  }

}
