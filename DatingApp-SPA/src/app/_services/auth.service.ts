import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  baseUrl = 'https://localhost:5001/api/auth/';

  constructor(private http: HttpClient) { }

  login(model: any): any {
    return this.http.post(this.baseUrl + 'login', model).pipe(
        map((response: any) => {
          const user = response; // user here will be containing token object.
          if (user) {
            localStorage.setItem('token', user.token);
          }
        })
      );
  }

  register(model: any): Observable<typeof model>{
    return this.http.post(this.baseUrl + 'register', model);
  }

}
