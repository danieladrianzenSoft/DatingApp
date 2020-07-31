import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable} from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  baseUrl = environment.apiUrl + 'auth/';
  jwtHelper = new JwtHelperService();
  decodedToken: any;
  currentUser: User;
  photoUrl = new BehaviorSubject<string>('../../assets/user.png');
  currentPhotoUrl = this.photoUrl.asObservable();

  constructor(private http: HttpClient) { }

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
            localStorage.setItem('token', user.token);
            localStorage.setItem('user', JSON.stringify(user.user));
            this.decodedToken = this.jwtHelper.decodeToken(user.token);
            this.currentUser = user.user;
            this.changeMemberPhoto(this.currentUser.photoUrl);
          }
        })
      );
  }

  register(model: any): Observable<typeof model>{
    return this.http.post(this.baseUrl + 'register', model);
  }

  loggedIn(): any{
    // return true if token is not expired.
    const token = localStorage.getItem('token');
    return !this.jwtHelper.isTokenExpired(token);
  }



}
