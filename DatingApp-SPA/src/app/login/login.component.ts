import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';
import { Router } from '@angular/router';
import { UserService } from '../_services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  model: any = {};
  photoUrl: string;
  showNotVerified = false;

  constructor(public authService: AuthService, private alertify: AlertifyService,
              private router: Router, private userService: UserService) { }

  ngOnInit(): void {
    this.authService.currentPhotoUrl.subscribe(photoUrl => this.photoUrl = photoUrl);
    this.authService.unverifiedAccount.asObservable().subscribe(unverified => {
      this.showNotVerified = unverified;
    });
  }

  login(): any{
    this.authService.login(this.model).subscribe( next => {
      this.alertify.success('Logged in successfully');
      this.authService.unverifiedAccount.next(false);
    }, error => {
      this.alertify.error(error);
    }, () => {
      this.router.navigate(['/members']);
    });
    // login method returns an observable, and we always need to subscribe
    // to observables.
  }

  loggedIn(): boolean {
    return this.authService.loggedIn();
    // !! is shorthand for an if statement: if there's something in the token
    // return true, otherwise return false.
  }

  goOffline(): any{
    this.userService.goOffline(this.authService.decodedToken.nameid).subscribe();
  }

  logOut(): any{
    this.userService.goOffline(this.authService.decodedToken.nameid);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.authService.decodedToken = null;
    this.authService.currentUser = null;
    this.alertify.message('logged out');
    this.router.navigate(['/home']);
  }


}
