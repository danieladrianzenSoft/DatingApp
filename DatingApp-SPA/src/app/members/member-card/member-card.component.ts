import { Component, OnInit, Input } from '@angular/core';
import { User } from '../../_models/user';
import { AuthService } from 'src/app/_services/auth.service';
import { UserService } from 'src/app/_services/user.service';
import { AlertifyService } from 'src/app/_services/alertify.service';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.scss']
})
export class MemberCardComponent implements OnInit {
  @Input() user: User;

  constructor(private authService: AuthService, private userService: UserService,
              private alertifyService: AlertifyService) { }

  ngOnInit(): void {
  }

  sendLike(id: number): any{
    // this id represents recipient id.
    this.userService.sendLike(this.authService.decodedToken.nameid, id).subscribe( data => {
      this.alertifyService.success('You have liked: ' + this.user.knownAs);
    }, error => {
      this.alertifyService.error(error);
    });
  }

  // loggedIn(): boolean {
  //   return this.authService.loggedIn();
  //   // !! is shorthand for an if statement: if there's something in the token
  //   // return true, otherwise return false.
  // }

}
