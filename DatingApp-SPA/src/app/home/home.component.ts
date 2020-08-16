import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  // @Input() registerMode: boolean;

  constructor(private http: HttpClient, private authService: AuthService) { }

  ngOnInit(): void {
    // this.registerMode = false;
  }

  // registerToggle(): any{
  //   this.registerMode = true;
  // }

  // cancelRegisterMode(registerMode: boolean): any {
  //   this.registerMode = registerMode;
  // }

  loggedIn(): boolean {
    return this.authService.loggedIn();
  }

}
