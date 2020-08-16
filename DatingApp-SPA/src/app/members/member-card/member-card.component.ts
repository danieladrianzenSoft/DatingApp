import { Component, OnInit, Input, Output } from '@angular/core';
import { User } from '../../_models/user';
import { AuthService } from 'src/app/_services/auth.service';
import { UserService } from 'src/app/_services/user.service';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { Route } from '@angular/compiler/src/core';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.scss']
})
export class MemberCardComponent implements OnInit {
  @Input() user: User;
  route: Route;
  activityPictureUrl: string;

  constructor(private authService: AuthService, private userService: UserService,
              private alertify: AlertifyService) { }

  ngOnInit(): void {
  }

  sendLikeUnlike(id: number): any{
    // this id represents recipient id.
    this.userService.sendLikeUnlike(this.authService.decodedToken.nameid, id).subscribe( data => {
      if (data === true) {
        this.alertify.warning('You have unliked: ' + this.user.displayName);
      }
      else{
        this.alertify.success('You have liked: ' + this.user.displayName);
      }
    }, error => {
        this.alertify.error(error);
    });

  }
}
