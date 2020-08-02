import { Component, OnInit, Input } from '@angular/core';
import { User } from '../../_models/user';
import { AuthService } from 'src/app/_services/auth.service';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.scss']
})
export class MemberCardComponent implements OnInit {
  @Input() user: User;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
  }

  // loggedIn(): boolean {
  //   return this.authService.loggedIn();
  //   // !! is shorthand for an if statement: if there's something in the token
  //   // return true, otherwise return false.
  // }

}
