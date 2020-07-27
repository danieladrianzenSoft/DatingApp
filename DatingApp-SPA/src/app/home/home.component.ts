import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  registerMode = false;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }

  registerToggle(): any{
    this.registerMode = true;
  }

  cancelRegisterMode(registerMode: boolean): any {
    this.registerMode = registerMode;
  }

}
