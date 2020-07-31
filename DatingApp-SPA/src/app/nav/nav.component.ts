import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
  model: any = {};
  photoUrl: string;

  constructor(public authService: AuthService, private alertify: AlertifyService,
              private router: Router) { }

  ngOnInit(): void {
    this.authService.currentPhotoUrl.subscribe(photoUrl => this.photoUrl = photoUrl);
  }

  login(): any{
    this.authService.login(this.model).subscribe( next => {
      this.alertify.success('Logged in successfully');
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

  logOut(): any{
     localStorage.removeItem('token');
     localStorage.removeItem('user');
     this.authService.decodedToken = null;
     this.authService.currentUser = null;
     this.alertify.message('logged out');
     this.router.navigate(['/home']);
  }

}
