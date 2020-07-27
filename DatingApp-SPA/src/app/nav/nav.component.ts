import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
  model: any = {};

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
  }

  login(): any{
    this.authService.login(this.model).subscribe( next => {
      console.log('Logged in successfully');
    }, error => {
      console.log('Failed to login');
    });
    // login method returns an observable, and we always need to subscribe
    // to observables.
  }

  loggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
    // !! is shorthand for an if statement: if there's something in the token
    // return true, otherwise return false.
  }

  logOut(): any{
     localStorage.removeItem('token');
     console.log('logged out');
  }

}
