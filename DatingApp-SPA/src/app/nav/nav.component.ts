import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { UserService } from '../_services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { map, mergeMap, filter } from 'rxjs/operators';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
  model: any = {};
  photoUrl: string;
  isCollapsed = true;
  visible: boolean;

  // isLoginButtonVisible = true;
  // isRegisterButtonVisible = true;

  constructor(public authService: AuthService, private alertify: AlertifyService,
              private router: Router, private userService: UserService,
              private activatedRoute: ActivatedRoute) { this.visible = true; }

  ngOnInit(): void {
    this.authService.currentPhotoUrl.subscribe(photoUrl => this.photoUrl = photoUrl);
    this.router.events
    .pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map(route => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
    )
    .pipe(
      filter(route => route.outlet === 'primary'),
      mergeMap(route => route.data),
    )
    .subscribe(event => {
      this.showNavbar(event.navbar); // show the toolbar?
    });
  }

  showNavbar(event): any {
    if (event === false) {
      this.visible = false;
    } else if (event === true) {
      this.visible = true;
    } else {
      this.visible = true;
    }
  }
  // login(): any{
  //   this.authService.login(this.model).subscribe( next => {
  //     this.alertify.success('Logged in successfully');
  //   }, error => {
  //     this.alertify.error(error);
  //     console.log(error);
  //   }, () => {
  //     this.router.navigate(['/members']);
  //   });
  //   // login method returns an observable, and we always need to subscribe
  //   // to observables.
  // }

  loggedIn(): boolean {
    return this.authService.loggedIn();
    // !! is shorthand for an if statement: if there's something in the token
    // return true, otherwise return false.
  }

  goOffline(): any{
    this.userService.goOffline(this.authService.decodedToken.nameid).subscribe();
  }

  logOut(): any{
    this.isCollapsed = true;
    // this.isLoginButtonVisible = true;
    // this.isRegisterButtonVisible = true;
    this.userService.goOffline(this.authService.decodedToken.nameid);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.authService.decodedToken = null;
    this.authService.currentUser = null;
    this.alertify.message('logged out');
    this.router.navigate(['/home']);
  }


}
